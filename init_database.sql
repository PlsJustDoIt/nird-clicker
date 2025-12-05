-- NIRD Clicker - Initialisation de la base de données
-- Exécuter avec : mysql -u root -p < init_database.sql

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS nird_clicker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nird_clicker;

-- Table des scores du leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    score BIGINT NOT NULL DEFAULT 0,
    prestige_level INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index pour optimiser les requêtes de classement
    INDEX idx_score (score DESC),
    INDEX idx_player (player_name)
);

-- Créer un utilisateur dédié pour l'application (optionnel mais recommandé)
-- CREATE USER IF NOT EXISTS 'nird_user'@'localhost' IDENTIFIED BY 'nird_password';
-- GRANT SELECT, INSERT, UPDATE ON nird_clicker.* TO 'nird_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Quelques scores de test pour voir que ça marche
INSERT INTO leaderboard (player_name, score, prestige_level) VALUES
    ('NIRD_Master', 1000000, 5),
    ('LinuxFan42', 500000, 3),
    ('OpenSourceHero', 250000, 2),
    ('Pingouin_Libre', 100000, 1),
    ('Tux_Lover', 50000, 0);

SELECT '✅ Base de données nird_clicker initialisée avec succès !' AS Status;
SELECT * FROM leaderboard ORDER BY score DESC;
