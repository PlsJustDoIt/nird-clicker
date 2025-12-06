/**
 * NIRD Clicker - État global du jeu
 * Gestion centralisée de l'état avec getters/setters
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// État global du jeu (var pour compatibilité avec les autres scripts)
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

function getScore() {
    return gameState.score;
}

function getTotalScore() {
    return gameState.totalScore;
}

function getClickPower() {
    return gameState.clickPower;
}

function getProductionPerSecond() {
    return gameState.productionPerSecond;
}

function getPrestigeLevel() {
    return gameState.prestigeLevel;
}

function getPrestigePoints() {
    return gameState.prestigePoints;
}

function getCurrentCombo() {
    return gameState.currentCombo;
}

function getActiveEffects() {
    return gameState.activeEffects;
}

// ============================================
// SETTERS - Modifications contrôlées
// ============================================

function addScore(amount) {
    gameState.score += amount;
    gameState.totalScore += amount;
    gameState.sessionScore += amount;
}

function subtractScore(amount) {
    gameState.score = Math.max(0, gameState.score - amount);
}

function setScore(amount) {
    gameState.score = amount;
}

function incrementClicks() {
    gameState.totalClicks++;
    gameState.sessionClicks++;
}

function setClickPower(power) {
    gameState.clickPower = power;
}

function addClickPower(bonus) {
    gameState.clickPower += bonus;
}

function setProductionPerSecond(pps) {
    gameState.productionPerSecond = pps;
}

function incrementUpgrades(count = 1) {
    gameState.totalUpgrades += count;
    gameState.sessionUpgrades += count;
}

function incrementBossDefeated() {
    gameState.bossDefeated++;
    gameState.sessionBoss++;
}

function incrementQuizCorrect() {
    gameState.quizCorrect++;
    gameState.sessionQuiz++;
}

function setCombo(combo) {
    gameState.currentCombo = combo;
    if (combo > gameState.maxCombo) {
        gameState.maxCombo = combo;
    }
}

function resetCombo() {
    gameState.currentCombo = 0;
}

function addActiveEffect(effect) {
    gameState.activeEffects.push(effect);
}

function cleanExpiredEffects() {
    const now = Date.now();
    gameState.activeEffects = gameState.activeEffects.filter(e => e.endTime > now);
}

function setVillageLevel(level) {
    gameState.currentVillageLevel = level;
}

function addTriggeredMilestone(score) {
    if (!gameState.triggeredMilestones.includes(score)) {
        gameState.triggeredMilestones.push(score);
    }
}

// ============================================
// PRESTIGE
// ============================================

function addPrestigePoints(points) {
    gameState.prestigePoints += points;
    gameState.prestigeLevel += points;
}

function setPrestigeUpgrade(upgradeId, level) {
    gameState.prestigeUpgrades[upgradeId] = level;
}

function getPrestigeUpgradeLevel(upgradeId) {
    return gameState.prestigeUpgrades[upgradeId] || 0;
}

// ============================================
// SKINS & THEMES
// ============================================

function setCurrentSkin(skinId) {
    gameState.currentSkin = skinId;
}

function unlockSkin(skinId) {
    if (!gameState.skinsUnlocked.includes(skinId)) {
        gameState.skinsUnlocked.push(skinId);
    }
}

function isSkinUnlocked(skinId) {
    return gameState.skinsUnlocked.includes(skinId);
}

function setCurrentTheme(themeId) {
    gameState.currentTheme = themeId;
}

// ============================================
// SETTINGS
// ============================================

function setSoundEnabled(enabled) {
    gameState.soundEnabled = enabled;
}

function setParticlesEnabled(enabled) {
    gameState.particlesEnabled = enabled;
}

function setTutorialCompleted(completed) {
    gameState.tutorialCompleted = completed;
}

// ============================================
// DAILY MISSIONS
// ============================================

function setDailyMissions(missions) {
    gameState.dailyMissions = missions;
}

function setDailyMissionsDate(date) {
    gameState.dailyMissionsDate = date;
}

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

function loadStateFromSave(data) {
    Object.keys(data).forEach(key => {
        if (gameState.hasOwnProperty(key)) {
            gameState[key] = data[key];
        }
    });
}

// Exposer gameState globalement pour compatibilité avec le code existant
// À terme, on utilisera uniquement les getters/setters
window.gameState = gameState;
