/**
 * NIRD Clicker - Système de sauvegarde
 * Gestion localStorage avec fallback gracieux
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

var SAVE_KEY = 'nirdClicker_save';
var SAVE_VERSION = 2; // Version du format de sauvegarde

// Flag pour éviter la sauvegarde pendant un reset
var isResetting = false;

/**
 * Vérifie si localStorage est disponible
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Sauvegarde le jeu dans localStorage
 */
function saveGame() {
    if (isResetting) return;
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage non disponible, sauvegarde impossible');
        return;
    }
    
    try {
        const saveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            // État du jeu
            ...getStateForSave(),
            // Upgrades
            upgrades: typeof UPGRADES !== 'undefined' 
                ? UPGRADES.map(u => ({ id: u.id, owned: u.owned, unlocked: u.unlocked }))
                : [],
            clickUpgrades: typeof CLICK_UPGRADES !== 'undefined'
                ? CLICK_UPGRADES.map(u => ({ id: u.id, purchased: u.purchased }))
                : [],
            achievements: typeof ACHIEVEMENTS !== 'undefined'
                ? ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: a.unlocked }))
                : [],
            skins: typeof SKINS !== 'undefined'
                ? SKINS.map(s => ({ id: s.id, owned: s.owned }))
                : []
        };
        
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        gameState.lastSave = Date.now();
        
        // Log discret (pas à chaque sauvegarde auto)
        // console.log('💾 Partie sauvegardée');
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
    }
}

/**
 * Charge le jeu depuis localStorage
 */
function loadGame() {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage non disponible');
        return;
    }
    
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) {
            console.log('🆕 Nouvelle partie');
            return;
        }
        
        const data = JSON.parse(savedData);
        
        // Charger l'état du jeu
        if (typeof loadStateFromSave === 'function') {
            loadStateFromSave(data);
        } else {
            // Fallback: charger directement dans gameState
            Object.keys(data).forEach(key => {
                if (gameState.hasOwnProperty(key) && key !== 'version' && key !== 'timestamp') {
                    gameState[key] = data[key];
                }
            });
        }
        
        // Restaurer les upgrades
        if (data.upgrades && typeof UPGRADES !== 'undefined') {
            data.upgrades.forEach(saved => {
                const upgrade = UPGRADES.find(u => u.id === saved.id);
                if (upgrade) {
                    upgrade.owned = saved.owned || 0;
                    upgrade.unlocked = saved.unlocked || false;
                }
            });
        }
        
        // Restaurer les upgrades de clic
        if (data.clickUpgrades && typeof CLICK_UPGRADES !== 'undefined') {
            data.clickUpgrades.forEach(saved => {
                const upgrade = CLICK_UPGRADES.find(u => u.id === saved.id);
                if (upgrade) {
                    upgrade.purchased = saved.purchased || false;
                }
            });
        }
        
        // Restaurer les achievements
        if (data.achievements && typeof ACHIEVEMENTS !== 'undefined') {
            data.achievements.forEach(saved => {
                const achievement = ACHIEVEMENTS.find(a => a.id === saved.id);
                if (achievement) {
                    achievement.unlocked = saved.unlocked || false;
                }
            });
        }
        
        // Restaurer les skins
        if (data.skins && typeof SKINS !== 'undefined') {
            data.skins.forEach(saved => {
                const skin = SKINS.find(s => s.id === saved.id);
                if (skin) {
                    skin.owned = saved.owned || false;
                }
            });
            // Mettre à jour skinsUnlocked
            gameState.skinsUnlocked = data.skins.filter(s => s.owned).map(s => s.id);
            if (!gameState.skinsUnlocked.includes('default')) {
                gameState.skinsUnlocked.unshift('default');
            }
        }
        
        console.log('📂 Partie chargée');
        
    } catch (e) {
        console.error('Erreur de chargement:', e);
        console.log('La sauvegarde semble corrompue, démarrage d\'une nouvelle partie');
    }
}

/**
 * Réinitialise complètement le jeu
 * @param {boolean} confirm - Si true, demande confirmation
 */
function resetGame(confirm = true) {
    if (confirm && !window.confirm('⚠️ Voulez-vous vraiment tout recommencer ? Cette action est irréversible !')) {
        return false;
    }
    
    isResetting = true;
    
    try {
        // Supprimer la sauvegarde
        if (isLocalStorageAvailable()) {
            localStorage.removeItem(SAVE_KEY);
        }
        
        // Recharger la page pour réinitialiser tout
        window.location.reload();
        
    } catch (e) {
        console.error('Erreur lors du reset:', e);
        isResetting = false;
    }
    
    return true;
}

/**
 * Exporte la sauvegarde en JSON téléchargeable
 */
function exportSave() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) {
            if (typeof showNotification === 'function') {
                showNotification('Aucune sauvegarde à exporter', 'error');
            }
            return;
        }
        
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nird-clicker-save-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof showNotification === 'function') {
            showNotification('💾 Sauvegarde exportée !', 'success');
        }
    } catch (e) {
        console.error('Erreur export:', e);
    }
}

/**
 * Importe une sauvegarde depuis un fichier
 * @param {File} file - Le fichier JSON à importer
 */
function importSave(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            // Valider que c'est du JSON valide
            const data = JSON.parse(event.target.result);
            
            // Vérification basique de la structure
            if (typeof data.score === 'undefined') {
                throw new Error('Format de sauvegarde invalide');
            }
            
            // Sauvegarder et recharger
            localStorage.setItem(SAVE_KEY, event.target.result);
            
            if (typeof showNotification === 'function') {
                showNotification('📂 Sauvegarde importée ! Rechargement...', 'success');
            }
            
            setTimeout(() => window.location.reload(), 1000);
            
        } catch (e) {
            console.error('Erreur import:', e);
            if (typeof showNotification === 'function') {
                showNotification('❌ Fichier de sauvegarde invalide', 'error');
            }
        }
    };
    
    reader.readAsText(file);
}

/**
 * Calcule les gains hors-ligne
 * @returns {number} Points gagnés hors-ligne
 */
function calculateOfflineGains() {
    const now = Date.now();
    const lastSave = gameState.lastSave || now;
    const offlineTime = (now - lastSave) / 1000; // En secondes
    
    // Maximum 8 heures de gains hors-ligne
    const maxOfflineTime = 8 * 60 * 60;
    const effectiveTime = Math.min(offlineTime, maxOfflineTime);
    
    // 50% de la production normale hors-ligne
    const offlineEfficiency = 0.5;
    const offlineGain = Math.floor(gameState.productionPerSecond * effectiveTime * offlineEfficiency);
    
    return offlineGain;
}

/**
 * Applique les gains hors-ligne
 */
function applyOfflineGains() {
    const offlineGain = calculateOfflineGains();
    
    if (offlineGain > 0) {
        gameState.score += offlineGain;
        gameState.totalScore += offlineGain;
        
        return offlineGain;
    }
    
    return 0;
}

// Exposer globalement
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.exportSave = exportSave;
window.importSave = importSave;
window.calculateOfflineGains = calculateOfflineGains;
window.applyOfflineGains = applyOfflineGains;
window.isResetting = isResetting;
