/**
 * NIRD Clicker - Interface Utilisateur (Version Complète)
 * Gestion de l'affichage, interactions, particules et menus
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Variable pour le multiplicateur d'achat
let buyMultiplier = 1;
var buyMode = 1; // Alias pour compatibilité avec les modules

// ============================================
// SYSTÈME DE QUEUE D'ÉVÉNEMENTS
// Évite les conflits entre boss et quiz
// ============================================
let eventQueue = [];
let isEventInProgress = false;

/**
 * Vérifie si un événement (boss ou quiz) est actuellement actif
 */
function isEventActive() {
    // Vérifier si un boss est actif
    const bossModal = document.getElementById('boss-modal');
    const isBossActive = bossModal && !bossModal.classList.contains('hidden');
    
    // Vérifier si un quiz est actif
    const quizModal = document.querySelector('.quiz-modal');
    const isQuizActive = quizModal !== null;
    
    // Vérifier si un milestone est actif
    const milestoneModal = document.querySelector('.milestone-modal');
    const isMilestoneActive = milestoneModal !== null;
    
    return isBossActive || isQuizActive || isMilestoneActive || isEventInProgress;
}

/**
 * Ajoute un événement à la queue s'il n'y en a pas déjà du même type
 */
function queueEvent(type, data = null) {
    // Éviter les doublons du même type
    const hasSameType = eventQueue.some(e => e.type === type);
    if (!hasSameType) {
        eventQueue.push({ type, data });
        console.log(`📋 Événement "${type}" ajouté à la queue. File d'attente: ${eventQueue.length}`);
    }
}

/**
 * Traite le prochain événement dans la queue
 */
function processEventQueue() {
    // Attendre un court délai pour laisser les modales se fermer proprement
    setTimeout(() => {
        if (eventQueue.length === 0) {
            console.log('📋 Queue d\'événements vide.');
            return;
        }
        
        if (isEventActive()) {
            console.log('📋 Un événement est encore actif, attente...');
            return;
        }
        
        const event = eventQueue.shift();
        console.log(`📋 Traitement de l'événement "${event.type}". Restants: ${eventQueue.length}`);
        
        isEventInProgress = true;
        
        switch(event.type) {
            case 'boss':
                _showBossInternal(event.data);
                break;
            case 'quiz':
                _showQuizInternal();
                break;
            default:
                console.warn('Type d\'événement inconnu:', event.type);
                isEventInProgress = false;
        }
    }, 300);
}

/**
 * Appelé quand un événement se termine
 */
function onEventComplete() {
    isEventInProgress = false;
    processEventQueue();
}

// Mise à jour complète de l'interface
function updateUI() {
    updateScoreDisplay();
    updateStatsDisplay();
    updateUpgradesList();
    updateGauge();
    updateClickPower();
    updatePrestigeButton();
    updatePrestigeDisplay();
    updateMissionsUI();
    updateVillageVisual();
}

// Variable pour tracker si on doit mettre à jour les upgrades
let lastScoreForUpgrades = 0;

// Mise à jour du score
function updateScoreDisplay() {
    document.getElementById('score').textContent = formatNumber(gameState.score);
    document.getElementById('per-second').textContent = formatNumber(gameState.productionPerSecond);
    
    // Mettre à jour les upgrades si le score a significativement changé ou si mode MAX
    if (buyMode === 'max' || Math.abs(gameState.score - lastScoreForUpgrades) > lastScoreForUpgrades * 0.05) {
        updateUpgradesList();
        lastScoreForUpgrades = gameState.score;
    }
}

// Mise à jour des statistiques
function updateStatsDisplay() {
    document.getElementById('total-clicks').textContent = formatNumber(gameState.totalClicks);
    document.getElementById('pc-liberated').textContent = formatNumber(Math.floor(gameState.totalScore / 100));
    document.getElementById('village-level').textContent = gameState.currentVillageLevel + 1;
    
    // Prestige info si disponible
    const prestigeInfo = document.getElementById('prestige-info');
    const prestigeTab = document.getElementById('prestige-tab');
    if (gameState.prestigeLevel > 0) {
        
        if (prestigeTab) {
            prestigeTab.style.display = 'inline-block';
        }
    } else {
        if (prestigeInfo) {
            prestigeInfo.textContent = '';
            prestigeInfo.classList.remove('visible');
        }
        if (prestigeTab) {
            prestigeTab.style.display = 'none';
        }
    }
}

// Mise à jour de la puissance de clic (avec bonus prestige)
function updateClickPower() {
    const effectivePower = getEffectiveClickPower();
    const clickPowerEl = document.getElementById('click-power');
    if (clickPowerEl) {
        clickPowerEl.textContent = effectivePower;
    }
}

// Mise à jour du combo
function updateComboDisplay() {
    const comboEl = document.getElementById('combo-display');
    if (comboEl) {
        if (gameState.currentCombo > 1) {
            comboEl.textContent = `🔥 Combo x${gameState.currentCombo}`;
            comboEl.classList.add('active');
        } else {
            comboEl.textContent = '';
            comboEl.classList.remove('active');
        }
    }
}

// Mise à jour de la jauge de résistance
function updateGauge() {
    const currentLevel = VILLAGE_LEVELS[gameState.currentVillageLevel];
    const nextLevel = VILLAGE_LEVELS[gameState.currentVillageLevel + 1];
    
    let percentage = 100;
    if (nextLevel) {
        const progress = gameState.totalScore - currentLevel.minScore;
        const needed = nextLevel.minScore - currentLevel.minScore;
        percentage = Math.min(100, (progress / needed) * 100);
    }
    
    document.getElementById('gauge-fill').style.width = percentage + '%';
    document.getElementById('gauge-label').textContent = `${currentLevel.emoji} ${currentLevel.name}`;
}

// Mise à jour du bouton prestige
function updatePrestigeButton() {
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
        const canPrestigeNow = canPrestige();
        const prestigePoints = calculatePrestigePoints();
        prestigeBtn.disabled = !canPrestigeNow;
        prestigeBtn.innerHTML = canPrestigeNow 
            ? `🔄 Prestige (+${prestigePoints} pts)` 
            : `🔄 Prestige (${formatNumber(PRESTIGE_THRESHOLD)} requis)`;
    }
}

// Mise à jour des missions
function updateMissionsUI() {
    const container = document.getElementById('daily-missions');
    if (!container || !gameState.dailyMissions) return;
    
    container.innerHTML = '<h3>🎯 Missions du jour</h3>';
    
    gameState.dailyMissions.forEach(mission => {
        const progress = Math.min(mission.progress, mission.target);
        const percent = (progress / mission.target) * 100;
        
        const missionEl = document.createElement('div');
        missionEl.className = `mission-item ${mission.completed ? 'completed' : ''}`;
        missionEl.innerHTML = `
            <div class="mission-header">
                <span class="mission-name">${mission.name}</span>
                <span class="mission-reward">+${mission.reward}</span>
            </div>
            <div class="mission-progress-bar">
                <div class="mission-progress-fill" style="width: ${percent}%"></div>
            </div>
            <span class="mission-progress-text">${progress}/${mission.target}</span>
        `;
        container.appendChild(missionEl);
    });
}

// Mise à jour des boutons de mode d'achat
function updateBuyModeButtons() {
    document.querySelectorAll('.buy-mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode == buyMode) {
            btn.classList.add('active');
        }
    });
}

// Génération de la liste des upgrades
function updateUpgradesList() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    
    // Vérifier si on doit recréer la liste ou juste mettre à jour
    const existingItems = container.querySelectorAll('.upgrade-item[data-upgrade-id]');
    const shouldRebuild = existingItems.length === 0 || 
        existingItems.length !== UPGRADES.filter(u => u.unlocked).length;
    
    if (shouldRebuild) {
        container.innerHTML = '';
        
        // Upgrades de production uniquement
        UPGRADES.forEach(upgrade => {
            if (upgrade.unlocked) {
                const upgradeEl = createUpgradeElement(upgrade);
                container.appendChild(upgradeEl);
            }
        });
    } else {
        // Mettre à jour les éléments existants sans recréer le DOM
        UPGRADES.forEach(upgrade => {
            if (upgrade.unlocked) {
                const el = container.querySelector(`.upgrade-item[data-upgrade-id="${upgrade.id}"]`);
                if (el) {
                    updateUpgradeElement(el, upgrade);
                }
            }
        });
    }
    
    // Mettre à jour les upgrades de clic dans leur propre tab
    updateClickUpgradesList();
}

