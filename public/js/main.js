/**
 * NIRD Clicker - Point d'entrée principal
 * Initialisation et démarrage du jeu
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Attendre le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🖥️ NIRD Clicker - Initialisation...');
    
    // Afficher un écran de chargement
    showLoadingScreen();
    
    // Initialiser le jeu après un court délai
    setTimeout(() => {
        initGame();
        initEventListeners();
        hideLoadingScreen();
        
        console.log('✅ NIRD Clicker - Prêt !');
        console.log('💡 Astuce : Tapez le Konami Code pour un bonus secret !');
        
        // Message de bienvenue
        if (!localStorage.getItem('nirdClicker_welcomed')) {
            showWelcomeMessage();
            localStorage.setItem('nirdClicker_welcomed', 'true');
        }
    }, 500);
});

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

// Message de bienvenue
function showWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.className = 'welcome-modal';
    welcome.innerHTML = `
        <div class="welcome-content">
            <h2>🖥️ Bienvenue dans NIRD Clicker !</h2>
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
                    <span class="instruction-icon">🪟</span>
                    <span>Fermez les pop-ups Windows qui veulent vous bloquer !</span>
                </div>
                <div class="instruction">
                    <span class="instruction-icon">🏆</span>
                    <span>Atteignez l'indépendance numérique totale !</span>
                </div>
            </div>
            
            <p class="welcome-nird">
                <small>
                    🌱 Ce jeu s'inscrit dans la démarche <strong>NIRD</strong> (Numérique Inclusif, Responsable et Durable) 
                    pour sensibiliser à la souveraineté numérique.
                </small>
            </p>
            
            <button onclick="this.parentElement.parentElement.remove()">
                🚀 Commencer la Résistance !
            </button>
        </div>
    `;
    document.body.appendChild(welcome);
}

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Sauvegarder quand on quitte
        saveGame();
    } else {
        // Recharger les gains hors-ligne au retour
        const savedData = localStorage.getItem('nirdClicker_save');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.savedAt) {
                const offlineTime = (Date.now() - data.savedAt) / 1000;
                const offlineGain = Math.floor(gameState.productionPerSecond * offlineTime * 0.1);
                
                if (offlineGain > 10 && offlineTime > 30) {
                    gameState.score += offlineGain;
                    gameState.totalScore += offlineGain;
                    showNotification(`🌙 +${formatNumber(offlineGain)} points pendant votre absence !`, 'offline');
                    updateUI();
                }
            }
        }
    }
});

// Empêcher la fermeture accidentelle
window.addEventListener('beforeunload', (e) => {
    saveGame();
    // Désactiver le message d'avertissement pour l'instant
    // e.preventDefault();
    // e.returnValue = '';
});

// Debug : exposer l'état pour le développement
window.DEBUG = {
    getState: () => gameState,
    addScore: (amount) => {
        gameState.score += amount;
        gameState.totalScore += amount;
        updateUI();
    },
    resetGame: resetGame,
    triggerBoss: showBoss
};

console.log('💡 Conseil développeur : utilisez window.DEBUG pour déboguer le jeu');
