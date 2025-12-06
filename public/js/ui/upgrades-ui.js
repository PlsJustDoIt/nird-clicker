/**
 * NIRD Clicker - Interface des upgrades
 * Affichage et interaction avec les upgrades de production et de clic
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// VARIABLES
// ============================================
// NOTE: buyMode est déjà défini dans gameLogic.js
// Ce module fournit des versions optimisées des fonctions d'upgrades

// ============================================
// MISE À JOUR DE LA LISTE DES UPGRADES
// ============================================

/**
 * Met à jour ou reconstruit la liste des upgrades de production
 */
function updateUpgradesList() {
    const container = document.getElementById('upgrades-list');
    if (!container || typeof UPGRADES === 'undefined') return;
    
    // Vérifier si on doit recréer la liste ou juste mettre à jour
    const existingItems = container.querySelectorAll('.upgrade-item[data-upgrade-id]');
    const unlockedUpgrades = UPGRADES.filter(u => u.unlocked);
    const shouldRebuild = existingItems.length === 0 || 
        existingItems.length !== unlockedUpgrades.length;
    
    if (shouldRebuild) {
        container.innerHTML = '';
        
        unlockedUpgrades.forEach(upgrade => {
            const upgradeEl = createUpgradeElement(upgrade);
            container.appendChild(upgradeEl);
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

/**
 * Met à jour la liste des upgrades de clic
 * Affiche : les achetées + les 3 prochaines non achetées
 */
function updateClickUpgradesList() {
    const container = document.getElementById('click-upgrades-list');
    if (!container || typeof CLICK_UPGRADES === 'undefined') return;
    
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

// ============================================
// CRÉATION D'ÉLÉMENTS
// ============================================

/**
 * Crée un élément DOM pour une upgrade de production
 */
function createUpgradeElement(upgrade) {
    let displayCount = buyMode;
    let cost;
    
    if (buyMode === 'max') {
        const maxInfo = typeof getMaxAffordable === 'function' 
            ? getMaxAffordable(upgrade) 
            : { count: 0, totalCost: 0 };
        displayCount = maxInfo.count || 0;
        cost = maxInfo.totalCost || (typeof getUpgradeCost === 'function' ? getUpgradeCost(upgrade) : upgrade.baseCost);
    } else {
        displayCount = buyMode;
        cost = typeof getMultiUpgradeCost === 'function' 
            ? getMultiUpgradeCost(upgrade, buyMode) 
            : upgrade.baseCost * buyMode;
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
            <p class="upgrade-tip">${upgrade.info || ''}</p>
        </div>
    `;
    
    upgradeEl.addEventListener('click', () => {
        if (typeof buyUpgrade === 'function') buyUpgrade(upgrade.id);
    });
    
    return upgradeEl;
}

/**
 * Met à jour un élément d'upgrade existant sans recréer le DOM
 */
function updateUpgradeElement(el, upgrade) {
    let displayCount = buyMode;
    let cost;
    
    if (buyMode === 'max') {
        const maxInfo = typeof getMaxAffordable === 'function' 
            ? getMaxAffordable(upgrade) 
            : { count: 0, totalCost: 0 };
        displayCount = maxInfo.count || 0;
        cost = maxInfo.totalCost || (typeof getUpgradeCost === 'function' ? getUpgradeCost(upgrade) : upgrade.baseCost);
    } else {
        displayCount = buyMode;
        cost = typeof getMultiUpgradeCost === 'function' 
            ? getMultiUpgradeCost(upgrade, buyMode) 
            : upgrade.baseCost * buyMode;
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

/**
 * Crée un élément DOM pour une upgrade de clic
 */
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
        upgradeEl.addEventListener('click', () => {
            if (typeof buyClickUpgrade === 'function') buyClickUpgrade(upgrade.id);
        });
    }
    
    return upgradeEl;
}

/**
 * Met à jour un élément d'upgrade de clic existant
 */
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

// ============================================
// MODE D'ACHAT
// ============================================

/**
 * Met à jour l'affichage des boutons de mode d'achat
 */
function updateBuyModeButtons() {
    document.querySelectorAll('.buy-mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode == buyMode) {
            btn.classList.add('active');
        }
    });
}

/**
 * Change le mode d'achat (1, 10, 100, max)
 */
function setBuyMode(mode) {
    buyMode = mode;
    updateBuyModeButtons();
    updateUpgradesList();
}

/**
 * Pour compatibilité avec l'ancien code
 */
function setBuyMultiplier(value) {
    setBuyMode(value);
}

// ============================================
// CALCULS UTILITAIRES
// ============================================

/**
 * Calcule la quantité effective selon le multiplicateur
 */
function getEffectiveQuantity(upgrade) {
    if (buyMode === 'max') {
        let count = 0;
        let tempScore = gameState.score;
        let tempOwned = upgrade.owned;
        const costMult = typeof COST_MULTIPLIER !== 'undefined' ? COST_MULTIPLIER : 1.15;
        
        while (true) {
            const cost = Math.floor(upgrade.baseCost * Math.pow(costMult, tempOwned));
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
    return buyMode;
}

/**
 * Calcule le coût total pour une quantité donnée
 */
function getTotalCostForQuantity(upgrade, quantity) {
    let total = 0;
    let tempOwned = upgrade.owned;
    const costMult = typeof COST_MULTIPLIER !== 'undefined' ? COST_MULTIPLIER : 1.15;
    
    for (let i = 0; i < quantity; i++) {
        total += Math.floor(upgrade.baseCost * Math.pow(costMult, tempOwned));
        tempOwned++;
    }
    return total;
}

// ============================================
// PRESTIGE UPGRADES UI
// ============================================

/**
 * Affiche la liste des upgrades de prestige
 */
function renderPrestigeUpgrades() {
    const container = document.getElementById('prestige-upgrades-list');
    if (!container || typeof PRESTIGE_UPGRADES === 'undefined') return;
    
    container.innerHTML = '';
    
    PRESTIGE_UPGRADES.forEach(upgrade => {
        const owned = gameState.prestigeUpgrades && gameState.prestigeUpgrades[upgrade.id];
        const canAfford = gameState.prestigePoints >= upgrade.cost;
        
        const el = document.createElement('div');
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
            el.addEventListener('click', () => {
                if (typeof buyPrestigeUpgrade === 'function') buyPrestigeUpgrade(upgrade.id);
            });
        }
        
        container.appendChild(el);
    });
}

// ============================================
// SKINS UI
// ============================================

/**
 * Affiche la liste des skins disponibles
 */
function renderSkins() {
    const container = document.getElementById('skins-list');
    if (!container || typeof SKINS === 'undefined') return;
    
    container.innerHTML = '';
    
    SKINS.forEach(skin => {
        const owned = gameState.skinsUnlocked && gameState.skinsUnlocked.includes(skin.id);
        const isActive = gameState.currentSkin === skin.id;
        const canAfford = owned || gameState.score >= (skin.cost || 0);
        
        // Si c'est un skin caché et pas encore débloqué, ne l'afficher que si on peut se le permettre
        if (skin.hidden && !owned && !canAfford) return;
        
        const el = document.createElement('div');
        el.className = `skin-item ${isActive ? 'active' : ''} ${!canAfford && !owned ? 'locked' : ''} ${skin.hidden ? 'secret-skin' : ''}`;
        
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
                if (typeof applySkin === 'function') applySkin(skin.id);
                renderSkins();
            } else if (canAfford) {
                if (typeof buySkin === 'function') buySkin(skin.id);
            }
        });
        
        container.appendChild(el);
    });
}

// ============================================
// ENCYCLOPÉDIE UI
// ============================================

/**
 * Affiche les entrées de l'encyclopédie dans le tab
 */
function renderEncyclopedia() {
    const container = document.getElementById('encyclopedia-list');
    if (!container || typeof ENCYCLOPEDIA === 'undefined') return;
    
    container.innerHTML = '';
    
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

/**
 * Alias pour updateUpgradesList
 */
function renderUpgrades() {
    updateUpgradesList();
}

/**
 * Met à jour l'affichage du prestige
 */
function updatePrestigeDisplay() {
    const pointsDisplay = document.getElementById('prestige-points-display');
    const multiplierDisplay = document.getElementById('prestige-multiplier');
    
    if (pointsDisplay) {
        pointsDisplay.textContent = gameState.prestigePoints || 0;
    }
    if (multiplierDisplay) {
        multiplierDisplay.textContent = (1 + (gameState.prestigeLevel || 0) * 0.1).toFixed(1);
    }
    
    if (typeof updatePrestigeButton === 'function') updatePrestigeButton();
}

// Exposer globalement
window.updateUpgradesList = updateUpgradesList;
window.updateClickUpgradesList = updateClickUpgradesList;
window.createUpgradeElement = createUpgradeElement;
window.updateUpgradeElement = updateUpgradeElement;
window.createClickUpgradeElement = createClickUpgradeElement;
window.updateClickUpgradeElement = updateClickUpgradeElement;
window.updateBuyModeButtons = updateBuyModeButtons;
window.setBuyMode = setBuyMode;
window.setBuyMultiplier = setBuyMultiplier;
window.getEffectiveQuantity = getEffectiveQuantity;
window.getTotalCostForQuantity = getTotalCostForQuantity;
window.renderPrestigeUpgrades = renderPrestigeUpgrades;
window.renderSkins = renderSkins;
window.renderEncyclopedia = renderEncyclopedia;
window.renderUpgrades = renderUpgrades;
window.updatePrestigeDisplay = updatePrestigeDisplay;
