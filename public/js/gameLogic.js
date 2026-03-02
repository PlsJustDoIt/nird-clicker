/**
 * @file NIRD Clicker - Logique du jeu (Version Complète)
 * @description Gestion des calculs, prestige, quiz, missions et progression
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 * 
 * Note: gameState, audio et save sont maintenant dans core/
 */

// ============================================
// COMPATIBILITÉ - Ces variables sont définies dans core/
// Si core/ n'est pas chargé, on les définit ici en fallback
// ============================================
if (typeof gameState === 'undefined') {
    console.warn('⚠️ core/state.js non chargé, utilisation du fallback');
    var gameState = {
        score: 0,
        totalScore: 0,
        lifetimeScore: 0,
        totalClicks: 0,
        totalUpgrades: 0,
        clickPower: 1,
        productionPerSecond: 0,
        bossDefeated: 0,
        activeEffects: [],
        lastSave: Date.now(),
        startTime: Date.now(),
        currentVillageLevel: 0,
        prestigeLevel: 0,
        prestigePoints: 0,
        prestigeUpgrades: {},
        currentSkin: 'default',
        skinsUnlocked: ['default'],
        quizCorrect: 0,
        maxCombo: 0,
        currentCombo: 0,
        soundEnabled: true,
        particlesEnabled: true,
        currentTheme: 'dark',
        tutorialCompleted: false,
        dailyMissions: [],
        dailyMissionsDate: null,
        sessionClicks: 0,
        sessionScore: 0,
        sessionUpgrades: 0,
        sessionBoss: 0,
        sessionQuiz: 0,
        triggeredMilestones: []
    };
}

/**
 * Initialise le jeu
 * Charge la sauvegarde, calcule la production et démarre le game loop
 */
function initGame() {
    loadGame();
    calculateProductionPerSecond();
    startGameLoop();
    checkUnlocks();
    initDailyMissions();
    initAudio();
    applyTheme(gameState.currentTheme);
    applySkin(gameState.currentSkin);
    updateUI();
    
    // Démarrer le tutoriel si première partie
    if (!gameState.tutorialCompleted && gameState.totalClicks === 0) {
        setTimeout(startTutorial, 1000);
    }
    
    // Planifier quiz et tips
    scheduleQuiz();
    scheduleTips();
}

// ============================================
// Note: initAudio() et playSound() sont dans core/audio.js
// On garde un fallback si le module n'est pas chargé
// ============================================
if (typeof initAudio === 'undefined') {
    var audioContext = null;
    
    /**
     *
     */
    function initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio non supporté');
        }
    }
    
    /**
     *
     * @param type
     */
    function playSound(type) {
        if (!gameState.soundEnabled || !audioContext) return;
        // Version simplifiée en fallback
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 440;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {}
    }
}

/**
 * Calcule la vraie puissance de clic (avec bonus prestige)
 * @returns {number} Puissance de clic effective
 */
function getEffectiveClickPower() {
    const prestigeBonus = 1 + (gameState.prestigeLevel * PRESTIGE_BONUS_PER_LEVEL);
    return Math.floor(gameState.clickPower * prestigeBonus);
}


/**
 * Calcule le coût actuel d'une upgrade
 * @param {Upgrade} upgrade - L'upgrade dont on veut le coût
 * @returns {number} Coût de la prochaine unité
 */
function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, upgrade.owned));
}

/**
 * Calcule la production passive par seconde (avec bonus prestige)
 * @returns {number} Production par seconde
 */
function calculateProductionPerSecond() {
    let baseProduction = 0;
    
    UPGRADES.forEach(upgrade => {
        baseProduction += upgrade.baseProduction * upgrade.owned;
    });
    
    // Appliquer le bonus de prestige
    const prestigeBonus = 1 + (gameState.prestigeLevel * PRESTIGE_BONUS_PER_LEVEL);
    baseProduction *= prestigeBonus;
    
    // Appliquer les effets actifs
    let multiplier = 1;
    gameState.activeEffects.forEach(effect => {
        if (effect.type === 'production_doubled') multiplier *= 2;
        if (effect.type === 'production_tripled') multiplier *= 3;
        if (effect.type === 'production_x5') multiplier *= 5;
        if (effect.type === 'production_x10') multiplier *= 10;
        if (effect.type === 'production_x20') multiplier *= 20;
        if (effect.type === 'production_halved') multiplier *= 0.5;
        if (effect.type === 'clicks_only') multiplier = 0;
    });
    
    gameState.productionPerSecond = Math.floor(baseProduction * multiplier);
    return gameState.productionPerSecond;
}

