/**
 * @file NIRD Clicker - Interface des upgrades
 * @description Affichage et interaction avec les upgrades de production et de clic
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// VARIABLES
// ============================================
// NOTE: buyMode est déjà défini dans gameLogic.js
// Ce module fournit des versions optimisées des fonctions d'upgrades

// ============================================
// OUTILS COMMUNS
// ============================================

/**
 * Calcule le coût affiché et la quantité selon le mode d'achat courant
 * @param {Upgrade} upgrade - Bâtiment
 * @returns {{cost: number, count: number}} Coût total et quantité achetée
 */
function getDisplayedPurchase(upgrade) {
    if (buyMode === 'max') {
        const maxInfo = typeof getMaxAffordable === 'function'
            ? getMaxAffordable(upgrade)
            : { count: 0, totalCost: 0 };
        return {
            count: maxInfo.count || 0,
            cost: maxInfo.totalCost || (typeof getUpgradeCost === 'function' ? getUpgradeCost(upgrade) : upgrade.baseCost)
        };
    }
    return {
        count: buyMode,
        cost: typeof getMultiUpgradeCost === 'function'
            ? getMultiUpgradeCost(upgrade, buyMode)
            : upgrade.baseCost * buyMode
    };
}

/**
 * Markup du prix (jeton + montant)
 * @param {number} cost - Montant
 * @param {string} [suffix=''] - Texte additionnel (ex. quantité)
 * @returns {string} HTML
 */
function priceMarkup(cost, suffix = '') {
    return `<span class="price">${icon('token', 'price-token')}<span class="price-value">${formatNumber(cost)}</span>${suffix ? `<span class="price-qty">${suffix}</span>` : ''}</span>`;
}

// ============================================
// MISE À JOUR DE LA LISTE DES UPGRADES
// ============================================

/**
 * Met à jour ou reconstruit la liste des bâtiments (production)
 */
function updateUpgradesList() {
    const container = document.getElementById('upgrades-list');
    if (!container || typeof UPGRADES === 'undefined') return;

    const unlockedUpgrades = UPGRADES.filter(u => u.unlocked);
    const nextLocked = UPGRADES.find(u => !u.unlocked);
    const rebuildKey = unlockedUpgrades.map(u => u.id).join('|') + '#' + (nextLocked ? nextLocked.id : '') + '#' + buyMode;

    if (container.dataset.key !== rebuildKey) {
        container.dataset.key = rebuildKey;
        container.innerHTML = '';
        unlockedUpgrades.forEach(upgrade => container.appendChild(createUpgradeElement(upgrade)));
        if (nextLocked) container.appendChild(createMysteryElement(nextLocked));
    } else {
        unlockedUpgrades.forEach(upgrade => {
            const el = container.querySelector(`.upgrade-item[data-upgrade-id="${upgrade.id}"]`);
            if (el) updateUpgradeElement(el, upgrade);
        });
    }

    updateClickUpgradesList();
    if (typeof updateShowcase === 'function') updateShowcase();
}

/**
 * Met à jour la liste des améliorations de clic
 * Affiche les prochaines améliorations disponibles + un bandeau des améliorations acquises
 */
function updateClickUpgradesList() {
    const container = document.getElementById('click-upgrades-list');
    if (!container || typeof CLICK_UPGRADES === 'undefined') return;

    const purchased = CLICK_UPGRADES.filter(u => u.purchased);
    const available = CLICK_UPGRADES.filter(u => !u.purchased).slice(0, 4);
    const rebuildKey = purchased.map(u => u.id).join('|') + '#' + available.map(u => u.id).join('|');

    if (container.dataset.key !== rebuildKey) {
        container.dataset.key = rebuildKey;
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'click-grid';
        available.forEach(upgrade => grid.appendChild(createClickUpgradeElement(upgrade)));
        if (available.length === 0) {
            grid.innerHTML = '<p class="empty-note">Toutes les améliorations de clic sont acquises.</p>';
        }
        container.appendChild(grid);

        const owned = document.createElement('div');
        owned.className = 'owned-strip';
        owned.innerHTML = `
            <h4 class="section-label">Acquises <span>${purchased.length} / ${CLICK_UPGRADES.length}</span></h4>
            <div class="owned-icons">
                ${purchased.length
                    ? purchased.map(u => `<span class="owned-icon" data-tip="click:${u.id}">${icon(u.icon)}</span>`).join('')
                    : '<span class="empty-note">Aucune pour l\'instant.</span>'}
            </div>`;
        container.appendChild(owned);
    } else {
        available.forEach(upgrade => {
            const el = container.querySelector(`.upgrade-item[data-click-upgrade-id="${upgrade.id}"]`);
            if (el) updateClickUpgradeElement(el, upgrade);
        });
    }
}

