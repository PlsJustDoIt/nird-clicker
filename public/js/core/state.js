/**
 * @file NIRD Clicker - État global du jeu
 * @description Gestion centralisée de l'état avec getters/setters
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

/**
 * État global du jeu (var pour compatibilité avec les autres scripts)
 * @type {GameState}
 */
var gameState = {
    // Score
    score: 0,
    totalScore: 0,
    
    // Clics
    totalClicks: 0,
    clickPower: 1,
    currentCombo: 0,
    maxCombo: 0,
    
    // Production
    productionPerSecond: 0,
    totalUpgrades: 0,
    
    // Boss
    bossDefeated: 0,
    
    // Effets temporaires
    activeEffects: [],
    
    // Temps
    lastSave: Date.now(),
    startTime: Date.now(),
    
    // Progression
    currentVillageLevel: 0,
    triggeredMilestones: [],
    
    // Prestige
    prestigeLevel: 0,
    prestigePoints: 0,
    prestigeUpgrades: {},
    
    // Personnalisation
    currentSkin: 'default',
    skinsUnlocked: ['default'],
    currentTheme: 'dark',
    
    // Quiz & Missions
    quizCorrect: 0,
    dailyMissions: [],
    dailyMissionsDate: null,
    
    // Paramètres
    soundEnabled: true,
    particlesEnabled: true,
    tutorialCompleted: false,
    
    // Session (reset à chaque visite)
    sessionClicks: 0,
    sessionScore: 0,
    sessionUpgrades: 0,
    sessionBoss: 0,
    sessionQuiz: 0
};

// ============================================
// GETTERS - Accès en lecture
// ============================================

/**
 * Récupère le score actuel
 * @returns {number} Le score actuel du joueur
 */
function getScore() {
    return gameState.score;
}

/**
 * Récupère le score total accumulé
 * @returns {number} Le score total depuis le début
 */
function getTotalScore() {
    return gameState.totalScore;
}

/**
 * Récupère la puissance de clic actuelle
 * @returns {number} Points par clic
 */
function getClickPower() {
    return gameState.clickPower;
}

/**
 * Récupère la production passive par seconde
 * @returns {number} Points produits par seconde
 */
function getProductionPerSecond() {
    return gameState.productionPerSecond;
}

/**
 * Récupère le niveau de prestige actuel
 * @returns {number} Niveau de prestige
 */
function getPrestigeLevel() {
    return gameState.prestigeLevel;
}

/**
 * Récupère les points de prestige disponibles
 * @returns {number} Points de prestige
 */
function getPrestigePoints() {
    return gameState.prestigePoints;
}

/**
 * Récupère le combo actuel
 * @returns {number} Valeur du combo
 */
function getCurrentCombo() {
    return gameState.currentCombo;
}

/**
 * Récupère la liste des effets actifs
 * @returns {Effect[]} Tableau des effets temporaires actifs
 */
function getActiveEffects() {
    return gameState.activeEffects;
}

// ============================================
// SETTERS - Modifications contrôlées
// ============================================

/**
 * Ajoute des points au score (et met à jour totalScore et sessionScore)
 * @param {number} amount - Montant à ajouter
 */
function addScore(amount) {
    gameState.score += amount;
    gameState.totalScore += amount;
    gameState.sessionScore += amount;
}

/**
 * Soustrait des points du score (minimum 0)
 * @param {number} amount - Montant à soustraire
 */
function subtractScore(amount) {
    gameState.score = Math.max(0, gameState.score - amount);
}

/**
 * Définit le score à une valeur précise
 * @param {number} amount - Nouvelle valeur du score
 */
function setScore(amount) {
    gameState.score = amount;
}

/**
 * Incrémente le compteur de clics
 */
function incrementClicks() {
    gameState.totalClicks++;
    gameState.sessionClicks++;
}

/**
 * Définit la puissance de clic
 * @param {number} power - Nouvelle puissance de clic
 */
function setClickPower(power) {
    gameState.clickPower = power;
}

