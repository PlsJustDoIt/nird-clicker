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
 * Crée un nombre flottant après un clic
 * @param {number} points - Points gagnés
 */
function createFloatingNumber(points) {
    const clickArea = document.getElementById('click-area');
    if (!clickArea) return;
    
    const floater = document.createElement('div');
    floater.className = 'floating-number';
    floater.textContent = '+' + formatNumber(points);
    
    // Position aléatoire
    floater.style.left = (30 + Math.random() * 40) + '%';
    floater.style.top = (20 + Math.random() * 30) + '%';
    
    clickArea.appendChild(floater);
    
    // Message bonus aléatoire (10% de chance)
    if (Math.random() < 0.1 && typeof CLICK_MESSAGES !== 'undefined') {
        const msg = document.createElement('div');
        msg.className = 'floating-message';
        msg.textContent = CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)];
        msg.style.left = (20 + Math.random() * 60) + '%';
        clickArea.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    }
    
    // Nettoyage
    setTimeout(() => floater.remove(), 1000);
}

// ============================================
// PARTICULES
// ============================================

/** @type {HTMLElement[]} Pool de particules pour réutilisation */
var particlePool = [];

/** @type {number} Nombre maximum de particules dans le pool */
var MAX_PARTICLES = 50;

/**
 * Crée des particules au clic (version optimisée avec pool)
 */
function createParticles() {
    if (!gameState.particlesEnabled) return;
    
    const clickArea = document.getElementById('click-area');
    if (!clickArea) return;
    
    const colors = ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa'];
    
    for (let i = 0; i < 5; i++) {
        let particle;
        
        // Réutiliser une particule du pool si disponible
        if (particlePool.length > 0) {
            particle = particlePool.pop();
            particle.style.display = 'block';
        } else {
            particle = document.createElement('div');
            particle.className = 'particle';
            clickArea.appendChild(particle);
        }
        
        // Positionner la particule
        particle.style.left = (40 + Math.random() * 20) + '%';
        particle.style.top = (40 + Math.random() * 20) + '%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.setProperty('--dx', (Math.random() - 0.5) * 100 + 'px');
        particle.style.setProperty('--dy', (Math.random() - 0.5) * 100 + 'px');
        
        // Réinitialiser l'animation
        particle.style.animation = 'none';
        particle.offsetHeight; // Force reflow
        particle.style.animation = '';
        
        // Retourner au pool après animation
        setTimeout(() => {
            particle.style.display = 'none';
            if (particlePool.length < MAX_PARTICLES) {
                particlePool.push(particle);
            } else {
                particle.remove();
            }
        }, 600);
    }
}

// ============================================
// CONFETTIS (pour les célébrations)
// ============================================

/**
 * Crée une pluie de confettis
 * @param {number} count - Nombre de confettis
 */
function createConfetti(count = 100) {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#88ff00'];
    
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
                <div class="loading-spinner">🖥️</div>
                <p>Chargement du Village Numérique...</p>
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
window.createConfetti = createConfetti;
window.showLoadingScreen = showLoadingScreen;
window.hideLoadingScreen = hideLoadingScreen;
window.shakeElement = shakeElement;
window.shakeScreen = shakeScreen;
window.flashScreen = flashScreen;
