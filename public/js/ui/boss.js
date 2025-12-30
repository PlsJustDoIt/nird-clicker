/**
 * @file NIRD Clicker - Système de Boss GAFAM
 * @description Combats de boss avec mécaniques variées
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// VARIABLES DU BOSS
// ============================================

/** @type {Boss|null} Boss actuellement actif */
var currentBoss = null;

/** @type {number} Nombre de clics restants pour vaincre le boss */
var bossClicksRemaining = 0;

/** @type {number[]} Timers actifs du boss */
var bossTimers = [];

/** @type {number} Timestamp de début du combat */
var bossStartTime = 0;

/** @type {string[]} Pattern actuel pour les boss pattern */
var bossPattern = [];

/** @type {number} Index actuel dans le pattern */
var patternIndex = 0;

/** @type {Array} File d'attente des clics retardés (mécanique lag) */
var lagQueue = [];

/** @type {boolean} Indique si le bouclier du boss est actif */
var bossShieldActive = false;

/** @type {number} Phase actuelle du combat */
var bossPhase = 1;

// ============================================
// AFFICHAGE DU BOSS
// ============================================

/**
 * Déclenche l'apparition d'un boss
 * @param {string|null} [bossId=null] - ID du boss spécifique ou null pour aléatoire
 */
function showBoss(bossId = null) {
    if (typeof isEventActive === 'function' && isEventActive()) {
        if (typeof queueEvent === 'function') queueEvent('boss', bossId);
        return;
    }
    if (typeof isEventInProgress !== 'undefined') isEventInProgress = true;
    _showBossInternal(bossId);
}

/**
 * Fonction interne pour afficher le boss (appelée après vérification de la queue)
 * @param {string|null} [bossId=null] - ID du boss spécifique ou null pour aléatoire
 */
function _showBossInternal(bossId = null) {
    clearAllBossTimers();
    
    if (typeof BOSS_TYPES === 'undefined') {
        console.error('BOSS_TYPES non défini');
        return;
    }
    
    // Sélectionner un boss
    if (bossId) {
        currentBoss = BOSS_TYPES.find(b => b.id === bossId);
        if (!currentBoss) {
            console.error(`Boss "${bossId}" non trouvé.`);
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
        currentPhase: -1,
        activeMechanic: currentBoss.mechanic || 'classic',
        popups: [],
        laggedClicks: []
    };
    
    const modal = document.getElementById('boss-modal');
    const content = modal?.querySelector('.boss-content') || modal?.querySelector('.modal-content');
    
    if (content) {
        content.innerHTML = generateBossHTML();
        setupBossEventListeners();
        startBossMechanic();
    }
    
    modal?.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    modal.onclick = (e) => e.stopPropagation();
    
    // Bouton skip après 3 secondes
    bossTimers.skipButton = setTimeout(() => {
        const skipBtn = document.getElementById('boss-skip-btn');
        if (skipBtn) {
            skipBtn.classList.remove('hidden');
            skipBtn.onclick = () => closeBoss(false);
        }
    }, 3000);
    
    if (typeof playSound === 'function') playSound('boss');
}

/**
 * Génère le HTML du boss actuel
 * @returns {string} Code HTML de l'interface du boss
 */
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

/**
 * Retourne l'indice pour une mécanique de boss
 * @param {string} mechanic - Type de mécanique
 * @returns {string} Texte d'indice pour le joueur
 */
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
        'chaos': '💀 CHAOS : Tout peut arriver !',
        // === MÉCANIQUES WTF ===
        'randomClickValue': '🌀 Chaque clic a une valeur aléatoire !',
        'multiplierRandom': '🛸 Parfois vos clics sont multipliés x10 !',
        'delayedClicks': '🌍 Vos clics arrivent avec du retard...',
        'buggyClicks': '👾 Certains clics sont annulés ou doublés !',
        'movingTarget': '🟩 La cible se déplace très vite !',
        'rootRandom': '🗝️ 1% de tout perdre, 1% de jackpot !'
    };
    return hints[mechanic] || hints['classic'];
}