/**
 * Gère un clic sur le bouton principal
 * Ajoute les points, met à jour le combo, joue le son et met à jour l'UI
 */
function handleClick() {
    // Utiliser la vraie puissance de clic (avec bonus prestige)
    const points = getEffectiveClickPower();
    
    gameState.score += points;
    gameState.totalScore += points;
    gameState.lifetimeScore += points;
    gameState.totalClicks++;
    gameState.sessionClicks++;
    gameState.sessionScore += points;
    
    // Mise à jour immédiate du compteur de clics
    const totalClicksEl = document.getElementById('total-clicks');
    if (totalClicksEl) totalClicksEl.textContent = formatNumber(gameState.totalClicks);
    
    // Mise à jour immédiate du compteur de PC libérés
    const pcLiberatedEl = document.getElementById('pc-liberated');
    if (pcLiberatedEl) pcLiberatedEl.textContent = formatNumber(gameState.totalUpgrades);
    
    // Gestion du combo
    updateCombo();
    
    // Son de clic
    playSound('click');
    
    // Animation et feedback
    showClickFeedback(points);
    createFloatingNumber(points);
    
    // Particules
    if (gameState.particlesEnabled) {
        createParticles();
    }
    
    // Vérifier les succès et missions
    checkAchievements();
    checkDailyMissions();
    
    // Mise à jour UI
    updateScoreDisplay();
    updateStatsDisplay();
    updateComboDisplay();
    
    // Mise à jour des upgrades en mode MAX (toutes les 10 clics pour performance)
    if (buyMode === 'max' && gameState.totalClicks % 10 === 0) {
        updateUpgradesList();
    }
}

/**
 * Met à jour le combo de clics
 * Reset automatiquement après 1.5 secondes sans clic
 */
function updateCombo() {
    gameState.currentCombo++;
    
    if (gameState.currentCombo > gameState.maxCombo) {
        gameState.maxCombo = gameState.currentCombo;
    }
    
    // Reset combo après 1.5 secondes sans clic
    clearTimeout(window.comboTimeout);
    window.comboTimeout = setTimeout(() => {
        gameState.currentCombo = 0;
        updateComboDisplay();
    }, 1500);
}

// NOTE: buyMode et setBuyMode sont maintenant dans ui/upgrades-ui.js

/**
 * Calcule le coût total pour acheter N upgrades
 * @param {Upgrade} upgrade - L'upgrade à acheter
 * @param {number} count - Nombre d'unités à acheter
 * @returns {number} Coût total
 */
function getMultiUpgradeCost(upgrade, count) {
    let totalCost = 0;
    for (let i = 0; i < count; i++) {
        totalCost += Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, upgrade.owned + i));
    }
    return totalCost;
}

/**
 * Calcule combien d'upgrades on peut acheter avec le score actuel
 * @param {Upgrade} upgrade - L'upgrade à analyser
 * @returns {{count: number, totalCost: number}} Nombre et coût total
 */
function getMaxAffordable(upgrade) {
    let count = 0;
    let totalCost = 0;
    let tempOwned = upgrade.owned;
    
    while (true) {
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, tempOwned));
        if (totalCost + nextCost > gameState.score) break;
        totalCost += nextCost;
        tempOwned++;
        count++;
        if (count > 1000) break; // Sécurité
    }
    
    return { count, totalCost };
}

/**
 * Achète une upgrade de production (avec support multi-achat)
 * @param {string} upgradeId - ID de l'upgrade à acheter
 * @param {number|null} [forceCount=null] - Forcer un nombre d'achats
 * @returns {boolean} True si l'achat a réussi
 */
function buyUpgrade(upgradeId, forceCount = null) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    let count = forceCount || buyMode;
    let totalCost;
    
    if (count === 'max') {
        const maxInfo = getMaxAffordable(upgrade);
        count = maxInfo.count;
        totalCost = maxInfo.totalCost;
    } else {
        totalCost = getMultiUpgradeCost(upgrade, count);
    }
    
    if (count === 0) {
        showNotification('Pas assez de points !', 'error');
        return false;
    }
    
    if (gameState.score >= totalCost) {
        gameState.score -= totalCost;
        upgrade.owned += count;
        gameState.totalUpgrades += count;
        gameState.sessionUpgrades += count;
        
        calculateProductionPerSecond();
        checkUnlocks();
        checkAchievements();
        checkDailyMissions();
        updateUI();
        
        playSound('upgrade');
        // Notification
        if (count > 1) {
            showNotification(`${upgrade.icon} ${upgrade.name} x${count} acheté !`, 'success');
        } else {
            showNotification(`${upgrade.icon} ${upgrade.name} acheté !`, 'success');
        }
        
        return true;
    } else {
        showNotification('Pas assez de points !', 'error');
        return false;
    }
}