// Mise à jour de la liste des upgrades de clic (tab séparé)
// Affiche : les achetées + les 3 prochaines non achetées
function updateClickUpgradesList() {
    const container = document.getElementById('click-upgrades-list');
    if (!container) return;
    
    // Filtrer : achetées + 3 prochaines non achetées
    const purchased = CLICK_UPGRADES.filter(u => u.purchased);
    const notPurchased = CLICK_UPGRADES.filter(u => !u.purchased);
    const nextThree = notPurchased.slice(0, 3);
    const visibleUpgrades = [...purchased, ...nextThree];
    
    const existingItems = container.querySelectorAll('.upgrade-item[data-click-upgrade-id]');
    const shouldRebuild = existingItems.length !== visibleUpgrades.length;
    
    if (shouldRebuild) {
        container.innerHTML = '';
        
        visibleUpgrades.forEach(upgrade => {
            const upgradeEl = createClickUpgradeElement(upgrade);
            container.appendChild(upgradeEl);
        });
    } else {
        visibleUpgrades.forEach(upgrade => {
            const el = container.querySelector(`.upgrade-item[data-click-upgrade-id="${upgrade.id}"]`);
            if (el) {
                updateClickUpgradeElement(el, upgrade);
            }
        });
    }
}

// Créer un élément d'upgrade
function createUpgradeElement(upgrade) {
    let displayCount = buyMode;
    let cost;
    
    if (buyMode === 'max') {
        const maxInfo = getMaxAffordable(upgrade);
        displayCount = maxInfo.count || 0;
        cost = maxInfo.totalCost || getUpgradeCost(upgrade);
    } else {
        displayCount = buyMode;
        cost = getMultiUpgradeCost(upgrade, buyMode);
    }
    
    const canAfford = gameState.score >= cost && displayCount > 0;
    
    const upgradeEl = document.createElement('div');
    upgradeEl.className = `upgrade-item ${canAfford ? 'can-afford' : 'cannot-afford'}`;
    upgradeEl.setAttribute('data-upgrade-id', upgrade.id);
    upgradeEl.innerHTML = `
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-info">
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-owned">x${upgrade.owned}</span>
            </div>
            <p class="upgrade-desc">${upgrade.description}</p>
            <div class="upgrade-footer">
                <span class="upgrade-cost">${formatNumber(cost)} pts ${buyMode !== 1 ? `(x${displayCount})` : ''}</span>
                <span class="upgrade-production">+${upgrade.baseProduction}/sec</span>
            </div>
            <p class="upgrade-tip">${upgrade.info}</p>
        </div>
    `;
    
    upgradeEl.addEventListener('click', () => {
        buyUpgrade(upgrade.id);
    });
    
    return upgradeEl;
}

// Mettre à jour un élément d'upgrade existant
function updateUpgradeElement(el, upgrade) {
    let displayCount = buyMode;
    let cost;
    
    if (buyMode === 'max') {
        const maxInfo = getMaxAffordable(upgrade);
        displayCount = maxInfo.count || 0;
        cost = maxInfo.totalCost || getUpgradeCost(upgrade);
    } else {
        displayCount = buyMode;
        cost = getMultiUpgradeCost(upgrade, buyMode);
    }
    
    const canAfford = gameState.score >= cost && displayCount > 0;
    
    // Mettre à jour la classe sans toucher au reste
    el.classList.toggle('can-afford', canAfford);
    el.classList.toggle('cannot-afford', !canAfford);
    
    // Mettre à jour les valeurs
    const ownedEl = el.querySelector('.upgrade-owned');
    if (ownedEl) ownedEl.textContent = `x${upgrade.owned}`;
    
    const costEl = el.querySelector('.upgrade-cost');
    if (costEl) costEl.textContent = `${formatNumber(cost)} pts ${buyMode !== 1 ? `(x${displayCount})` : ''}`;
}

// Créer un élément d'upgrade de clic
function createClickUpgradeElement(upgrade) {
    const isPurchased = upgrade.purchased;
    const canAfford = !isPurchased && gameState.score >= upgrade.cost;
    
    const upgradeEl = document.createElement('div');
    upgradeEl.className = `upgrade-item click-upgrade ${isPurchased ? 'purchased' : (canAfford ? 'can-afford' : 'cannot-afford')}`;
    upgradeEl.setAttribute('data-click-upgrade-id', upgrade.id);
    upgradeEl.innerHTML = `
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-info">
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                ${isPurchased ? '<span class="upgrade-status">ACTIVÉ</span>' : ''}
            </div>
            <p class="upgrade-desc">${upgrade.description}</p>
            <div class="upgrade-footer${isPurchased ? ' purchased-footer' : ''}">
                ${!isPurchased ? `<span class="upgrade-cost">${formatNumber(upgrade.cost)} pts</span>` : ''}
                <span class="upgrade-bonus">+${upgrade.bonus} par clic</span>
            </div>
        </div>
    `;
    
    if (!isPurchased) {
        upgradeEl.addEventListener('click', () => buyClickUpgrade(upgrade.id));
    }
    
    return upgradeEl;
}

// Mettre à jour un élément d'upgrade de clic existant
function updateClickUpgradeElement(el, upgrade) {
    const isPurchased = upgrade.purchased;
    const canAfford = !isPurchased && gameState.score >= upgrade.cost;
    
    el.classList.toggle('purchased', isPurchased);
    el.classList.toggle('can-afford', canAfford);
    el.classList.toggle('cannot-afford', !isPurchased && !canAfford);
    
    // Mettre à jour le statut si acheté
    const headerEl = el.querySelector('.upgrade-header');
    if (headerEl && isPurchased && !headerEl.querySelector('.upgrade-status')) {
        headerEl.innerHTML = `
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-status">ACTIVÉ</span>
        `;
    }
    
    const footerEl = el.querySelector('.upgrade-footer');
    if (footerEl && isPurchased) {
        footerEl.classList.add('purchased-footer');
        const costEl = footerEl.querySelector('.upgrade-cost');
        if (costEl) costEl.remove();
    }
}

// Calculer la quantité effective selon le multiplicateur
function getEffectiveQuantity(upgrade) {
    if (buyMultiplier === 'max') {
        let count = 0;
        let tempScore = gameState.score;
        let tempOwned = upgrade.owned;
        
        while (true) {
            const cost = Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, tempOwned));
            if (tempScore >= cost) {
                tempScore -= cost;
                tempOwned++;
                count++;
            } else {
                break;
            }
        }
        return Math.max(1, count);
    }
    return buyMultiplier;
}

// Calculer le coût total pour une quantité
function getTotalCostForQuantity(upgrade, quantity) {
    let total = 0;
    let tempOwned = upgrade.owned;
    
    for (let i = 0; i < quantity; i++) {
        total += Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, tempOwned));
        tempOwned++;
    }
    return total;
}

// Animation de clic
function showClickFeedback(points) {
    const clicker = document.getElementById('main-clicker');
    clicker.classList.add('clicked');
    setTimeout(() => clicker.classList.remove('clicked'), 100);
}

// Nombre flottant après clic
function createFloatingNumber(points) {
    const clickArea = document.getElementById('click-area');
    const floater = document.createElement('div');
    floater.className = 'floating-number';
    floater.textContent = '+' + points;
    
    floater.style.left = (30 + Math.random() * 40) + '%';
    floater.style.top = (20 + Math.random() * 30) + '%';
    
    clickArea.appendChild(floater);
    
    if (Math.random() < 0.1) {
        const msg = document.createElement('div');
        msg.className = 'floating-message';
        msg.textContent = CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)];
        msg.style.left = (20 + Math.random() * 60) + '%';
        clickArea.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }
    
    setTimeout(() => floater.remove(), 1000);
}

// Création de particules au clic
function createParticles() {
    const clickArea = document.getElementById('click-area');
    const colors = ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa'];
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = (40 + Math.random() * 20) + '%';
        particle.style.top = (40 + Math.random() * 20) + '%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.setProperty('--dx', (Math.random() - 0.5) * 100 + 'px');
        particle.style.setProperty('--dy', (Math.random() - 0.5) * 100 + 'px');
        
        clickArea.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
    }
}

// Notifications
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('floating-notifications');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, duration);
}