/**
 *
 */
function setupBossEventListeners() {
    const clickBtn = document.getElementById('boss-click-btn');
    if (clickBtn) {
        clickBtn.addEventListener('click', handleBossClick);
    }
    
    if (currentBoss.mechanic === 'pattern') {
        document.addEventListener('keydown', handlePatternKey);
    }
}

// ============================================
// MÉCANIQUES DE BOSS
// ============================================

/**
 *
 */
function startBossMechanic() {
    const mechanic = bossState.activeMechanic;
    const isSubMechanic = currentBoss.mechanic === 'phases' || currentBoss.mechanic === 'chaos';
    const params = (isSubMechanic && mechanic !== currentBoss.mechanic) 
        ? getDefaultMechanicParams(mechanic) 
        : (currentBoss.mechanicParams || {});
    
    switch(mechanic) {
        case 'regen': startRegenMechanic(params); break;
        case 'invisible': startInvisibleMechanic(params); break;
        case 'popups': startPopupsMechanic(params); break;
        case 'timer': startTimerMechanic(params); break;
        case 'pattern': startPatternMechanic(params); break;
        case 'lag': startLagMechanic(params); break;
        case 'moving': startMovingMechanic(params); break;
        case 'shield': startShieldMechanic(params); break;
        case 'phases': startPhasesMechanic(params); break;
        case 'chaos': startChaosMechanic(params); break;
        // === MÉCANIQUES WTF ===
        case 'randomClickValue': startRandomClickValueMechanic(params); break;
        case 'multiplierRandom': startMultiplierRandomMechanic(params); break;
        case 'delayedClicks': startDelayedClicksMechanic(params); break;
        case 'buggyClicks': startBuggyClicksMechanic(params); break;
        case 'movingTarget': startMovingTargetMechanic(params); break;
        case 'rootRandom': startRootRandomMechanic(params); break;
    }
}

// === MÉCANIQUE : RÉGÉNÉRATION ===
/**
 *
 * @param params
 */
function startRegenMechanic(params) {
    let lastClickTime = Date.now();
    
    bossTimers.regen = setInterval(() => {
        const timeSinceClick = Date.now() - lastClickTime;
        if (timeSinceClick > params.regenDelay && bossClicksRemaining < bossMaxClicks) {
            bossClicksRemaining = Math.min(bossMaxClicks, bossClicksRemaining + params.regenAmount);
            updateBossUI();
            showBossStatus(params.regenMessage, 'warning');
            if (typeof playSound === 'function') playSound('boss');
        }
    }, 500);
    
    bossState.onHit = () => { lastClickTime = Date.now(); };
}

// === MÉCANIQUE : INVISIBLE ===
/**
 *
 * @param params
 */
function startInvisibleMechanic(params) {
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
            setVisible(!currentlyVisible);
            scheduleToggle();
        }, delay);
    };
    
    setVisible(true);
    scheduleToggle();
}

// === MÉCANIQUE : POPUPS ===
/**
 *
 * @param params
 */
function startPopupsMechanic(params) {
    bossTimers.popups = setInterval(() => {
        createBossPopup(params);
    }, params.popupInterval);
}

/**
 *
 * @param params
 */
function createBossPopup(params) {
    const container = document.getElementById('boss-popups');
    if (!container) return;
    
    const popupTexts = params.popupTexts || ['📢 PUB!', '🔔 NOTIF!', '💰 SPAM!', '⚠️ ALERTE!'];
    const popupDuration = params.popupDuration || 2500;
    const stolenClicks = params.stolenClicks || 3;
    
    const existingPopups = container.querySelectorAll('.boss-popup').length;
    
    const popup = document.createElement('div');
    popup.className = 'boss-popup boss-popup-blocking';
    popup.innerHTML = `
        <span class="popup-text">${popupTexts[Math.floor(Math.random() * popupTexts.length)]}</span>
        <button class="popup-close">✕</button>
    `;
    
    const spreadFactor = Math.max(0, 30 - existingPopups * 5);
    popup.style.left = 50 + (Math.random() - 0.5) * spreadFactor + '%';
    popup.style.top = 50 + (Math.random() - 0.5) * spreadFactor + '%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = 1000 + existingPopups;
    
    container.appendChild(popup);
    
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.remove();
        if (typeof playSound === 'function') playSound('click');
    });
    
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
/**
 *
 * @param params
 */
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
/**
 *
 * @param params
 */