// ============================================
// CRÉATION D'ÉLÉMENTS
// ============================================

/**
 * Crée une ligne de boutique pour un bâtiment
 * @param {Upgrade} upgrade - Le bâtiment à afficher
 * @returns {HTMLElement} Élément DOM
 */
function createUpgradeElement(upgrade) {
    const { cost, count } = getDisplayedPurchase(upgrade);
    const canAfford = gameState.score >= cost && count > 0;

    const upgradeEl = document.createElement('button');
    upgradeEl.type = 'button';
    upgradeEl.className = `upgrade-item store-row ${canAfford ? 'can-afford' : 'cannot-afford'}`;
    upgradeEl.setAttribute('data-upgrade-id', upgrade.id);
    upgradeEl.setAttribute('data-tip', `upgrade:${upgrade.id}`);
    upgradeEl.innerHTML = `
        <span class="upgrade-icon">${icon(upgrade.icon)}</span>
        <span class="upgrade-info">
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-meta">
                <span class="upgrade-cost">${priceMarkup(cost, buyMode !== 1 ? `×${count}` : '')}</span>
                <span class="upgrade-production">+${formatRate(upgrade.baseProduction)}/s</span>
            </span>
            <span class="upgrade-desc">${upgrade.description}</span>
        </span>
        <span class="upgrade-owned">${upgrade.owned || ''}</span>
    `;

    upgradeEl.addEventListener('click', () => {
        if (typeof buyUpgrade === 'function') buyUpgrade(upgrade.id);
        if (typeof refreshTooltip === 'function') refreshTooltip();
    });

    return upgradeEl;
}

/**
 * Crée la ligne « mystère » du prochain bâtiment verrouillé
 * @param {Upgrade} upgrade - Prochain bâtiment
 * @returns {HTMLElement} Élément DOM
 */
