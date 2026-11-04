/**
 * NIRD Clicker - Support Gamepad
 * Permet de jouer avec une manette de jeu (Xbox, PlayStation, etc.)
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// État du gamepad
const gamepadState = {
    connected: false,
    index: null,
    lastButtonStates: {},
    vibrationSupported: false,
    vibrationEnabled: true,
    deadzone: 0.15,
    repeatDelay: 150,
    lastActionTime: {}
};

// Mapping des boutons (Xbox layout, compatible PlayStation)
const GAMEPAD_BUTTONS = {
    A: 0,           // A (Xbox) / X (PS) - Clic principal
    B: 1,           // B (Xbox) / O (PS) - Fermer/Retour
    X: 2,           // X (Xbox) / □ (PS) - Acheter upgrade
    Y: 3,           // Y (Xbox) / △ (PS) - Menu
    LB: 4,          // Left Bumper - Tab précédent
    RB: 5,          // Right Bumper - Tab suivant
    LT: 6,          // Left Trigger - Achat x10
    RT: 7,          // Right Trigger - Achat MAX
    SELECT: 8,      // Select/Share - Stats
    START: 9,       // Start/Options - Pause/Menu
    L3: 10,         // Left Stick Click - N/A
    R3: 11,         // Right Stick Click - N/A
    DPAD_UP: 12,    // D-Pad Up - Navigation haut
    DPAD_DOWN: 13,  // D-Pad Down - Navigation bas
    DPAD_LEFT: 14,  // D-Pad Left - Navigation gauche
    DPAD_RIGHT: 15  // D-Pad Right - Navigation droite
};

// Axes du stick
const GAMEPAD_AXES = {
    LEFT_X: 0,
    LEFT_Y: 1,
    RIGHT_X: 2,
    RIGHT_Y: 3
};

// Index de l'upgrade sélectionnée
let selectedUpgradeIndex = 0;
let upgradeElements = [];

// Index pour la navigation dans les quiz
let selectedQuizAnswerIndex = 0;

// Système de maintien du bouton X pour acheter
const holdToBuy = {
    isHolding: false,
    startTime: 0,
    duration: 600, // ms pour compléter l'achat
    progress: 0,
    vibrationInterval: null
};

// Helper pour obtenir le conteneur d'upgrades actif et son sélecteur d'items
function getActiveUpgradeContainer() {
    // Vérifier quel onglet est actif
    const upgradesContent = document.getElementById('upgrades-content');
    const clicksContent = document.getElementById('clicks-content');
    const prestigeContent = document.getElementById('prestige-content');
    const skinsContent = document.getElementById('skins-content');
    
    if (upgradesContent && upgradesContent.classList.contains('active')) {
        return document.getElementById('upgrades-list');
    } else if (clicksContent && clicksContent.classList.contains('active')) {
        return document.getElementById('click-upgrades-list');
    } else if (prestigeContent && prestigeContent.classList.contains('active')) {
        return document.getElementById('prestige-upgrades-list');
    } else if (skinsContent && skinsContent.classList.contains('active')) {
        return document.getElementById('skins-list');
    }
    
    // Fallback : retourner le premier conteneur visible
    const upgrades = document.getElementById('upgrades-list');
    if (upgrades && upgrades.offsetParent !== null) return upgrades;
    
    const clicks = document.getElementById('click-upgrades-list');
    if (clicks && clicks.offsetParent !== null) return clicks;
    
    return document.getElementById('upgrades-list');
}

// Helper pour obtenir le sélecteur CSS des items selon le conteneur actif
function getActiveItemSelector() {
    const prestigeContent = document.getElementById('prestige-content');
    const skinsContent = document.getElementById('skins-content');
    
    if (prestigeContent && prestigeContent.classList.contains('active')) {
        return '.prestige-upgrade-item';
    } else if (skinsContent && skinsContent.classList.contains('active')) {
        return '.skin-item';
    }
    
    return '.upgrade-item:not(.upgrade-separator)';
}

// Helper pour détecter si on est dans une grille (skins)
function isGridLayout() {
    const skinsContent = document.getElementById('skins-content');
    return skinsContent && skinsContent.classList.contains('active');
}

// Helper pour obtenir le nombre de colonnes de la grille
function getGridColumns() {
    const skinsList = document.getElementById('skins-list');
    if (!skinsList) return 1;
    
    // Obtenir le style calculé
    const computedStyle = window.getComputedStyle(skinsList);
    const gridColumns = computedStyle.getPropertyValue('grid-template-columns');
    
    // Compter le nombre de colonnes (ex: "100px 100px 100px" = 3 colonnes)
    if (gridColumns && gridColumns !== 'none') {
        return gridColumns.split(' ').filter(col => col.trim()).length;
    }
    
    return 3; // Fallback: 3 colonnes par défaut pour les skins
}

// Helper pour obtenir l'élément scrollable actif
function getScrollableElement() {
    // Vérifier si une modal est ouverte
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) return settingsModal.querySelector('.settings-menu-content') || settingsModal;
    
    const quizModal = document.querySelector('.quiz-modal');
    if (quizModal) return quizModal.querySelector('.quiz-content') || quizModal;
    
    const milestoneModal = document.querySelector('.milestone-modal');
    if (milestoneModal) return milestoneModal;
    
    // Vérifier les modals overlay ouvertes
    const openModal = document.querySelector('.modal-overlay:not(.hidden) .modal-content');
    if (openModal) return openModal;
    
    // Vérifier l'onglet actif et retourner son conteneur scrollable
    const activeContent = document.querySelector('.menu-content.active');
    if (activeContent) return activeContent;
    
    // Fallback: scroller la zone de jeu principale
    const upgradesPanel = document.getElementById('upgrades-panel');
    if (upgradesPanel) return upgradesPanel;
    
    // Dernier recours: scroller la page
    return document.documentElement;
}

// Initialisation du support gamepad
function initGamepad() {
    // Charger les préférences de vibration
    const savedVibration = localStorage.getItem('nirdClicker_vibrationEnabled');
    if (savedVibration !== null) {
        gamepadState.vibrationEnabled = savedVibration === 'true';
    }
    
    // Initialiser le toggle de vibration
    const vibrationToggle = document.getElementById('vibration-toggle');
    if (vibrationToggle) {
        vibrationToggle.checked = gamepadState.vibrationEnabled;
        vibrationToggle.addEventListener('change', (e) => {
            gamepadState.vibrationEnabled = e.target.checked;
            localStorage.setItem('nirdClicker_vibrationEnabled', e.target.checked);
            if (e.target.checked) {
                vibrateGamepad(100, 0.5); // Feedback de confirmation
            }
        });
    }
    
    // Écouter les connexions de manettes
    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);
    
    // Vérifier si une manette est déjà connectée
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            onGamepadConnected({ gamepad: gamepads[i] });
            break;
        }
    }
    
    // Mettre à jour l'état dans les settings périodiquement
    setInterval(updateGamepadStatusUI, 1000);
    
    // Démarrer la boucle de polling
    requestAnimationFrame(gamepadLoop);
    
    console.log('Support Gamepad initialisé');
}

// Mettre à jour l'UI du status gamepad
function updateGamepadStatusUI() {
    const statusEl = document.getElementById('gamepad-status-value');
    if (statusEl) {
        if (gamepadState.connected) {
            const gamepad = navigator.getGamepads()[gamepadState.index];
            const name = gamepad ? gamepad.id.split('(')[0].trim() : 'Manette';
            statusEl.textContent = name;
            statusEl.className = 'status-value connected';
        } else {
            statusEl.textContent = 'Non connectée';
            statusEl.className = 'status-value disconnected';
        }
    }
}

// Manette connectée
function onGamepadConnected(event) {
    const gamepad = event.gamepad;
    
    gamepadState.connected = true;
    gamepadState.index = gamepad.index;
    gamepadState.vibrationSupported = 'vibrationActuator' in gamepad || 'hapticActuators' in gamepad;
    
    console.log(`Manette connectée : ${gamepad.id}`);
    showNotification(`Manette "${gamepad.id.split('(')[0].trim()}" connectée !`, 'success');
    
    // Mettre à jour l'UI
    updateGamepadStatusUI();
    
    // Afficher l'indicateur gamepad
    showGamepadIndicator(true);
    
    // Vibration de confirmation
    vibrateGamepad(100, 0.3);
}

// Manette déconnectée
function onGamepadDisconnected(event) {
    if (event.gamepad.index === gamepadState.index) {
        gamepadState.connected = false;
        gamepadState.index = null;
        
        console.log('Manette déconnectée');
        showNotification('Manette déconnectée', 'warning');
        
        // Mettre à jour l'UI
        updateGamepadStatusUI();
        
        // Cacher l'indicateur gamepad
        showGamepadIndicator(false);
    }
}

// Boucle principale de polling du gamepad
function gamepadLoop() {
    if (gamepadState.connected) {
        const gamepad = navigator.getGamepads()[gamepadState.index];
        
        if (gamepad) {
            processGamepadInput(gamepad);
        }
    }
    
    requestAnimationFrame(gamepadLoop);
}

// Traitement des entrées gamepad
function processGamepadInput(gamepad) {
    const now = Date.now();
    const settingsModal = document.querySelector('.settings-modal');
    
    // Détecter les popups actifs
    const quizModal = document.querySelector('.quiz-modal');
    const milestoneModal = document.querySelector('.milestone-modal');
    const prestigePopup = document.querySelector('.prestige-confirm-popup');
    const bossModal = document.getElementById('boss-modal');
    const isBossVisible = bossModal && !bossModal.classList.contains('hidden');
    const facebookModal = document.getElementById('facebook-attack-modal');
    const facebookAlertScreen = document.getElementById('facebook-alert-screen');
    const facebookVideoScreen = document.getElementById('facebook-video-screen');
    const isFacebookAttackVisible = facebookModal && !facebookModal.classList.contains('hidden');
    const isFacebookAlertPhase = isFacebookAttackVisible && facebookAlertScreen && !facebookAlertScreen.classList.contains('hidden');
    const isFacebookVideoPhase = isFacebookAttackVisible && facebookVideoScreen && !facebookVideoScreen.classList.contains('hidden');
    // OpenAI modal detection (mirrors Facebook behavior)
    const openaiModal = document.getElementById('openai-attack-modal');
    const openaiAlertScreen = document.getElementById('openai-alert-screen');
    const openaiVideoScreen = document.getElementById('openai-video-screen');
    const isOpenaiAttackVisible = openaiModal && !openaiModal.classList.contains('hidden');
    const isOpenaiAlertPhase = isOpenaiAttackVisible && openaiAlertScreen && !openaiAlertScreen.classList.contains('hidden');
    const isOpenaiVideoPhase = isOpenaiAttackVisible && openaiVideoScreen && !openaiVideoScreen.classList.contains('hidden');

    const hasActivePopup = quizModal || milestoneModal || isFacebookAttackVisible || isOpenaiAttackVisible || isBossVisible || prestigePopup;
    
    // Bouton A - Clic principal OU activer item du menu settings OU valider quiz/event
    if (isButtonPressed(gamepad, GAMEPAD_BUTTONS.A)) {
        if (prestigePopup) {
            // Valider le choix dans la popup prestige
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                activatePrestigePopupButton();
                vibrateGamepad(50, 0.5);
            }
        } else if (settingsModal) {
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                activateSettingsItem();
                vibrateGamepad(30, 0.3);
            }
        } else if (quizModal) {
            // Valider la réponse sélectionnée du quiz
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                selectQuizAnswer();
                vibrateGamepad(50, 0.5);
            }
        } else if (milestoneModal) {
            // Fermer le milestone
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                closeMilestoneModalGamepad();
                vibrateGamepad(30, 0.3);
            }
        } else if (isBossVisible) {
            // Cliquer sur le bouton du boss
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                const bossBtn = document.getElementById('boss-click-btn');
                if (bossBtn) {
                    bossBtn.click();
                    vibrateGamepad(40, 0.4);
                }
            }
        } else if (isFacebookAlertPhase) {
            // Lancer la vidéo de l'attaque Facebook
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                const alertBtn = document.getElementById('facebook-alert-btn');
                if (alertBtn) {
                    alertBtn.click();
                    vibrateGamepad(100, 0.8);
                }
            }
        } else if (isOpenaiAlertPhase) {
            // Lancer la vidéo de l'attaque OpenAI
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                const alertBtn = document.getElementById('openai-alert-btn');
                if (alertBtn) {
                    alertBtn.click();
                    vibrateGamepad(100, 0.8);
                }
            }
        } else if (isFacebookVideoPhase) {
            // Fermer si le bouton est visible
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                const closeBtn = document.getElementById('facebook-attack-close-btn');
                if (closeBtn && !closeBtn.classList.contains('hidden')) {
                    closeBtn.click();
                    vibrateGamepad(50, 0.5);
                }
            }
        } else if (isOpenaiVideoPhase) {
            // Fermer OpenAI si le bouton est visible
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                const closeBtn = document.getElementById('openai-attack-close-btn');
                if (closeBtn && !closeBtn.classList.contains('hidden')) {
                    closeBtn.click();
                    vibrateGamepad(50, 0.5);
                }
            }
        } else {
            handleClick();
            createClickEffect();
            vibrateGamepad(30, 0.2);
        }
    }
    
    // Bouton X - Maintenir pour acheter OU interagir avec popup
    if (!settingsModal) {
        const xPressed = isButtonPressed(gamepad, GAMEPAD_BUTTONS.X);
        
        // Si la popup prestige est ouverte, X valide le choix
        if (prestigePopup && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            activatePrestigePopupButton();
            vibrateGamepad(50, 0.5);
        }
        // Si un boss est visible, X clique sur le bouton (pas besoin de maintenir)
        else if (isBossVisible && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            const bossBtn = document.getElementById('boss-click-btn');
            if (bossBtn) {
                bossBtn.click();
                vibrateGamepad(40, 0.4);
            }
        }
        // Si un quiz est ouvert, X valide aussi la réponse
        else if (quizModal && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            selectQuizAnswer();
            vibrateGamepad(50, 0.5);
        }
        // Si un milestone est ouvert, X le ferme
        else if (milestoneModal && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            closeMilestoneModalGamepad();
            vibrateGamepad(30, 0.3);
        }
        // Si l'attaque Facebook est en phase alerte, X lance la vidéo
        else if (isFacebookAlertPhase && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            const alertBtn = document.getElementById('facebook-alert-btn');
            if (alertBtn) {
                alertBtn.click();
                vibrateGamepad(100, 0.8);
            }
        }
        // Si l'attaque OpenAI est en phase alerte, X lance la vidéo
        else if (isOpenaiAlertPhase && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            const alertBtn = document.getElementById('openai-alert-btn');
            if (alertBtn) {
                alertBtn.click();
                vibrateGamepad(100, 0.8);
            }
        }
        // Si l'attaque OpenAI est en phase vidéo, X ferme (si le bouton est visible)
        else if (isOpenaiVideoPhase && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            const closeBtn = document.getElementById('openai-attack-close-btn');
            if (closeBtn && !closeBtn.classList.contains('hidden')) {
                closeBtn.click();
                vibrateGamepad(50, 0.5);
            }
        }
        // Si l'attaque Facebook est en phase vidéo, X ferme (si le bouton est visible)
        else if (isFacebookVideoPhase && isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
            const closeBtn = document.getElementById('facebook-attack-close-btn');
            if (closeBtn && !closeBtn.classList.contains('hidden')) {
                closeBtn.click();
                vibrateGamepad(50, 0.5);
            }
        }
        // Sinon, comportement normal d'achat
        else if (!hasActivePopup) {
            if (xPressed && !holdToBuy.isHolding) {
                // Début du maintien
                startHoldToBuy();
            } else if (xPressed && holdToBuy.isHolding) {
                // Continuer le maintien
                updateHoldToBuy(now);
            } else if (!xPressed && holdToBuy.isHolding) {
                // Relâchement avant la fin
                cancelHoldToBuy();
            }
        }
    }
    
    // Bouton B - Fermer les modals/popups (priorité aux popups dynamiques)
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.B)) {
        // Popup prestige en priorité
        if (prestigePopup) {
            closePrestigePopup();
        } else if (settingsModal) {
            settingsModal.remove();
            playSound('click');
        } else {
            // Fermer tout type de popup/modal ouvert
            closeAllModals();
        }
    }
    
    // Bouton Y - Prestige (avec popup de confirmation)
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.Y)) {
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn && !prestigeBtn.disabled) {
            showPrestigeConfirmPopup();
        }
    }
    
    // Start - Ouvrir/fermer le menu settings
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.START)) {
        openSettingsMenu();
    }
    
    // Select - Afficher les succès
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.SELECT)) {
        toggleModal('achievements-modal');
    }
    
    // LB/RB - Changer d'onglet
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.LB)) {
        switchToPreviousTab();
    }
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.RB)) {
        switchToNextTab();
    }
    
    // LT/RT - Changer le mode d'achat
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.LT)) {
        cycleBuyMode(-1);
    }
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.RT)) {
        cycleBuyMode(1);
    }
    
    // D-Pad / Stick gauche - Navigation
    const leftY = gamepad.axes[GAMEPAD_AXES.LEFT_Y];
    const leftX = gamepad.axes[GAMEPAD_AXES.LEFT_X];
    const dpadUp = gamepad.buttons[GAMEPAD_BUTTONS.DPAD_UP]?.pressed;
    const dpadDown = gamepad.buttons[GAMEPAD_BUTTONS.DPAD_DOWN]?.pressed;
    const dpadLeft = gamepad.buttons[GAMEPAD_BUTTONS.DPAD_LEFT]?.pressed;
    const dpadRight = gamepad.buttons[GAMEPAD_BUTTONS.DPAD_RIGHT]?.pressed;
    
    // Vérifier si le boss pattern est actif
    const bossPatternActive = typeof currentBoss !== 'undefined' && currentBoss && currentBoss.mechanic === 'pattern';
    
    if (canRepeatAction('navigate', now)) {
        // Si boss pattern actif, utiliser le D-pad pour le pattern
        if (bossPatternActive && typeof handlePatternGamepad === 'function') {
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.DPAD_UP) || (leftY < -0.7 && canRepeatAction('pattern', now))) {
                handlePatternGamepad('up');
                gamepadState.lastActionTime['pattern'] = now;
                gamepadState.lastActionTime['navigate'] = now;
            } else if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.DPAD_DOWN) || (leftY > 0.7 && canRepeatAction('pattern', now))) {
                handlePatternGamepad('down');
                gamepadState.lastActionTime['pattern'] = now;
                gamepadState.lastActionTime['navigate'] = now;
            } else if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.DPAD_LEFT) || (leftX < -0.7 && canRepeatAction('pattern', now))) {
                handlePatternGamepad('left');
                gamepadState.lastActionTime['pattern'] = now;
                gamepadState.lastActionTime['navigate'] = now;
            } else if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.DPAD_RIGHT) || (leftX > 0.7 && canRepeatAction('pattern', now))) {
                handlePatternGamepad('right');
                gamepadState.lastActionTime['pattern'] = now;
                gamepadState.lastActionTime['navigate'] = now;
            }
        } else {
            // Navigation normale haut/bas
            if (dpadUp || leftY < -gamepadState.deadzone) {
                if (settingsModal) {
                    navigateSettingsMenu(-1);
                } else if (quizModal) {
                    navigateQuizAnswers(-1);
                } else if (!prestigePopup) {
                    navigateUpgrades('up');
                }
                gamepadState.lastActionTime['navigate'] = now;
            } else if (dpadDown || leftY > gamepadState.deadzone) {
                if (settingsModal) {
                    navigateSettingsMenu(1);
                } else if (quizModal) {
                    navigateQuizAnswers(1);
                } else if (!prestigePopup) {
                    navigateUpgrades('down');
                }
                gamepadState.lastActionTime['navigate'] = now;
            }
            
            // Navigation gauche/droite
            if (prestigePopup) {
                // Navigation dans la popup prestige
                if (dpadLeft || leftX < -gamepadState.deadzone) {
                    navigatePrestigePopup(-1);
                    gamepadState.lastActionTime['navigate'] = now;
                } else if (dpadRight || leftX > gamepadState.deadzone) {
                    navigatePrestigePopup(1);
                    gamepadState.lastActionTime['navigate'] = now;
                }
            } else if (settingsModal && settingsMenuIndex === 2) { // Index 2 = thème
                if (dpadLeft || leftX < -gamepadState.deadzone) {
                    cycleTheme(-1);
                    gamepadState.lastActionTime['navigate'] = now;
                } else if (dpadRight || leftX > gamepadState.deadzone) {
                    cycleTheme(1);
                    gamepadState.lastActionTime['navigate'] = now;
                }
            } else if (!settingsModal && isGridLayout()) {
                // Navigation gauche/droite pour les grilles (skins)
                if (dpadLeft || leftX < -gamepadState.deadzone) {
                    navigateUpgrades('left');
                    gamepadState.lastActionTime['navigate'] = now;
                } else if (dpadRight || leftX > gamepadState.deadzone) {
                    navigateUpgrades('right');
                    gamepadState.lastActionTime['navigate'] = now;
                }
            }
        }
    }
    
    // Joystick droit - Scroll de la page
    const rightY = gamepad.axes[GAMEPAD_AXES.RIGHT_Y];
    const rightX = gamepad.axes[GAMEPAD_AXES.RIGHT_X];
    
    if (Math.abs(rightY) > gamepadState.deadzone || Math.abs(rightX) > gamepadState.deadzone) {
        // Scroll direct de la page
        window.scrollBy(rightX * 20, rightY * 20);
    }
    
    // Mettre à jour l'état des boutons pour le prochain frame
    updateButtonStates(gamepad);
}

// Vérifier si un bouton est pressé (maintenu)
function isButtonPressed(gamepad, buttonIndex) {
    const button = gamepad.buttons[buttonIndex];
    return button && (button.pressed || button.value > 0.5);
}

// Vérifier si un bouton vient juste d'être pressé
function isButtonJustPressed(gamepad, buttonIndex) {
    const button = gamepad.buttons[buttonIndex];
    const isPressed = button && (button.pressed || button.value > 0.5);
    const wasPressed = gamepadState.lastButtonStates[buttonIndex];
    
    return isPressed && !wasPressed;
}

// Mettre à jour l'état des boutons
function updateButtonStates(gamepad) {
    for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i];
        gamepadState.lastButtonStates[i] = button && (button.pressed || button.value > 0.5);
    }
}

// Vérifier si une action peut être répétée
function canRepeatAction(action, now) {
    const lastTime = gamepadState.lastActionTime[action] || 0;
    return (now - lastTime) > gamepadState.repeatDelay;
}

// Faire vibrer la manette
function vibrateGamepad(duration = 100, intensity = 0.5) {
    if (!gamepadState.connected || !gamepadState.vibrationSupported || !gamepadState.vibrationEnabled) return;
    
    const gamepad = navigator.getGamepads()[gamepadState.index];
    if (!gamepad) return;
    
    try {
        if (gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                duration: duration,
                strongMagnitude: intensity,
                weakMagnitude: intensity * 0.5
            });
        } else if (gamepad.hapticActuators && gamepad.hapticActuators[0]) {
            gamepad.hapticActuators[0].pulse(intensity, duration);
        }
    } catch (e) {
        // Vibration non supportée, ignorer silencieusement
    }
}

// Navigation dans les upgrades (verticale ou grille)
// direction: 'up', 'down', 'left', 'right' ou -1/1 pour compatibilité
function navigateUpgrades(direction) {
    const container = getActiveUpgradeContainer();
    if (!container) return;
    
    const selector = getActiveItemSelector();
    upgradeElements = container.querySelectorAll(selector);
    if (upgradeElements.length === 0) return;
    
    // Retirer la sélection précédente
    upgradeElements.forEach(el => el.classList.remove('gamepad-selected'));
    
    // Calculer le nouvel index selon le type de navigation
    const isGrid = isGridLayout();
    const columns = isGrid ? getGridColumns() : 1;
    
    let newIndex = selectedUpgradeIndex;
    
    if (direction === 'up' || direction === -1) {
        // Navigation vers le haut
        if (isGrid) {
            newIndex -= columns;
            if (newIndex < 0) {
                // Aller à la dernière ligne, même colonne si possible
                const currentCol = selectedUpgradeIndex % columns;
                const lastRowStart = Math.floor((upgradeElements.length - 1) / columns) * columns;
                newIndex = Math.min(lastRowStart + currentCol, upgradeElements.length - 1);
            }
        } else {
            newIndex--;
            if (newIndex < 0) newIndex = upgradeElements.length - 1;
        }
    } else if (direction === 'down' || direction === 1) {
        // Navigation vers le bas
        if (isGrid) {
            newIndex += columns;
            if (newIndex >= upgradeElements.length) {
                // Aller à la première ligne, même colonne
                const currentCol = selectedUpgradeIndex % columns;
                newIndex = currentCol;
            }
        } else {
            newIndex++;
            if (newIndex >= upgradeElements.length) newIndex = 0;
        }
    } else if (direction === 'left') {
        // Navigation vers la gauche (grille uniquement)
        if (isGrid) {
            newIndex--;
            if (newIndex < 0) newIndex = upgradeElements.length - 1;
        }
    } else if (direction === 'right') {
        // Navigation vers la droite (grille uniquement)
        if (isGrid) {
            newIndex++;
            if (newIndex >= upgradeElements.length) newIndex = 0;
        }
    }
    
    selectedUpgradeIndex = newIndex;
    
    // Appliquer la sélection
    const selectedElement = upgradeElements[selectedUpgradeIndex];
    if (selectedElement) {
        selectedElement.classList.add('gamepad-selected');
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Son de navigation
    playSound('click');
}

// ============================================
// NAVIGATION QUIZ (Gamepad)
// ============================================

function navigateQuizAnswers(direction) {
    const quizModal = document.querySelector('.quiz-modal');
    if (!quizModal) return;
    
    const answers = quizModal.querySelectorAll('.quiz-answer');
    if (answers.length === 0) return;
    
    // Retirer la sélection précédente
    answers.forEach(el => el.classList.remove('gamepad-selected'));
    
    // Calculer le nouvel index
    selectedQuizAnswerIndex += direction;
    if (selectedQuizAnswerIndex < 0) selectedQuizAnswerIndex = answers.length - 1;
    if (selectedQuizAnswerIndex >= answers.length) selectedQuizAnswerIndex = 0;
    
    // Appliquer la sélection
    const selectedAnswer = answers[selectedQuizAnswerIndex];
    if (selectedAnswer) {
        selectedAnswer.classList.add('gamepad-selected');
    }
    
    playSound('click');
}

function selectQuizAnswer() {
    const quizModal = document.querySelector('.quiz-modal');
    if (!quizModal) return;
    
    const answers = quizModal.querySelectorAll('.quiz-answer');
    if (answers.length === 0) return;
    
    // Si aucune réponse n'est sélectionnée, sélectionner la première
    let selectedAnswer = quizModal.querySelector('.quiz-answer.gamepad-selected');
    if (!selectedAnswer && answers.length > 0) {
        selectedAnswer = answers[0];
    }
    
    if (selectedAnswer) {
        selectedAnswer.click();
        selectedQuizAnswerIndex = 0; // Reset pour le prochain quiz
    }
}

function closeMilestoneModalGamepad() {
    // Appeler la fonction globale de events.js si disponible
    if (typeof window.closeMilestoneModal === 'function') {
        window.closeMilestoneModal();
    } else {
        // Fallback si la fonction n'existe pas
        const milestoneModal = document.querySelector('.milestone-modal');
        if (milestoneModal) {
            document.body.classList.remove('modal-open');
            milestoneModal.remove();
            document.querySelectorAll('.confetti').forEach(c => c.remove());
            if (typeof onEventComplete === 'function') {
                onEventComplete();
            }
        }
    }
    playSound('click');
}

// ============================================
// POPUP DE CONFIRMATION PRESTIGE
// ============================================

let prestigePopupSelectedIndex = 0; // 0 = Annuler, 1 = Confirmer

function showPrestigeConfirmPopup() {
    // Fermer toute popup existante d'abord
    const existingPopup = document.querySelector('.prestige-confirm-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Vérifier si on peut prestige
    if (typeof canPrestige === 'function' && !canPrestige()) {
        if (typeof showNotification === 'function') {
            showNotification('Pas assez de points pour le prestige !', 'error');
        }
        vibrateGamepad(150, 0.8);
        return;
    }
    
    // Calculer les points de prestige
    let pointsGained = 1;
    if (typeof calculatePrestigePoints === 'function') {
        pointsGained = calculatePrestigePoints();
    }
    
    let currentBonus = 0;
    let newBonus = 0;
    let currentScore = 0;
    let currentProduction = 0;
    let totalUpgrades = 0;
    
    if (typeof gameState !== 'undefined') {
        currentBonus = (gameState.prestigeLevel || 0) * 10;
        newBonus = ((gameState.prestigeLevel || 0) + pointsGained) * 10;
        currentScore = gameState.score || 0;
        currentProduction = gameState.productionPerSecond || 0;
        totalUpgrades = gameState.totalUpgrades || 0;
    }
    
    // Formater les nombres
    const formatNum = typeof formatNumber === 'function' ? formatNumber : (n) => n.toLocaleString();
    
    // Créer la popup
    const popup = document.createElement('div');
    popup.className = 'prestige-confirm-popup';
    popup.innerHTML = `
        <div class="prestige-confirm-content">
            <span class="modal-kicker">Renaissance</span>
            <h2>Prestige</h2>
            <div class="prestige-info">
                <p class="prestige-points">Vous allez gagner <strong>+${pointsGained}</strong> point(s) de prestige !</p>
                <div class="prestige-gains">
                    <p class="prestige-bonus">Bonus production : <span class="current">+${currentBonus}%</span> → <span class="new">+${newBonus}%</span></p>
                </div>
            </div>
            <div class="prestige-losses">
                <p class="loss-title">Vous allez perdre :</p>
                <ul>
                    <li>${formatNum(currentScore)} points</li>
                    <li>${formatNum(currentProduction)}/s de production</li>
                    <li>${totalUpgrades} bâtiments</li>
                </ul>
            </div>
            <div class="prestige-buttons">
                <button class="prestige-cancel-btn gamepad-selected" data-action="cancel">Annuler</button>
                <button class="prestige-confirm-btn" data-action="confirm">Confirmer</button>
            </div>
            <p class="prestige-hint">← → pour choisir, A/X pour valider, B pour annuler</p>
        </div>
    `;
    
    document.body.appendChild(popup);
    prestigePopupSelectedIndex = 0;
    
    // Ajouter les événements clic
    popup.querySelector('.prestige-cancel-btn').addEventListener('click', closePrestigePopup);
    popup.querySelector('.prestige-confirm-btn').addEventListener('click', confirmPrestige);
    
    playSound('click');
}

function navigatePrestigePopup(direction) {
    const popup = document.querySelector('.prestige-confirm-popup');
    if (!popup) return;
    
    const buttons = popup.querySelectorAll('.prestige-buttons button');
    if (buttons.length === 0) return;
    
    // Retirer la sélection précédente
    buttons.forEach(btn => btn.classList.remove('gamepad-selected'));
    
    // Changer l'index
    prestigePopupSelectedIndex += direction;
    if (prestigePopupSelectedIndex < 0) prestigePopupSelectedIndex = buttons.length - 1;
    if (prestigePopupSelectedIndex >= buttons.length) prestigePopupSelectedIndex = 0;
    
    // Appliquer la nouvelle sélection
    buttons[prestigePopupSelectedIndex].classList.add('gamepad-selected');
    
    playSound('click');
}

function activatePrestigePopupButton() {
    const popup = document.querySelector('.prestige-confirm-popup');
    if (!popup) return;
    
    const selectedBtn = popup.querySelector('.prestige-buttons button.gamepad-selected');
    if (selectedBtn) {
        selectedBtn.click();
    }
}

function confirmPrestige() {
    // Fermer la popup d'abord
    const popup = document.querySelector('.prestige-confirm-popup');
    if (popup) {
        popup.remove();
    }
    
    // Appeler directement doPrestigeDirectly
    if (typeof doPrestigeDirectly === 'function') {
        doPrestigeDirectly();
    } else if (typeof doPrestigeWithoutConfirm === 'function') {
        doPrestigeWithoutConfirm();
    } else {
        // Fallback: exécuter le prestige directement
        executePrestige();
    }
    
    vibrateGamepad(200, 1.0);
    playSound('prestige');
}

function executePrestige() {
    // Exécuter le prestige directement
    if (typeof gameState === 'undefined' || typeof PRESTIGE_THRESHOLD === 'undefined') return;
    
    if (gameState.totalScore < PRESTIGE_THRESHOLD) return;
    
    const pointsGained = typeof calculatePrestigePoints === 'function' ? calculatePrestigePoints() : 1;
    
    // Appliquer le prestige
    gameState.prestigePoints = (gameState.prestigePoints || 0) + pointsGained;
    gameState.prestigeLevel = (gameState.prestigeLevel || 0) + pointsGained;
    
    // Reset les données de jeu
    gameState.score = 0;
    gameState.totalScore = 0;
    gameState.totalClicks = 0;
    gameState.totalUpgrades = 0;
    gameState.clickPower = 1;
    gameState.productionPerSecond = 0;
    gameState.currentVillageLevel = 0;
    
    // Reset les upgrades
    if (typeof UPGRADES !== 'undefined') {
        UPGRADES.forEach(u => {
            u.owned = 0;
            u.unlocked = u.unlockAt ? false : true;
        });
    }
    
    // Reset les click upgrades
    if (typeof CLICK_UPGRADES !== 'undefined') {
        CLICK_UPGRADES.forEach(u => {
            u.purchased = false;
        });
    }
    
    if (typeof playSound === 'function') playSound('prestige');
    if (typeof showNotification === 'function') {
        showNotification(`Prestige ! +${pointsGained} points, bonus +${gameState.prestigeLevel * 10}%`, 'prestige');
    }
    
    if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
}

function closePrestigePopup() {
    const popup = document.querySelector('.prestige-confirm-popup');
    if (popup) {
        popup.remove();
        playSound('click');
    }
}

// ============================================
// SYSTÈME DE MAINTIEN POUR ACHETER (Hold to Buy)
// ============================================

function startHoldToBuy() {
    const container = getActiveUpgradeContainer();
    if (!container) return;
    
    const selector = getActiveItemSelector();
    upgradeElements = container.querySelectorAll(selector);
    const selectedElement = upgradeElements[selectedUpgradeIndex];
    
    if (!selectedElement) return;
    
    // Déterminer le type d'élément
    const isSkin = selectedElement.classList.contains('skin-item');
    const isPrestige = selectedElement.classList.contains('prestige-upgrade-item');
    
    // Logique pour les skins
    if (isSkin) {
        const isLocked = selectedElement.classList.contains('locked');
        const isActive = selectedElement.classList.contains('active');
        
        // Ne pas permettre si verrouillé (pas assez de points) ou déjà actif
        if (isLocked) {
            vibrateGamepad(150, 0.8);
            return;
        }
        // Si actif, on peut quand même cliquer pour "réappliquer"
    }
    // Logique pour les prestige upgrades
    else if (isPrestige) {
        const isPurchased = selectedElement.classList.contains('purchased');
        const cannotAfford = selectedElement.classList.contains('cannot-afford');
        
        // Si déjà acheté, ne rien faire (pas de vibration)
        if (isPurchased) {
            return;
        }
        
        // Si on ne peut pas se permettre l'achat
        if (cannotAfford) {
            vibrateGamepad(150, 0.8);
            return;
        }
        
        const buyButton = selectedElement.querySelector('.prestige-buy-btn');
        if (buyButton && buyButton.disabled) {
            vibrateGamepad(150, 0.8);
            return;
        }
    }
    // Logique pour les upgrades classiques
    else {
        const buyButton = selectedElement.querySelector('.upgrade-buy-btn');
        const canAfford = selectedElement.classList.contains('can-afford');
        const isPurchased = selectedElement.classList.contains('purchased');
        
        // Si déjà acheté, ne rien faire (pas de vibration)
        if (isPurchased) {
            return;
        }
        
        if (!canAfford && !buyButton) {
            vibrateGamepad(150, 0.8);
            return;
        }
        
        if (buyButton && buyButton.disabled) {
            vibrateGamepad(150, 0.8);
            return;
        }
    }
    
    holdToBuy.isHolding = true;
    holdToBuy.startTime = Date.now();
    holdToBuy.progress = 0;
    
    // Ajouter la classe d'animation
    selectedElement.classList.add('hold-to-buy-active');
    
    // Créer l'élément de progression si pas présent
    let progressBar = selectedElement.querySelector('.hold-progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'hold-progress-bar';
        selectedElement.appendChild(progressBar);
    }
    progressBar.style.width = '0%';
    
    // Vibration initiale légère
    vibrateGamepad(30, 0.2);
}

function updateHoldToBuy(now) {
    if (!holdToBuy.isHolding) return;
    
    const elapsed = now - holdToBuy.startTime;
    holdToBuy.progress = Math.min(elapsed / holdToBuy.duration, 1);
    
    // Mettre à jour la barre de progression
    const container = getActiveUpgradeContainer();
    if (!container) return;
    
    const selector = getActiveItemSelector();
    upgradeElements = container.querySelectorAll(selector);
    const selectedElement = upgradeElements[selectedUpgradeIndex];
    
    if (selectedElement) {
        const progressBar = selectedElement.querySelector('.hold-progress-bar');
        if (progressBar) {
            progressBar.style.width = (holdToBuy.progress * 100) + '%';
        }
    }
    
    // Vibration progressive (plus forte au fur et à mesure)
    const vibrationIntensity = 0.1 + (holdToBuy.progress * 0.5);
    vibrateGamepad(20, vibrationIntensity);
    
    // Achat complété !
    if (holdToBuy.progress >= 1) {
        completeHoldToBuy();
    }
}

function completeHoldToBuy() {
    const container = getActiveUpgradeContainer();
    if (!container) return;
    
    const selector = getActiveItemSelector();
    upgradeElements = container.querySelectorAll(selector);
    const selectedElement = upgradeElements[selectedUpgradeIndex];
    
    if (selectedElement) {
        // Déterminer le type d'élément
        const isSkin = selectedElement.classList.contains('skin-item');
        const isPrestige = selectedElement.classList.contains('prestige-upgrade-item');
        
        if (isSkin) {
            // Les skins utilisent un clic direct sur l'élément
            selectedElement.click();
        } else if (isPrestige) {
            // Prestige utilise un bouton spécifique
            const buyButton = selectedElement.querySelector('.prestige-buy-btn');
            if (buyButton && !buyButton.disabled) {
                buyButton.click();
            } else {
                selectedElement.click();
            }
        } else {
            // Upgrades classiques
            const buyButton = selectedElement.querySelector('.upgrade-buy-btn');
            if (buyButton && !buyButton.disabled) {
                buyButton.click();
            } else if (selectedElement.classList.contains('can-afford')) {
                selectedElement.click();
            }
        }
        
        // Vibration de succès forte
        vibrateGamepad(150, 1.0);
        
        // Animation de succès
        selectedElement.classList.add('hold-to-buy-success');
        setTimeout(() => {
            selectedElement.classList.remove('hold-to-buy-success');
        }, 300);
    }
    
    // Reset
    resetHoldToBuy();
}

function cancelHoldToBuy() {
    const container = getActiveUpgradeContainer();
    if (container) {
        const selector = getActiveItemSelector();
        upgradeElements = container.querySelectorAll(selector);
        const selectedElement = upgradeElements[selectedUpgradeIndex];
        
        if (selectedElement) {
            // Animation d'annulation
            selectedElement.classList.add('hold-to-buy-cancel');
            setTimeout(() => {
                selectedElement.classList.remove('hold-to-buy-cancel');
            }, 200);
        }
    }
    
    resetHoldToBuy();
}

function resetHoldToBuy() {
    holdToBuy.isHolding = false;
    holdToBuy.progress = 0;
    holdToBuy.startTime = 0;
    
    // Nettoyer les éléments visuels de tous les conteneurs
    const containersAndSelectors = [
        { id: 'upgrades-list', selector: '.upgrade-item' },
        { id: 'click-upgrades-list', selector: '.upgrade-item' },
        { id: 'prestige-upgrades-list', selector: '.prestige-upgrade-item' },
        { id: 'skins-list', selector: '.skin-item' }
    ];
    
    containersAndSelectors.forEach(({ id, selector }) => {
        const container = document.getElementById(id);
        if (container) {
            const items = container.querySelectorAll(selector);
            items.forEach(el => {
                el.classList.remove('hold-to-buy-active');
                const progressBar = el.querySelector('.hold-progress-bar');
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
            });
        }
    });
}

// Acheter l'upgrade sélectionnée (legacy, gardé pour compatibilité)
function buySelectedUpgrade() {
    const container = getActiveUpgradeContainer();
    if (!container) return;
    
    const selector = getActiveItemSelector();
    upgradeElements = container.querySelectorAll(selector);
    const selectedElement = upgradeElements[selectedUpgradeIndex];
    
    if (selectedElement) {
        // Trouver et cliquer sur le bouton d'achat
        const buyButton = selectedElement.querySelector('.upgrade-buy-btn');
        if (buyButton && !buyButton.disabled) {
            buyButton.click();
            vibrateGamepad(100, 0.6);
        } else {
            // Vibration d'erreur si pas assez de points
            vibrateGamepad(200, 0.8);
        }
    }
}

// Changer d'onglet (précédent)
function switchToPreviousTab() {
    const tabs = document.querySelectorAll('.menu-tab');
    const activeTab = document.querySelector('.menu-tab.active');
    
    if (!activeTab || tabs.length === 0) return;
    
    // Retirer la sélection de l'ancien onglet
    clearGamepadSelection();
    
    let currentIndex = Array.from(tabs).indexOf(activeTab);
    currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    
    tabs[currentIndex].click();
    
    // Réinitialiser l'index de sélection
    selectedUpgradeIndex = 0;
    playSound('click');
}

// Changer d'onglet (suivant)
function switchToNextTab() {
    const tabs = document.querySelectorAll('.menu-tab');
    const activeTab = document.querySelector('.menu-tab.active');
    
    if (!activeTab || tabs.length === 0) return;
    
    // Retirer la sélection de l'ancien onglet
    clearGamepadSelection();
    
    let currentIndex = Array.from(tabs).indexOf(activeTab);
    currentIndex = (currentIndex + 1) % tabs.length;
    
    tabs[currentIndex].click();
    
    // Réinitialiser l'index de sélection
    selectedUpgradeIndex = 0;
    playSound('click');
}

// Nettoyer la sélection gamepad de tous les conteneurs
function clearGamepadSelection() {
    const selectors = ['.upgrade-item', '.prestige-upgrade-item', '.skin-item'];
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.remove('gamepad-selected');
        });
    });
}

// Cycle du mode d'achat
function cycleBuyMode(direction) {
    const modes = [1, 10, 50, 'max'];
    const currentMode = typeof buyMode !== 'undefined' ? buyMode : 1;
    let currentIndex = modes.indexOf(currentMode);
    
    if (currentIndex === -1) currentIndex = 0;
    
    currentIndex = (currentIndex + direction + modes.length) % modes.length;
    
    if (typeof setBuyMode === 'function') {
        setBuyMode(modes[currentIndex]);
        playSound('click');
    }
}

// Fermer toutes les modals et popups
function closeAllModals() {
    let closed = false;
    
    // Fermer les modals overlay classiques
    const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
    modals.forEach(modal => {
        modal.classList.add('hidden');
        closed = true;
    });
    
    // Fermer les quiz dynamiques
    const quizModal = document.querySelector('.quiz-modal');
    if (quizModal) {
        quizModal.remove();
        closed = true;
        // Appeler skipQuiz si disponible pour gérer l'état
        if (typeof skipQuiz === 'function') {
            // skipQuiz affiche une notification, on l'appelle pas directement
            // On utilise closeQuiz si disponible
        }
        if (typeof closeQuiz === 'function') {
            closeQuiz();
        }
    }
    
    // Fermer les milestone modals
    const milestoneModal = document.querySelector('.milestone-modal');
    if (milestoneModal) {
        milestoneModal.remove();
        closed = true;
    }
    
    // Fermer l'attaque Facebook
    const facebookModal = document.getElementById('facebook-attack-modal');
    if (facebookModal && !facebookModal.classList.contains('hidden')) {
        // Utiliser la fonction de fermeture propre
        if (typeof closeFacebookAttack === 'function') {
            closeFacebookAttack();
        } else {
            facebookModal.classList.add('hidden');
        }
        closed = true;
    }
    // Fermer l'attaque OpenAI
    const openaiModal = document.getElementById('openai-attack-modal');
    if (openaiModal && !openaiModal.classList.contains('hidden')) {
        if (typeof closeOpenaiAttack === 'function') {
            closeOpenaiAttack();
        } else {
            openaiModal.classList.add('hidden');
        }
        closed = true;
    }
    
    // Fermer le menu settings dynamique
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
        settingsModal.remove();
        closed = true;
    }
    
    // Fermer les notifications de confirmation/alert
    const confirmModals = document.querySelectorAll('.confirm-modal, .alert-modal, .notification-modal');
    confirmModals.forEach(modal => {
        modal.remove();
        closed = true;
    });
    
    if (closed) {
        playSound('click');
    }
}

// Toggle une modal spécifique
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden');
        playSound('click');
    }
}

// Afficher/cacher l'indicateur gamepad
function showGamepadIndicator(show) {
    let indicator = document.getElementById('gamepad-indicator');
    
    if (show) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'gamepad-indicator';
            indicator.innerHTML = `
                <span class="gamepad-icon">${icon('gamepad')}</span>
                <span class="gamepad-text">Manette connectée</span>
            `;
            document.body.appendChild(indicator);
        }
        indicator.classList.add('visible');
        
        // Cacher après 3 secondes
        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 3000);
    } else if (indicator) {
        indicator.classList.remove('visible');
    }
}

// Créer un effet visuel de clic
function createClickEffect() {
    const clicker = document.getElementById('main-clicker');
    if (clicker) {
        clicker.classList.add('clicked');
        setTimeout(() => clicker.classList.remove('clicked'), 100);
    }
}

// Afficher l'aide gamepad
function showGamepadHelp() {
    const helpContent = `
        <div class="gamepad-help">
            <h3>Contrôles Manette</h3>
            <div class="gamepad-help-grid">
                <div class="gamepad-help-item">
                    <span class="btn-icon">A</span>
                    <span>Clic (maintenir pour spam)</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">B</span>
                    <span>Fermer / Retour</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">X</span>
                    <span>Acheter upgrade</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">Y</span>
                    <span>Paramètres</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">LB/RB</span>
                    <span>Changer d'onglet</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">LT/RT</span>
                    <span>Mode achat (x1/x10/MAX)</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">D-Pad ↑↓</span>
                    <span>Naviguer dans les upgrades</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">Start</span>
                    <span>Prestige</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">Select</span>
                    <span>Succès</span>
                </div>
            </div>
        </div>
    `;
    
    showNotification(helpContent, 'info', 10000);
}

// Exposer les fonctions globalement
window.initGamepad = initGamepad;
window.vibrateGamepad = vibrateGamepad;
window.showGamepadHelp = showGamepadHelp;
window.gamepadState = gamepadState;

// Auto-init quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamepad);
} else {
    initGamepad();
}