function startPatternMechanic(params) {
    generatePattern(params);
}

/**
 *
 * @param params
 */
function generatePattern(params) {
    bossState.currentPattern = [];
    bossState.patternIndex = 0;
    
    for (let i = 0; i < params.patternLength; i++) {
        bossState.currentPattern.push(params.patternKeys[Math.floor(Math.random() * params.patternKeys.length)]);
    }
    
    displayPattern();
    showBossStatus(params.patternMessage, 'info');
}

/**
 *
 */
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

/**
 *
 * @param e
 */
function handlePatternKey(e) {
    if (!currentBoss || currentBoss.mechanic !== 'pattern') return;
    
    const keyMap = {
        'ArrowUp': '⬆️', 'ArrowDown': '⬇️', 'ArrowLeft': '⬅️', 'ArrowRight': '➡️',
        'z': '⬆️', 'Z': '⬆️', 's': '⬇️', 'S': '⬇️', 'q': '⬅️', 'Q': '⬅️', 'd': '➡️', 'D': '➡️',
        'w': '⬆️', 'W': '⬆️', 'a': '⬅️', 'A': '⬅️'
    };
    
    const pressed = keyMap[e.key];
    if (!pressed) return;
    
    e.preventDefault();
    processPatternInput(pressed);
}

/**
 *
 * @param pressed
 */
function processPatternInput(pressed) {
    if (!currentBoss || currentBoss.mechanic !== 'pattern') return;
    
    const expected = bossState.currentPattern[bossState.patternIndex];
    
    if (pressed === expected) {
        bossState.patternIndex++;
        if (typeof playSound === 'function') playSound('click');
        displayPattern();
        
        if (bossState.patternIndex >= bossState.currentPattern.length) {
            const damage = Math.ceil(bossMaxClicks / 4);
            bossClicksRemaining = Math.max(0, bossClicksRemaining - damage);
            updateBossUI();
            showBossStatus('✅ Pattern réussi ! -' + damage + ' clics', 'success');
            
            if (bossClicksRemaining <= 0) {
                closeBoss(true);
            } else {
                setTimeout(() => generatePattern(currentBoss.mechanicParams), 1000);
            }
        }
    } else {
        bossState.patternIndex = 0;
        displayPattern();
        showBossStatus('❌ Mauvaise touche !', 'danger');
        if (typeof playSound === 'function') playSound('boss');
    }
}

/**
 *
 * @param direction
 */
function handlePatternGamepad(direction) {
    const directionMap = { 'up': '⬆️', 'down': '⬇️', 'left': '⬅️', 'right': '➡️' };
    const pressed = directionMap[direction];
    if (pressed) processPatternInput(pressed);
}

// === MÉCANIQUE : LAG ===
/**
 *
 * @param params
 */
function startLagMechanic(params) {
    showBossStatus(params.lagMessage, 'warning');
    bossState.lagDelay = params.lagDelay;
}

/**
 *
 */
function processLaggedClick() {
    setTimeout(() => {
        if (bossClicksRemaining > 0) {
            bossClicksRemaining--;
            updateBossUI();
            if (typeof playSound === 'function') playSound('click');
            
            if (bossClicksRemaining <= 0) closeBoss(true);
        }
    }, bossState.lagDelay);
}

// === MÉCANIQUE : MOVING ===
// NOTE: lastMoveX est défini dans ui.js

/**
 *
 * @param params
 */
