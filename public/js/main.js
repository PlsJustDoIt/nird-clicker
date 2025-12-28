/**
 * NIRD Clicker - Point d'entrée principal
 * Initialisation et démarrage du jeu
 * Version 2.0 avec toutes les features !
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🖥️ NIRD Clicker v2.0 - Initialisation...');
    
    // Afficher un écran de chargement
    showLoadingScreen();
    
    // Initialiser le jeu après un court délai
    setTimeout(() => {
        initGame();
        initEventListeners();
        initNewSystems();
        hideLoadingScreen();
        
        console.log('✅ NIRD Clicker - Prêt !');
        console.log('💡 Astuce : Tapez le Konami Code pour un bonus secret !');
        console.log('🎮 Nouvelles features : Prestige, Quiz, Missions, Skins, Thèmes !');
        
        // Message de bienvenue ou tutoriel
        if (!localStorage.getItem('nirdClicker_welcomed')) {
            showTutorial();
            localStorage.setItem('nirdClicker_welcomed', 'true');
        } else {
            // Afficher une astuce aléatoire
            showRandomTip();
        }
        
        // Vérifier les gains hors-ligne
        checkOfflineGains();
        
    }, 500);
});

// Initialiser les nouveaux systèmes
function initNewSystems() {
    console.log('🔧 Initialisation des nouveaux systèmes...');
    
    // Appliquer le thème sauvegardé
    if (gameState.currentTheme) {
        applyTheme(gameState.currentTheme);
    }
    
    // Appliquer le skin sauvegardé
    if (gameState.currentSkin) {
        applySkin(gameState.currentSkin);
    }
    
    // Générer les missions quotidiennes
    generateDailyMissions();
    
    // Mettre à jour l'affichage du prestige
    updatePrestigeDisplay();
    
    // Initialiser les particules si activées
    if (gameState.particlesEnabled) {
        console.log('✨ Particules activées');
    }
    
    // Charger le menu par défaut
    switchMenuTab('upgrades');
    
    // Event listeners pour les nouveaux éléments
    initNewEventListeners();
    
    console.log('✅ Nouveaux systèmes initialisés');
}

// Event listeners pour les nouvelles features
function initNewEventListeners() {
    // Tabs du menu
    document.querySelectorAll('.menu-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchMenuTab(tabName);
        });
    });
    
    // Bouton prestige
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
        prestigeBtn.addEventListener('click', () => {
            // Utilise la popup de confirmation
            doPrestige();
        });
    }
    
    // Boutons multiplicateur d'achat
    document.querySelectorAll('.buy-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            setBuyMultiplier(amount === 'max' ? 'max' : parseInt(amount));
            
            // Mise à jour visuelle
            document.querySelectorAll('.buy-amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Fermer les modales
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });
    
    // Fermer en cliquant à l'extérieur (sauf pour le boss)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        // Ne pas permettre de fermer le boss en cliquant à l'extérieur
        if (modal.id === 'boss-modal') return;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

// Changer d'onglet de menu
function switchMenuTab(tabName) {
    // Mettre à jour les tabs
    document.querySelectorAll('.menu-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Mettre à jour le contenu
    document.querySelectorAll('.menu-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-content`);
    });
    
    // Rafraîchir le contenu selon l'onglet
    switch(tabName) {
        case 'upgrades':
            renderUpgrades();
            break;
        case 'prestige':
            renderPrestigeUpgrades();
            break;
        case 'skins':
            renderSkins();
            break;
        case 'encyclopedia':
            renderEncyclopedia();
            break;
    }
}

// Écran de chargement
function showLoadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'loading-screen';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-icon">🐧</div>
            <h2>NIRD Clicker</h2>
            <p>Chargement de la résistance...</p>
            <div class="loader-bar">
                <div class="loader-progress"></div>
            </div>
            <p style="font-size: 0.8em; margin-top: 1em; opacity: 0.7">v2.0 - Toutes les features !</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 500);
    }
}

// Tutoriel interactif
function showTutorial() {
    const tutorial = document.createElement('div');
    tutorial.className = 'welcome-modal tutorial';
    tutorial.innerHTML = `
        <div class="welcome-content">
            <h2>🖥️ Bienvenue dans NIRD Clicker v2.0 !</h2>
            <p><strong>Votre mission :</strong> Libérer le numérique de l'emprise des Big Tech !</p>
            
            <div class="welcome-instructions">
                <div class="instruction">
                    <span class="instruction-icon">👆</span>
                    <span>Cliquez sur l'ordinateur pour gagner des Points de Souveraineté</span>
                </div>
                <div class="instruction">
                    <span class="instruction-icon">🔧</span>
                    <span>Achetez des améliorations pour automatiser votre production</span>
                </div>
                <div class="instruction">
                    <span class="instruction-icon">👹</span>
                    <span>Affrontez les 5 Boss GAFAM : Microsoft, Google, Apple, Meta, Amazon</span>
                </div>
                <div class="instruction">
                    <span class="instruction-icon">🎯</span>
                    <span>Complétez des missions quotidiennes pour des bonus</span>
                </div>
                <div class="instruction">
                    <span class="instruction-icon">🧠</span>
                    <span>Répondez aux quiz NIRD pour gagner des récompenses</span>
                </div>
                <div class="instruction">
                    <span class="instruction-icon">⭐</span>
                    <span>Faites un Prestige pour des bonus permanents !</span>
                </div>
            </div>
            
            <p class="welcome-nird">
                <small>
                    🌱 Ce jeu s'inscrit dans la démarche <strong>NIRD</strong> (Numérique Inclusif, Responsable et Durable) 
                    pour sensibiliser à la souveraineté numérique.
                </small>
            </p>
            
            <button onclick="this.parentElement.parentElement.remove(); gameState.tutorialComplete = true;">
                🚀 Commencer la Résistance !
            </button>
        </div>
    `;
    document.body.appendChild(tutorial);
}

// Afficher une astuce aléatoire
function showRandomTip() {
    if (typeof TIPS !== 'undefined' && TIPS.length > 0) {
        const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
        const tipBanner = document.getElementById('tip-banner');
        if (tipBanner) {
            tipBanner.querySelector('.tip-text').textContent = randomTip;
            tipBanner.classList.remove('hidden');
            
            // Fermer automatiquement après 10 secondes
            setTimeout(() => {
                tipBanner.classList.add('hidden');
            }, 10000);
        }
    }
}

// Vérifier les gains hors-ligne
function checkOfflineGains() {
    const savedData = localStorage.getItem('nirdClicker_save');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.savedAt) {
            const offlineTime = (Date.now() - data.savedAt) / 1000;
            const multiplier = 1 + (gameState.prestigeLevel * 0.1); // Bonus prestige
            const offlineGain = Math.floor(gameState.productionPerSecond * offlineTime * 0.1 * multiplier);
            
            if (offlineGain > 10 && offlineTime > 30) {
                gameState.score += offlineGain;
                gameState.totalScore += offlineGain;
                
                // Modal de gains hors-ligne
                const offlineModal = document.createElement('div');
                offlineModal.className = 'welcome-modal offline-gains';
                offlineModal.innerHTML = `
                    <div class="welcome-content">
                        <h2>🌙 Gains Hors-Ligne</h2>
                        <p>Pendant votre absence (${formatTime(offlineTime)}), vos militants ont continué le combat !</p>
                        <div class="offline-reward">
                            <span class="reward-amount">+${formatNumber(offlineGain)}</span>
                            <span class="reward-label">Points de Souveraineté</span>
                        </div>
                        ${gameState.prestigeLevel > 0 ? `<p class="prestige-bonus">✨ Bonus Prestige x${(1 + gameState.prestigeLevel * 0.1).toFixed(1)}</p>` : ''}
                        <button onclick="this.parentElement.parentElement.remove()">
                            Super !
                        </button>
                    </div>
                `;
                document.body.appendChild(offlineModal);
                
                updateUI();
            }
        }
    }
}

// Formater le temps
function formatTime(seconds) {
    if (seconds < 60) return `${Math.floor(seconds)} secondes`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} heures`;
    return `${Math.floor(seconds / 86400)} jours`;
}

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Sauvegarder quand on quitte
        saveGame();
    }
});

// Empêcher la fermeture accidentelle
window.addEventListener('beforeunload', (e) => {
    saveGame();
});

// Debug : exposer l'état pour le développement (différé pour éviter les erreurs de référence)
document.addEventListener('DOMContentLoaded', () => {
    window.DEBUG = {
        getState: () => gameState,
        addScore: (amount) => {
            gameState.score += amount;
            gameState.totalScore += amount;
            updateUI();
        },
        resetGame: () => typeof resetGame === 'function' && resetGame(),
        triggerBoss: () => typeof showBoss === 'function' && showBoss(),
        // Triggers pour chaque boss spécifique
        triggerBossWindows: () => showBoss('windows'),
    triggerBossGoogle: () => showBoss('google'),
    triggerBossFacebook: () => showBoss('facebook'),
    triggerOpenaiAttack: () => triggerOpenaiAttack(),
    triggerBossAmazon: () => showBoss('amazon'),
    triggerBossApple: () => showBoss('apple'),
    triggerBossTeams: () => showBoss('microsoft-teams'),
    triggerBossTiktok: () => showBoss('tiktok'),
    triggerBossNvidia: () => showBoss('nvidia'),
    triggerBossMetaAI: () => showBoss('meta-ai'),
    triggerBossSkynet: () => showBoss('skynet-gafam'),
    triggerQuiz: () => typeof showQuiz === 'function' && showQuiz(),
    addPrestige: (amount) => {
        gameState.prestigePoints += amount;
        if (typeof updatePrestigeDisplay === 'function') updatePrestigeDisplay();
    },
    unlockAllSkins: () => {
        if (typeof SKINS !== 'undefined') {
            SKINS.forEach(s => gameState.skinsUnlocked.push(s.id));
            if (typeof renderSkins === 'function') renderSkins();
        }
    },
    showTip: () => typeof showRandomTip === 'function' && showRandomTip(),
    switchTheme: (theme) => typeof applyTheme === 'function' && applyTheme(theme),
    getUpgrades: () => typeof UPGRADES !== 'undefined' ? UPGRADES : [],
    setLevel: (level) => {
        gameState.currentVillageLevel = level;
        if (typeof updateVillageVisual === 'function') updateVillageVisual();
    }
};

    console.log('💡 Conseil développeur : utilisez window.DEBUG pour déboguer le jeu');
    console.log('📚 Commandes : DEBUG.getState(), DEBUG.addScore(n), DEBUG.triggerBoss(), DEBUG.triggerQuiz()');
    console.log('🎨 Thèmes : DEBUG.switchTheme("dark"|"light"|"retro"|"nature")');
    console.log('👾 Boss : DEBUG.triggerBossWindows(), DEBUG.triggerBossGoogle(), DEBUG.triggerBossFacebook(), etc.');
});
