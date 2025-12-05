/**
 * NIRD Clicker - Système d'événements (Version Complète)
 * Gestion des événements aléatoires, milestones et easter eggs
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Événements spéciaux pour moments clés
const MILESTONE_EVENTS = [
    {
        score: 100,
        triggered: false,
        title: '🎓 Premier Éveil !',
        message: 'Vous avez sensibilisé votre premier élève à la souveraineté numérique !'
    },
    {
        score: 1000,
        triggered: false,
        title: '🏫 La Classe s\'éveille !',
        message: 'Toute une classe est maintenant convertie au logiciel libre !'
    },
    {
        score: 10000,
        triggered: false,
        title: '🏘️ Le Village est né !',
        message: 'Votre établissement est devenu un véritable Village Numérique Responsable !'
    },
    {
        score: 100000,
        triggered: false,
        title: '🌟 Reconnaissance Nationale !',
        message: 'Le ministère vous cite en exemple ! Votre projet inspire la France entière !'
    },
    {
        score: 1000000,
        triggered: false,
        title: '🏆 LIBÉRATION TOTALE !',
        message: 'Félicitations ! Vous avez atteint l\'indépendance numérique complète !'
    }
];

// Vérifier les événements de milestone
function checkMilestoneEvents() {
    // Ne déclencher qu'un seul milestone à la fois (le plus bas non encore atteint)
    for (const event of MILESTONE_EVENTS) {
        if (!gameState.triggeredMilestones.includes(event.score) && gameState.totalScore >= event.score) {
            gameState.triggeredMilestones.push(event.score);
            showMilestoneModal(event);
            saveGame(); // Sauvegarder immédiatement pour éviter les doublons
            return; // Sortir après avoir affiché un seul milestone
        }
    }
}

// Afficher une modal de milestone
function showMilestoneModal(event) {
    playSound('levelup');
    
    const modal = document.createElement('div');
    modal.className = 'milestone-modal';
    modal.innerHTML = `
        <div class="milestone-content">
            <h2>${event.title}</h2>
            <p>${event.message}</p>
            <div class="milestone-celebration">🎉🎊🎉</div>
            <button onclick="this.parentElement.parentElement.remove()">Continuer</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    createConfetti();
}

// Confettis améliorés
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#88ff00'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
            confetti.style.width = (5 + Math.random() * 10) + 'px';
            confetti.style.height = confetti.style.width;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

// Bonus de combo (au-delà du système de base)
function checkComboBonuses(combo) {
    if (combo === 10) {
        const bonus = 50;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        playSound('achievement');
        showNotification(`🔥 Combo x10 ! +${bonus} points !`, 'combo');
    } else if (combo === 25) {
        const bonus = 200;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        playSound('achievement');
        showNotification(`🔥🔥 Combo x25 ! +${bonus} points !`, 'combo');
        checkDailyMissions();
    } else if (combo === 50) {
        const bonus = 1000;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        playSound('achievement');
        showNotification(`🔥🔥🔥 MEGA COMBO ! +${bonus} points !`, 'combo');
    } else if (combo === 100) {
        const bonus = 5000;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        playSound('prestige');
        showNotification(`💀 COMBO LÉGENDAIRE ! +${bonus} points !`, 'combo');
        createConfetti();
    }
}

// Override handleClick pour ajouter les événements
const _originalHandleClick = typeof handleClick !== 'undefined' ? handleClick : null;

if (_originalHandleClick) {
    const enhancedHandleClick = function() {
        _originalHandleClick();
        checkMilestoneEvents();
        
        // Bonus de combo
        if (gameState.currentCombo > 0 && [10, 25, 50, 100].includes(gameState.currentCombo)) {
            checkComboBonuses(gameState.currentCombo);
        }
    };
    
    // Remplacer handleClick
    window.handleClick = enhancedHandleClick;
}

// Easter eggs
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiIndex = 0;

// Code secret "NIRD"
const NIRD_CODE = ['KeyN', 'KeyI', 'KeyR', 'KeyD'];
let nirdIndex = 0;

// Code secret "LINUX"
const LINUX_CODE = ['KeyL', 'KeyI', 'KeyN', 'KeyU', 'KeyX'];
let linuxIndex = 0;

document.addEventListener('keydown', (e) => {
    // Konami Code
    if (e.code === KONAMI_CODE[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI_CODE.length) {
            activateKonamiCode();
            konamiIndex = 0;
        }
    } else if (e.code === KONAMI_CODE[0]) {
        konamiIndex = 1;
    } else {
        konamiIndex = 0;
    }
    
    // NIRD Code
    if (e.code === NIRD_CODE[nirdIndex]) {
        nirdIndex++;
        if (nirdIndex === NIRD_CODE.length) {
            activateNirdCode();
            nirdIndex = 0;
        }
    } else if (e.code === NIRD_CODE[0]) {
        nirdIndex = 1;
    } else {
        nirdIndex = 0;
    }
    
    // LINUX Code
    if (e.code === LINUX_CODE[linuxIndex]) {
        linuxIndex++;
        if (linuxIndex === LINUX_CODE.length) {
            activateLinuxCode();
            linuxIndex = 0;
        }
    } else if (e.code === LINUX_CODE[0]) {
        linuxIndex = 1;
    } else {
        linuxIndex = 0;
    }
});

function activateKonamiCode() {
    playSound('prestige');
    showNotification('🎮 KONAMI CODE ACTIVÉ ! +10000 points !', 'achievement');
    gameState.score += 10000;
    gameState.totalScore += 10000;
    updateUI();
    createConfetti();
}

function activateNirdCode() {
    playSound('achievement');
    showNotification('🌱 CODE NIRD ! Double production pendant 30s !', 'achievement');
    gameState.activeEffects.push({
        type: 'production_doubled',
        endTime: Date.now() + 30000
    });
    calculateProductionPerSecond();
    createConfetti();
}

function activateLinuxCode() {
    playSound('achievement');
    const bonus = gameState.productionPerSecond * 60;
    showNotification(`🐧 VIVE LINUX ! +${formatNumber(bonus)} points !`, 'achievement');
    gameState.score += bonus;
    gameState.totalScore += bonus;
    updateUI();
    createConfetti();
}

// Auto-save indicator
setInterval(() => {
    const lastSaveAgo = Math.floor((Date.now() - gameState.lastSave) / 1000);
    const autoSaveIndicator = document.getElementById('auto-save-indicator');
    if (autoSaveIndicator) {
        autoSaveIndicator.textContent = `💾 Sauvegardé il y a ${lastSaveAgo}s`;
    }
}, 1000);

// Debug console
window.DEBUG = {
    getState: () => gameState,
    addScore: (amount) => {
        gameState.score += amount;
        gameState.totalScore += amount;
        updateUI();
        console.log(`+${amount} points ajoutés`);
    },
    triggerBoss: () => showBoss(),
    triggerQuiz: () => showQuiz(),
    resetGame: () => resetGame(),
    unlockAll: () => {
        UPGRADES.forEach(u => u.unlocked = true);
        ACHIEVEMENTS.forEach(a => a.unlocked = true);
        if (typeof SKINS !== 'undefined') {
            gameState.skinsUnlocked = SKINS.map(s => s.id);
        }
        updateUI();
        console.log('Tout débloqué !');
    },
    setPrestige: (level) => {
        gameState.prestigeLevel = level;
        calculateProductionPerSecond();
        updateUI();
        console.log(`Niveau de prestige: ${level}`);
    },
    giveMax: () => {
        gameState.score = 999999999;
        gameState.totalScore = 999999999;
        updateUI();
        console.log('Score maxé !');
    }
};

console.log('%c🖥️ NIRD Clicker - Console Debug', 'font-size: 20px; color: #00d4aa;');
console.log('%cUtilisez window.DEBUG pour accéder aux commandes de débogage.', 'color: #aaa;');
console.log('%cExemple: window.DEBUG.addScore(1000)', 'color: #888; font-style: italic;');
