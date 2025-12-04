/**
 * NIRD Clicker - Interface Utilisateur
 * Gestion de l'affichage et des interactions
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Mise à jour complète de l'interface
function updateUI() {
    updateScoreDisplay();
    updateStatsDisplay();
    updateUpgradesList();
    updateGauge();
    updateClickPower();
}

// Mise à jour du score
function updateScoreDisplay() {
    document.getElementById('score').textContent = formatNumber(gameState.score);
    document.getElementById('per-second').textContent = formatNumber(gameState.productionPerSecond);
}

// Mise à jour des statistiques
function updateStatsDisplay() {
    document.getElementById('total-clicks').textContent = formatNumber(gameState.totalClicks);
    document.getElementById('pc-liberated').textContent = formatNumber(Math.floor(gameState.totalScore / 100));
    document.getElementById('village-level').textContent = gameState.currentVillageLevel + 1;
}

// Mise à jour de la puissance de clic
function updateClickPower() {
    document.getElementById('click-power').textContent = gameState.clickPower;
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

// Génération de la liste des upgrades
function updateUpgradesList() {
    const container = document.getElementById('upgrades-list');
    container.innerHTML = '';
    
    // Upgrades de production
    UPGRADES.forEach(upgrade => {
        if (upgrade.unlocked) {
            const cost = getUpgradeCost(upgrade);
            const canAfford = gameState.score >= cost;
            
            const upgradeEl = document.createElement('div');
            upgradeEl.className = `upgrade-item ${canAfford ? 'can-afford' : 'cannot-afford'}`;
            upgradeEl.innerHTML = `
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-header">
                        <span class="upgrade-name">${upgrade.name}</span>
                        <span class="upgrade-owned">x${upgrade.owned}</span>
                    </div>
                    <p class="upgrade-desc">${upgrade.description}</p>
                    <div class="upgrade-footer">
                        <span class="upgrade-cost">${formatNumber(cost)} pts</span>
                        <span class="upgrade-production">+${upgrade.baseProduction}/sec</span>
                    </div>
                    <p class="upgrade-tip">${upgrade.info}</p>
                </div>
            `;
            
            upgradeEl.addEventListener('click', () => buyUpgrade(upgrade.id));
            container.appendChild(upgradeEl);
        }
    });
    
    // Séparateur
    const separator = document.createElement('div');
    separator.className = 'upgrade-separator';
    separator.innerHTML = '<h3>⚡ Améliorations de clic</h3>';
    container.appendChild(separator);
    
    // Upgrades de clic
    CLICK_UPGRADES.forEach(upgrade => {
        if (!upgrade.purchased) {
            const canAfford = gameState.score >= upgrade.cost;
            
            const upgradeEl = document.createElement('div');
            upgradeEl.className = `upgrade-item click-upgrade ${canAfford ? 'can-afford' : 'cannot-afford'}`;
            upgradeEl.innerHTML = `
                <div class="upgrade-icon">⚡</div>
                <div class="upgrade-info">
                    <div class="upgrade-header">
                        <span class="upgrade-name">${upgrade.name}</span>
                    </div>
                    <p class="upgrade-desc">${upgrade.description}</p>
                    <div class="upgrade-footer">
                        <span class="upgrade-cost">${formatNumber(upgrade.cost)} pts</span>
                    </div>
                </div>
            `;
            
            upgradeEl.addEventListener('click', () => buyClickUpgrade(upgrade.id));
            container.appendChild(upgradeEl);
        }
    });
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
    
    // Position aléatoire
    floater.style.left = (30 + Math.random() * 40) + '%';
    floater.style.top = (20 + Math.random() * 30) + '%';
    
    clickArea.appendChild(floater);
    
    // Message aléatoire parfois
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

// Notifications
function showNotification(message, type = 'info') {
    const container = document.getElementById('floating-notifications');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Bannière d'événement
function showEventBanner(title, description) {
    const banner = document.getElementById('event-banner');
    const text = document.getElementById('event-text');
    
    text.innerHTML = `<strong>${title}</strong> - ${description}`;
    banner.classList.remove('hidden');
    
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 5000);
}

// Boss Windows
let bossClicksRemaining = 0;

function showBoss() {
    bossClicksRemaining = BOSS_CLICKS_REQUIRED;
    
    const modal = document.getElementById('boss-modal');
    const progressBar = document.getElementById('boss-progress-bar');
    const clicksLeft = document.getElementById('boss-clicks-left');
    
    modal.classList.remove('hidden');
    progressBar.style.width = '0%';
    clicksLeft.textContent = bossClicksRemaining;
    
    // Son d'alerte (si disponible)
    playSound('alert');
}

function handleBossClick() {
    bossClicksRemaining--;
    
    const progressBar = document.getElementById('boss-progress-bar');
    const clicksLeft = document.getElementById('boss-clicks-left');
    
    const progress = ((BOSS_CLICKS_REQUIRED - bossClicksRemaining) / BOSS_CLICKS_REQUIRED) * 100;
    progressBar.style.width = progress + '%';
    clicksLeft.textContent = bossClicksRemaining;
    
    if (bossClicksRemaining <= 0) {
        closeBoss();
    }
}

function closeBoss() {
    const modal = document.getElementById('boss-modal');
    modal.classList.add('hidden');
    
    gameState.bossDefeated++;
    
    // Bonus pour avoir fermé Windows !
    const bonus = Math.floor(gameState.productionPerSecond * 10 + 50);
    gameState.score += bonus;
    gameState.totalScore += bonus;
    
    showNotification(`🎉 Windows fermé ! +${formatNumber(bonus)} points bonus !`, 'success');
    checkAchievements();
    updateUI();
}

// Placeholder pour les sons
function playSound(soundName) {
    // À implémenter si vous ajoutez des sons
    console.log('Sound:', soundName);
}

// Initialisation des event listeners
function initEventListeners() {
    // Clic principal
    document.getElementById('main-clicker').addEventListener('click', handleClick);
    
    // Clic boss
    document.getElementById('boss-click-btn').addEventListener('click', handleBossClick);
    
    // Empêcher la fermeture du boss en cliquant en dehors
    document.getElementById('boss-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('boss-modal')) {
            // Ne rien faire - forcer le joueur à cliquer sur le bouton
        }
    });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            // Si le boss est visible, cliquer sur le boss
            if (!document.getElementById('boss-modal').classList.contains('hidden')) {
                handleBossClick();
            } else {
                handleClick();
            }
            e.preventDefault();
        }
    });
}
