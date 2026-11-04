/**
 * @file NIRD Clicker - Système de notifications
 * @description Notifications flottantes et bannières d'événements
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// NOTIFICATIONS FLOTTANTES
// ============================================

/**
 * Affiche une notification
 * @param {string} message - Message à afficher
 * @param {string} type - Type: 'info', 'success', 'error', 'warning', 'achievement', 'bonus', 'tip'
 * @param {number} duration - Durée d'affichage en ms
 */
function showNotification(message, type = 'info', duration = 3000, iconName = null) {
    const container = document.getElementById('floating-notifications');
    if (!container) {
        console.warn('Container de notifications non trouvé');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    // Icône selon le type
    const icons = {
        'info': 'info',
        'success': 'check-circle',
        'error': 'x-circle',
        'warning': 'warning',
        'danger': 'warning',
        'achievement': 'trophy',
        'bonus': 'gift',
        'tip': 'lightbulb',
        'unlock': 'unlock',
        'level-up': 'trending',
        'mission': 'target',
        'offline': 'moon',
        'combo': 'flame',
        'prestige': 'cycle'
    };
    
    const iconKey = iconName || icons[type] || 'info';
    notification.innerHTML = `<span class="notif-icon">${icon(iconKey)}</span><span class="notif-text">${message}</span>`;
    
    container.appendChild(notification);
    
    // Animation d'entrée
    notification.style.animation = 'slideInRight 0.3s ease-out';
    
    // Auto-suppression
    setTimeout(() => {
        notification.classList.add('fade-out');
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    // Limiter le nombre de notifications visibles
    const allNotifs = container.querySelectorAll('.notification');
    if (allNotifs.length > 5) {
        allNotifs[0].remove();
    }
}

// ============================================
// BANNIÈRE D'ÉVÉNEMENT
// ============================================

/**
 * Affiche une bannière d'événement en haut de l'écran
 * @param {string} title - Titre de l'événement
 * @param {string} description - Description
 * @param {number} duration - Durée d'affichage en ms
 */
function showEventBanner(title, description, duration = 5000, iconName = 'zap') {
    const banner = document.getElementById('event-banner');
    const text = document.getElementById('event-text');
    
    if (!banner || !text) return;
    
    text.innerHTML = `<span class="event-icon">${icon(iconName)}</span><strong>${title}</strong><span class="event-desc">${description}</span>`;
    banner.classList.remove('hidden');
    
    // Animation d'entrée
    banner.style.animation = 'slideDown 0.3s ease-out';
    
    setTimeout(() => {
        banner.style.animation = 'slideUp 0.3s ease-in';
        setTimeout(() => banner.classList.add('hidden'), 300);
    }, duration);
}

// ============================================
// TIPS (ASTUCES)
// ============================================

/**
 * Affiche une astuce en bas de l'écran
 * @param {string} tip - Texte de l'astuce
 */
function showTip(tip) {
    const tipBanner = document.getElementById('tip-banner');
    const tipText = tipBanner?.querySelector('.tip-text');
    
    if (!tipBanner || !tipText) return;
    
    tipText.textContent = tip;
    tipBanner.classList.remove('hidden');
    
    // Auto-hide après 8 secondes
    setTimeout(() => {
        tipBanner.classList.add('hidden');
    }, 8000);
}

/**
 * Affiche une astuce aléatoire depuis EDUCATIONAL_TIPS
 */
function showRandomTip() {
    if (typeof EDUCATIONAL_TIPS === 'undefined' || EDUCATIONAL_TIPS.length === 0) return;
    
    const tip = EDUCATIONAL_TIPS[Math.floor(Math.random() * EDUCATIONAL_TIPS.length)];
    showNotification(tip, 'tip', 6000);
}

// ============================================
// TOAST (notification courte)
// ============================================

/**
 * Affiche un toast rapide
 * @param {string} message - Message
 * @param {string} type - Type de toast
 */
function showToast(message, type = 'info') {
    showNotification(message, type, 2000);
}

// ============================================
// CONFIRMATION DIALOG
// ============================================

/**
 * Affiche une boîte de dialogue de confirmation
 * @param {string} title - Titre
 * @param {string} message - Message
 * @param {Function} onConfirm - Callback si confirmé
 * @param {Function} onCancel - Callback si annulé
 */
function showConfirmDialog(title, message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay confirm-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-buttons">
                <button class="btn btn-cancel">Annuler</button>
                <button class="btn btn-confirm">Confirmer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const confirmBtn = modal.querySelector('.btn-confirm');
    const cancelBtn = modal.querySelector('.btn-cancel');
    
    confirmBtn.addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
    
    // Fermer en cliquant à côté
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    });
}

// Exposer globalement
window.showNotification = showNotification;
window.showEventBanner = showEventBanner;
window.showTip = showTip;
window.showRandomTip = showRandomTip;
window.showToast = showToast;
window.showConfirmDialog = showConfirmDialog;