// Bannière d'événement
function showEventBanner(title, description) {
    const banner = document.getElementById('event-banner');
    const text = document.getElementById('event-text');
    
    text.innerHTML = `<strong>${title}</strong> - ${description}`;
    banner.classList.remove('hidden');
    
    setTimeout(() => banner.classList.add('hidden'), 5000);
}

// ============================================
// BOSS GAFAM AMÉLIORÉ - AVEC MÉCANIQUES VARIÉES
// ============================================
let currentBoss = null;
let bossClicksRemaining = 0;
let bossMaxClicks = 0;
let bossTimers = {};
let bossState = {};

/**
 * Fonction publique pour déclencher un boss
 * Utilise le système de queue pour éviter les conflits
 */
function showBoss(bossId = null) {
    if (isEventActive()) {
        queueEvent('boss', bossId);
        return;
    }
    isEventInProgress = true;
    _showBossInternal(bossId);
}

/**
 * Fonction interne pour afficher le boss (appelée par la queue)
 */
function _showBossInternal(bossId = null) {
    // Nettoyer les anciens timers s'il y en avait
    clearAllBossTimers();
    
    // Sélectionner un boss : par ID ou aléatoire
    if (bossId) {
        currentBoss = BOSS_TYPES.find(b => b.id === bossId);
        if (!currentBoss) {
            console.error(`Boss "${bossId}" non trouvé. Boss disponibles:`, BOSS_TYPES.map(b => b.id));
            return;
        }
    } else {
        currentBoss = BOSS_TYPES[Math.floor(Math.random() * BOSS_TYPES.length)];
    }
    bossClicksRemaining = currentBoss.clicksRequired;
    bossMaxClicks = currentBoss.clicksRequired;
    bossState = {
        shieldActive: false,
        invisible: false,
        currentPattern: [],
        patternIndex: 0,
        currentPhase: -1,  // -1 pour forcer l'activation de la première phase
        activeMechanic: currentBoss.mechanic || 'classic',
        popups: [],
        laggedClicks: []
    };
    
    const modal = document.getElementById('boss-modal');
    const content = modal.querySelector('.boss-content') || modal.querySelector('.modal-content');
    
    if (content) {
        content.innerHTML = generateBossHTML();
        setupBossEventListeners();
        startBossMechanic();
    }
    
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open'); // Bloquer le scroll
    
    // Empêcher les clics sur l'overlay de fermer le boss
    modal.onclick = (e) => {
        e.stopPropagation();
    };
    
    // Faire apparaître le bouton skip après 3 secondes
    bossTimers.skipButton = setTimeout(() => {
        const skipBtn = document.getElementById('boss-skip-btn');
        if (skipBtn) {
            skipBtn.classList.remove('hidden');
            skipBtn.onclick = () => closeBoss(false);
        }
    }, 3000);
    
    playSound('boss');
}

function generateBossHTML() {
    const mechanicHint = getMechanicHint(bossState.activeMechanic);
    
    return `
        <button id="boss-skip-btn" class="boss-skip-btn hidden" title="Quitter le boss">✕</button>
        <div class="boss-header" style="background-color: ${currentBoss.color}">
            <span class="boss-icon" id="boss-icon-main">${currentBoss.icon}</span>
            <h2>${currentBoss.name}</h2>
        </div>
        <p class="boss-message" id="boss-message">${currentBoss.message}</p>
        <p class="boss-mechanic-hint" id="mechanic-hint">${mechanicHint}</p>
        <div class="boss-progress">
            <div id="boss-progress-bar" class="progress-bar-fill" style="width: 0%; background-color: ${currentBoss.color}"></div>
        </div>
        <div class="boss-status" id="boss-status"></div>
        <p class="boss-clicks">Clics restants: <span id="boss-clicks-left">${bossClicksRemaining}</span></p>
        ${currentBoss.mechanic === 'timer' ? `<p class="boss-timer" id="boss-timer">⏱️ <span id="boss-timer-value">${(currentBoss.mechanicParams.timeLimit / 1000).toFixed(1)}</span>s</p>` : ''}
        ${currentBoss.mechanic === 'pattern' ? `<div class="boss-pattern" id="boss-pattern"></div>` : ''}
        <div class="boss-popups-container" id="boss-popups"></div>
        <div class="boss-click-zone" id="boss-click-zone">
            <button id="boss-click-btn" class="boss-btn" style="background-color: ${currentBoss.color}">
                ❌ FERMER ${currentBoss.icon}
            </button>
        </div>
    `;
}

function getMechanicHint(mechanic) {
    const hints = {
        'classic': '👆 Cliquez pour fermer !',
        'regen': '⚠️ Cliquez vite, sinon il se régénère !',
        'invisible': '👁️ Il disparaît par moments...',
        'popups': '📢 Fermez les pubs qui apparaissent !',
        'timer': '⏰ Vite ! Le temps presse !',
        'pattern': '🎮 Reproduisez le pattern !',
        'lag': '🔄 Connexion lente... clics retardés',
        'moving': '🎯 Il bouge ! Suivez-le !',
        'shield': '🛡️ Attendez que le bouclier tombe !',
        'phases': '⚡ Plusieurs phases à affronter !',
        'chaos': '💀 CHAOS : Tout peut arriver !'
    };
    return hints[mechanic] || hints['classic'];
}

function setupBossEventListeners() {
    const clickBtn = document.getElementById('boss-click-btn');
    if (clickBtn) {
        clickBtn.addEventListener('click', handleBossClick);
    }
    
    // Pour la mécanique pattern, écouter les touches
    if (currentBoss.mechanic === 'pattern') {
        document.addEventListener('keydown', handlePatternKey);
    }
}

function startBossMechanic() {
    const mechanic = bossState.activeMechanic;
    // Si on est dans une phase ou chaos, utiliser les params par défaut pour la sous-mécanique
    const isSubMechanic = currentBoss.mechanic === 'phases' || currentBoss.mechanic === 'chaos';
    const params = (isSubMechanic && mechanic !== currentBoss.mechanic) 
        ? getDefaultMechanicParams(mechanic) 
        : (currentBoss.mechanicParams || {});
    
    switch(mechanic) {
        case 'regen':
            startRegenMechanic(params);
            break;
        case 'invisible':
            startInvisibleMechanic(params);
            break;
        case 'popups':
            startPopupsMechanic(params);
            break;
        case 'timer':
            startTimerMechanic(params);
            break;
        case 'pattern':
            startPatternMechanic(params);
            break;
        case 'lag':
            startLagMechanic(params);
            break;
        case 'moving':
            startMovingMechanic(params);
            break;
        case 'shield':
            startShieldMechanic(params);
            break;
        case 'phases':
            startPhasesMechanic(params);
            break;
        case 'chaos':
            startChaosMechanic(params);
            break;
    }
}

// === MÉCANIQUE : RÉGÉNÉRATION ===
function startRegenMechanic(params) {
    let lastClickTime = Date.now();
    
    bossTimers.regen = setInterval(() => {
        const timeSinceClick = Date.now() - lastClickTime;
        if (timeSinceClick > params.regenDelay && bossClicksRemaining < bossMaxClicks) {
            bossClicksRemaining = Math.min(bossMaxClicks, bossClicksRemaining + params.regenAmount);
            updateBossUI();
            showBossStatus(params.regenMessage, 'warning');
            playSound('boss');
        }
    }, 500);
    
    // Mettre à jour lastClickTime à chaque clic
    bossState.onHit = () => { lastClickTime = Date.now(); };
}

// === MÉCANIQUE : INVISIBLE ===
function startInvisibleMechanic(params) {
    // Valeurs par défaut
    const visibleDuration = params.visibleDuration || 2000;
    const invisibleDuration = params.invisibleDuration || 1500;
    const invisibleMessage = params.invisibleMessage || '👁️ Invisible !';
    
    const setVisible = (visible) => {
        bossState.invisible = !visible;
        const icon = document.getElementById('boss-icon-main');
        const btn = document.getElementById('boss-click-btn');
        const clickZone = document.getElementById('boss-click-zone');
        
        if (!visible) {
            if (icon) icon.style.opacity = '0.1';
            if (btn) btn.classList.add('boss-invisible');
            if (clickZone) clickZone.classList.add('boss-invisible');
            showBossStatus(invisibleMessage, 'warning');
        } else {
            if (icon) icon.style.opacity = '1';
            if (btn) btn.classList.remove('boss-invisible');
            if (clickZone) clickZone.classList.remove('boss-invisible');
            showBossStatus('👁️ Visible !', 'success');
        }
    };
    
    const scheduleToggle = () => {
        const currentlyVisible = !bossState.invisible;
        const delay = currentlyVisible ? visibleDuration : invisibleDuration;
        
        bossTimers.invisible = setTimeout(() => {
            setVisible(!currentlyVisible); // Toggle
            scheduleToggle(); // Planifier le prochain
        }, delay);
    };
    
    // Commencer visible
    setVisible(true);
    scheduleToggle();
}

