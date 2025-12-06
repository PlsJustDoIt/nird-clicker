/**
 * @file NIRD Clicker - Game Loop Unifié
 * @description Un seul setInterval pour tout, optimisé pour les performances
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// CONFIGURATION DU GAME LOOP
// ============================================

/** @type {number} Intervalle du game loop en ms (1 tick par seconde) */
var TICK_RATE = 1000;

/** @type {number|null} ID du setInterval du game loop */
var gameLoopId = null;

/** @type {number} Timestamp du dernier tick */
var lastTickTime = Date.now();

/**
 * Compteurs pour les actions périodiques
 * @type {TickCounters}
 */
var tickCounters = {
    production: 0,      // Chaque tick
    save: 0,            // Toutes les 10 secondes
    effects: 0,         // Chaque tick
    events: 0,          // Toutes les 5 secondes
    tips: 0,            // Toutes les 60 secondes
    quiz: 0,            // Toutes les 90 secondes
    uiRefresh: 0        // Chaque tick (ou moins souvent)
};

/**
 * Intervalles en nombre de ticks
 * @type {TickIntervals}
 */
var TICK_INTERVALS = {
    production: 1,      // Chaque seconde
    save: 10,           // Toutes les 10 secondes
    effects: 1,         // Chaque seconde
    events: 5,          // Toutes les 5 secondes
    tips: 60,           // Toutes les 60 secondes
    quiz: 90,           // Toutes les 90 secondes
    uiRefresh: 1        // Chaque seconde
};

/** @type {boolean} Flag pour éviter les doubles exécutions */
var isGameLoopRunning = false;

// ============================================
// GAME LOOP PRINCIPAL
// ============================================

/**
 * Démarre le game loop unifié
 */
function startGameLoop() {
    if (isGameLoopRunning) {
        console.warn('⚠️ Game loop déjà en cours');
        return;
    }
    
    isGameLoopRunning = true;
    lastTickTime = Date.now();
    
    console.log('🎮 Game loop démarré (tick rate: ' + TICK_RATE + 'ms)');
    
    // Un seul setInterval pour tout !
    gameLoopId = setInterval(gameTick, TICK_RATE);
    
    // Programmer le premier boss
    scheduleBoss();
}

/**
 * Arrête le game loop
 */
function stopGameLoop() {
    if (gameLoopId) {
        clearInterval(gameLoopId);
        gameLoopId = null;
    }
    isGameLoopRunning = false;
    console.log('🛑 Game loop arrêté');
}

/**
 * Un tick du game loop - exécuté toutes les TICK_RATE ms
 */
function gameTick() {
    const now = Date.now();
    const _deltaTime = now - lastTickTime; // Préfixé pour usage futur
    lastTickTime = now;
    
    // Incrémenter tous les compteurs
    Object.keys(tickCounters).forEach(key => {
        tickCounters[key]++;
    });
    
    // === PRODUCTION (chaque tick) ===
    if (tickCounters.production >= TICK_INTERVALS.production) {
        tickCounters.production = 0;
        tickProduction();
    }
    
    // === NETTOYAGE DES EFFETS (chaque tick) ===
    if (tickCounters.effects >= TICK_INTERVALS.effects) {
        tickCounters.effects = 0;
        tickEffects();
    }
    
    // === MISE À JOUR UI (chaque tick) ===
    if (tickCounters.uiRefresh >= TICK_INTERVALS.uiRefresh) {
        tickCounters.uiRefresh = 0;
        tickUI();
    }
    
    // === ÉVÉNEMENTS ALÉATOIRES (toutes les 5 secondes) ===
    if (tickCounters.events >= TICK_INTERVALS.events) {
        tickCounters.events = 0;
        tickEvents();
    }
    
    // === SAUVEGARDE AUTO (toutes les 10 secondes) ===
    if (tickCounters.save >= TICK_INTERVALS.save) {
        tickCounters.save = 0;
        tickSave();
    }
    
    // === TIPS (toutes les 60 secondes) ===
    if (tickCounters.tips >= TICK_INTERVALS.tips) {
        tickCounters.tips = 0;
        tickTips();
    }
    
    // === QUIZ (toutes les 90 secondes) ===
    if (tickCounters.quiz >= TICK_INTERVALS.quiz) {
        tickCounters.quiz = 0;
        tickQuiz();
    }
}

// ============================================
// FONCTIONS DE TICK INDIVIDUELLES
// ============================================

/**
 * Tick de production - ajoute les points par seconde
 */
