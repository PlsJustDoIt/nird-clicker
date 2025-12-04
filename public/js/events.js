/**
 * NIRD Clicker - Système d'événements
 * Gestion des événements aléatoires et spéciaux
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
    MILESTONE_EVENTS.forEach(event => {
        if (!event.triggered && gameState.totalScore >= event.score) {
            event.triggered = true;
            showMilestoneModal(event);
        }
    });
}

// Afficher une modal de milestone
function showMilestoneModal(event) {
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
    
    // Animation de confettis (simple)
    createConfetti();
}

// Confettis simples
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}

// Combo de clics
let clickCombo = 0;
let lastClickTime = 0;
const COMBO_TIMEOUT = 500; // ms

function trackClickCombo() {
    const now = Date.now();
    
    if (now - lastClickTime < COMBO_TIMEOUT) {
        clickCombo++;
        
        if (clickCombo === 10) {
            showNotification('🔥 Combo x10 ! Bonus +50 !', 'combo');
            gameState.score += 50;
            gameState.totalScore += 50;
        } else if (clickCombo === 25) {
            showNotification('🔥🔥 Combo x25 ! Bonus +200 !', 'combo');
            gameState.score += 200;
            gameState.totalScore += 200;
        } else if (clickCombo === 50) {
            showNotification('🔥🔥🔥 MEGA COMBO ! Bonus +1000 !', 'combo');
            gameState.score += 1000;
            gameState.totalScore += 1000;
        } else if (clickCombo >= 100) {
            showNotification('💀 COMBO LÉGENDAIRE ! Bonus +5000 !', 'combo');
            gameState.score += 5000;
            gameState.totalScore += 5000;
            clickCombo = 0; // Reset après le combo légendaire
        }
    } else {
        clickCombo = 1;
    }
    
    lastClickTime = now;
}

// Intégrer le combo au clic
const originalHandleClick = handleClick;
handleClick = function() {
    originalHandleClick();
    trackClickCombo();
    checkMilestoneEvents();
};

// Easter eggs
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === KONAMI_CODE[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI_CODE.length) {
            activateKonamiCode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateKonamiCode() {
    showNotification('🎮 KONAMI CODE ACTIVÉ ! +10000 points !', 'easter-egg');
    gameState.score += 10000;
    gameState.totalScore += 10000;
    updateUI();
    createConfetti();
}

// Mode nuit automatique
function checkNightMode() {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
        document.body.classList.add('night-mode');
        if (!localStorage.getItem('nightModeNotified')) {
            showNotification('🌙 Mode nuit activé pour vos yeux !', 'info');
            localStorage.setItem('nightModeNotified', 'true');
        }
    }
}

// Vérifier le mode nuit au chargement
setTimeout(checkNightMode, 2000);