/**
 * Ajoute un bonus à la puissance de clic
 * @param {number} bonus - Bonus à ajouter
 */
function addClickPower(bonus) {
    gameState.clickPower += bonus;
}

/**
 * Définit la production par seconde
 * @param {number} pps - Nouvelle valeur de production
 */
function setProductionPerSecond(pps) {
    gameState.productionPerSecond = pps;
}

/**
 * Incrémente le compteur d'upgrades achetées
 * @param {number} [count=1] - Nombre d'upgrades à ajouter
 */
function incrementUpgrades(count = 1) {
    gameState.totalUpgrades += count;
    gameState.sessionUpgrades += count;
}

/**
 * Incrémente le compteur de boss vaincus
 */
function incrementBossDefeated() {
    gameState.bossDefeated++;
    gameState.sessionBoss++;
}

/**
 * Incrémente le compteur de quiz réussis
 */
function incrementQuizCorrect() {
    gameState.quizCorrect++;
    gameState.sessionQuiz++;
}

/**
 * Définit la valeur du combo et met à jour le max si nécessaire
 * @param {number} combo - Nouvelle valeur du combo
 */
function setCombo(combo) {
    gameState.currentCombo = combo;
    if (combo > gameState.maxCombo) {
        gameState.maxCombo = combo;
    }
}

/**
 * Remet le combo à zéro
 */
function resetCombo() {
    gameState.currentCombo = 0;
}

/**
 * Ajoute un effet temporaire actif
 * @param {Effect} effect - L'effet à ajouter
 */
function addActiveEffect(effect) {
    gameState.activeEffects.push(effect);
}

/**
 * Supprime les effets temporaires expirés
 */
function cleanExpiredEffects() {
    const now = Date.now();
    gameState.activeEffects = gameState.activeEffects.filter(e => e.endTime > now);
}

/**
 * Définit le niveau du village
 * @param {number} level - Index du niveau dans VILLAGE_LEVELS
 */
function setVillageLevel(level) {
    gameState.currentVillageLevel = level;
}

/**
 * Ajoute un milestone aux milestones déclenchés
 * @param {number} score - Score du milestone atteint
 */
function addTriggeredMilestone(score) {
    if (!gameState.triggeredMilestones.includes(score)) {
        gameState.triggeredMilestones.push(score);
    }
}

// ============================================
// PRESTIGE
// ============================================

/**
 * Ajoute des points de prestige (et incrémente le niveau)
 * @param {number} points - Points de prestige à ajouter
 */
function addPrestigePoints(points) {
    gameState.prestigePoints += points;
    gameState.prestigeLevel += points;
}

/**
 * Définit le niveau d'une amélioration de prestige
 * @param {string} upgradeId - ID de l'amélioration
 * @param {number} level - Niveau à définir
 */
function setPrestigeUpgrade(upgradeId, level) {
    gameState.prestigeUpgrades[upgradeId] = level;
}

/**
 * Récupère le niveau d'une amélioration de prestige
 * @param {string} upgradeId - ID de l'amélioration
 * @returns {number} Niveau actuel (0 si non achetée)
 */
function getPrestigeUpgradeLevel(upgradeId) {
    return gameState.prestigeUpgrades[upgradeId] || 0;
}

// ============================================
// SKINS & THEMES
// ============================================

/**
 * Définit le skin actuellement équipé
 * @param {string} skinId - ID du skin
 */
function setCurrentSkin(skinId) {
    gameState.currentSkin = skinId;
}

/**
 * Débloque un nouveau skin
 * @param {string} skinId - ID du skin à débloquer
 */
function unlockSkin(skinId) {
    if (!gameState.skinsUnlocked.includes(skinId)) {
        gameState.skinsUnlocked.push(skinId);
    }
}

/**
 * Vérifie si un skin est débloqué
 * @param {string} skinId - ID du skin
 * @returns {boolean} True si débloqué
 */
function isSkinUnlocked(skinId) {
    return gameState.skinsUnlocked.includes(skinId);
}

/**
 * Définit le thème actuel
 * @param {string} themeId - ID du thème ('dark', 'light', etc.)
 */
