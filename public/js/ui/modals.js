/**
 * @file NIRD Clicker - Système de modales
 * @description Settings, Achievements, Encyclopedia, Stats, Leaderboard
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// VARIABLES DE NAVIGATION GAMEPAD
// ============================================
// NOTE: settingsMenuIndex et settingsMenuItems sont déjà définis dans ui.js

// ============================================
// MENU PARAMÈTRES
// ============================================

/**
 * Ouvre/ferme le menu des paramètres
 */
function openSettingsMenu() {
    const existingModal = document.querySelector('.settings-modal');
    if (existingModal) {
        existingModal.remove();
        return; // Toggle: si déjà ouvert, on ferme
    }
    
    settingsMenuIndex = 0;
    
    const currentTheme = (typeof THEMES !== 'undefined' && THEMES.find(t => t.id === gameState.currentTheme)) || { name: 'Défaut', id: 'default' };
    
    const modal = document.createElement('div');
    modal.className = 'settings-modal modal-overlay';
    modal.innerHTML = `
        <div class="modal-content settings-content">
            <h2>⚙️ Options</h2>
            <p class="gamepad-hint">🎮 D-Pad: naviguer • A: activer • B: fermer</p>
            
            <div class="setting-item gamepad-selectable" data-index="0">
                <span>🔊 Sons</span>
                <button id="sound-toggle-btn" class="${gameState.soundEnabled ? 'active' : ''}">
                    ${gameState.soundEnabled ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="setting-item gamepad-selectable" data-index="1">
                <span>✨ Particules</span>
                <button id="particles-toggle-btn" class="${gameState.particlesEnabled ? 'active' : ''}">
                    ${gameState.particlesEnabled ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="setting-item gamepad-selectable" data-index="2">
                <span>🎨 Thème</span>
                <div class="theme-selector-gamepad">
                    <button class="theme-arrow" id="theme-prev">◀</button>
                    <span class="theme-name" id="theme-current">${currentTheme.name}</span>
                    <button class="theme-arrow" id="theme-next">▶</button>
                </div>
            </div>
            
            <hr>
            
            <div class="setting-item gamepad-selectable" data-index="3">
                <span>💾 Exporter</span>
                <button id="export-btn">📤 Exporter</button>
            </div>
            
            <div class="setting-item gamepad-selectable" data-index="4">
                <span>💾 Importer</span>
                <button id="import-btn">📥 Importer</button>
            </div>
            
            <div class="setting-item danger gamepad-selectable" data-index="5">
                <span>🗑️ Reset</span>
                <button id="reset-btn" class="danger-btn">Recommencer</button>
            </div>
            
            <button id="close-settings-btn" class="close-btn gamepad-selectable" data-index="6">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Récupérer les éléments navigables
    settingsMenuItems = modal.querySelectorAll('.gamepad-selectable');
    updateSettingsSelection();
    
    // Event listeners
    modal.querySelector('#sound-toggle-btn').addEventListener('click', toggleSettingsSound);
    modal.querySelector('#particles-toggle-btn').addEventListener('click', toggleSettingsParticles);
    modal.querySelector('#theme-prev').addEventListener('click', () => cycleTheme(-1));
    modal.querySelector('#theme-next').addEventListener('click', () => cycleTheme(1));
    modal.querySelector('#export-btn').addEventListener('click', exportSave);
    modal.querySelector('#import-btn').addEventListener('click', importSave);
    modal.querySelector('#reset-btn').addEventListener('click', () => {
        if (confirm('⚠️ Voulez-vous vraiment tout recommencer ?')) {
            if (typeof resetGame === 'function') resetGame();
        }
    });
    modal.querySelector('#close-settings-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Change de thème
 * @param {number} direction - 1 suivant, -1 précédent
 */
function cycleTheme(direction) {
    if (typeof THEMES === 'undefined') return;
    
    const currentIndex = THEMES.findIndex(t => t.id === gameState.currentTheme);
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = THEMES.length - 1;
    if (newIndex >= THEMES.length) newIndex = 0;
    
    const newTheme = THEMES[newIndex];
    if (typeof applyTheme === 'function') applyTheme(newTheme.id);
    
    const themeNameEl = document.getElementById('theme-current');
    if (themeNameEl) themeNameEl.textContent = newTheme.name;
}

/**
 * Active/désactive le son et met à jour le bouton
 */
function toggleSettingsSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.querySelector('#sound-toggle-btn');
    if (btn) {
        btn.textContent = gameState.soundEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', gameState.soundEnabled);
    }
    if (typeof saveGame === 'function') saveGame();
}

/**
 * Active/désactive les particules et met à jour le bouton
 */
function toggleSettingsParticles() {
    gameState.particlesEnabled = !gameState.particlesEnabled;
    const btn = document.querySelector('#particles-toggle-btn');
    if (btn) {
        btn.textContent = gameState.particlesEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', gameState.particlesEnabled);
    }
    if (typeof saveGame === 'function') saveGame();
}

/**
 * Met à jour la sélection visuelle dans le menu paramètres (pour gamepad)
 */
function updateSettingsSelection() {
    settingsMenuItems.forEach((item, index) => {
        item.classList.toggle('gamepad-selected', index === settingsMenuIndex);
    });
}

/**
 * Navigue dans le menu paramètres (pour gamepad)
 * @param {number} direction - Direction de navigation (1 ou -1)
 */
function navigateSettingsMenu(direction) {
    const modal = document.querySelector('.settings-modal');
    if (!modal) return;
    
    settingsMenuIndex += direction;
    if (settingsMenuIndex < 0) settingsMenuIndex = settingsMenuItems.length - 1;
    if (settingsMenuIndex >= settingsMenuItems.length) settingsMenuIndex = 0;
    
    updateSettingsSelection();
    if (typeof playSound === 'function') playSound('click');
}

/**
 * Active l'élément actuellement sélectionné dans le menu paramètres
 */
function activateSettingsItem() {
    const modal = document.querySelector('.settings-modal');
    if (!modal) return;
    
    const item = settingsMenuItems[settingsMenuIndex];
    if (!item) return;
    
    const btn = item.querySelector('button:not(.theme-arrow)');
    const themeNext = item.querySelector('#theme-next');
    
    if (themeNext) {
        cycleTheme(1);
        if (typeof playSound === 'function') playSound('click');
    } else if (btn) {
        btn.click();
        if (typeof playSound === 'function') playSound('click');
    } else if (item.classList.contains('close-btn')) {
        modal.remove();
        if (typeof playSound === 'function') playSound('click');
    }
}

// ============================================
// MENU SUCCÈS
// ============================================

/**
 *
 */
function openAchievementsMenu() {
    const modal = document.createElement('div');
    modal.className = 'achievements-modal modal-overlay';
    
    let achievementsList = '';
    if (typeof ACHIEVEMENTS !== 'undefined') {
        achievementsList = ACHIEVEMENTS.map(a => `
            <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}">
                <span class="achievement-icon">${a.icon || '🏆'}</span>
                <div class="achievement-info">
                    <span class="achievement-name">${a.unlocked ? a.name : '???'}</span>
                    <span class="achievement-desc">${a.unlocked ? a.description : 'Succès verrouillé'}</span>
                </div>
            </div>
        `).join('');
    }
    
    const unlockedCount = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.filter(a => a.unlocked).length : 0;
    const totalCount = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.length : 0;
    
    modal.innerHTML = `
        <div class="modal-content achievements-content">
            <h2>🏆 Succès</h2>
            <p class="achievements-count">${unlockedCount} / ${totalCount} débloqués</p>
            <div class="achievements-list">${achievementsList}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ============================================
