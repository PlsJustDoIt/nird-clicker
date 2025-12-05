-- NIRD Clicker - Initialisation de la base de données
-- Exécuter avec : mysql -u root -p < init_database.sql

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS nird_clicker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer l'utilisateur dédié (changer le mot de passe !)
CREATE USER IF NOT EXISTS 'nird_user'@'localhost' IDENTIFIED BY 'CHANGE_MOI_MOT_DE_PASSE';
GRANT ALL PRIVILEGES ON nird_clicker.* TO 'nird_user'@'localhost';
FLUSH PRIVILEGES;

USE nird_clicker;

-- Supprimer l'ancienne table si elle existe (pour reset)
DROP TABLE IF EXISTS leaderboard;

-- Table des scores du leaderboard
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
);


-- Quelques scores de test pour voir que ça marche
INSERT INTO leaderboard (pseudo, score, total_clicks, prestige_level, boss_defeated, play_time) VALUES
    ('NIRD_Master', 1000000, 50000, 5, 10, 7200),
    ('LinuxFan42', 500000, 25000, 3, 5, 3600),
    ('OpenSourceHero', 250000, 12000, 2, 3, 1800),
    ('Pingouin_Libre', 100000, 5000, 1, 1, 900),
    ('Tux_Lover', 50000, 2500, 0, 0, 450);

SELECT '✅ Base de données nird_clicker initialisée avec succès !' AS Status;
SELECT * FROM leaderboard ORDER BY score DESC;