function startMovingMechanic(params) {
    showBossStatus(params.moveMessage, 'info');
    lastMoveX = 0;
    
    bossTimers.moving = setInterval(() => {
        const clickZone = document.getElementById('boss-click-zone');
        if (clickZone) {
            let newX, newY;
            
            if (lastMoveX <= 0) {
                newX = 80 + Math.random() * 70;
            } else {
                newX = -80 - Math.random() * 70;
            }
            
            newY = Math.random() * 80 - 40;
            lastMoveX = newX;
            clickZone.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    }, params.moveInterval);
}

// === MÉCANIQUE : BOUCLIER ===
/**
 *
 * @param params
 */
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
        
        const delay = bossState.shieldActive ? params.shieldDuration : params.shieldCooldown;
        bossTimers.shield = setTimeout(toggleShield, delay);
    };
    
    toggleShield();
}

// === MÉCANIQUE : PHASES ===
/**
 *
 * @param params
 */
function startPhasesMechanic(params) {
    bossState.phases = params.phases;
    updateBossPhase();
}

/**
 *
 */
function updateBossPhase() {
    if (!bossState.phases) return;
    
    const healthPercent = (bossClicksRemaining / bossMaxClicks) * 100;
    
    for (let i = bossState.phases.length - 1; i >= 0; i--) {
        if (healthPercent <= bossState.phases[i].percent) {
            if (bossState.currentPhase !== i) {
                bossState.currentPhase = i;
                const phase = bossState.phases[i];
                
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
/**
 *
 * @param params
 */
function startChaosMechanic(params) {
    showBossStatus(params.chaosMessage, 'danger');
    
    const switchMechanic = () => {
        clearBossMechanicTimers();
        
        const randomMechanic = params.chaosMechanics[Math.floor(Math.random() * params.chaosMechanics.length)];
        bossState.activeMechanic = randomMechanic;
        
        const hint = document.getElementById('mechanic-hint');
        if (hint) hint.textContent = '💀 ' + getMechanicHint(randomMechanic);
        
        const defaultParams = getDefaultMechanicParams(randomMechanic);
        
        switch(randomMechanic) {
            case 'regen': startRegenMechanic(defaultParams); break;
            case 'popups': startPopupsMechanic(defaultParams); break;
            case 'shield': startShieldMechanic(defaultParams); break;
            case 'moving': startMovingMechanic(defaultParams); break;
            case 'lag': startLagMechanic(defaultParams); break;
        }
        
        bossTimers.chaos = setTimeout(switchMechanic, params.chaosInterval);
    };
    
    switchMechanic();
}

/**
 *
 * @param mechanic
 */
function getDefaultMechanicParams(mechanic) {
    const defaults = {
        'regen': { regenDelay: 2000, regenAmount: 5, regenMessage: '⚠️ Régénération !' },
        'popups': { popupInterval: 2000, popupDuration: 2500, stolenClicks: 3, popupTexts: ['📢 PUB!', '🔔 NOTIF!', '💰 SPAM!'] },
        'shield': { shieldDuration: 1500, shieldCooldown: 2000, shieldMessage: '🛡️ Bouclier !' },
        'moving': { moveInterval: 1000, moveMessage: '🎯 Il bouge !' },
        'lag': { lagDelay: 500, lagMessage: '🔄 LAG !' },
        'invisible': { visibleDuration: 2000, invisibleDuration: 1500, invisibleMessage: '👁️ Invisible !' },
        // === MÉCANIQUES WTF ===
        'randomClickValue': { min: 1, max: 5, message: '🌀 Valeur aléatoire !' },
        'multiplierRandom': { chance: 0.1, multiplier: 5, message: '🛸 Multiplicateur !' },
        'delayedClicks': { delay: 800, message: '🌍 Clics retardés !' },
        'buggyClicks': { cancelChance: 0.15, doubleChance: 0.1, message: '👾 Clics buggés !' },
        'movingTarget': { moveInterval: 600, moveMessage: '🟩 Cible mobile !' },
        'rootRandom': { wipeChance: 0.01, jackpotChance: 0.01, message: '🗝️ Root aléatoire !' }
    };
    return defaults[mechanic] || {};
}

// ============================================
// MÉCANIQUES WTF (Théories du Complot)
// ============================================

// === MÉCANIQUE : RANDOM CLICK VALUE (Effet Mandela) ===
/**
 * Chaque clic a une valeur aléatoire entre min et max
 * @param {Object} params - Paramètres de la mécanique
 */
function startRandomClickValueMechanic(params) {
    bossState.randomClickMin = params.min || 1;
    bossState.randomClickMax = params.max || 5;
    showBossStatus(params.message || '🌀 Valeur aléatoire !', 'info');
}

// === MÉCANIQUE : MULTIPLIER RANDOM (Illuminati) ===
/**
 * Chance de multiplier les clics
 * @param {Object} params - Paramètres de la mécanique
 */
function startMultiplierRandomMechanic(params) {
    bossState.multiplierChance = params.chance || 0.1;
    bossState.multiplierValue = params.multiplier || 5;
    showBossStatus(params.message || '🛸 Multiplicateur secret !', 'info');
}

// === MÉCANIQUE : DELAYED CLICKS (Terre Plate) ===
/**
 * Les clics sont retardés (similaire à lag mais avec message différent)
 * @param {Object} params - Paramètres de la mécanique
 */
function startDelayedClicksMechanic(params) {
    bossState.delayedClicksDelay = params.delay || 1000;
    showBossStatus(params.message || '🌍 Clics retardés !', 'warning');
}

// === MÉCANIQUE : BUGGY CLICKS (Théorie de la Simulation) ===
/**
 * Certains clics sont annulés, d'autres doublés
 * @param {Object} params - Paramètres de la mécanique
 */
function startBuggyClicksMechanic(params) {
    bossState.cancelChance = params.cancelChance || 0.2;
    bossState.doubleChance = params.doubleChance || 0.1;
    showBossStatus(params.message || '👾 Clics buggés !', 'warning');
}

// === MÉCANIQUE : MOVING TARGET (Glitch dans la Matrice) ===
/**
 * La cible se déplace très rapidement
 * @param {Object} params - Paramètres de la mécanique
 */
function startMovingTargetMechanic(params) {
    showBossStatus(params.moveMessage || '🟩 Cible mobile !', 'info');
    lastMoveX = 0;
    
    bossTimers.movingTarget = setInterval(() => {
        const clickZone = document.getElementById('boss-click-zone');
        if (clickZone) {
            // Mouvement plus agressif que moving normal
            const newX = (Math.random() - 0.5) * 200;
            const newY = (Math.random() - 0.5) * 100;
            clickZone.style.transform = `translate(${newX}px, ${newY}px)`;
            clickZone.style.transition = `transform ${params.moveInterval * 0.3}ms ease-out`;
        }
    }, params.moveInterval || 800);
}

// === MÉCANIQUE : ROOT RANDOM (Accès Root Universel) ===
/**
 * Chance de tout perdre ou de jackpot
 * @param {Object} params - Paramètres de la mécanique
 */
function startRootRandomMechanic(params) {
    bossState.wipeChance = params.wipeChance || 0.01;
    bossState.jackpotChance = params.jackpotChance || 0.01;
    showBossStatus(params.message || '🗝️ Root aléatoire !', 'danger');
}

// ============================================
// GESTION DES CLICS
// ============================================

/**
 * Gère un clic sur le boss
 */
function handleBossClick() {
    const popupContainer = document.getElementById('boss-popups');
    const activePopups = popupContainer ? popupContainer.querySelectorAll('.boss-popup').length : 0;
    if (activePopups > 0) {
        showBossStatus('📢 Fermez les pubs d\'abord !', 'warning');
        if (typeof playSound === 'function') playSound('boss');
        return;
    }
    
    if (bossState.shieldActive) {
        showBossStatus('🛡️ Bouclier actif !', 'danger');
        if (typeof playSound === 'function') playSound('boss');
        return;
    }
    
    if (bossState.invisible) {
        showBossStatus('👁️ Cible invisible !', 'danger');
        if (typeof playSound === 'function') playSound('boss');
        return;
    }
    
    if (bossState.activeMechanic === 'lag' || (currentBoss.mechanic === 'chaos' && bossState.activeMechanic === 'lag')) {
        processLaggedClick();
        return;
    }
    
    if (currentBoss.mechanic === 'pattern') {
        showBossStatus('🎮 Utilisez les flèches !', 'info');
        return;
    }
    
    // === MÉCANIQUES WTF ===
    const mechanic = bossState.activeMechanic || currentBoss.mechanic;
    
    // Mécanique: Delayed Clicks (Terre Plate)
    if (mechanic === 'delayedClicks') {
        const delay = bossState.delayedClicksDelay || 1000;
        showBossStatus('🌍 Clic en attente...', 'info');
        setTimeout(() => {
            if (bossClicksRemaining > 0) {
                bossClicksRemaining--;
                updateBossUI();
                if (typeof playSound === 'function') playSound('click');
                showBossStatus('🌍 Clic arrivé !', 'success');
                if (bossClicksRemaining <= 0) closeBoss(true);
            }
        }, delay);
        return;
    }
    
    // Mécanique: Root Random (Accès Root Universel)
    if (mechanic === 'rootRandom') {
        const roll = Math.random();
        
        // 1% de chance de tout perdre
        if (roll < bossState.wipeChance) {
            showBossStatus('💀 WIPE ! Vous avez tout perdu...', 'danger');
            if (typeof playSound === 'function') playSound('boss');
            failBoss('💀 Le root vous a effacé... Boss perdu !');
            return;
        }
        
        // 1% de chance de jackpot (victoire instantanée)
        if (roll < bossState.wipeChance + bossState.jackpotChance) {
            showBossStatus('🎰 JACKPOT ! Victoire instantanée !', 'success');
            bossClicksRemaining = 0;
            updateBossUI();
            if (typeof playSound === 'function') playSound('achievement');
            closeBoss(true);
            return;
        }
    }
    
    // Mécanique: Buggy Clicks (Théorie de la Simulation)
    if (mechanic === 'buggyClicks') {
        const roll = Math.random();
        
        // Chance d'annuler le clic
        if (roll < bossState.cancelChance) {
            showBossStatus('❌ Clic annulé par la matrice !', 'danger');
            if (typeof playSound === 'function') playSound('boss');
            return;
        }
        
        // Chance de doubler le clic
        if (roll < bossState.cancelChance + bossState.doubleChance) {
            bossClicksRemaining -= 2;
            showBossStatus('✨ Clic doublé !', 'success');
            if (typeof playSound === 'function') playSound('achievement');
            updateBossUI();
            if (bossClicksRemaining <= 0) closeBoss(true);
            return;
        }
    }
    
    // Mécanique: Random Click Value (Effet Mandela)
    if (mechanic === 'randomClickValue') {
        const min = bossState.randomClickMin || 1;
        const max = bossState.randomClickMax || 5;
        const damage = Math.floor(Math.random() * (max - min + 1)) + min;
        bossClicksRemaining -= damage;
        showBossStatus(`🌀 Clic de valeur ${damage} !`, damage > (max / 2) ? 'success' : 'info');
        if (typeof playSound === 'function') playSound('click');
        updateBossUI();
        if (bossState.onHit) bossState.onHit();
        if (bossClicksRemaining <= 0) closeBoss(true);
        return;
    }
    
    // Mécanique: Multiplier Random (Illuminati)
    if (mechanic === 'multiplierRandom') {
        let damage = 1;
        if (Math.random() < bossState.multiplierChance) {
            damage = bossState.multiplierValue || 5;
            showBossStatus(`🛸 x${damage} ! Multiplicateur secret !`, 'success');
            if (typeof playSound === 'function') playSound('achievement');
        } else {
            if (typeof playSound === 'function') playSound('click');
        }
        bossClicksRemaining -= damage;
        updateBossUI();
        if (bossState.onHit) bossState.onHit();
        if (bossClicksRemaining <= 0) closeBoss(true);
        return;
    }
    
    // Clic normal pour les autres mécaniques
    bossClicksRemaining--;
    if (typeof playSound === 'function') playSound('click');
    
    if (bossState.onHit) bossState.onHit();
    
    updateBossUI();
    
    if (currentBoss.mechanic === 'phases') {
        updateBossPhase();
    }
    
    if (bossClicksRemaining <= 0) {
        closeBoss(true);
    }
}

/**
 *
 */
function updateBossUI() {
    const progressBar = document.getElementById('boss-progress-bar');
    const clicksLeft = document.getElementById('boss-clicks-left');
    
    const progress = ((bossMaxClicks - bossClicksRemaining) / bossMaxClicks) * 100;
    if (progressBar) progressBar.style.width = progress + '%';
    if (clicksLeft) clicksLeft.textContent = bossClicksRemaining;
}

/**
 *
 * @param message
 * @param type
 */
function showBossStatus(message, type) {
    const status = document.getElementById('boss-status');
    if (status) {
        status.textContent = message;
        status.className = 'boss-status ' + (type ? 'boss-status-' + type : '');
    }
}

// ============================================
// FIN DU BOSS
// ============================================

/**
 *
 * @param message
 */
function failBoss(message) {
    clearAllBossTimers();
    
    const modal = document.getElementById('boss-modal');
    modal?.classList.add('hidden');
    document.body.classList.remove('modal-open');
    
    if (typeof showNotification === 'function') showNotification(message, 'error');
    if (typeof playSound === 'function') playSound('boss');
    
    document.removeEventListener('keydown', handlePatternKey);
    currentBoss = null;
    
    if (typeof onEventComplete === 'function') onEventComplete();
}

/**
 *
 */
function clearAllBossTimers() {
    Object.values(bossTimers).forEach(timer => {
        clearInterval(timer);
        clearTimeout(timer);
    });
    bossTimers = {};
    bossState = {};
}

/**
 *
 */
function clearBossMechanicTimers() {
    Object.keys(bossTimers).forEach(key => {
        if (key !== 'chaos') {
            clearInterval(bossTimers[key]);
            clearTimeout(bossTimers[key]);
            delete bossTimers[key];
        }
    });
    
    bossState.shieldActive = false;
    bossState.invisible = false;
    
    const btn = document.getElementById('boss-click-btn');
    if (btn) {
        btn.classList.remove('boss-shielded');
        btn.classList.remove('boss-invisible');
    }
}

/**
 *
 * @param victory
 */
function closeBoss(victory = true) {
    const bossInfo = currentBoss ? {
        reward: currentBoss.reward,
        name: currentBoss.name
    } : null;
    
    clearAllBossTimers();
    
    const modal = document.getElementById('boss-modal');
    modal?.classList.add('hidden');
    document.body.classList.remove('modal-open');
    
    document.removeEventListener('keydown', handlePatternKey);
    
    if (victory && bossInfo) {
        gameState.bossDefeated++;
        gameState.sessionBoss++;
        
        const bonus = Math.floor(gameState.productionPerSecond * 10 + bossInfo.reward);
        gameState.score += bonus;
        gameState.totalScore += bonus;
        
        if (typeof playSound === 'function') playSound('achievement');
        if (typeof showNotification === 'function') {
            showNotification(`🎉 ${bossInfo.name} fermé ! +${formatNumber(bonus)} points bonus !`, 'success');
        }
        
        if (typeof checkAchievements === 'function') checkAchievements();
        if (typeof checkDailyMissions === 'function') checkDailyMissions();
        if (typeof updateUI === 'function') updateUI();
    }
    
    currentBoss = null;
    
    if (typeof onEventComplete === 'function') onEventComplete();
}

// Exposer globalement
window.showBoss = showBoss;
window.closeBoss = closeBoss;
window.handleBossClick = handleBossClick;
window.handlePatternGamepad = handlePatternGamepad;
