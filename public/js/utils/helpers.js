/**
 * NIRD Clicker - Fonctions utilitaires
 * Helpers purs sans effets de bord
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// FORMATAGE
// ============================================

/**
 * Formate un nombre pour l'affichage (K, M, B)
 * @param {number} num - Le nombre à formater
 * @returns {string} Le nombre formaté
 */
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

/**
 * Formate une durée en secondes pour l'affichage
 * @param {number} seconds - Durée en secondes
 * @returns {string} Durée formatée (ex: "2h 30m")
 */
function formatDuration(seconds) {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
}

/**
 * Formate une date pour l'affichage
 * @param {Date|number} date - Date ou timestamp
 * @returns {string} Date formatée
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// TABLEAUX
// ============================================

/**
 * Mélange un tableau en place (Fisher-Yates)
 * @param {Array} array - Le tableau à mélanger
 * @returns {Array} Le même tableau mélangé
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Sélectionne un élément aléatoire d'un tableau
 * @param {Array} array - Le tableau source
 * @returns {*} Un élément aléatoire
 */
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sélectionne N éléments aléatoires uniques d'un tableau
 * @param {Array} array - Le tableau source
 * @param {number} n - Nombre d'éléments à sélectionner
 * @returns {Array} Les éléments sélectionnés
 */
function randomElements(array, n) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// ============================================
// MATHÉMATIQUES
// ============================================

/**
 * Limite une valeur entre min et max
 * @param {number} value - La valeur à limiter
 * @param {number} min - Valeur minimum
 * @param {number} max - Valeur maximum
 * @returns {number} La valeur limitée
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Interpolation linéaire entre deux valeurs
 * @param {number} a - Valeur de départ
 * @param {number} b - Valeur d'arrivée
 * @param {number} t - Facteur d'interpolation (0-1)
 * @returns {number} La valeur interpolée
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Génère un nombre aléatoire entre min et max
 * @param {number} min - Valeur minimum
 * @param {number} max - Valeur maximum
 * @returns {number} Nombre aléatoire
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Génère un entier aléatoire entre min et max (inclus)
 * @param {number} min - Valeur minimum
 * @param {number} max - Valeur maximum
 * @returns {number} Entier aléatoire
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// CALCULS DE JEU
// ============================================

/**
 * Calcule le coût d'une upgrade à un niveau donné
 * @param {number} baseCost - Coût de base
 * @param {number} owned - Nombre déjà possédé
 * @param {number} multiplier - Multiplicateur de coût (ex: 1.12)
 * @returns {number} Le coût calculé
 */
function calculateUpgradeCost(baseCost, owned, multiplier) {
    return Math.floor(baseCost * Math.pow(multiplier, owned));
}

/**
 * Calcule le coût total pour acheter N upgrades
 * @param {number} baseCost - Coût de base
 * @param {number} owned - Nombre déjà possédé
 * @param {number} count - Nombre à acheter
 * @param {number} multiplier - Multiplicateur de coût
 * @returns {number} Le coût total
 */
function calculateMultiUpgradeCost(baseCost, owned, count, multiplier) {
    let totalCost = 0;
    for (let i = 0; i < count; i++) {
        totalCost += calculateUpgradeCost(baseCost, owned + i, multiplier);
    }
    return totalCost;
}

/**
 * Calcule combien d'upgrades on peut acheter avec un budget
 * @param {number} baseCost - Coût de base
 * @param {number} owned - Nombre déjà possédé
 * @param {number} budget - Budget disponible
 * @param {number} multiplier - Multiplicateur de coût
 * @returns {{count: number, totalCost: number}} Nombre achetable et coût total
 */
function calculateMaxAffordable(baseCost, owned, budget, multiplier) {
    let count = 0;
    let totalCost = 0;
    let tempOwned = owned;
    
    while (count < 1000) { // Sécurité
        const nextCost = calculateUpgradeCost(baseCost, tempOwned, multiplier);
        if (totalCost + nextCost > budget) break;
        totalCost += nextCost;
        tempOwned++;
        count++;
    }
    
    return { count, totalCost };
}

/**
 * Calcule le bonus de prestige
 * @param {number} prestigeLevel - Niveau de prestige
 * @param {number} bonusPerLevel - Bonus par niveau (ex: 0.05 = 5%)
 * @returns {number} Le multiplicateur de bonus (ex: 1.15)
 */
function calculatePrestigeBonus(prestigeLevel, bonusPerLevel) {
    return 1 + (prestigeLevel * bonusPerLevel);
}

// ============================================
// DOM UTILITIES
// ============================================

/**
 * Raccourci pour document.getElementById
 * @param {string} id - L'ID de l'élément
 * @returns {HTMLElement|null} L'élément ou null
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * Raccourci pour document.querySelector
 * @param {string} selector - Le sélecteur CSS
 * @returns {HTMLElement|null} L'élément ou null
 */
function $$(selector) {
    return document.querySelector(selector);
}

/**
 * Raccourci pour document.querySelectorAll
 * @param {string} selector - Le sélecteur CSS
 * @returns {NodeList} Les éléments trouvés
 */
function $$$(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Crée un élément HTML avec des attributs et du contenu
 * @param {string} tag - Le tag HTML
 * @param {Object} attrs - Les attributs
 * @param {string|HTMLElement|Array} content - Le contenu
 * @returns {HTMLElement} L'élément créé
 */
function createElement(tag, attrs = {}, content = null) {
    const el = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });
    
    if (content !== null) {
        if (typeof content === 'string') {
            el.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            el.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    el.appendChild(child);
                }
            });
        }
    }
    
    return el;
}

// ============================================
// DEBOUNCE / THROTTLE
// ============================================

/**
 * Debounce une fonction (attend que l'utilisateur arrête d'appeler)
 * @param {Function} func - La fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function} La fonction debouncée
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle une fonction (limite le nombre d'appels par période)
 * @param {Function} func - La fonction à throttler
 * @param {number} limit - Intervalle minimum entre appels en ms
 * @returns {Function} La fonction throttlée
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Exposer globalement pour compatibilité
window.formatNumber = formatNumber;
window.formatDuration = formatDuration;
window.shuffleArray = shuffleArray;
window.randomElement = randomElement;
window.clamp = clamp;
window.debounce = debounce;
window.throttle = throttle;
window.$ = $;
window.$$ = $$;
window.$$$ = $$$;
window.createElement = createElement;
window.calculateUpgradeCost = calculateUpgradeCost;
window.calculateMultiUpgradeCost = calculateMultiUpgradeCost;
window.calculateMaxAffordable = calculateMaxAffordable;
window.calculatePrestigeBonus = calculatePrestigeBonus;
