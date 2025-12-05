/**
 * NIRD Clicker - Interface Utilisateur (Version Complète)
 * Gestion de l'affichage, interactions, particules et menus
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Variable pour le multiplicateur d'achat
let buyMultiplier = 1;

// Mise à jour complète de l'interface
function updateUI() {
    updateScoreDisplay();
    updateStatsDisplay();
    updateUpgradesList();
    updateGauge();
    updateClickPower();
    updatePrestigeButton();
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
    if (prestigeInfo && gameState.prestigeLevel > 0) {
        prestigeInfo.textContent = `Prestige: ${gameState.prestigeLevel} (+${gameState.prestigeLevel * 10}%)`;
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
            <div class="upgrade-footer">
                <span class="upgrade-cost">${isPurchased ? 'Acheté' : formatNumber(upgrade.cost) + ' pts'}</span>
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
    
    const costEl = el.querySelector('.upgrade-cost');
    if (costEl) costEl.textContent = isPurchased ? 'Acheté' : formatNumber(upgrade.cost) + ' pts';
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
// BOSS GAFAM AMÉLIORÉ
// ============================================
let currentBoss = null;
let bossClicksRemaining = 0;

function showBoss() {
    // Sélectionner un boss aléatoire
    currentBoss = BOSS_TYPES[Math.floor(Math.random() * BOSS_TYPES.length)];
    bossClicksRemaining = currentBoss.clicksRequired;
    
    const modal = document.getElementById('boss-modal');
    const content = modal.querySelector('.boss-content') || modal.querySelector('.modal-content');
    
    if (content) {
        content.innerHTML = `
            <div class="boss-header" style="background-color: ${currentBoss.color}">
                <span class="boss-icon">${currentBoss.icon}</span>
                <h2>${currentBoss.name}</h2>
            </div>
            <p class="boss-message">${currentBoss.message}</p>
            <div class="boss-progress">
                <div id="boss-progress-bar" class="progress-bar-fill" style="width: 0%; background-color: ${currentBoss.color}"></div>
            </div>
            <p class="boss-clicks">Clics restants: <span id="boss-clicks-left">${bossClicksRemaining}</span></p>
            <button id="boss-click-btn" class="boss-btn" style="background-color: ${currentBoss.color}">
                ❌ FERMER ${currentBoss.icon}
            </button>
        `;
        
        document.getElementById('boss-click-btn').addEventListener('click', handleBossClick);
    }
    
    modal.classList.remove('hidden');
    playSound('boss');
}

function handleBossClick() {
    bossClicksRemaining--;
    
    const progressBar = document.getElementById('boss-progress-bar');
    const clicksLeft = document.getElementById('boss-clicks-left');
    
    const progress = ((currentBoss.clicksRequired - bossClicksRemaining) / currentBoss.clicksRequired) * 100;
    progressBar.style.width = progress + '%';
    clicksLeft.textContent = bossClicksRemaining;
    
    playSound('click');
    
    if (bossClicksRemaining <= 0) {
        closeBoss();
    }
}

function closeBoss() {
    const modal = document.getElementById('boss-modal');
    modal.classList.add('hidden');
    
    gameState.bossDefeated++;
    gameState.sessionBoss++;
    
    const bonus = Math.floor(gameState.productionPerSecond * 10 + currentBoss.reward);
    gameState.score += bonus;
    gameState.totalScore += bonus;
    
    playSound('achievement');
    showNotification(`🎉 ${currentBoss.name} fermé ! +${formatNumber(bonus)} points bonus !`, 'success');
    
    checkAchievements();
    checkDailyMissions();
    updateUI();
    
    currentBoss = null;
}

// ============================================
// MENUS SUPPLÉMENTAIRES
// ============================================

// Menu Options/Settings
function openSettingsMenu() {
    const existingModal = document.querySelector('.settings-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'settings-modal modal-overlay';
    modal.innerHTML = `
        <div class="modal-content settings-content">
            <h2>⚙️ Options</h2>
            
            <div class="setting-item">
                <span>🔊 Sons</span>
                <button id="sound-toggle-btn" class="${gameState.soundEnabled ? 'active' : ''}">
                    ${gameState.soundEnabled ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="setting-item">
                <span>✨ Particules</span>
                <button id="particles-toggle-btn" class="${gameState.particlesEnabled ? 'active' : ''}">
                    ${gameState.particlesEnabled ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="setting-item">
                <span>🎨 Thème</span>
                <select id="theme-select">
                    ${THEMES.map(t => `<option value="${t.id}" ${gameState.currentTheme === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                </select>
            </div>
            
            <hr>
            
            <div class="setting-item">
                <span>💾 Sauvegarde</span>
                <button id="export-btn">Exporter</button>
                <button id="import-btn">Importer</button>
            </div>
            
            <div class="setting-item danger">
                <span>🗑️ Reset</span>
                <button id="reset-btn" class="danger-btn">Recommencer</button>
            </div>
            
            <button id="close-settings-btn" class="close-btn">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#sound-toggle-btn').addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        const btn = modal.querySelector('#sound-toggle-btn');
        btn.textContent = gameState.soundEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', gameState.soundEnabled);
        saveGame();
    });
    
    modal.querySelector('#particles-toggle-btn').addEventListener('click', () => {
        gameState.particlesEnabled = !gameState.particlesEnabled;
        const btn = modal.querySelector('#particles-toggle-btn');
        btn.textContent = gameState.particlesEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', gameState.particlesEnabled);
        saveGame();
    });
    
    modal.querySelector('#theme-select').addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
    
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
        el.className = `prestige-upgrade-item ${owned ? 'purchased' : ''} ${canAfford ? 'can-afford' : 'cannot-afford'}`;
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
    
    // Empêcher la fermeture du boss
    document.getElementById('boss-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('boss-modal')) {
            // Ne rien faire
        }
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