// === MÉCANIQUE : POPUPS ===
function startPopupsMechanic(params) {
    bossTimers.popups = setInterval(() => {
        createBossPopup(params);
    }, params.popupInterval);
}

function createBossPopup(params) {
    const container = document.getElementById('boss-popups');
    if (!container) return;
    
    // Valeurs par défaut si params incomplet
    const popupTexts = params.popupTexts || ['📢 PUB!', '🔔 NOTIF!', '💰 SPAM!', '⚠️ ALERTE!'];
    const popupDuration = params.popupDuration || 2500;
    const stolenClicks = params.stolenClicks || 3;
    
    // Compter les popups existantes
    const existingPopups = container.querySelectorAll('.boss-popup').length;
    
    const popup = document.createElement('div');
    popup.className = 'boss-popup boss-popup-blocking';
    popup.innerHTML = `
        <span class="popup-text">${popupTexts[Math.floor(Math.random() * popupTexts.length)]}</span>
        <button class="popup-close">✕</button>
    `;
    
    // Position qui couvre le bouton boss (plus il y a de popups, plus elles se superposent au centre)
    const spreadFactor = Math.max(0, 30 - existingPopups * 5); // Moins d'écart avec plus de popups
    popup.style.left = 50 + (Math.random() - 0.5) * spreadFactor + '%';
    popup.style.top = 50 + (Math.random() - 0.5) * spreadFactor + '%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = 1000 + existingPopups;
    
    container.appendChild(popup);
    
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.remove();
        playSound('click');
    });
    
    // Si pas fermé à temps, vole des clics
    setTimeout(() => {
        if (popup.parentNode) {
            bossClicksRemaining = Math.min(bossMaxClicks, bossClicksRemaining + stolenClicks);
            updateBossUI();
            showBossStatus('📢 Pub non fermée ! +' + stolenClicks + ' clics', 'danger');
            popup.remove();
        }
    }, popupDuration);
}

// === MÉCANIQUE : TIMER ===
function startTimerMechanic(params) {
    let timeRemaining = params.timeLimit;
    
    bossTimers.timer = setInterval(() => {
        timeRemaining -= 100;
        const timerEl = document.getElementById('boss-timer-value');
        if (timerEl) {
            timerEl.textContent = (timeRemaining / 1000).toFixed(1);
            if (timeRemaining <= 3000) {
                timerEl.parentElement.classList.add('timer-critical');
            }
        }
        
        if (timeRemaining <= 0) {
            clearAllBossTimers();
            failBoss('⏰ Temps écoulé ! Le boss s\'est échappé...');
        }
    }, 100);
}

// === MÉCANIQUE : PATTERN (QTE) ===
function startPatternMechanic(params) {
    generatePattern(params);
}

function generatePattern(params) {
    bossState.currentPattern = [];
    bossState.patternIndex = 0;
    
    for (let i = 0; i < params.patternLength; i++) {
        bossState.currentPattern.push(params.patternKeys[Math.floor(Math.random() * params.patternKeys.length)]);
    }
    
    displayPattern();
    showBossStatus(params.patternMessage, 'info');
}

function displayPattern() {
    const patternEl = document.getElementById('boss-pattern');
    if (!patternEl) return;
    
    patternEl.innerHTML = bossState.currentPattern.map((key, index) => {
        let className = 'pattern-key';
        if (index < bossState.patternIndex) className += ' pattern-done';
        if (index === bossState.patternIndex) className += ' pattern-current';
        return `<span class="${className}">${key}</span>`;
    }).join('');
}

function handlePatternKey(e) {
    if (!currentBoss || currentBoss.mechanic !== 'pattern') return;
    
    // Support flèches, ZQSD et WASD
    const keyMap = {
        // Flèches directionnelles
        'ArrowUp': '⬆️',
        'ArrowDown': '⬇️',
        'ArrowLeft': '⬅️',
        'ArrowRight': '➡️',
        // ZQSD (FR)
        'z': '⬆️', 'Z': '⬆️',
        's': '⬇️', 'S': '⬇️',
        'q': '⬅️', 'Q': '⬅️',
        'd': '➡️', 'D': '➡️',
        // WASD (EN)
        'w': '⬆️', 'W': '⬆️',
        'a': '⬅️', 'A': '⬅️'
    };
    
    const pressed = keyMap[e.key];
    if (!pressed) return;
    
    e.preventDefault(); // Empêcher le scroll avec les flèches
    processPatternInput(pressed);
}

// Fonction pour traiter l'input du pattern (clavier ou gamepad)
function processPatternInput(pressed) {
    if (!currentBoss || currentBoss.mechanic !== 'pattern') return;
    
    const expected = bossState.currentPattern[bossState.patternIndex];
    
    if (pressed === expected) {
        bossState.patternIndex++;
        playSound('click');
        displayPattern();
        
        if (bossState.patternIndex >= bossState.currentPattern.length) {
            // Pattern réussi = plusieurs clics de dégâts
            const damage = Math.ceil(bossMaxClicks / 4);
            bossClicksRemaining = Math.max(0, bossClicksRemaining - damage);
            updateBossUI();
            showBossStatus('✅ Pattern réussi ! -' + damage + ' clics', 'success');
            
            if (bossClicksRemaining <= 0) {
                closeBoss(true);
            } else {
                // Nouveau pattern
                setTimeout(() => generatePattern(currentBoss.mechanicParams), 1000);
            }
        }
    } else {
        // Mauvaise touche, reset pattern
        bossState.patternIndex = 0;
        displayPattern();
        showBossStatus('❌ Mauvaise touche !', 'danger');
        playSound('boss');
    }
}

// Support Gamepad pour le pattern (appelé depuis gamepad.js)
function handlePatternGamepad(direction) {
    const directionMap = {
        'up': '⬆️',
        'down': '⬇️',
        'left': '⬅️',
        'right': '➡️'
    };
    
    const pressed = directionMap[direction];
    if (pressed) {
        processPatternInput(pressed);
    }
}

// === MÉCANIQUE : LAG ===
function startLagMechanic(params) {
    showBossStatus(params.lagMessage, 'warning');
    bossState.lagDelay = params.lagDelay;
}

function processLaggedClick() {
    setTimeout(() => {
        if (bossClicksRemaining > 0) {
            bossClicksRemaining--;
            updateBossUI();
            playSound('click');
            
            if (bossClicksRemaining <= 0) {
                closeBoss(true);
            }
        }
    }, bossState.lagDelay);
}

// === MÉCANIQUE : MOVING ===
let lastMoveX = 0;