/**
 * Achète une amélioration de clic
 * @param {string} upgradeId - ID de l'amélioration à acheter
 * @returns {boolean} True si l'achat a réussi
 */
function buyClickUpgrade(upgradeId) {
    const upgrade = CLICK_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased) return false;
    
    if (gameState.score >= upgrade.cost) {
        gameState.score -= upgrade.cost;
        gameState.clickPower += upgrade.bonus;
        upgrade.purchased = true;
        
        updateUI();
        playSound('upgrade');
        showNotification(`${upgrade.name} acheté ! +${upgrade.bonus} par clic`, 'success');
        checkAchievements();
        
        return true;
    }
    return false;
}

/**
 * Achète ou équipe un skin
 * @param {string} skinId - ID du skin
 * @returns {boolean} True si l'achat/équipement a réussi
 */
function buySkin(skinId) {
    // Chercher dans SKINS
    let skin = null;
    if (typeof SKINS !== 'undefined') {
        skin = SKINS.find(s => s.id === skinId);
    }
    if (!skin) return false;
    
    // Initialiser skinsUnlocked si nécessaire
    if (!gameState.skinsUnlocked) {
        gameState.skinsUnlocked = ['default'];
    }
    
    const isOwned = gameState.skinsUnlocked.includes(skinId) || skin.owned;
    
    if (isOwned) {
        // Équiper le skin
        gameState.currentSkin = skinId;
        applySkin(skinId);
        showNotification(`${skin.emoji} ${skin.name} équipé !`, 'success');
        renderSkins();
        return true;
    }
    
    if (gameState.score >= skin.cost) {
        gameState.score -= skin.cost;
        skin.owned = true;
        gameState.skinsUnlocked.push(skinId);
        gameState.currentSkin = skinId;
        applySkin(skinId);
        
        playSound('upgrade');
        showNotification(`${skin.emoji} ${skin.name} acheté et équipé !`, 'success');
        checkAchievements();
        updateUI();
        renderSkins();
        
        return true;
    }
    
    showNotification('Pas assez de points !', 'error');
    return false;
}

/**
 * Applique un skin au jeu
 * @param {string} skinId - ID du skin à appliquer
 */
function applySkin(skinId) {
    // Chercher dans SKINS
    let skin = null;
    if (typeof SKINS !== 'undefined') {
        skin = SKINS.find(s => s.id === skinId);
    }
    
    if (skin) {
        const pcIcon = document.querySelector('.pc-icon');
        if (pcIcon) {
            pcIcon.textContent = skin.emoji;
        }
    }
}

// Vérifier les débloquages
/**
 *
 */
function checkUnlocks() {
    UPGRADES.forEach(upgrade => {
        if (!upgrade.unlocked && upgrade.unlockAt && gameState.totalScore >= upgrade.unlockAt) {
            upgrade.unlocked = true;
            playSound('levelup');
            showNotification(`🔓 Nouveau : ${upgrade.name} débloqué !`, 'unlock');
        }
    });
    
    // Vérifier le niveau du village
    let newLevel = 0;
    for (let i = VILLAGE_LEVELS.length - 1; i >= 0; i--) {
        if (gameState.totalScore >= VILLAGE_LEVELS[i].minScore) {
            newLevel = i;
            break;
        }
    }
    
    if (newLevel > gameState.currentVillageLevel) {
        gameState.currentVillageLevel = newLevel;
        const level = VILLAGE_LEVELS[newLevel];
        playSound('levelup');
        showNotification(`🎉 Niveau atteint : ${level.emoji} ${level.name} !`, 'level-up');
        updateVillageVisual();
    }
}

// Mettre à jour le visuel du village
/**
 *
 */