function setCurrentTheme(themeId) {
    gameState.currentTheme = themeId;
}

// ============================================
// SETTINGS
// ============================================

/**
 * Active ou désactive le son
 * @param {boolean} enabled - True pour activer
 */
function setSoundEnabled(enabled) {
    gameState.soundEnabled = enabled;
}

/**
 * Active ou désactive les particules
 * @param {boolean} enabled - True pour activer
 */
function setParticlesEnabled(enabled) {
    gameState.particlesEnabled = enabled;
}

/**
 * Marque le tutoriel comme complété ou non
 * @param {boolean} completed - True si complété
 */
function setTutorialCompleted(completed) {
    gameState.tutorialCompleted = completed;
}

// ============================================
// DAILY MISSIONS
// ============================================

/**
 * Définit les missions quotidiennes
 * @param {DailyMission[]} missions - Tableau des missions
 */
function setDailyMissions(missions) {
    gameState.dailyMissions = missions;
}

/**
 * Définit la date des missions quotidiennes
 * @param {string|null} date - Date au format ISO ou null
 */
function setDailyMissionsDate(date) {
    gameState.dailyMissionsDate = date;
}

/**
 * Remet à zéro les statistiques de session
 */
function resetSessionStats() {
    gameState.sessionClicks = 0;
    gameState.sessionScore = 0;
    gameState.sessionUpgrades = 0;
    gameState.sessionBoss = 0;
    gameState.sessionQuiz = 0;
}

// ============================================
// RESET POUR PRESTIGE
// ============================================

/**
 * Remet à zéro l'état du jeu pour un prestige
 * Conserve le niveau de prestige et les upgrades de prestige
 */
function resetGameStateForPrestige() {
    gameState.score = 0;
    gameState.totalScore = 0;
    gameState.totalClicks = 0;
    gameState.totalUpgrades = 0;
    gameState.clickPower = 1;
    gameState.productionPerSecond = 0;
    gameState.bossDefeated = 0;
    gameState.activeEffects = [];
    gameState.currentVillageLevel = 0;
    gameState.currentCombo = 0;
    gameState.maxCombo = 0;
    gameState.triggeredMilestones = [];
    resetSessionStats();
}

// ============================================
// SERIALIZATION (pour sauvegarde)
// ============================================

/**
 * Retourne l'état du jeu prêt pour la sauvegarde
 * @returns {object} Objet contenant les données à sauvegarder
 */
function getStateForSave() {
    return {
        score: gameState.score,
        totalScore: gameState.totalScore,
        totalClicks: gameState.totalClicks,
        totalUpgrades: gameState.totalUpgrades,
        clickPower: gameState.clickPower,
        bossDefeated: gameState.bossDefeated,
        startTime: gameState.startTime,
        currentVillageLevel: gameState.currentVillageLevel,
        prestigeLevel: gameState.prestigeLevel,
        prestigePoints: gameState.prestigePoints,
        prestigeUpgrades: gameState.prestigeUpgrades,
        currentSkin: gameState.currentSkin,
        skinsUnlocked: gameState.skinsUnlocked,
        quizCorrect: gameState.quizCorrect,
        maxCombo: gameState.maxCombo,
        soundEnabled: gameState.soundEnabled,
        particlesEnabled: gameState.particlesEnabled,
        currentTheme: gameState.currentTheme,
        tutorialCompleted: gameState.tutorialCompleted,
        dailyMissions: gameState.dailyMissions,
        dailyMissionsDate: gameState.dailyMissionsDate,
        triggeredMilestones: gameState.triggeredMilestones
    };
}

/**
 * Charge l'état du jeu depuis une sauvegarde
 * @param {object} data - Données de sauvegarde
 */
function loadStateFromSave(data) {
    Object.keys(data).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(gameState, key)) {
            gameState[key] = data[key];
        }
    });
}

// Exposer gameState globalement pour compatibilité avec le code existant
// À terme, on utilisera uniquement les getters/setters
window.gameState = gameState;