function createMysteryElement(upgrade) {
    const el = document.createElement('div');
    el.className = 'store-row mystery';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <span class="upgrade-icon">${icon(upgrade.icon)}</span>
        <span class="upgrade-info">
            <span class="upgrade-name">???</span>
            <span class="upgrade-meta"><span class="upgrade-cost">Révélé à ${formatNumber(upgrade.unlockAt || 0)} pts cumulés</span></span>
        </span>
        <span class="upgrade-owned"></span>
    `;
    return el;
}

/**
 * Met à jour une ligne de boutique existante sans recréer le DOM
 * @param {HTMLElement} el - Élément DOM
 * @param {Upgrade} upgrade - Données du bâtiment
 */
function updateUpgradeElement(el, upgrade) {
    const { cost, count } = getDisplayedPurchase(upgrade);
    const canAfford = gameState.score >= cost && count > 0;

    el.classList.toggle('can-afford', canAfford);
    el.classList.toggle('cannot-afford', !canAfford);

    const ownedEl = el.querySelector('.upgrade-owned');
    const ownedText = upgrade.owned ? String(upgrade.owned) : '';
    if (ownedEl && ownedEl.textContent !== ownedText) {
        ownedEl.textContent = ownedText;
        ownedEl.classList.remove('bump');
        void ownedEl.offsetWidth;
        ownedEl.classList.add('bump');
    }

    const costEl = el.querySelector('.upgrade-cost');
    if (costEl) {
        const html = priceMarkup(cost, buyMode !== 1 ? `×${count}` : '');
        if (costEl.innerHTML !== html) costEl.innerHTML = html;
    }
}

/**
 * Crée une carte d'amélioration de clic
 * @param {ClickUpgrade} upgrade - L'amélioration à afficher
 * @returns {HTMLElement} Élément DOM
 */
function createClickUpgradeElement(upgrade) {
    const isPurchased = upgrade.purchased;
    const canAfford = !isPurchased && gameState.score >= upgrade.cost;

    const upgradeEl = document.createElement('button');
    upgradeEl.type = 'button';
    upgradeEl.className = `upgrade-item store-row click-upgrade click-card ${isPurchased ? 'purchased' : (canAfford ? 'can-afford' : 'cannot-afford')}`;
    upgradeEl.setAttribute('data-click-upgrade-id', upgrade.id);
    upgradeEl.setAttribute('data-tip', `click:${upgrade.id}`);
    upgradeEl.innerHTML = `
        <span class="upgrade-icon">${icon(upgrade.icon)}</span>
        <span class="upgrade-info">
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-bonus">+${formatNumber(upgrade.bonus)} par clic</span>
            <span class="upgrade-cost">${priceMarkup(upgrade.cost)}</span>
        </span>
    `;

    if (!isPurchased) {
        upgradeEl.addEventListener('click', () => {
            if (typeof buyClickUpgrade === 'function') buyClickUpgrade(upgrade.id);
            if (typeof hideTooltip === 'function') hideTooltip();
        });
    }

    return upgradeEl;
}

/**
 * Met à jour une carte d'amélioration de clic existante
 * @param {HTMLElement} el - Élément DOM
 * @param {ClickUpgrade} upgrade - Données
 */
function updateClickUpgradeElement(el, upgrade) {
    const isPurchased = upgrade.purchased;
    const canAfford = !isPurchased && gameState.score >= upgrade.cost;

    el.classList.toggle('purchased', isPurchased);
    el.classList.toggle('can-afford', canAfford);
    el.classList.toggle('cannot-afford', !isPurchased && !canAfford);
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
 * @param mode
 */
function setBuyMode(mode) {
    buyMode = mode;
    updateBuyModeButtons();
    updateUpgradesList();
}

/**
 * Pour compatibilité avec l'ancien code
 * @param value
 */
function setBuyMultiplier(value) {
    setBuyMode(value);
}

// ============================================
// CALCULS UTILITAIRES
// ============================================

/**
 * Calcule la quantité effective selon le multiplicateur
 * @param upgrade
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
 * @param upgrade
 * @param quantity
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
 * Affiche la liste des améliorations de prestige
 */
function renderPrestigeUpgrades() {
    const container = document.getElementById('prestige-upgrades-list');
    if (!container || typeof PRESTIGE_UPGRADES === 'undefined') return;

    container.innerHTML = '';

    PRESTIGE_UPGRADES.forEach(upgrade => {
        const owned = gameState.prestigeUpgrades && gameState.prestigeUpgrades[upgrade.id];
        const canAfford = gameState.prestigePoints >= upgrade.cost;

        const el = document.createElement('div');
        el.className = `prestige-upgrade-item store-row ${owned ? 'purchased' : (canAfford ? 'can-afford' : 'cannot-afford')}`;
        el.innerHTML = `
            <span class="upgrade-icon">${icon(upgrade.icon || 'star')}</span>
            <span class="upgrade-info">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-desc is-visible">${upgrade.description}</span>
            </span>
            <span class="upgrade-cost prestige-cost">${owned ? icon('check') : `${icon('star', 'price-token')}${upgrade.cost}`}</span>
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
 * Affiche la liste des apparences du poste
 */
function renderSkins() {
    const container = document.getElementById('skins-list');
    if (!container || typeof SKINS === 'undefined') return;

    container.innerHTML = '';

    SKINS.forEach(skin => {
        const owned = gameState.skinsUnlocked && gameState.skinsUnlocked.includes(skin.id);
        const isActive = gameState.currentSkin === skin.id;
        const canAfford = owned || gameState.score >= (skin.cost || 0);

        // Skin caché : visible uniquement s'il est abordable ou possédé
        if (skin.hidden && !owned && !canAfford) return;

        const el = document.createElement('button');
        el.type = 'button';
        el.className = `skin-item ${isActive ? 'active' : ''} ${owned ? 'owned' : ''} ${!canAfford && !owned ? 'locked' : ''} ${skin.hidden ? 'secret-skin' : ''}`;
        el.style.setProperty('--skin-tint', skin.tint || 'var(--accent)');

        const displayName = owned && skin.unlockedName ? skin.unlockedName : skin.name;
        const iconContent = owned && skin.image
            ? `<img src="${skin.image}" alt="" class="skin-image">`
            : icon(skin.icon);

        let footer;
        if (isActive) footer = '<span class="skin-state">Équipé</span>';
        else if (owned) footer = '<span class="skin-state">Possédé</span>';
        else footer = `<span class="skin-cost">${priceMarkup(skin.cost)}</span>`;

        el.innerHTML = `
            <span class="skin-icon">${iconContent}</span>
            <span class="skin-name">${displayName}</span>
            ${footer}
            ${isActive ? `<span class="skin-badge">${icon('check')}</span>` : ''}
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
                <span class="entry-icon">${icon(entry.icon)}</span>
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
window.priceMarkup = priceMarkup;
window.getDisplayedPurchase = getDisplayedPurchase;
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