function updateVillageVisual() {
    const villageContainer = document.getElementById('village-visual');
    if (villageContainer) {
        const level = VILLAGE_LEVELS[gameState.currentVillageLevel];
        villageContainer.innerHTML = `
            <div class="village-level-${gameState.currentVillageLevel}">
                <span class="village-emoji">${level.emoji}</span>
                <p class="village-description">${level.description || ''}</p>
            </div>
        `;
    }
}

// Vérifier les succès
/**
 *
 */
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition(gameState)) {
            achievement.unlocked = true;
            playSound('achievement');
            showNotification(`🏆 Succès : ${achievement.icon || ''} ${achievement.name}`, 'achievement');
        }
    });
}

// ============================================
// SYSTÈME DE PRESTIGE
// ============================================
/**
 *
 */
function canPrestige() {
    return gameState.totalScore >= PRESTIGE_THRESHOLD;
}

/**
 *
 */
function calculatePrestigePoints() {
    if (!canPrestige()) return 0;
    return Math.floor(Math.sqrt(gameState.totalScore / PRESTIGE_THRESHOLD));
}

/**
 *
 */
function doPrestige() {
    if (!canPrestige()) {
        showNotification(`Besoin de ${formatNumber(PRESTIGE_THRESHOLD)} points pour prestige !`, 'error');
        return false;
    }
    
    // Afficher la popup de confirmation
    showPrestigeConfirmPopup();
    return true;
}

// Exécute le prestige directement sans confirmation
/**
 *
 */
function doPrestigeDirectly() {
    if (!canPrestige()) {
        return false;
    }
    
    const pointsGained = calculatePrestigePoints();
    
    // Appliquer le prestige
    gameState.prestigePoints += pointsGained;
    gameState.prestigeLevel += pointsGained;
    
    // Reset les données de jeu
    gameState.score = 0;
    gameState.totalScore = 0;
    gameState.totalClicks = 0;
    gameState.totalUpgrades = 0;
    gameState.clickPower = 1;
    gameState.productionPerSecond = 0;
    gameState.currentVillageLevel = 0;
    
    // Reset les upgrades
    UPGRADES.forEach(u => {
        u.owned = 0;
        u.unlocked = u.unlockAt ? false : true;
    });
    
    // Reset les click upgrades
    CLICK_UPGRADES.forEach(u => {
        u.purchased = false;
    });
    
    // Garder les skins et achievements
    
    playSound('prestige');
    showNotification(`🔄 Prestige ! +${pointsGained} points, bonus +${gameState.prestigeLevel * 10}%`, 'prestige');
    
    calculateProductionPerSecond();
    saveGame();
    updateUI();
    
    return true;
}

// Alias pour la compatibilité
/**
 *
 */
function performPrestige() {
    return doPrestige();
}

// Alias pour gamepad.js
/**
 *
 */
function doPrestigeWithoutConfirm() {
    return doPrestigeDirectly();
}

// Acheter une amélioration de prestige
/**
 *
 * @param upgradeId
 */
function buyPrestigeUpgrade(upgradeId) {
    if (typeof PRESTIGE_UPGRADES === 'undefined') return false;
    
    const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    // Vérifier si déjà acheté
    if (!gameState.prestigeUpgrades) gameState.prestigeUpgrades = {};
    if (gameState.prestigeUpgrades[upgradeId]) {
        showNotification('Déjà acheté !', 'info');
        return false;
    }
    
    // Vérifier si on peut se le permettre
    if (gameState.prestigePoints < upgrade.cost) {
        showNotification('Pas assez de points de prestige !', 'error');
        return false;
    }
    
    // Acheter
    gameState.prestigePoints -= upgrade.cost;
    gameState.prestigeUpgrades[upgradeId] = true;
    
    // Appliquer l'effet
    if (upgrade.effect) {
        switch(upgrade.effect.type) {
            case 'clickMultiplier':
                gameState.clickPower = Math.floor(gameState.clickPower * upgrade.effect.value);
                break;
            case 'productionMultiplier':
                // Sera appliqué dans calculateProductionPerSecond
                break;
            case 'startBonus':
                // Sera appliqué au prochain prestige
                break;
        }
    }
    
    playSound('upgrade');
    showNotification(`⭐ ${upgrade.name} acheté !`, 'success');
    
    calculateProductionPerSecond();
    saveGame();
    updatePrestigeDisplay();
    renderPrestigeUpgrades();
    
    return true;
}

// ============================================
// SYSTÈME DE QUIZ
// ============================================
var currentQuiz = null;