// MENU ENCYCLOPÉDIE
// ============================================

/**
 *
 */
function openEncyclopedia() {
    const modal = document.createElement('div');
    modal.className = 'encyclopedia-modal modal-overlay';
    
    let entries = '';
    if (typeof ENCYCLOPEDIA !== 'undefined') {
        entries = ENCYCLOPEDIA.map(e => `
            <div class="encyclopedia-entry">
                <div class="entry-header">
                    <span class="entry-icon">${e.icon}</span>
                    <div>
                        <h3>${e.title}</h3>
                        <span class="entry-subtitle">${e.subtitle || ''}</span>
                    </div>
                </div>
                <p class="entry-content">${e.content}</p>
            </div>
        `).join('');
    }
    
    modal.innerHTML = `
        <div class="modal-content encyclopedia-content">
            <h2>📖 Encyclopédie NIRD</h2>
            <button class="easter-egg-btn" title="???" onclick="if(typeof openSnakeGame==='function')openSnakeGame(); this.closest('.modal-overlay').remove();">?</button>
            <div class="encyclopedia-list">${entries}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ============================================
// MENU STATISTIQUES
// ============================================

/**
 *
 */
function openStatsMenu() {
    const playTime = Math.floor((Date.now() - (gameState.startTime || Date.now())) / 1000);
    const hours = Math.floor(playTime / 3600);
    const minutes = Math.floor((playTime % 3600) / 60);
    
    const effectiveClickPower = typeof getEffectiveClickPower === 'function' ? getEffectiveClickPower() : (gameState.clickPower || 1);
    
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
                    <span class="stat-value">${effectiveClickPower}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">GAFAM vaincus</span>
                    <span class="stat-value">${gameState.bossDefeated || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Niveau prestige</span>
                    <span class="stat-value">${gameState.prestigeLevel || 0} (+${(gameState.prestigeLevel || 0) * 10}%)</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Quiz réussis</span>
                    <span class="stat-value">${gameState.quizCorrect || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Meilleur combo</span>
                    <span class="stat-value">x${gameState.maxCombo || 0}</span>
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
// LEADERBOARD
// ============================================

/**
 *
 */
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
                <span>Ton score total : <strong>${formatNumber(gameState.lifetimeScore)}</strong></span>
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
    
    await refreshLeaderboard();
}

/**
 *
 */
async function refreshLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    const leaderboard = typeof fetchLeaderboard === 'function' ? await fetchLeaderboard() : [];
    
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

/**
 *
 */
async function submitToLeaderboard() {
    const input = document.getElementById('leaderboard-pseudo');
    if (!input) return;
    
    const pseudo = input.value.trim();
    
    if (typeof submitScore === 'function' && await submitScore(pseudo)) {
        await refreshLeaderboard();
    }
}

/**
 * Échappe les caractères HTML
 * @param text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// TOGGLES
// ============================================

/**
 *
 */
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
    if (typeof saveGame === 'function') saveGame();
}

/**
 *
 */
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
    if (typeof saveGame === 'function') saveGame();
}

// ============================================
// THÈMES & SKINS
// ============================================

/**
 *
 * @param themeName
 */
function applyTheme(themeName) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
    gameState.currentTheme = themeName;
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
    
    if (typeof saveGame === 'function') saveGame();
}

/**
 *
 * @param skinId
 */
function applySkin(skinId) {
    if (typeof SKINS === 'undefined') return;
    
    const skin = SKINS.find(s => s.id === skinId);
    if (skin) {
        gameState.currentSkin = skinId;
        const clicker = document.querySelector('#main-clicker .pc-icon');
        if (clicker) {
            if (skin.image) {
                clicker.innerHTML = `<img src="${skin.image}" alt="${skin.unlockedName || skin.name}" class="clicker-skin-image">`;
            } else {
                clicker.textContent = skin.emoji;
            }
        }
        if (typeof saveGame === 'function') saveGame();
    }
}

// ============================================
// EXPORT/IMPORT SAVE
// ============================================

/**
 *
 */
function exportSave() {
    if (typeof saveGame === 'function') saveGame();
    const data = localStorage.getItem('nirdClicker_save');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nird-clicker-save.json';
    a.click();
    if (typeof showNotification === 'function') {
        showNotification('💾 Sauvegarde exportée !', 'success');
    }
}

/**
 *
 */
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
                if (typeof showNotification === 'function') {
                    showNotification('✅ Sauvegarde importée ! Rechargement...', 'success');
                }
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                if (typeof showNotification === 'function') {
                    showNotification('❌ Fichier de sauvegarde invalide', 'error');
                }
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

/**
 * Ouvre la modale d'information
 */
function openInfoModal() {
    const modal = document.getElementById('info-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.add('hidden');
        }
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };
    }
}


// Exposer globalement
window.openSettingsMenu = openSettingsMenu;
window.openAchievementsMenu = openAchievementsMenu;
window.openEncyclopedia = openEncyclopedia;
window.openStatsMenu = openStatsMenu;
window.openLeaderboard = openLeaderboard;
window.refreshLeaderboard = refreshLeaderboard;
window.submitToLeaderboard = submitToLeaderboard;
window.toggleSound = toggleSound;
window.toggleParticles = toggleParticles;
window.applyTheme = applyTheme;
window.applySkin = applySkin;
window.exportSave = exportSave;
window.importSave = importSave;
window.cycleTheme = cycleTheme;
window.navigateSettingsMenu = navigateSettingsMenu;
window.activateSettingsItem = activateSettingsItem;
window.escapeHtml = escapeHtml;
window.openInfoModal = openInfoModal;
