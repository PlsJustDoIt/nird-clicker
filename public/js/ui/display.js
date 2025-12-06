/**
 * NIRD Clicker - Affichage UI
 * Mise à jour du score, stats, jauges
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Variable pour optimiser les mises à jour des upgrades
var lastScoreForUpgrades = 0;

// ============================================
// MISE À JOUR PRINCIPALE
// ============================================

/**
 * Met à jour toute l'interface
 */
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

/**
 * Met à jour l'affichage du score
 */
function updateScoreDisplay() {
    const scoreEl = document.getElementById('score');
    const perSecEl = document.getElementById('per-second');
    
    if (scoreEl) scoreEl.textContent = formatNumber(gameState.score);
    if (perSecEl) perSecEl.textContent = formatNumber(gameState.productionPerSecond);
    
    // Mettre à jour les upgrades si le score a significativement changé ou si mode MAX
    if (typeof buyMode !== 'undefined' && (buyMode === 'max' || Math.abs(gameState.score - lastScoreForUpgrades) > lastScoreForUpgrades * 0.05)) {
        if (typeof updateUpgradesList === 'function') updateUpgradesList();
        lastScoreForUpgrades = gameState.score;
    }
}

/**
 * Met à jour les statistiques
 */
function updateStatsDisplay() {
    const totalClicksEl = document.getElementById('total-clicks');
    const pcLiberatedEl = document.getElementById('pc-liberated');
    const villageLevelEl = document.getElementById('village-level');
    
    if (totalClicksEl) totalClicksEl.textContent = formatNumber(gameState.totalClicks);
    if (pcLiberatedEl) pcLiberatedEl.textContent = formatNumber(Math.floor(gameState.totalScore / 100));
    if (villageLevelEl) villageLevelEl.textContent = gameState.currentVillageLevel + 1;
    
    // Prestige info
    const prestigeInfo = document.getElementById('prestige-info');
    const prestigeTab = document.getElementById('prestige-tab');
    
    if (gameState.prestigeLevel > 0) {
        if (prestigeTab) prestigeTab.style.display = 'inline-block';
    } else {
        if (prestigeInfo) {
            prestigeInfo.textContent = '';
            prestigeInfo.classList.remove('visible');
        }
        if (prestigeTab) prestigeTab.style.display = 'none';
    }
}

/**
 * Met à jour la puissance de clic affichée
 */
function updateClickPower() {
    const effectivePower = typeof getEffectiveClickPower === 'function' 
        ? getEffectiveClickPower() 
        : gameState.clickPower;
    const clickPowerEl = document.getElementById('click-power');
    if (clickPowerEl) clickPowerEl.textContent = effectivePower;
}

/**
 * Met à jour l'affichage du combo
 */
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

/**
 * Met à jour la jauge de résistance/progression
 */
function updateGauge() {
    if (typeof VILLAGE_LEVELS === 'undefined') return;
    
    const currentLevel = VILLAGE_LEVELS[gameState.currentVillageLevel];
    const nextLevel = VILLAGE_LEVELS[gameState.currentVillageLevel + 1];
    
    let percentage = 100;
    if (nextLevel) {
        const progress = gameState.totalScore - currentLevel.minScore;
        const needed = nextLevel.minScore - currentLevel.minScore;
        percentage = Math.min(100, (progress / needed) * 100);
    }
    
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeLabel = document.getElementById('gauge-label');
    
    if (gaugeFill) gaugeFill.style.width = percentage + '%';
    if (gaugeLabel) gaugeLabel.textContent = `${currentLevel.emoji} ${currentLevel.name}`;
}

/**
 * Met à jour le bouton de prestige
 */
function updatePrestigeButton() {
    const prestigeBtn = document.getElementById('prestige-btn');
    if (!prestigeBtn) return;
    
    const canPrestigeNow = typeof canPrestige === 'function' ? canPrestige() : false;
    const prestigePoints = typeof calculatePrestigePoints === 'function' ? calculatePrestigePoints() : 0;
    const threshold = typeof PRESTIGE_THRESHOLD !== 'undefined' ? PRESTIGE_THRESHOLD : 500000;
    
    prestigeBtn.disabled = !canPrestigeNow;
    prestigeBtn.innerHTML = canPrestigeNow 
        ? `🔄 Prestige (+${prestigePoints} pts)` 
        : `🔄 Prestige (${formatNumber(threshold)} requis)`;
}

/**
 * Met à jour l'affichage du prestige
 */
function updatePrestigeDisplay() {
    const pointsDisplay = document.getElementById('prestige-points-display');
    const multiplierDisplay = document.getElementById('prestige-multiplier');
    
    if (pointsDisplay) pointsDisplay.textContent = gameState.prestigePoints || 0;
    if (multiplierDisplay) {
        const bonus = typeof PRESTIGE_BONUS_PER_LEVEL !== 'undefined' ? PRESTIGE_BONUS_PER_LEVEL : 0.05;
        const multiplier = 1 + (gameState.prestigeLevel * bonus);
        multiplierDisplay.textContent = multiplier.toFixed(2);
    }
}

/**
 * Met à jour les missions quotidiennes
 */
function updateMissionsUI() {
    const container = document.getElementById('daily-missions');
    if (!container || !gameState.dailyMissions) return;
    
    container.innerHTML = '<h3>🎯 Missions du jour</h3>';
    
    gameState.dailyMissions.forEach(mission => {
        const progress = Math.min(mission.progress || 0, mission.target);
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

/**
 * Met à jour le visuel du village
 */
function updateVillageVisual() {
    const villageContainer = document.getElementById('village-visual');
    if (!villageContainer || typeof VILLAGE_LEVELS === 'undefined') return;
    
    const level = VILLAGE_LEVELS[gameState.currentVillageLevel];
    if (level) {
        villageContainer.innerHTML = `
            <div class="village-level-${gameState.currentVillageLevel}">
                <span class="village-emoji">${level.emoji}</span>
                <p class="village-description">${level.description || ''}</p>
            </div>
        `;
    }
}

/**
 * Met à jour les boutons de mode d'achat
 */
function updateBuyModeButtons() {
    document.querySelectorAll('.buy-mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (typeof buyMode !== 'undefined' && btn.dataset.mode == buyMode) {
            btn.classList.add('active');
        }
    });
}

// Exposer globalement
window.updateUI = updateUI;
window.updateScoreDisplay = updateScoreDisplay;
window.updateStatsDisplay = updateStatsDisplay;
window.updateClickPower = updateClickPower;
window.updateComboDisplay = updateComboDisplay;
window.updateGauge = updateGauge;
window.updatePrestigeButton = updatePrestigeButton;
window.updatePrestigeDisplay = updatePrestigeDisplay;
window.updateMissionsUI = updateMissionsUI;
window.updateVillageVisual = updateVillageVisual;
window.updateBuyModeButtons = updateBuyModeButtons;
