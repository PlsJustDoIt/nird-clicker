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
    
    console.log('🎮 Support Gamepad initialisé');
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
    
    console.log(`🎮 Manette connectée : ${gamepad.id}`);
    showNotification(`🎮 Manette "${gamepad.id.split('(')[0].trim()}" connectée !`, 'success');
    
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
        
        console.log('🎮 Manette déconnectée');
        showNotification('🎮 Manette déconnectée', 'warning');
        
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
    
    // Bouton A - Clic principal OU activer item du menu settings
    if (isButtonPressed(gamepad, GAMEPAD_BUTTONS.A)) {
        if (settingsModal) {
            if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.A)) {
                activateSettingsItem();
                vibrateGamepad(30, 0.3);
            }
        } else {
            handleClick();
            createClickEffect();
            vibrateGamepad(30, 0.2);
        }
    }
    
    // Bouton X - Acheter l'upgrade sélectionnée
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.X)) {
        if (!settingsModal) {
            buySelectedUpgrade();
            vibrateGamepad(50, 0.4);
        }
    }
    
    // Bouton B - Fermer les modals
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.B)) {
        if (settingsModal) {
            settingsModal.remove();
            playSound('click');
        } else {
            closeAllModals();
        }
    }
    
    // Bouton Y - Ouvrir/fermer le menu settings
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.Y)) {
        openSettingsMenu();
    }
    
    // Start - Prestige (avec confirmation)
    if (isButtonJustPressed(gamepad, GAMEPAD_BUTTONS.START)) {
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn && !prestigeBtn.disabled) {
            prestigeBtn.click();
        }
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
    
    if (canRepeatAction('navigate', now)) {
        // Navigation haut/bas
        if (dpadUp || leftY < -gamepadState.deadzone) {
            if (settingsModal) {
                navigateSettingsMenu(-1);
            } else {
                navigateUpgrades(-1);
            }
            gamepadState.lastActionTime['navigate'] = now;
        } else if (dpadDown || leftY > gamepadState.deadzone) {
            if (settingsModal) {
                navigateSettingsMenu(1);
            } else {
                navigateUpgrades(1);
            }
            gamepadState.lastActionTime['navigate'] = now;
        }
        
        // Navigation gauche/droite pour le thème dans settings
        if (settingsModal && settingsMenuIndex === 2) { // Index 2 = thème
            if (dpadLeft || leftX < -gamepadState.deadzone) {
                cycleTheme(-1);
                gamepadState.lastActionTime['navigate'] = now;
            } else if (dpadRight || leftX > gamepadState.deadzone) {
                cycleTheme(1);
                gamepadState.lastActionTime['navigate'] = now;
            }
        }
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

// Navigation dans les upgrades
function navigateUpgrades(direction) {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    
    upgradeElements = container.querySelectorAll('.upgrade-item:not(.upgrade-separator)');
    if (upgradeElements.length === 0) return;
    
    // Retirer la sélection précédente
    upgradeElements.forEach(el => el.classList.remove('gamepad-selected'));
    
    // Calculer le nouvel index
    selectedUpgradeIndex += direction;
    if (selectedUpgradeIndex < 0) selectedUpgradeIndex = upgradeElements.length - 1;
    if (selectedUpgradeIndex >= upgradeElements.length) selectedUpgradeIndex = 0;
    
    // Appliquer la sélection
    const selectedElement = upgradeElements[selectedUpgradeIndex];
    if (selectedElement) {
        selectedElement.classList.add('gamepad-selected');
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Son de navigation
    playSound('click');
}

// Acheter l'upgrade sélectionnée
function buySelectedUpgrade() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    
    upgradeElements = container.querySelectorAll('.upgrade-item:not(.upgrade-separator)');
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
    
    let currentIndex = Array.from(tabs).indexOf(activeTab);
    currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    
    tabs[currentIndex].click();
    playSound('click');
}

// Changer d'onglet (suivant)
function switchToNextTab() {
    const tabs = document.querySelectorAll('.menu-tab');
    const activeTab = document.querySelector('.menu-tab.active');
    
    if (!activeTab || tabs.length === 0) return;
    
    let currentIndex = Array.from(tabs).indexOf(activeTab);
    currentIndex = (currentIndex + 1) % tabs.length;
    
    tabs[currentIndex].click();
    playSound('click');
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

// Fermer toutes les modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
    playSound('click');
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
                <span class="gamepad-icon">🎮</span>
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
            <h3>🎮 Contrôles Manette</h3>
            <div class="gamepad-help-grid">
                <div class="gamepad-help-item">
                    <span class="btn-icon">🅰️</span>
                    <span>Clic (maintenir pour spam)</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">🅱️</span>
                    <span>Fermer / Retour</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">🅧</span>
                    <span>Acheter upgrade</span>
                </div>
                <div class="gamepad-help-item">
                    <span class="btn-icon">🅨</span>
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
