// Chargement des modules
require("dotenv").config();
const express = require("express");
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 45975;
const isProduction = process.env.NODE_ENV === "production";
const leaderboardEnabled = process.env.LEADERBOARD_ENABLED === "true";

// Pool de connexions MySQL (uniquement si activé)
let pool = null;

async function initDB() {
  if (!leaderboardEnabled) {
    console.log("ℹ️  Leaderboard désactivé (LEADERBOARD_ENABLED=false)");
    return;
  }

  try {
    const mysql = require("mysql2/promise");
    
    // Utiliser DB_URL (format: mysql://user:password@host:port/database)
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      throw new Error("DB_URL non définie");
    }

    pool = mysql.createPool({
      uri: dbUrl,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 10000
    });

    // Créer la table si elle n'existe pas
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS leaderboard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pseudo VARCHAR(50) NOT NULL,
        score BIGINT NOT NULL DEFAULT 0,
        total_clicks INT NOT NULL DEFAULT 0,
        prestige_level INT NOT NULL DEFAULT 0,
        boss_defeated INT NOT NULL DEFAULT 0,
        play_time INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_score (score DESC),
        INDEX idx_pseudo (pseudo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await pool.execute(createTableSQL);
    console.log("✅ Base de données connectée et table leaderboard prête !");
  } catch (err) {
    console.error("❌ Erreur de connexion à la base de données:", err.message);
    console.log("ℹ️  Le leaderboard sera désactivé");
    pool = null;
  }
}

// Ne pas modifier le numéro du port
const server = app.listen(PORT, function () {
  console.log(`🖥️  NIRD Clicker - Mode ${isProduction ? "PRODUCTION" : "DÉVELOPPEMENT"}`);
  console.log(`C'est parti ! En attente de connexion sur le port ${PORT}...`);
  console.log(`Se connecter à l'application en local : http://localhost:${PORT}`);
  initDB();
});

// ============================================
// API LEADERBOARD
// ============================================

// Middleware pour vérifier si le leaderboard est actif
function checkLeaderboard(req, res, next) {
  if (!pool) {
    return res.status(503).json({ 
      success: false, 
      error: "Leaderboard non disponible",
      disabled: true 
    });
  }
  next();
}

// GET /api/leaderboard - Récupérer le top 50
app.get("/api/leaderboard", checkLeaderboard, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT pseudo, score, total_clicks, prestige_level, boss_defeated, play_time, created_at FROM leaderboard ORDER BY score DESC LIMIT 50"
    );
    res.json({ success: true, leaderboard: rows });
  } catch (err) {
    console.error("Erreur leaderboard:", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// POST /api/leaderboard - Soumettre un score
app.post("/api/leaderboard", checkLeaderboard, async (req, res) => {
  try {
    const { pseudo, score, totalClicks, prestigeLevel, bossDefeated, playTime } = req.body;

    // Validation
    if (!pseudo || pseudo.length < 2 || pseudo.length > 50) {
      return res.status(400).json({ success: false, error: "Pseudo invalide (2-50 caractères)" });
    }
    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ success: false, error: "Score invalide" });
    }

    // Nettoyer le pseudo
    const cleanPseudo = pseudo.replace(/[<>\"']/g, "").trim();

    // Vérifier si le joueur existe déjà
    const [existing] = await pool.execute(
      "SELECT id, score FROM leaderboard WHERE pseudo = ?",
      [cleanPseudo]
    );

    if (existing.length > 0) {
      // Mettre à jour seulement si le score est meilleur
      if (score > existing[0].score) {
        await pool.execute(
          "UPDATE leaderboard SET score = ?, total_clicks = ?, prestige_level = ?, boss_defeated = ?, play_time = ? WHERE pseudo = ?",
          [score, totalClicks || 0, prestigeLevel || 0, bossDefeated || 0, playTime || 0, cleanPseudo]
        );
        res.json({ success: true, message: "Nouveau record !", updated: true });
      } else {
        res.json({ success: true, message: "Score existant meilleur", updated: false });
      }
    } else {
      // Nouveau joueur
      await pool.execute(
        "INSERT INTO leaderboard (pseudo, score, total_clicks, prestige_level, boss_defeated, play_time) VALUES (?, ?, ?, ?, ?, ?)",
        [cleanPseudo, score, totalClicks || 0, prestigeLevel || 0, bossDefeated || 0, playTime || 0]
      );
      res.json({ success: true, message: "Score enregistré !", updated: true });
    }
  } catch (err) {
    console.error("Erreur submit score:", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// GET /api/leaderboard/rank/:pseudo - Récupérer le rang d'un joueur
app.get("/api/leaderboard/rank/:pseudo", checkLeaderboard, async (req, res) => {
  try {
    const pseudo = req.params.pseudo;

    const [rows] = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) + 1 FROM leaderboard WHERE score > (SELECT score FROM leaderboard WHERE pseudo = ?)) as rank,
        score, total_clicks, prestige_level, boss_defeated
      FROM leaderboard WHERE pseudo = ?`,
      [pseudo, pseudo]
    );

    if (rows.length > 0 && rows[0].rank) {
      res.json({ success: true, ...rows[0] });
    } else {
      res.json({ success: false, error: "Joueur non trouvé" });
    }
  } catch (err) {
    console.error("Erreur rank:", err);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// GET /api/status - Status du serveur
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    environment: isProduction ? "production" : "development",
    leaderboard: pool !== null
  });
});

// Configuration d'express pour utiliser le répertoire "public"
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
