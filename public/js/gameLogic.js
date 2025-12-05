/**
 * NIRD Clicker - Logique du jeu (Version Complète)
 * Gestion de l'état, des calculs, prestige, quiz, missions et progression
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// État global du jeu
let gameState = {
    score: 0,
    totalScore: 0,
    totalClicks: 0,
    totalUpgrades: 0,
    clickPower: 1,
    productionPerSecond: 0,
    bossDefeated: 0,
    activeEffects: [],
    lastSave: Date.now(),
    startTime: Date.now(),
    currentVillageLevel: 0,
    // Nouveaux champs
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

// Audio context pour les sons
let audioContext = null;

// Initialisation du jeu
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

// Initialisation audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio non supporté');
    }
}

// Jouer un son synthétisé
function playSound(type) {
    if (!gameState.soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'click':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
            case 'upgrade':
                oscillator.frequency.value = 523;
                oscillator.type = 'triangle';
                gainNode.gain.value = 0.15;
                oscillator.start();
                oscillator.frequency.exponentialRampToValueAtTime(1047, audioContext.currentTime + 0.15);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'achievement':
                oscillator.frequency.value = 440;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
            case 'boss':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'levelup':
                oscillator.frequency.value = 330;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.3);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
            case 'prestige':
                oscillator.frequency.value = 220;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.25;
                oscillator.start();
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);
                oscillator.stop(audioContext.currentTime + 0.6);
                break;
        }
    } catch (e) {
        console.log('Erreur audio:', e);
    }
}

// Calcul du coût d'une upgrade
function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, upgrade.owned));
}

// Calcul de la production par seconde (avec bonus prestige)
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
        if (effect.type === 'production_halved') multiplier *= 0.5;
        if (effect.type === 'clicks_only') multiplier = 0;
    });
    
    gameState.productionPerSecond = Math.floor(baseProduction * multiplier);
    return gameState.productionPerSecond;
}

// Gestion du clic
function handleClick() {
    // Bonus de prestige sur les clics
    const prestigeBonus = 1 + (gameState.prestigeLevel * PRESTIGE_BONUS_PER_LEVEL);
    const points = Math.floor(gameState.clickPower * prestigeBonus);
    
    gameState.score += points;
    gameState.totalScore += points;
    gameState.totalClicks++;
    gameState.sessionClicks++;
    gameState.sessionScore += points;
    
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

// Gestion du combo de clics
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

// Mode d'achat actuel (1, 10, 50, 'max')
let buyMode = 1;

// Changer le mode d'achat
function setBuyMode(mode) {
    buyMode = mode;
    updateBuyModeButtons();
    updateUpgradesList();
}

// Calculer le coût total pour acheter N upgrades
function getMultiUpgradeCost(upgrade, count) {
    let totalCost = 0;
    for (let i = 0; i < count; i++) {
        totalCost += Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, upgrade.owned + i));
    }
    return totalCost;
}

// Calculer combien d'upgrades on peut acheter avec le score actuel
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

// Acheter une upgrade (avec support multi-achat)
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

// Acheter une amélioration de clic
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

// Acheter un skin
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

// Appliquer un skin
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
function canPrestige() {
    return gameState.totalScore >= PRESTIGE_THRESHOLD;
}

function calculatePrestigePoints() {
    if (!canPrestige()) return 0;
    return Math.floor(Math.sqrt(gameState.totalScore / PRESTIGE_THRESHOLD));
}

function doPrestige() {
    if (!canPrestige()) {
        showNotification(`Besoin de ${formatNumber(PRESTIGE_THRESHOLD)} points pour prestige !`, 'error');
        return false;
    }
    
    const pointsGained = calculatePrestigePoints();
    
    if (!confirm(`🔄 PRESTIGE\n\nVous allez gagner ${pointsGained} point(s) de prestige !\nBonus actuel : +${(gameState.prestigeLevel * 10)}%\nBonus après : +${((gameState.prestigeLevel + pointsGained) * 10)}%\n\n⚠️ Votre score et vos upgrades seront réinitialisés.\n\nContinuer ?`)) {
        return false;
    }
    
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
function performPrestige() {
    return doPrestige();
}

// Acheter une amélioration de prestige
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
let currentQuiz = null;

function scheduleQuiz() {
    setInterval(() => {
        if (gameState.totalScore >= 500 && !currentQuiz && Math.random() < 0.3) {
            showQuiz();
        }
    }, QUIZ_INTERVAL);
}

function showQuiz() {
    if (currentQuiz) return;
    
    const question = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    currentQuiz = question;
    
    // Mélanger les réponses
    const shuffledAnswers = [...question.answers];
    const correctAnswer = shuffledAnswers[question.correct];
    shuffleArray(shuffledAnswers);
    const newCorrectIndex = shuffledAnswers.indexOf(correctAnswer);
    
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

function skipQuiz() {
    showNotification('Quiz passé', 'info');
    closeQuiz();
}

function closeQuiz() {
    currentQuiz = null;
    const modal = document.querySelector('.quiz-modal');
    if (modal) modal.remove();
}

// ============================================
// MISSIONS QUOTIDIENNES
// ============================================
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
function generateDailyMissions() {
    initDailyMissions();
}

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
function scheduleTips() {
    setInterval(() => {
        if (gameState.totalScore >= 100 && Math.random() < 0.2) {
            showRandomTip();
        }
    }, TIP_INTERVAL);
}

function showRandomTip() {
    const tip = EDUCATIONAL_TIPS[Math.floor(Math.random() * EDUCATIONAL_TIPS.length)];
    showNotification(tip, 'tip', 6000);
}

// ============================================
// THÈMES
// ============================================
function setTheme(themeId) {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;
    
    gameState.currentTheme = themeId;
    applyTheme(themeId);
    saveGame();
    showNotification(`${theme.name} activé !`, 'success');
}

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
function startTutorial() {
    const steps = [
        { target: '#main-clicker', message: '👆 Cliquez sur le PC pour gagner des points de souveraineté !' },
        { target: '.upgrades-zone', message: '🛒 Achetez des améliorations pour produire automatiquement !' },
        { target: '.resistance-gauge', message: '📊 Faites évoluer votre village vers l\'indépendance numérique !' },
        { target: '.stats-panel', message: '📈 Suivez vos statistiques ici. Bon jeu ! 🎮' }
    ];
    
    let currentStep = 0;
    
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
// ============================================
function startGameLoop() {
    // Production automatique
    setInterval(() => {
        if (gameState.productionPerSecond > 0) {
            gameState.score += gameState.productionPerSecond;
            gameState.totalScore += gameState.productionPerSecond;
            gameState.sessionScore += gameState.productionPerSecond;
            checkUnlocks();
            checkAchievements();
            checkDailyMissions();
            updateScoreDisplay();
            
            // Toujours mettre à jour les upgrades en mode MAX
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
    
    // Mise à jour périodique de l'UI (pour les boutons MAX)
    setInterval(() => updateUpgradesList(), 1000);
}

// Programmer l'apparition du boss
function scheduleBoss() {
    const delay = BOSS_INTERVAL_MIN + Math.random() * (BOSS_INTERVAL_MAX - BOSS_INTERVAL_MIN);
    setTimeout(() => {
        if (gameState.totalScore >= 100) {
            showBoss();
        }
        scheduleBoss();
    }, delay);
}

// Événement aléatoire
function tryRandomEvent() {
    if (gameState.totalScore < 500) return;
    
    RANDOM_EVENTS.forEach(event => {
        if (Math.random() < event.probability) {
            triggerEvent(event);
        }
    });
}

// Déclencher un événement
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
// ============================================
let isResetting = false;

function saveGame() {
    // Ne pas sauvegarder si on est en train de reset
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

function loadGame() {
    const savedData = localStorage.getItem('nirdClicker_save');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // Charger tous les champs
            Object.keys(data).forEach(key => {
                if (gameState.hasOwnProperty(key) && data[key] !== undefined) {
                    gameState[key] = data[key];
                }
            });
            
            // Restaurer les upgrades
            if (data.upgrades) {
                data.upgrades.forEach(saved => {
                    const upgrade = UPGRADES.find(u => u.id === saved.id);
                    if (upgrade) {
                        upgrade.owned = saved.owned;
                        upgrade.unlocked = saved.unlocked;
                    }
                });
            }
            
            // Restaurer les click upgrades
            if (data.clickUpgrades) {
                data.clickUpgrades.forEach(saved => {
                    const upgrade = CLICK_UPGRADES.find(u => u.id === saved.id);
                    if (upgrade) upgrade.purchased = saved.purchased;
                });
            }
            
            // Restaurer les succès
            if (data.achievements) {
                data.achievements.forEach(saved => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === saved.id);
                    if (achievement) achievement.unlocked = saved.unlocked;
                });
            }
            
            // Restaurer les skins
            if (data.skinsUnlocked) {
                gameState.skinsUnlocked = data.skinsUnlocked;
            } else if (data.skins) {
                // Migration depuis l'ancien format
                gameState.skinsUnlocked = data.skins.filter(s => s.owned).map(s => s.id);
                if (!gameState.skinsUnlocked.includes('default')) {
                    gameState.skinsUnlocked.unshift('default');
                }
            }
            
            // Gains hors-ligne
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

// Reset du jeu
function resetGame() {
    console.log('Reset du jeu...');
    
    // Bloquer la sauvegarde automatique
    isResetting = true;
    
    try {
        // Supprimer TOUT le localStorage
        localStorage.clear();
        console.log('localStorage.clear() exécuté');
    } catch (e) {
        console.error('Erreur lors du clear:', e);
    }
    
    // Vérification
    console.log('Après suppression, nirdClicker_save =', localStorage.getItem('nirdClicker_save'));
    
    // Forcer le rechargement immédiatement
    window.location.reload(true);
}

// ============================================
// UTILITAIRES
// ============================================
function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ============================================
// LEADERBOARD
// ============================================

// Récupérer le leaderboard
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
                score: gameState.totalScore,
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
function formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}