function tickProduction() {
    if (gameState.productionPerSecond > 0) {
        gameState.score += gameState.productionPerSecond;
        gameState.totalScore += gameState.productionPerSecond;
        gameState.sessionScore += gameState.productionPerSecond;
        
        // Vérifications légères
        if (typeof checkUnlocks === 'function') checkUnlocks();
        if (typeof checkMilestoneEvents === 'function') checkMilestoneEvents();
    }
}

/**
 * Tick des effets - nettoie les effets expirés
 */
function tickEffects() {
    const now = Date.now();
    const previousCount = gameState.activeEffects.length;
    
    gameState.activeEffects = gameState.activeEffects.filter(e => e.endTime > now);
    
    // Recalculer la production si des effets ont expiré
    if (previousCount > 0 && gameState.activeEffects.length !== previousCount) {
        if (typeof calculateProductionPerSecond === 'function') {
            calculateProductionPerSecond();
        }
    }
}

/**
 * Tick UI - mise à jour de l'affichage
 */
function tickUI() {
    // Mise à jour du score (toujours)
    if (typeof updateScoreDisplay === 'function') {
        updateScoreDisplay();
    }
    
    // Mise à jour des upgrades seulement si nécessaire
    // (en mode MAX ou si le score a beaucoup changé)
    if (typeof buyMode !== 'undefined' && buyMode === 'max') {
        if (typeof updateUpgradesList === 'function') {
            updateUpgradesList();
        }
    }
}

/**
 * Tick événements - tente de déclencher un événement aléatoire
 */
function tickEvents() {
    if (typeof tryRandomEvent === 'function') {
        tryRandomEvent();
    }
}

/**
 * Tick sauvegarde - sauvegarde automatique
 */
function tickSave() {
    if (typeof saveGame === 'function') {
        saveGame();
    }
}

/**
 * Tick tips - affiche une astuce aléatoire
 */
function tickTips() {
    if (gameState.totalScore >= 100 && Math.random() < 0.2) {
        if (typeof showRandomTip === 'function') {
            showRandomTip();
        }
    }
}

/**
 * Tick quiz - tente de lancer un quiz
 */
function tickQuiz() {
    if (gameState.totalScore >= 500 && Math.random() < 0.3) {
        if (typeof showQuiz === 'function' && typeof currentQuiz !== 'undefined' && !currentQuiz) {
            showQuiz();
        }
    }
}

// ============================================
// BOSS SCHEDULING (séparé car timing aléatoire)
// ============================================
var bossScheduleTimeout = null;

/**
 * Programme l'apparition du prochain boss
 */
function scheduleBoss() {
    // Nettoyer le timeout précédent
    if (bossScheduleTimeout) {
        clearTimeout(bossScheduleTimeout);
    }
    
    // Intervalle aléatoire entre BOSS_INTERVAL_MIN et BOSS_INTERVAL_MAX
    const minDelay = typeof BOSS_INTERVAL_MIN !== 'undefined' ? BOSS_INTERVAL_MIN : 45000;
    const maxDelay = typeof BOSS_INTERVAL_MAX !== 'undefined' ? BOSS_INTERVAL_MAX : 120000;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    
    bossScheduleTimeout = setTimeout(() => {
        // Ne déclencher que si le joueur a assez de points
        if (gameState.totalScore >= 100) {
            if (typeof showBoss === 'function') {
                showBoss();
            }
        }
        // Reprogrammer le prochain boss
        scheduleBoss();
    }, delay);
}

/**
 * Annule le prochain boss programmé
 */
function cancelScheduledBoss() {
    if (bossScheduleTimeout) {
        clearTimeout(bossScheduleTimeout);
        bossScheduleTimeout = null;
    }
}

// ============================================
// UTILITAIRES DE DEBUG
// ============================================

/**
 * Obtient les stats du game loop
 * @returns {object} Statistiques du game loop
 */
function getLoopStats() {
    return {
        isRunning: isGameLoopRunning,
        tickRate: TICK_RATE,
        counters: { ...tickCounters },
        intervals: { ...TICK_INTERVALS }
    };
}

/**
 * Modifie un intervalle de tick (pour debug/tuning)
 * @param {string} key - Clé de l'intervalle à modifier
 * @param {number} ticks - Nouveau nombre de ticks
 */
function setTickInterval(key, ticks) {
    if (Object.prototype.hasOwnProperty.call(TICK_INTERVALS, key)) {
        TICK_INTERVALS[key] = ticks;
        console.log(`⚙️ Intervalle "${key}" changé à ${ticks} ticks`);
    }
}

// Exposer globalement
window.startGameLoop = startGameLoop;
window.stopGameLoop = stopGameLoop;
window.scheduleBoss = scheduleBoss;
window.cancelScheduledBoss = cancelScheduledBoss;
window.getLoopStats = getLoopStats;
window.setTickInterval = setTickInterval;
