/**
 * @file NIRD Clicker - Animations UI
 * @description Particules, nombres flottants, feedback visuel
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// FEEDBACK DE CLIC
// ============================================

/**
 * Animation de feedback au clic sur le bouton principal
 * @param {number} _points - Points gagnés (non utilisé actuellement)
 */
function showClickFeedback(_points) {
    const clicker = document.getElementById('main-clicker');
    if (clicker) {
        clicker.classList.add('clicked');
        setTimeout(() => clicker.classList.remove('clicked'), 100);
    }
}

/**
 * Calcule la position d'un clic relative à la zone de clic
 * @param {MouseEvent|undefined} event - Événement souris (absent au clavier/manette)
 * @returns {{x: number, y: number, zone: HTMLElement}|null} Position relative
 */
function getClickPoint(event) {
    const zone = document.getElementById('click-zone');
    if (!zone) return null;
    const zr = zone.getBoundingClientRect();
    if (event && typeof event.clientX === 'number' && (event.clientX || event.clientY)) {
        return { x: event.clientX - zr.left, y: event.clientY - zr.top, zone };
    }
    const clicker = document.getElementById('main-clicker');
    const cr = clicker ? clicker.getBoundingClientRect() : zr;
    return {
        x: cr.left - zr.left + cr.width / 2 + (Math.random() - 0.5) * cr.width * 0.4,
        y: cr.top - zr.top + cr.height * 0.35 + (Math.random() - 0.5) * 30,
        zone
    };
}

/**
 * Crée un nombre flottant à l'endroit du clic
 * @param {number} points - Points gagnés
 * @param {MouseEvent} [event] - Événement de clic
 */
function createFloatingNumber(points, event) {
    const pt = getClickPoint(event);
    if (!pt) return;

    const floater = document.createElement('div');
    floater.className = 'floating-number';
    floater.textContent = '+' + formatNumber(points);
    floater.style.left = pt.x + 'px';
    floater.style.top = pt.y + 'px';
    floater.style.setProperty('--drift', ((Math.random() - 0.5) * 30).toFixed(0) + 'px');
    pt.zone.appendChild(floater);
    setTimeout(() => floater.remove(), 1100);

    // Message bonus aléatoire (8 % de chance)
    if (Math.random() < 0.08 && typeof CLICK_MESSAGES !== 'undefined') {
        const msg = document.createElement('div');
        msg.className = 'floating-message';
        msg.textContent = CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)];
        msg.style.left = pt.x + 'px';
        msg.style.top = (pt.y - 26) + 'px';
        pt.zone.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }
}

// ============================================
// PARTICULES
// ============================================

/**
 * Émet des jetons depuis le point de clic (dessinés dans le canvas de scène)
 * @param {MouseEvent} [event] - Événement de clic
 */
function createParticles(event) {
    if (!gameState.particlesEnabled) return;
    const pt = getClickPoint(event);
    if (!pt || typeof emitSparks !== 'function') return;
    emitSparks(pt.x, pt.y, 5);
}

// ============================================
// CONFETTIS (pour les célébrations)
// ============================================

/**
 * Crée une pluie de confettis
 * @param {number} count - Nombre de confettis
 */
function createConfetti(count = 100) {
    const colors = ['#8fd694', '#f0b450', '#e9e4d4', '#6fb7c9', '#e7795f'];
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
            confetti.style.width = (5 + Math.random() * 10) + 'px';
            confetti.style.height = confetti.style.width;
            document.body.appendChild(confetti);
            
            // Nettoyage
            setTimeout(() => confetti.remove(), 5000);
        }, i * 20);
    }
}

// ============================================
// ÉCRAN DE CHARGEMENT
// ============================================

/**
 * Affiche l'écran de chargement
 */
function showLoadingScreen() {
    let loadingEl = document.getElementById('loading-screen');
    
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'loading-screen';
        loadingEl.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">${icon('monitor')}</div>
                <p>Chargement du village numérique…</p>
            </div>
        `;
        document.body.appendChild(loadingEl);
    }
    
    loadingEl.classList.remove('hidden');
}

/**
 * Cache l'écran de chargement
 */
function hideLoadingScreen() {
    const loadingEl = document.getElementById('loading-screen');
    if (loadingEl) {
        loadingEl.classList.add('fade-out');
        setTimeout(() => loadingEl.remove(), 500);
    }
}

// ============================================
// ANIMATIONS DE SHAKE
// ============================================

/**
 * Fait trembler un élément
 * @param {HTMLElement|string} element - Élément ou sélecteur
 * @param {number} intensity - Intensité du shake (1-10)
 * @param {number} duration - Durée en ms
 */
function shakeElement(element, intensity = 5, duration = 500) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    
    el.style.animation = `shake ${duration}ms ease-in-out`;
    el.style.setProperty('--shake-intensity', intensity + 'px');
    
    setTimeout(() => {
        el.style.animation = '';
    }, duration);
}

/**
 * Fait trembler tout l'écran (pour les boss par exemple)
 * @param {number} [intensity=5] - Intensité du shake (1-10)
 * @param {number} [duration=300] - Durée en ms
 */
function shakeScreen(intensity = 5, duration = 300) {
    const app = document.getElementById('app');
    if (app) {
        shakeElement(app, intensity, duration);
    }
}

// ============================================
// FLASH D'ÉCRAN
// ============================================

/**
 * Flash l'écran d'une couleur
 * @param {string} color - Couleur du flash
 * @param {number} duration - Durée en ms
 */
function flashScreen(color = 'white', duration = 100) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    flash.style.backgroundColor = color;
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0.5';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.transition = 'opacity 0.1s';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 100);
    }, duration);
}

// Exposer globalement
window.showClickFeedback = showClickFeedback;
window.createFloatingNumber = createFloatingNumber;
window.createParticles = createParticles;
window.getClickPoint = getClickPoint;
window.createConfetti = createConfetti;
window.showLoadingScreen = showLoadingScreen;
window.hideLoadingScreen = hideLoadingScreen;
window.shakeElement = shakeElement;
window.shakeScreen = shakeScreen;
window.flashScreen = flashScreen;