// Note: scheduleQuiz n'est plus nécessaire, géré par core/loop.js
// On garde la fonction vide pour compatibilité
/**
 *
 */
function scheduleQuiz() {
    // Géré par core/loop.js - tickQuiz()
    console.log('📝 Quiz scheduling géré par core/loop.js');
}

/**
 * Fonction publique pour déclencher un quiz
 * Utilise le système de queue pour éviter les conflits avec les boss
 */
function showQuiz() {
    if (currentQuiz) return;
    
    // Vérifier si un événement est en cours (boss, autre quiz, milestone)
    if (typeof isEventActive === 'function' && isEventActive()) {
        if (typeof queueEvent === 'function') {
            queueEvent('quiz');
        }
        return;
    }
    
    // Marquer qu'un événement est en cours
    if (typeof isEventInProgress !== 'undefined') {
        isEventInProgress = true;
    }
    
    _showQuizInternal();
}

/**
 * Fonction interne pour afficher le quiz (appelée par la queue ou directement)
 */
function _showQuizInternal() {
    if (currentQuiz) return;
    
    const question = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    currentQuiz = question;
    
    // Mélanger les réponses
    const shuffledAnswers = [...question.answers];
    const correctAnswer = shuffledAnswers[question.correct];
    shuffleArray(shuffledAnswers);
    const newCorrectIndex = shuffledAnswers.indexOf(correctAnswer);
    
    document.body.classList.add('modal-open'); // Bloquer le scroll
    
    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.innerHTML = `
        <div class="quiz-content">
            <h2>🧠 Quiz NIRD !</h2>
            <p class="quiz-question">${question.question}</p>
            <div class="quiz-answers">
                ${shuffledAnswers.map((answer, i) => `
                    <button class="quiz-answer" data-index="${i}" data-correct="${i === newCorrectIndex}">${answer}</button>
                `).join('')}
            </div>
            <button class="quiz-skip" onclick="skipQuiz()">Passer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('.quiz-answer').forEach(btn => {
        btn.addEventListener('click', (e) => handleQuizAnswer(e, question));
    });
}

/**
 *
 * @param e
 * @param question
 */
function handleQuizAnswer(e, question) {
    const isCorrect = e.target.dataset.correct === 'true';
    
    if (isCorrect) {
        gameState.quizCorrect++;
        gameState.sessionQuiz++;
        const bonus = gameState.productionPerSecond * 30 + 100;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        
        playSound('achievement');
        showNotification(`✅ Bonne réponse ! +${formatNumber(bonus)} points`, 'success');
        checkAchievements();
        checkDailyMissions();
    } else {
        showNotification(`❌ Mauvaise réponse ! ${question.info}`, 'error');
    }
    
    closeQuiz();
}

/**
 *
 */
function skipQuiz() {
    showNotification('Quiz passé', 'info');
    closeQuiz();
}

/**
 *
 */
function closeQuiz() {
    currentQuiz = null;
    document.body.classList.remove('modal-open'); // Réactiver le scroll
    const modal = document.querySelector('.quiz-modal');
    if (modal) modal.remove();
    
    // Traiter la queue d'événements
    if (typeof onEventComplete === 'function') {
        onEventComplete();
    }
}

// ============================================
// MISSIONS QUOTIDIENNES
// ============================================
/**
 *
 */
function initDailyMissions() {
    const today = new Date().toDateString();
    
    if (gameState.dailyMissionsDate !== today) {
        // Nouvelles missions quotidiennes
        gameState.dailyMissionsDate = today;
        gameState.sessionClicks = 0;
        gameState.sessionScore = 0;
        gameState.sessionUpgrades = 0;
        gameState.sessionBoss = 0;
        gameState.sessionQuiz = 0;
        
        // Sélectionner 3 missions aléatoires
        if (typeof DAILY_MISSIONS !== 'undefined') {
            const shuffled = [...DAILY_MISSIONS].sort(() => 0.5 - Math.random());
            gameState.dailyMissions = shuffled.slice(0, 3).map(m => ({
                ...m,
                progress: 0,
                completed: false
            }));
        }
    }
}

// Alias pour la compatibilité
/**
 *
 */
function generateDailyMissions() {
    initDailyMissions();
}

/**
 *
 */
function checkDailyMissions() {
    gameState.dailyMissions.forEach(mission => {
        if (mission.completed) return;
        
        let progress = 0;
        switch(mission.type) {
            case 'clicks': progress = gameState.sessionClicks; break;
            case 'score': progress = gameState.sessionScore; break;
            case 'upgrades': progress = gameState.sessionUpgrades; break;
            case 'boss': progress = gameState.sessionBoss; break;
            case 'quiz': progress = gameState.sessionQuiz; break;
            case 'combo': progress = gameState.maxCombo; break;
        }
        
        mission.progress = Math.min(progress, mission.target);
        
        if (progress >= mission.target && !mission.completed) {
            mission.completed = true;
            gameState.score += mission.reward;
            gameState.totalScore += mission.reward;
            playSound('achievement');
            showNotification(`🎯 Mission complétée : ${mission.name} ! +${mission.reward}`, 'mission');
        }
    });
    
    updateMissionsUI();
}

// ============================================
// TIPS ÉDUCATIFS
// ============================================
// Note: scheduleTips n'est plus nécessaire, géré par core/loop.js
/**
 *
 */
function scheduleTips() {
    // Géré par core/loop.js - tickTips()
    console.log('💡 Tips scheduling géré par core/loop.js');
}

/**
 *
 */
function showRandomTip() {
    const tip = EDUCATIONAL_TIPS[Math.floor(Math.random() * EDUCATIONAL_TIPS.length)];
    showNotification(tip, 'tip', 6000);
}

// ============================================
// THÈMES
// ============================================
/**
 *
 * @param themeId
 */
function setTheme(themeId) {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;
    
    gameState.currentTheme = themeId;
    applyTheme(themeId);
    saveGame();
    showNotification(`${theme.name} activé !`, 'success');
}

/**
 *
 * @param themeId
 */
function applyTheme(themeId) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
        document.body.classList.add(theme.class);
    }
}

// ============================================
// TUTORIEL
// ============================================
/**
 *
 */
function startTutorial() {
    const steps = [
        { target: '#main-clicker', message: '👆 Cliquez sur le PC pour gagner des points de souveraineté !' },
        { target: '.upgrades-zone', message: '🛒 Achetez des améliorations pour produire automatiquement !' },
        { target: '.resistance-gauge', message: '📊 Faites évoluer votre village vers l\'indépendance numérique !' },
        { target: '.stats-panel', message: '📈 Suivez vos statistiques ici. Bon jeu ! 🎮' }
    ];
    
    let currentStep = 0;
    
    /**
     *
     */
    function showStep() {
        if (currentStep >= steps.length) {
            gameState.tutorialCompleted = true;
            saveGame();
            return;
        }
        
        const step = steps[currentStep];
        const tutorialOverlay = document.createElement('div');
        tutorialOverlay.className = 'tutorial-overlay';
        tutorialOverlay.innerHTML = `
            <div class="tutorial-message">
                <p>${step.message}</p>
                <button onclick="this.parentElement.parentElement.remove(); window.nextTutorialStep();">
                    ${currentStep < steps.length - 1 ? 'Suivant →' : 'Commencer !'}
                </button>
            </div>
        `;
        
        document.body.appendChild(tutorialOverlay);
        
        const target = document.querySelector(step.target);
        if (target) {
            target.classList.add('tutorial-highlight');
        }
    }
    
    window.nextTutorialStep = () => {
        const target = document.querySelector(steps[currentStep].target);
        if (target) target.classList.remove('tutorial-highlight');
        currentStep++;
        showStep();
    };
    
    showStep();
}

// ============================================
// BOUCLE DE JEU
// Note: startGameLoop est maintenant dans core/loop.js
// On garde un fallback si le module n'est pas chargé
// ============================================
if (typeof startGameLoop === 'undefined') {
    console.warn('⚠️ core/loop.js non chargé, utilisation du fallback');
    
    /**
     *
     */
    function startGameLoop() {
        // Production automatique
        setInterval(() => {
            if (gameState.productionPerSecond > 0) {
                gameState.score += gameState.productionPerSecond;
                gameState.totalScore += gameState.productionPerSecond;
                gameState.lifetimeScore += gameState.productionPerSecond;
                gameState.sessionScore += gameState.productionPerSecond;
                checkUnlocks();
                checkAchievements();
                checkDailyMissions();
                updateScoreDisplay();
                
                if (buyMode === 'max') {
                    updateUpgradesList();
                }
            }
        }, 1000);
        
        // Sauvegarde automatique
        setInterval(saveGame, SAVE_INTERVAL);
        
        // Nettoyage des effets
        setInterval(() => {
            const now = Date.now();
            gameState.activeEffects = gameState.activeEffects.filter(e => e.endTime > now);
            calculateProductionPerSecond();
        }, 1000);
        
        // Événements aléatoires
        setInterval(tryRandomEvent, 5000);
        
        // Boss GAFAM
        scheduleBoss();
        
        // Mise à jour périodique de l'UI
        setInterval(() => updateUpgradesList(), 1000);
    }
    
    /**
     *
     */
    function scheduleBoss() {
        const delay = BOSS_INTERVAL_MIN + Math.random() * (BOSS_INTERVAL_MAX - BOSS_INTERVAL_MIN);
        setTimeout(() => {
            if (gameState.totalScore >= 100) {
                showBoss();
            }
            scheduleBoss();
        }, delay);
    }
}

// Événement aléatoire
/**
 *
 */
function tryRandomEvent() {
    if (gameState.totalScore < 500) return;
    
    RANDOM_EVENTS.forEach(event => {
        if (Math.random() < event.probability) {
            triggerEvent(event);
        }
    });
}

// Déclencher un événement
/**
 *
 * @param event
 */
function triggerEvent(event) {
    showEventBanner(event.name, event.description);
    
    if (event.effect === 'instant_bonus') {
        const bonus = gameState.productionPerSecond * event.bonusMultiplier;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        showNotification(`+${formatNumber(bonus)} points !`, 'bonus');
    } else if (event.duration) {
        gameState.activeEffects.push({
            type: event.effect,
            endTime: Date.now() + event.duration
        });
        calculateProductionPerSecond();
    }
}

// ============================================
// SAUVEGARDE / CHARGEMENT
// Note: Ces fonctions sont maintenant dans core/save.js
// On garde un fallback si le module n'est pas chargé
// ============================================
if (typeof saveGame === 'undefined') {
    console.warn('⚠️ core/save.js non chargé, utilisation du fallback');
    
    var isResetting = false;
    
    /**
     *
     */
    function saveGame() {
        if (isResetting) return;
        
        const saveData = {
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
            quizCorrect: gameState.quizCorrect,
            maxCombo: gameState.maxCombo,
            soundEnabled: gameState.soundEnabled,
            particlesEnabled: gameState.particlesEnabled,
            currentTheme: gameState.currentTheme,
            tutorialCompleted: gameState.tutorialCompleted,
            dailyMissions: gameState.dailyMissions,
            dailyMissionsDate: gameState.dailyMissionsDate,
            sessionClicks: gameState.sessionClicks,
            sessionScore: gameState.sessionScore,
            sessionUpgrades: gameState.sessionUpgrades,
            sessionBoss: gameState.sessionBoss,
            sessionQuiz: gameState.sessionQuiz,
            triggeredMilestones: gameState.triggeredMilestones,
            upgrades: UPGRADES.map(u => ({ id: u.id, owned: u.owned, unlocked: u.unlocked })),
            clickUpgrades: CLICK_UPGRADES.map(u => ({ id: u.id, purchased: u.purchased })),
            achievements: ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: a.unlocked })),
            skinsUnlocked: gameState.skinsUnlocked,
            savedAt: Date.now()
        };
        
        localStorage.setItem('nirdClicker_save', JSON.stringify(saveData));
        gameState.lastSave = Date.now();
    }
    
    /**
     *
     */
    function loadGame() {
        const savedData = localStorage.getItem('nirdClicker_save');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(key => {
                    if (gameState.hasOwnProperty(key) && data[key] !== undefined) {
                        gameState[key] = data[key];
                    }
                });
                
                if (data.upgrades) {
                    data.upgrades.forEach(saved => {
                        const upgrade = UPGRADES.find(u => u.id === saved.id);
                        if (upgrade) {
                            upgrade.owned = saved.owned;
                            upgrade.unlocked = saved.unlocked;
                        }
                    });
                }
                
                if (data.clickUpgrades) {
                    data.clickUpgrades.forEach(saved => {
                        const upgrade = CLICK_UPGRADES.find(u => u.id === saved.id);
                        if (upgrade) upgrade.purchased = saved.purchased;
                    });
                }
                
                if (data.achievements) {
                    data.achievements.forEach(saved => {
                        const achievement = ACHIEVEMENTS.find(a => a.id === saved.id);
                        if (achievement) achievement.unlocked = saved.unlocked;
                    });
                }
                
                if (data.skinsUnlocked) {
                    gameState.skinsUnlocked = data.skinsUnlocked;
                } else if (data.skins) {
                    gameState.skinsUnlocked = data.skins.filter(s => s.owned).map(s => s.id);
                    if (!gameState.skinsUnlocked.includes('default')) {
                        gameState.skinsUnlocked.unshift('default');
                    }
                }
                
                if (data.savedAt) {
                    const offlineTime = (Date.now() - data.savedAt) / 1000;
                    const offlineProduction = calculateProductionPerSecond();
                    const offlineGain = Math.floor(offlineProduction * offlineTime * 0.1);
                    
                    if (offlineGain > 0 && offlineTime > 60) {
                        gameState.score += offlineGain;
                        gameState.totalScore += offlineGain;
                        setTimeout(() => {
                            showNotification(`🌙 Gains hors-ligne : +${formatNumber(offlineGain)} points !`, 'offline');
                        }, 1000);
                    }
                }
                
                console.log('Partie chargée !');
            } catch (e) {
                console.error('Erreur lors du chargement :', e);
            }
        }
    }
    
    /**
     *
     */
    function resetGame() {
        isResetting = true;
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Erreur lors du clear:', e);
        }
        window.location.reload(true);
    }
}

// ============================================
// UTILITAIRES
// Note: Ces fonctions sont maintenant dans utils/helpers.js
// On garde un fallback si le module n'est pas chargé
// ============================================
if (typeof formatNumber === 'undefined') {
    /**
     *
     * @param num
     */
    function formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toString();
    }
}

if (typeof shuffleArray === 'undefined') {
    /**
     *
     * @param array
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// ============================================
// LEADERBOARD
// ============================================

// Récupérer le leaderboard
/**
 *
 */
async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        if (data.success) {
            return data.leaderboard;
        }
        return [];
    } catch (err) {
        console.error('Erreur fetch leaderboard:', err);
        return [];
    }
}

// Soumettre le score au leaderboard
/**
 *
 * @param pseudo
 */
async function submitScore(pseudo) {
    if (!pseudo || pseudo.length < 2) {
        showNotification('Pseudo trop court (min 2 caractères)', 'error');
        return false;
    }
    
    try {
        const playTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        
        const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pseudo: pseudo,
                score: gameState.lifetimeScore,
                totalClicks: gameState.totalClicks,
                prestigeLevel: gameState.prestigeLevel,
                bossDefeated: gameState.bossDefeated,
                playTime: playTime
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            gameState.playerPseudo = pseudo;
            localStorage.setItem('nirdClicker_pseudo', pseudo);
            
            if (data.updated) {
                showNotification('🏆 Score enregistré dans le leaderboard !', 'success');
            } else {
                showNotification('Score déjà enregistré (meilleur existant)', 'info');
            }
            return true;
        } else {
            showNotification(data.error || 'Erreur lors de la soumission', 'error');
            return false;
        }
    } catch (err) {
        console.error('Erreur submit score:', err);
        showNotification('Erreur de connexion au serveur', 'error');
        return false;
    }
}

// Récupérer le rang du joueur
/**
 *
 * @param pseudo
 */
async function fetchPlayerRank(pseudo) {
    try {
        const response = await fetch(`/api/leaderboard/rank/${encodeURIComponent(pseudo)}`);
        const data = await response.json();
        if (data.success) {
            return data;
        }
        return null;
    } catch (err) {
        console.error('Erreur fetch rank:', err);
        return null;
    }
}

// Formater le temps de jeu
/**
 *
 * @param seconds
 */
function formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Exposer les fonctions globalement
window.initGame = initGame;
window.showQuiz = showQuiz;
window.handleClick = handleClick;
window.buyUpgrade = buyUpgrade;
window.buyClickUpgrade = buyClickUpgrade;
window.buySkin = buySkin;
window.doPrestige = doPrestige;
window.resetGame = resetGame;
window.getEffectiveClickPower = getEffectiveClickPower;
window.canPrestige = canPrestige;
window.calculatePrestigePoints = calculatePrestigePoints;
window.buyPrestigeUpgrade = buyPrestigeUpgrade;
window.getMultiUpgradeCost = getMultiUpgradeCost;
window.getMaxAffordable = getMaxAffordable;
window.checkAchievements = checkAchievements;
window.checkDailyMissions = checkDailyMissions;
window.submitScore = submitScore;
window.fetchLeaderboard = fetchLeaderboard;