function startMovingMechanic(params) {
    showBossStatus(params.moveMessage, 'info');
    lastMoveX = 0;
    
    bossTimers.moving = setInterval(() => {
        const clickZone = document.getElementById('boss-click-zone');
        if (clickZone) {
            // Forcer un grand déplacement en X : alterner gauche/droite
            let newX, newY;
            
            // Choisir un côté opposé à la position actuelle avec une grande amplitude
            if (lastMoveX <= 0) {
                newX = 80 + Math.random() * 70;  // +80 à +150 (droite)
            } else {
                newX = -80 - Math.random() * 70; // -80 à -150 (gauche)
            }
            
            // Y complètement aléatoire pour plus de variété
            newY = Math.random() * 80 - 40;  // -40 à +40 (aléatoire)
            
            lastMoveX = newX;
            clickZone.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    }, params.moveInterval);
}

// === MÉCANIQUE : BOUCLIER ===
function startShieldMechanic(params) {
    const toggleShield = () => {
        bossState.shieldActive = !bossState.shieldActive;
        const btn = document.getElementById('boss-click-btn');
        
        if (bossState.shieldActive) {
            if (btn) btn.classList.add('boss-shielded');
            showBossStatus(params.shieldMessage, 'warning');
        } else {
            if (btn) btn.classList.remove('boss-shielded');
            showBossStatus('🎯 Bouclier désactivé !', 'success');
        }
        
        // Planifier le prochain toggle
        const delay = bossState.shieldActive ? params.shieldDuration : params.shieldCooldown;
        bossTimers.shield = setTimeout(toggleShield, delay);
    };
    
    // Commencer avec le bouclier actif
    toggleShield();
}

// === MÉCANIQUE : PHASES ===
function startPhasesMechanic(params) {
    bossState.phases = params.phases;
    updateBossPhase();
}

function updateBossPhase() {
    if (!bossState.phases) return;
    
    const healthPercent = (bossClicksRemaining / bossMaxClicks) * 100;
    
    for (let i = bossState.phases.length - 1; i >= 0; i--) {
        if (healthPercent <= bossState.phases[i].percent) {
            if (bossState.currentPhase !== i) {
                bossState.currentPhase = i;
                const phase = bossState.phases[i];
                
                // Nettoyer les timers de la mécanique précédente SANS effacer bossState
                clearBossMechanicTimers();
                bossState.activeMechanic = phase.mechanic;
                
                const hint = document.getElementById('mechanic-hint');
                if (hint) hint.textContent = getMechanicHint(phase.mechanic);
                
                showBossStatus(phase.message, 'warning');
                startBossMechanic();
            }
            break;
        }
    }
}

// === MÉCANIQUE : CHAOS ===
function startChaosMechanic(params) {
    showBossStatus(params.chaosMessage, 'danger');
    
    const switchMechanic = () => {
        // Ne nettoyer que les timers des mécaniques, pas le chaos timer lui-même
        clearBossMechanicTimers();
        
        const randomMechanic = params.chaosMechanics[Math.floor(Math.random() * params.chaosMechanics.length)];
        bossState.activeMechanic = randomMechanic;
        
        const hint = document.getElementById('mechanic-hint');
        if (hint) hint.textContent = '💀 ' + getMechanicHint(randomMechanic);
        
        // Créer des params par défaut pour la mécanique
        const defaultParams = getDefaultMechanicParams(randomMechanic);
        
        switch(randomMechanic) {
            case 'regen': startRegenMechanic(defaultParams); break;
            case 'popups': startPopupsMechanic(defaultParams); break;
            case 'shield': startShieldMechanic(defaultParams); break;
            case 'moving': startMovingMechanic(defaultParams); break;
            case 'lag': startLagMechanic(defaultParams); break;
        }
        
        // Planifier le prochain changement
        bossTimers.chaos = setTimeout(switchMechanic, params.chaosInterval);
    };
    
    switchMechanic();
}

function getDefaultMechanicParams(mechanic) {
    const defaults = {
        'regen': { regenDelay: 2000, regenAmount: 5, regenMessage: '⚠️ Régénération !' },
        'popups': { popupInterval: 2000, popupDuration: 2500, stolenClicks: 3, popupTexts: ['📢 PUB!', '🔔 NOTIF!', '💰 SPAM!'] },
        'shield': { shieldDuration: 1500, shieldCooldown: 2000, shieldMessage: '🛡️ Bouclier !' },
        'moving': { moveInterval: 1000, moveMessage: '🎯 Il bouge !' },
        'lag': { lagDelay: 500, lagMessage: '🔄 LAG !' },
        'invisible': { visibleDuration: 2000, invisibleDuration: 1500, invisibleMessage: '👁️ Invisible !' }
    };
    return defaults[mechanic] || {};
}

// === GESTION DES CLICS ===
function handleBossClick() {
    // Vérifier si des popups bloquent le clic
    const popupContainer = document.getElementById('boss-popups');
    const activePopups = popupContainer ? popupContainer.querySelectorAll('.boss-popup').length : 0;
    if (activePopups > 0) {
        showBossStatus('📢 Fermez les pubs d\'abord !', 'warning');
        playSound('boss');
        return;
    }
    
    // Vérifier si le clic est bloqué par le bouclier
    if (bossState.shieldActive) {
        showBossStatus('🛡️ Bouclier actif !', 'danger');
        playSound('boss');
        return;
    }
    
    if (bossState.invisible) {
        showBossStatus('👁️ Cible invisible !', 'danger');
        playSound('boss');
        return;
    }
    
    // Mécanique lag : retarder le clic
    if (bossState.activeMechanic === 'lag' || (currentBoss.mechanic === 'chaos' && bossState.activeMechanic === 'lag')) {
        processLaggedClick();
        return;
    }
    
    // Mécanique pattern : ignorer les clics normaux
    if (currentBoss.mechanic === 'pattern') {
        showBossStatus('🎮 Utilisez les flèches !', 'info');
        return;
    }
    
    // Clic normal
    bossClicksRemaining--;
    playSound('click');
    
    // Callback spécial (ex: regen)
    if (bossState.onHit) bossState.onHit();
    
    updateBossUI();
    
    // Vérifier les phases
    if (currentBoss.mechanic === 'phases') {
        updateBossPhase();
    }
    
    if (bossClicksRemaining <= 0) {
        closeBoss(true);
    }
}

function updateBossUI() {
    const progressBar = document.getElementById('boss-progress-bar');
    const clicksLeft = document.getElementById('boss-clicks-left');
    
    const progress = ((bossMaxClicks - bossClicksRemaining) / bossMaxClicks) * 100;
    if (progressBar) progressBar.style.width = progress + '%';
    if (clicksLeft) clicksLeft.textContent = bossClicksRemaining;
}

function showBossStatus(message, type) {
    const status = document.getElementById('boss-status');
    if (status) {
        status.textContent = message;
        status.className = 'boss-status ' + (type ? 'boss-status-' + type : '');
    }
}

function failBoss(message) {
    clearAllBossTimers();
    
    const modal = document.getElementById('boss-modal');
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open'); // Réactiver le scroll
    
    showNotification(message, 'error');
    playSound('boss');
    
    // Cleanup
    document.removeEventListener('keydown', handlePatternKey);
    currentBoss = null;
    
    // Traiter la queue d'événements
    onEventComplete();
}

function clearAllBossTimers() {
    Object.values(bossTimers).forEach(timer => {
        clearInterval(timer);
        clearTimeout(timer);
    });
    bossTimers = {};
    
    // Reset l'état du boss
    bossState = {};
}

// Version qui ne réinitialise pas bossState (pour le chaos mode)
function clearBossMechanicTimers() {
    Object.keys(bossTimers).forEach(key => {
        if (key !== 'chaos') {
            clearInterval(bossTimers[key]);
            clearTimeout(bossTimers[key]);
            delete bossTimers[key];
        }
    });
    
    // Réinitialiser les états des mécaniques pour éviter les bugs (bouclier/invisible infini)
    bossState.shieldActive = false;
    bossState.invisible = false;
    
    // Retirer les classes visuelles du bouton
    const btn = document.getElementById('boss-click-btn');
    if (btn) {
        btn.classList.remove('boss-shielded');
        btn.classList.remove('boss-invisible');
    }
}

function closeBoss(victory = true) {
    // Sauvegarder les infos du boss AVANT de tout nettoyer
    const bossInfo = currentBoss ? {
        reward: currentBoss.reward,
        name: currentBoss.name
    } : null;
    
    clearAllBossTimers();
    
    const modal = document.getElementById('boss-modal');
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open'); // Réactiver le scroll
    
    // Cleanup
    document.removeEventListener('keydown', handlePatternKey);
    
    if (victory && bossInfo) {
        gameState.bossDefeated++;
        gameState.sessionBoss++;
        
        const bonus = Math.floor(gameState.productionPerSecond * 10 + bossInfo.reward);
        gameState.score += bonus;
        gameState.totalScore += bonus;
        
        playSound('achievement');
        showNotification(`🎉 ${bossInfo.name} fermé ! +${formatNumber(bonus)} points bonus !`, 'success');
        
        checkAchievements();
        checkDailyMissions();
        updateUI();
    }
    
    currentBoss = null;
    
    // Traiter la queue d'événements
    onEventComplete();
}

// ============================================
// MENUS SUPPLÉMENTAIRES
// ============================================

// Menu Options/Settings - Compatible Gamepad
// Navigation: D-Pad haut/bas, A pour activer, B pour fermer
let settingsMenuIndex = 0;
let settingsMenuItems = [];

function openSettingsMenu() {
    const existingModal = document.querySelector('.settings-modal');
    if (existingModal) {
        existingModal.remove();
        return; // Toggle: si déjà ouvert, on ferme
    }
    
    settingsMenuIndex = 0;
    
    const currentTheme = THEMES.find(t => t.id === gameState.currentTheme) || THEMES[0];
    
    const modal = document.createElement('div');
    modal.className = 'settings-modal modal-overlay';
    modal.innerHTML = `
        <div class="modal-content settings-content">
            <h2>⚙️ Options</h2>
            <p class="gamepad-hint">🎮 D-Pad: naviguer • A: activer • B: fermer</p>
            
            <div class="setting-item gamepad-selectable" data-index="0">
                <span>🔊 Sons</span>
                <button id="sound-toggle-btn" class="${gameState.soundEnabled ? 'active' : ''}">
                    ${gameState.soundEnabled ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="setting-item gamepad-selectable" data-index="1">
                <span>✨ Particules</span>
                <button id="particles-toggle-btn" class="${gameState.particlesEnabled ? 'active' : ''}">
                    ${gameState.particlesEnabled ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="setting-item gamepad-selectable" data-index="2">
                <span>🎨 Thème</span>
                <div class="theme-selector-gamepad">
                    <button class="theme-arrow" id="theme-prev">◀</button>
                    <span class="theme-name" id="theme-current">${currentTheme.name}</span>
                    <button class="theme-arrow" id="theme-next">▶</button>
                </div>
            </div>
            
            <hr>
            
            <div class="setting-item gamepad-selectable" data-index="3">
                <span>💾 Exporter</span>
                <button id="export-btn">📤 Exporter</button>
            </div>
            
            <div class="setting-item gamepad-selectable" data-index="4">
                <span>💾 Importer</span>
                <button id="import-btn">📥 Importer</button>
            </div>
            
            <div class="setting-item danger gamepad-selectable" data-index="5">
                <span>🗑️ Reset</span>
                <button id="reset-btn" class="danger-btn">Recommencer</button>
            </div>
            
            <button id="close-settings-btn" class="close-btn gamepad-selectable" data-index="6">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Récupérer les éléments navigables
    settingsMenuItems = modal.querySelectorAll('.gamepad-selectable');
    updateSettingsSelection();
    
    // Event listeners souris/clavier
    modal.querySelector('#sound-toggle-btn').addEventListener('click', toggleSettingsSound);
    modal.querySelector('#particles-toggle-btn').addEventListener('click', toggleSettingsParticles);
    modal.querySelector('#theme-prev').addEventListener('click', () => cycleTheme(-1));
    modal.querySelector('#theme-next').addEventListener('click', () => cycleTheme(1));
    modal.querySelector('#export-btn').addEventListener('click', exportSave);
    modal.querySelector('#import-btn').addEventListener('click', importSave);
    modal.querySelector('#reset-btn').addEventListener('click', () => {
        if (confirm('⚠️ Voulez-vous vraiment tout recommencer ?')) {
            resetGame();
        }
    });
    modal.querySelector('#close-settings-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function cycleTheme(direction) {
    const currentIndex = THEMES.findIndex(t => t.id === gameState.currentTheme);
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = THEMES.length - 1;
    if (newIndex >= THEMES.length) newIndex = 0;
    
    const newTheme = THEMES[newIndex];
    applyTheme(newTheme.id);
    
    // Mettre à jour l'affichage
    const themeNameEl = document.getElementById('theme-current');
    if (themeNameEl) themeNameEl.textContent = newTheme.name;
}

function toggleSettingsSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.querySelector('#sound-toggle-btn');
    if (btn) {
        btn.textContent = gameState.soundEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', gameState.soundEnabled);
    }
    saveGame();
}

function toggleSettingsParticles() {
    gameState.particlesEnabled = !gameState.particlesEnabled;
    const btn = document.querySelector('#particles-toggle-btn');
    if (btn) {
        btn.textContent = gameState.particlesEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', gameState.particlesEnabled);
    }
    saveGame();
}

function updateSettingsSelection() {
    settingsMenuItems.forEach((item, index) => {
        item.classList.toggle('gamepad-selected', index === settingsMenuIndex);
    });
}

function navigateSettingsMenu(direction) {
    const modal = document.querySelector('.settings-modal');
    if (!modal) return;
    
    settingsMenuIndex += direction;
    if (settingsMenuIndex < 0) settingsMenuIndex = settingsMenuItems.length - 1;
    if (settingsMenuIndex >= settingsMenuItems.length) settingsMenuIndex = 0;
    
    updateSettingsSelection();
    playSound('click');
}

function activateSettingsItem() {
    const modal = document.querySelector('.settings-modal');
    if (!modal) return;
    
    const item = settingsMenuItems[settingsMenuIndex];
    if (!item) return;
    
    // Trouver le bouton dans l'item et l'activer
    const btn = item.querySelector('button:not(.theme-arrow)');
    const themeNext = item.querySelector('#theme-next');
    
    if (themeNext) {
        // Pour le thème, on cycle vers le suivant
        cycleTheme(1);
        playSound('click');
    } else if (btn) {
        btn.click();
        playSound('click');
    } else if (item.classList.contains('close-btn')) {
        modal.remove();
        playSound('click');
    }
}

// Menu Succès
function openAchievementsMenu() {
    const modal = document.createElement('div');
    modal.className = 'achievements-modal modal-overlay';
    
    const achievementsList = ACHIEVEMENTS.map(a => `
        <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}">
            <span class="achievement-icon">${a.icon || '🏆'}</span>
            <div class="achievement-info">
                <span class="achievement-name">${a.unlocked ? a.name : '???'}</span>
                <span class="achievement-desc">${a.unlocked ? a.description : 'Succès verrouillé'}</span>
            </div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content achievements-content">
            <h2>🏆 Succès</h2>
            <p class="achievements-count">${ACHIEVEMENTS.filter(a => a.unlocked).length} / ${ACHIEVEMENTS.length} débloqués</p>
            <div class="achievements-list">${achievementsList}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Menu Encyclopédie
function openEncyclopedia() {
    const modal = document.createElement('div');
    modal.className = 'encyclopedia-modal modal-overlay';
    
    const entries = ENCYCLOPEDIA.map(e => `
        <div class="encyclopedia-entry">
            <div class="entry-header">
                <span class="entry-icon">${e.icon}</span>
                <div>
                    <h3>${e.title}</h3>
                    <span class="entry-subtitle">${e.subtitle}</span>
                </div>
            </div>
            <p class="entry-content">${e.content}</p>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content encyclopedia-content">
            <h2>📖 Encyclopédie NIRD</h2>
            <button class="easter-egg-btn" title="???" onclick="openSnakeGame(); this.closest('.modal-overlay').remove();">?</button>
            <div class="encyclopedia-list">${entries}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Menu Statistiques
function openStatsMenu() {
    const playTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const hours = Math.floor(playTime / 3600);
    const minutes = Math.floor((playTime % 3600) / 60);
    
    const modal = document.createElement('div');
    modal.className = 'stats-modal modal-overlay';
    modal.innerHTML = `
        <div class="modal-content stats-content">
            <h2>📊 Statistiques</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Score actuel</span>
                    <span class="stat-value">${formatNumber(gameState.score)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Score total</span>
                    <span class="stat-value">${formatNumber(gameState.totalScore)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total clics</span>
                    <span class="stat-value">${formatNumber(gameState.totalClicks)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Production/sec</span>
                    <span class="stat-value">${formatNumber(gameState.productionPerSecond)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Puissance de clic</span>
                    <span class="stat-value">${getEffectiveClickPower()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">GAFAM vaincus</span>
                    <span class="stat-value">${gameState.bossDefeated}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Niveau prestige</span>
                    <span class="stat-value">${gameState.prestigeLevel} (+${gameState.prestigeLevel * 10}%)</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Quiz réussis</span>
                    <span class="stat-value">${gameState.quizCorrect}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Meilleur combo</span>
                    <span class="stat-value">x${gameState.maxCombo}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Temps de jeu</span>
                    <span class="stat-value">${hours}h ${minutes}m</span>
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ============================================
// LEADERBOARD UI
// ============================================
async function openLeaderboard() {
    const modal = document.createElement('div');
    modal.className = 'leaderboard-modal modal-overlay';
    modal.innerHTML = `
        <div class="modal-content leaderboard-content">
            <h2>🏆 Leaderboard</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            
            <div class="leaderboard-submit">
                <input type="text" id="leaderboard-pseudo" placeholder="Ton pseudo..." maxlength="50" 
                    value="${localStorage.getItem('nirdClicker_pseudo') || ''}">
                <button onclick="submitToLeaderboard()">📤 Soumettre mon score</button>
            </div>
            
            <div class="leaderboard-stats">
                <span>Ton score : <strong>${formatNumber(gameState.totalScore)}</strong></span>
            </div>
            
            <div id="leaderboard-list" class="leaderboard-list">
                <div class="loading">Chargement...</div>
            </div>
            
            <button onclick="this.closest('.modal-overlay').remove()" class="close-btn">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Charger le leaderboard
    await refreshLeaderboard();
}

async function refreshLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    const leaderboard = await fetchLeaderboard();
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<div class="empty-leaderboard">Aucun score enregistré. Sois le premier !</div>';
        return;
    }
    
    const savedPseudo = localStorage.getItem('nirdClicker_pseudo');
    
    let html = '<div class="leaderboard-table">';
    html += '<div class="leaderboard-header"><span>#</span><span>Joueur</span><span>Score</span><span>Prestige</span></div>';
    
    leaderboard.forEach((player, index) => {
        const rank = index + 1;
        const isMe = savedPseudo && player.pseudo === savedPseudo;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        
        html += `
            <div class="leaderboard-row ${isMe ? 'is-me' : ''} ${rank <= 3 ? 'top-3' : ''}">
                <span class="rank">${medal}</span>
                <span class="pseudo">${escapeHtml(player.pseudo)}</span>
                <span class="score">${formatNumber(player.score)}</span>
                <span class="prestige">⭐${player.prestige_level}</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

async function submitToLeaderboard() {
    const input = document.getElementById('leaderboard-pseudo');
    const pseudo = input.value.trim();
    
    if (await submitScore(pseudo)) {
        await refreshLeaderboard();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle functions
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.getElementById('sound-toggle');
    if (btn) {
        if (btn.type === 'checkbox') {
            btn.checked = gameState.soundEnabled;
        } else {
            btn.textContent = gameState.soundEnabled ? 'ON' : 'OFF';
            btn.classList.toggle('active', gameState.soundEnabled);
        }
    }
    saveGame();
}

function toggleParticles() {
    gameState.particlesEnabled = !gameState.particlesEnabled;
    const btn = document.getElementById('particles-toggle');
    if (btn) {
        if (btn.type === 'checkbox') {
            btn.checked = gameState.particlesEnabled;
        } else {
            btn.textContent = gameState.particlesEnabled ? 'ON' : 'OFF';
            btn.classList.toggle('active', gameState.particlesEnabled);
        }
    }
    saveGame();
}

// ============================================
// THÈMES & SKINS
// ============================================
function applyTheme(themeName) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
    gameState.currentTheme = themeName;
    
    // Mettre à jour les boutons de thème
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
    
    saveGame();
}

function applySkin(skinId) {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin) {
        gameState.currentSkin = skinId;
        const clicker = document.querySelector('#main-clicker .pc-icon');
        if (clicker) {
            // Si le skin a une image, l'afficher, sinon utiliser l'emoji
            if (skin.image) {
                clicker.innerHTML = `<img src="${skin.image}" alt="${skin.unlockedName || skin.name}" class="clicker-skin-image">`;
            } else {
                clicker.textContent = skin.emoji;
            }
        }
        saveGame();
    }
}

// ============================================
// MENUS TABS (pour nouvelle interface)
// ============================================
function renderPrestigeUpgrades() {
    const container = document.getElementById('prestige-upgrades-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (typeof PRESTIGE_UPGRADES === 'undefined') return;
    
    PRESTIGE_UPGRADES.forEach(upgrade => {
        const owned = gameState.prestigeUpgrades && gameState.prestigeUpgrades[upgrade.id];
        const canAfford = gameState.prestigePoints >= upgrade.cost;
        
        const el = document.createElement('div');
        // Ne pas ajouter cannot-afford si déjà acheté
        let classes = 'prestige-upgrade-item';
        if (owned) {
            classes += ' purchased';
        } else if (canAfford) {
            classes += ' can-afford';
        } else {
            classes += ' cannot-afford';
        }
        el.className = classes;
        el.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon || '⭐'}</div>
            <div class="upgrade-info">
                <div class="upgrade-header">
                    <span class="upgrade-name">${upgrade.name}</span>
                </div>
                <p class="upgrade-desc">${upgrade.description}</p>
                <div class="upgrade-footer">
                    <span class="upgrade-cost">${owned ? '✓ Acheté' : upgrade.cost + ' pts prestige'}</span>
                </div>
            </div>
        `;
        
        if (!owned && canAfford) {
            el.addEventListener('click', () => buyPrestigeUpgrade(upgrade.id));
        }
        
        container.appendChild(el);
    });
}

function renderSkins() {
    const container = document.getElementById('skins-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (typeof SKINS === 'undefined') return;
    
    SKINS.forEach(skin => {
        const owned = gameState.skinsUnlocked && gameState.skinsUnlocked.includes(skin.id);
        const isActive = gameState.currentSkin === skin.id;
        const canAfford = owned || gameState.score >= (skin.cost || 0);
        
        // Si c'est un skin caché et pas encore débloqué, ne l'afficher que si on peut se le permettre
        if (skin.hidden && !owned && !canAfford) return;
        
        const el = document.createElement('div');
        el.className = `skin-item ${isActive ? 'active' : ''} ${!canAfford && !owned ? 'locked' : ''} ${skin.hidden ? 'secret-skin' : ''}`;
        
        // Afficher l'image si le skin est débloqué et a une image, sinon l'emoji
        const displayName = owned && skin.unlockedName ? skin.unlockedName : skin.name;
        const iconContent = owned && skin.image 
            ? `<img src="${skin.image}" alt="${displayName}" class="skin-image">` 
            : skin.emoji;
        
        el.innerHTML = `
            <div class="skin-icon">${iconContent}</div>
            <div class="skin-name">${displayName}</div>
            ${!owned && skin.cost > 0 ? `<div class="skin-cost">${formatNumber(skin.cost)} pts</div>` : ''}
            ${isActive ? '<div class="skin-badge">✓</div>' : ''}
        `;
        
        el.addEventListener('click', () => {
            if (owned) {
                applySkin(skin.id);
                renderSkins();
            } else if (canAfford) {
                buySkin(skin.id);
            }
        });
        
        container.appendChild(el);
    });
}

function renderEncyclopedia() {
    const container = document.getElementById('encyclopedia-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (typeof ENCYCLOPEDIA === 'undefined') return;
    
    ENCYCLOPEDIA.forEach(entry => {
        const el = document.createElement('div');
        el.className = 'encyclopedia-entry';
        el.innerHTML = `
            <div class="entry-header">
                <span class="entry-icon">${entry.icon}</span>
                <div>
                    <h3>${entry.title}</h3>
                    <span class="entry-subtitle">${entry.subtitle || ''}</span>
                </div>
            </div>
            <p class="entry-content">${entry.content}</p>
        `;
        container.appendChild(el);
    });
}

function renderUpgrades() {
    // La fonction updateUpgradesList existe déjà
    updateUpgradesList();
}

function updatePrestigeDisplay() {
    const pointsDisplay = document.getElementById('prestige-points-display');
    const multiplierDisplay = document.getElementById('prestige-multiplier');
    
    if (pointsDisplay) {
        pointsDisplay.textContent = gameState.prestigePoints || 0;
    }
    if (multiplierDisplay) {
        multiplierDisplay.textContent = (1 + (gameState.prestigeLevel || 0) * 0.1).toFixed(1);
    }
    
    updatePrestigeButton();
}

// Export/Import save
function exportSave() {
    saveGame();
    const data = localStorage.getItem('nirdClicker_save');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nird-clicker-save.json';
    a.click();
    showNotification('💾 Sauvegarde exportée !', 'success');
}

function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                JSON.parse(event.target.result);
                localStorage.setItem('nirdClicker_save', event.target.result);
                showNotification('✅ Sauvegarde importée ! Rechargement...', 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                showNotification('❌ Fichier de sauvegarde invalide', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Set buy multiplier
function setBuyMultiplier(value) {
    buyMultiplier = value;
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mult == value);
    });
    updateUpgradesList();
}

// ============================================
// INITIALISATION
// ============================================
function initEventListeners() {
    // Clic principal
    document.getElementById('main-clicker').addEventListener('click', handleClick);
    
    // Empêcher la fermeture du boss en cliquant sur l'overlay
    document.getElementById('boss-modal').addEventListener('click', (e) => {
        // Bloquer tous les clics sur l'overlay (fond noir)
        e.stopPropagation();
        e.preventDefault();
    });
    
    // Permettre les clics à l'intérieur du contenu du boss
    document.querySelector('#boss-modal .boss-content, #boss-modal .modal-content')?.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher la propagation vers l'overlay
    });
    
    // Boutons multiplicateur
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mult = btn.dataset.mult;
            setBuyMultiplier(mult === 'max' ? 'max' : parseInt(mult));
        });
    });
    
    // Bouton Prestige
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
        prestigeBtn.addEventListener('click', doPrestige);
    }
    
    // Boutons menu
    document.getElementById('settings-btn')?.addEventListener('click', openSettingsMenu);
    document.getElementById('achievements-btn')?.addEventListener('click', openAchievementsMenu);
    document.getElementById('encyclopedia-btn')?.addEventListener('click', openEncyclopedia);
    document.getElementById('stats-btn')?.addEventListener('click', openStatsMenu);
    document.getElementById('leaderboard-btn')?.addEventListener('click', openLeaderboard);
    
    // Easter Egg - Snake Game
    document.getElementById('easter-egg-btn')?.addEventListener('click', openSnakeGame);
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            if (!document.getElementById('boss-modal').classList.contains('hidden')) {
                handleBossClick();
            } else if (!document.querySelector('.quiz-modal')) {
                handleClick();
            }
            e.preventDefault();
        }
        // Fermer les modals avec Escape
        if (e.code === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => {
                if (!m.id) m.remove();
            });
            closeSnakeGame();
        }
    });
}

// ============================================
// EASTER EGG - SNAKE GAME
// ============================================
let snakeGame = {
    canvas: null,
    ctx: null,
    snake: [],
    food: null,
    direction: 'right',
    nextDirection: 'right',
    gameLoop: null,
    score: 0,
    highScore: 0,
    gridSize: 15,
    tileCount: 20,
    isRunning: false
};

function openSnakeGame() {
    const modal = document.getElementById('snake-modal');
    modal.classList.remove('hidden');
    
    // Fermer l'encyclopédie
    document.getElementById('encyclopedia-modal')?.classList.add('hidden');
    
    // Initialiser le canvas
    snakeGame.canvas = document.getElementById('snake-canvas');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
    snakeGame.tileCount = snakeGame.canvas.width / snakeGame.gridSize;
    
    // Charger le high score
    snakeGame.highScore = parseInt(localStorage.getItem('nirdClicker_snakeHighScore') || '0');
    document.getElementById('snake-high-score').textContent = snakeGame.highScore;
    
    // Dessiner l'écran initial
    drawSnakeGame();
    
    showNotification('🐍 Easter Egg découvert !', 'success');
}

function closeSnakeGame() {
    const modal = document.getElementById('snake-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    stopSnakeGame();
}

function startSnakeGame() {
    // Reset du jeu
    snakeGame.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    snakeGame.direction = 'right';
    snakeGame.nextDirection = 'right';
    snakeGame.score = 0;
    snakeGame.isRunning = true;
    
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-start-btn').disabled = true;
    document.getElementById('snake-start-btn').textContent = '🎮 En cours...';
    
    spawnFood();
    
    // Démarrer la boucle de jeu
    if (snakeGame.gameLoop) clearInterval(snakeGame.gameLoop);
    snakeGame.gameLoop = setInterval(updateSnakeGame, 120);
    
    // Ajouter les contrôles clavier
    document.addEventListener('keydown', handleSnakeKeydown);
}

function stopSnakeGame() {
    snakeGame.isRunning = false;
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
        snakeGame.gameLoop = null;
    }
    document.removeEventListener('keydown', handleSnakeKeydown);
    
    const startBtn = document.getElementById('snake-start-btn');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = '🎮 Rejouer';
    }
}

function handleSnakeKeydown(e) {
    if (!snakeGame.isRunning) return;
    
    const keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up', 'KeyZ': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left', 'KeyQ': 'left',
        'ArrowRight': 'right', 'KeyD': 'right'
    };
    
    const newDir = keyMap[e.code];
    if (newDir) {
        setSnakeDirection(newDir);
        e.preventDefault();
    }
}

function setSnakeDirection(dir) {
    if (!snakeGame.isRunning) return;
    
    const opposites = {
        'up': 'down', 'down': 'up',
        'left': 'right', 'right': 'left'
    };
    
    // Ne pas permettre de faire demi-tour
    if (opposites[dir] !== snakeGame.direction) {
        snakeGame.nextDirection = dir;
    }
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        snakeGame.food = {
            x: Math.floor(Math.random() * snakeGame.tileCount),
            y: Math.floor(Math.random() * snakeGame.tileCount)
        };
        
        // Vérifier que la nourriture n'est pas sur le serpent
        validPosition = !snakeGame.snake.some(seg => 
            seg.x === snakeGame.food.x && seg.y === snakeGame.food.y
        );
    }
}

function updateSnakeGame() {
    if (!snakeGame.isRunning) return;
    
    snakeGame.direction = snakeGame.nextDirection;
    
    // Calculer la nouvelle position de la tête
    const head = { ...snakeGame.snake[0] };
    
    switch (snakeGame.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Vérifier les collisions avec les murs
    if (head.x < 0 || head.x >= snakeGame.tileCount || 
        head.y < 0 || head.y >= snakeGame.tileCount) {
        gameOverSnake();
        return;
    }
    
    // Vérifier les collisions avec soi-même
    if (snakeGame.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOverSnake();
        return;
    }
    
    // Ajouter la nouvelle tête
    snakeGame.snake.unshift(head);
    
    // Vérifier si on mange la nourriture
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score++;
        document.getElementById('snake-score').textContent = snakeGame.score;
        spawnFood();
        playSound('click');
    } else {
        // Retirer la queue si on n'a pas mangé
        snakeGame.snake.pop();
    }
    
    drawSnakeGame();
}

function drawSnakeGame() {
    const ctx = snakeGame.ctx;
    const size = snakeGame.gridSize;
    
    // Effacer le canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    // Dessiner la grille (subtile)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i <= snakeGame.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, snakeGame.canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * size);
        ctx.lineTo(snakeGame.canvas.width, i * size);
        ctx.stroke();
    }
    
    // Dessiner la nourriture (pomme)
    if (snakeGame.food) {
        ctx.font = `${size - 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍎', 
            snakeGame.food.x * size + size / 2, 
            snakeGame.food.y * size + size / 2
        );
    }
    
    // Dessiner le serpent
    snakeGame.snake.forEach((seg, i) => {
        if (i === 0) {
            // Tête avec emoji
            ctx.font = `${size - 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐍', seg.x * size + size / 2, seg.y * size + size / 2);
        } else {
            // Corps avec dégradé
            const gradient = ctx.createRadialGradient(
                seg.x * size + size / 2, seg.y * size + size / 2, 0,
                seg.x * size + size / 2, seg.y * size + size / 2, size / 2
            );
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#22c55e');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(seg.x * size + size / 2, seg.y * size + size / 2, size / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Message de démarrage si le jeu n'est pas en cours
    if (!snakeGame.isRunning && snakeGame.snake.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Appuie sur Jouer !', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2);
    }
}

function gameOverSnake() {
    stopSnakeGame();
    
    // Calculer les points gagnés (10 points par pomme)
    const pointsEarned = snakeGame.score * 10;
    
    // Mettre à jour le high score
    if (snakeGame.score > snakeGame.highScore) {
        snakeGame.highScore = snakeGame.score;
        localStorage.setItem('nirdClicker_snakeHighScore', snakeGame.highScore.toString());
        document.getElementById('snake-high-score').textContent = snakeGame.highScore;
    }
    
    // Ajouter les points au jeu principal
    if (pointsEarned > 0) {
        gameState.score += pointsEarned;
        gameState.totalScore += pointsEarned;
        updateUI();
        saveGame();
    }
    
    // Afficher le message de fin
    const ctx = snakeGame.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 24px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 - 30);
    
    ctx.fillStyle = '#4ade80';
    ctx.font = '16px Roboto, sans-serif';
    ctx.fillText(`Score: ${snakeGame.score} 🍎`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 10);
    
    ctx.fillStyle = '#facc15';
    ctx.fillText(`+${pointsEarned} Points de Souveraineté!`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 40);
    
    if (pointsEarned > 0) {
        showNotification(`🐍 Snake terminé ! +${pointsEarned} points !`, 'success');
    }
}
