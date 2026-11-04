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
        title: 'Premier Éveil !',
        icon: 'sprout',
        message: 'Vous avez sensibilisé votre premier élève à la souveraineté numérique !'
    },
    {
        score: 1000,
        triggered: false,
        title: 'La Classe s\'éveille !',
        icon: 'school',
        message: 'Toute une classe est maintenant convertie au logiciel libre !'
    },
    {
        score: 10000,
        triggered: false,
        title: 'Le Village est né !',
        icon: 'houses',
        message: 'Votre établissement est devenu un véritable Village Numérique Responsable !'
    },
    {
        score: 100000,
        triggered: false,
        title: 'Reconnaissance Nationale !',
        icon: 'landmark',
        message: 'Le ministère vous cite en exemple ! Votre projet inspire la France entière !'
    },
    {
        score: 1000000,
        triggered: false,
        title: 'Libération totale !',
        icon: 'flag',
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
    
    document.body.classList.add('modal-open');
    
    const modal = document.createElement('div');
    modal.className = 'milestone-modal';
    modal.innerHTML = `
        <div class="milestone-content">
            <h2>${event.title}</h2>
            <p>${event.message}</p>
            <div class="milestone-celebration">${typeof icon === 'function' ? icon(event.icon || 'trophy') : ''}</div>
            <button class="milestone-close-btn">Continuer</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.milestone-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMilestoneModal(modal);
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeMilestoneModal(modal);
        }
    });
    
    createConfetti();
}

// Fermer la modal de milestone et traiter la queue
function closeMilestoneModal(modal) {
    if (!modal) {
        modal = document.querySelector('.milestone-modal');
    }
    
    document.body.classList.remove('modal-open');
    
    document.querySelectorAll('.milestone-modal').forEach(m => m.remove());
    document.querySelectorAll('.confetti').forEach(c => c.remove());
    
    if (typeof onEventComplete === 'function') {
        onEventComplete();
    }
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
        showNotification(`Combo x10 ! +${bonus} points !`, 'combo');
    } else if (combo === 25) {
        const bonus = 200;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        playSound('achievement');
        showNotification(`Combo x25 ! +${bonus} points !`, 'combo');
        checkDailyMissions();
    } else if (combo === 50) {
        const bonus = 1000;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        playSound('achievement');
        showNotification(`MEGA COMBO ! +${bonus} points !`, 'combo');
    } else if (combo === 100) {
        const bonus = 5000;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        playSound('prestige');
        showNotification(`COMBO LÉGENDAIRE ! +${bonus} points !`, 'combo');
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
    showNotification('KONAMI CODE ACTIVÉ ! +10000 points !', 'achievement');
    gameState.score += 10000;
    gameState.totalScore += 10000;
    updateUI();
    createConfetti();
}

function activateNirdCode() {
    playSound('achievement');
    showNotification('CODE NIRD ! Double production pendant 30s !', 'achievement');
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
    showNotification(`VIVE LINUX ! +${formatNumber(bonus)} points !`, 'achievement');
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
        autoSaveIndicator.textContent = `Sauvegardé il y a ${lastSaveAgo}s`;
    }
}, 1000);

// Debug console

console.log('%cNIRD Clicker - Console Debug', 'font-size: 20px; color: #00d4aa;');
console.log('%cUtilisez window.DEBUG pour accéder aux commandes de débogage.', 'color: #aaa;');
console.log('%cExemple: window.DEBUG.addScore(1000)', 'color: #888; font-style: italic;');

// ============================================
// ATTAQUE FACEBOOK NUCLÉAIRE 
// ============================================
let facebookAttackActive = false;
let facebookAttackInterval = null;
let facebookBonusGiven = false;
let vibrationInterval = null;

// Fonction pour faire vibrer le téléphone (si supporté)
function vibratePhone(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Démarre les vibrations pendant la vidéo
function startVideoVibration() {
    if (!('vibrate' in navigator)) return;
    
    // Vibration initiale intense (explosion nucléaire)
    navigator.vibrate([200, 100, 200, 100, 400]);
    
    // Vibrations continues pendant la vidéo (simule les tremblements)
    vibrationInterval = setInterval(() => {
        // Pattern aléatoire pour simuler des secousses
        const intensity = Math.random();
        if (intensity > 0.7) {
            // Forte vibration
            navigator.vibrate([150, 50, 150]);
        } else if (intensity > 0.3) {
            // Vibration moyenne
            navigator.vibrate([80, 40, 80]);
        } else {
            // Légère vibration
            navigator.vibrate([40]);
        }
    }, 500);
}

// Arrête les vibrations
function stopVideoVibration() {
    if (vibrationInterval) {
        clearInterval(vibrationInterval);
        vibrationInterval = null;
    }
    // Arrêter toute vibration en cours
    if ('vibrate' in navigator) {
        navigator.vibrate(0);
    }
}

function triggerFacebookAttack() {
    if (facebookAttackActive) return;
    facebookAttackActive = true;
    facebookBonusGiven = false;
    
    const modal = document.getElementById('facebook-attack-modal');
    const alertScreen = document.getElementById('facebook-alert-screen');
    const videoScreen = document.getElementById('facebook-video-screen');
    const alertBtn = document.getElementById('facebook-alert-btn');
    
    // Reset - montrer l'alerte, cacher la vidéo
    alertScreen.classList.remove('hidden');
    videoScreen.classList.add('hidden');
    
    // Afficher le modal
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open'); // Bloquer le scroll;
    
    // Montrer une notification
    if (typeof showNotification === 'function') {
        showNotification('ALERTE : Facebook tente une intrusion !', 'danger');
    }
    
    // Quand l'utilisateur clique sur le bouton d'alerte
    alertBtn.onclick = startFacebookVideo;
}

function startFacebookVideo() {
    const alertScreen = document.getElementById('facebook-alert-screen');
    const videoScreen = document.getElementById('facebook-video-screen');
    const video = document.getElementById('facebook-attack-video');
    const progressBar = document.getElementById('facebook-attack-progress-bar');
    const closeBtn = document.getElementById('facebook-attack-close-btn');
    const warningText = document.querySelector('#facebook-video-screen .attack-warning');
    
    // Cacher l'alerte, montrer la vidéo
    alertScreen.classList.add('hidden');
    videoScreen.classList.remove('hidden');
    
    // Reset
    progressBar.style.width = '0%';
    closeBtn.classList.add('hidden');
    warningText.textContent = 'RIPOSTE EN COURS...';
    
    // Jouer la vidéo (maintenant c'est après un clic utilisateur, donc l'audio marche)
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play().catch(err => console.log('Video play error:', err));
    
    // Démarrer les vibrations sur mobile 
    startVideoVibration();
    
    // Jouer le son d'alerte si disponible
    if (typeof playSound === 'function') {
        playSound('boss');
    }
    
    // Quand la vidéo se termine -> fermeture automatique
    video.onended = () => {
        console.log('Vidéo terminée, fermeture auto...');
        // Arrêter les vibrations
        stopVideoVibration();
        // Donner le bonus avant de fermer
        if (!facebookBonusGiven) {
            facebookBonusGiven = true;
            const bonus = Math.floor((gameState.productionPerSecond || 0) * 30 + 500);
            gameState.score += bonus;
            gameState.totalScore += bonus;
            
            if (typeof showNotification === 'function') {
                showNotification(`Facebook repoussé ! +${typeof formatNumber === 'function' ? formatNumber(bonus) : bonus} points !`, 'success');
            }
            
            if (typeof createConfetti === 'function') {
                createConfetti();
            }
        }
        // Fermer après un court délai
        setTimeout(() => {
            closeFacebookAttack();
        }, 500);
    };
}

function finishFacebookAttack() {
    const progressBar = document.getElementById('facebook-attack-progress-bar');
    const closeBtn = document.getElementById('facebook-attack-close-btn');
    const warningText = document.querySelector('#facebook-video-screen .attack-warning');
    
    if (facebookAttackInterval) {
        clearInterval(facebookAttackInterval);
        facebookAttackInterval = null;
    }
    
    progressBar.style.width = '100%';
    closeBtn.classList.remove('hidden');
    warningText.textContent = 'PROTECTION ACTIVÉE !';
    
    // Donner le bonus (une seule fois)
    if (!facebookBonusGiven) {
        facebookBonusGiven = true;
        const bonus = Math.floor(gameState.productionPerSecond * 30 + 500);
        
        if (typeof playSound === 'function') {
            playSound('achievement');
        }
        
        warningText.innerHTML = `DONNÉES PROTÉGÉES ! <span class="attack-bonus">+${typeof formatNumber === 'function' ? formatNumber(bonus) : bonus} points</span>`;
    }
}

function closeFacebookAttack() {
    console.log('Fermeture attaque Facebook...');
    const modal = document.getElementById('facebook-attack-modal');
    const video = document.getElementById('facebook-attack-video');
    const alertScreen = document.getElementById('facebook-alert-screen');
    const videoScreen = document.getElementById('facebook-video-screen');
    
    if (!modal) return;
    
    // Arrêter les vibrations
    stopVideoVibration();
    
    // Arrêter la vidéo
    if (video) {
        video.pause();
        video.currentTime = 0;
        video.onended = null; // Supprimer le handler pour éviter les appels multiples
    }
    
    // Cacher le modal
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open'); // Réactiver le scroll
    if (alertScreen) alertScreen.classList.remove('hidden');
    if (videoScreen) videoScreen.classList.add('hidden');
    
    // Arrêter l'interval
    if (facebookAttackInterval) {
        clearInterval(facebookAttackInterval);
        facebookAttackInterval = null;
    }
    
    // Bonus (seulement si pas déjà donné)
    if (!facebookBonusGiven) {
        facebookBonusGiven = true;
        const bonus = Math.floor(gameState.productionPerSecond * 30 + 500);
        gameState.score += bonus;
        gameState.totalScore += bonus;
        
        if (typeof showNotification === 'function') {
            showNotification(`Facebook repoussé ! +${typeof formatNumber === 'function' ? formatNumber(bonus) : bonus} points !`, 'success');
        }
        
        if (typeof createConfetti === 'function') {
            createConfetti();
        }
    }
    
    // Update UI
    if (typeof updateUI === 'function') {
        updateUI();
    }
    
    // Reset
    facebookAttackActive = false;
    
    // Sauvegarder
    if (typeof saveGame === 'function') {
        saveGame();
    }
}

// Déclencher l'attaque Facebook aléatoirement (environ toutes les 3-5 minutes de jeu)
function scheduleFacebookAttack() {
    const minDelay = 180000; // 3 minutes
    const maxDelay = 300000; // 5 minutes
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    setTimeout(() => {
        // Ne déclencher que si le joueur a un certain niveau
        if (gameState.totalScore >= 5000 && !facebookAttackActive) {
            triggerFacebookAttack();
        }
        // Programmer la prochaine attaque
        scheduleFacebookAttack();
    }, delay);
}

// Démarrer le système d'attaques Facebook après un délai initial
setTimeout(() => {
    scheduleFacebookAttack();
}, 60000); // Première attaque possible après 1 minute



// Rendre les fonctions accessibles globalement pour les onclick HTML
window.closeMilestoneModal = closeMilestoneModal;
window.closeFacebookAttack = closeFacebookAttack;
window.triggerFacebookAttack = triggerFacebookAttack;
window.startFacebookVideo = startFacebookVideo;

// ============================================
// SYSTÈME D'ÉVÉNEMENTS ALÉATOIRES
// ============================================

/**
 * Déclenche un événement aléatoire et applique ses effets
 * @param {Object} event - L'événement à déclencher
 */
function triggerRandomEvent(event) {
    if (!event) return;
    
    // Afficher la notification
    if (typeof showNotification === 'function') {
        showNotification(`<strong>${event.name}</strong> ${event.description}`, 'event', 4000, event.icon);
    }
    
    // Jouer le son
    if (typeof playSound === 'function') {
        playSound('event');
    }
    
    // Appliquer l'effet selon son type
    switch(event.effect) {
        case 'instant_bonus':
            // Bonus instantané basé sur la production
            const bonus = Math.floor(gameState.productionPerSecond * (event.bonusMultiplier || 10));
            gameState.score += bonus;
            gameState.totalScore += bonus;
            if (typeof showNotification === 'function') {
                showNotification(`+${formatNumber(bonus)} points !`, 'success');
            }
            break;
            
        case 'production_doubled':
            gameState.activeEffects.push({
                type: 'production_doubled',
                endTime: Date.now() + (event.duration || 10000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'production_tripled':
            gameState.activeEffects.push({
                type: 'production_tripled',
                endTime: Date.now() + (event.duration || 10000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'production_x5':
            gameState.activeEffects.push({
                type: 'production_x5',
                endTime: Date.now() + (event.duration || 10000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'production_x10':
            gameState.activeEffects.push({
                type: 'production_x10',
                endTime: Date.now() + (event.duration || 10000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'production_x20':
            gameState.activeEffects.push({
                type: 'production_x20',
                endTime: Date.now() + (event.duration || 10000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'production_x100':
            gameState.activeEffects.push({
                type: 'production_x100',
                endTime: Date.now() + (event.duration || 5000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'production_halved':
            gameState.activeEffects.push({
                type: 'production_halved',
                endTime: Date.now() + (event.duration || 10000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'production_div10':
            gameState.activeEffects.push({
                type: 'production_div10',
                endTime: Date.now() + (event.duration || 10000)
            });
            if (typeof calculateProductionPerSecond === 'function') calculateProductionPerSecond();
            break;
            
        case 'clicks_x10':
            gameState.activeEffects.push({
                type: 'clicks_x10',
                endTime: Date.now() + (event.duration || 10000)
            });
            break;
            
        case 'randomize_costs':
            // Effet Mandela : les coûts sont temporairement aléatoires
            gameState.activeEffects.push({
                type: 'randomize_costs',
                endTime: Date.now() + (event.duration || 30000)
            });
            if (typeof renderUpgrades === 'function') renderUpgrades();
            break;
            
        case 'bonus_per_second':
            // Bonus par seconde pendant la durée
            const bonusPerSec = event.bonusPerSecond || 1000;
            const duration = event.duration || 20000;
            const interval = setInterval(() => {
                gameState.score += bonusPerSec;
                gameState.totalScore += bonusPerSec;
                if (typeof updateUI === 'function') updateUI();
            }, 1000);
            setTimeout(() => clearInterval(interval), duration);
            break;
            
        default:
            console.log(`Effet non géré: ${event.effect}`);
    }
    
    // Mettre à jour l'UI
    if (typeof updateUI === 'function') updateUI();
    
    // Confettis pour les événements positifs
    if (event.effect && !event.effect.includes('halved') && !event.effect.includes('div')) {
        if (typeof createConfetti === 'function') createConfetti();
    }
}

// Fonction utilitaire pour déclencher un event par id
function triggerRandomEventById(id) {
    if (typeof RANDOM_EVENTS === 'undefined') return;
    const event = RANDOM_EVENTS.find(e => e.id === id);
    if (event) {
        triggerRandomEvent(event);
        console.log(`Event déclenché: ${id}`);
    } else {
        console.warn('Event non trouvé:', id);
    }
}

// Exposer les fonctions globalement pour DEBUG
window.triggerRandomEvent = triggerRandomEvent;
window.triggerRandomEventById = triggerRandomEventById;

// ============================================
// ATTAQUE OPENAI (MODE VIDÉO) - basé sur l'attaque Facebook
// ============================================
let openaiAttackActive = false;
let openaiAttackInterval = null;
let openaiBonusGiven = false;

function triggerOpenaiAttack() {
    if (openaiAttackActive) return;
    openaiAttackActive = true;
    openaiBonusGiven = false;

    const modal = document.getElementById('openai-attack-modal');
    const alertScreen = document.getElementById('openai-alert-screen');
    const videoScreen = document.getElementById('openai-video-screen');
    const alertBtn = document.getElementById('openai-alert-btn');

    // Reset - montrer l'alerte, cacher la vidéo
    alertScreen.classList.remove('hidden');
    videoScreen.classList.add('hidden');

    // Afficher le modal
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');

    if (typeof showNotification === 'function') {
        showNotification('ALERTE : OpenAI tente une intrusion !', 'danger');
    }

    alertBtn.onclick = startOpenaiVideo;
}

function startOpenaiVideo() {
    const alertScreen = document.getElementById('openai-alert-screen');
    const videoScreen = document.getElementById('openai-video-screen');
    const video = document.getElementById('openai-attack-video');
    const progressBar = document.getElementById('openai-attack-progress-bar');
    const closeBtn = document.getElementById('openai-attack-close-btn');
    const warningText = document.querySelector('#openai-video-screen .attack-warning');

    alertScreen.classList.add('hidden');
    videoScreen.classList.remove('hidden');

    progressBar.style.width = '0%';
    closeBtn.classList.add('hidden');
    warningText.textContent = 'RIPOSTE EN COURS...';

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play().catch(err => console.log('OpenAI video play error:', err));

    // Réutiliser la vibration globale si disponible
    startVideoVibration();

    if (typeof playSound === 'function') {
        playSound('boss');
    }

    video.onended = () => {
        stopVideoVibration();
        if (!openaiBonusGiven) {
            openaiBonusGiven = true;
            const bonus = Math.floor((gameState.productionPerSecond || 0) * 30 + 600);
            gameState.score += bonus;
            gameState.totalScore += bonus;
            if (typeof showNotification === 'function') {
                showNotification(`OpenAI repoussé ! +${typeof formatNumber === 'function' ? formatNumber(bonus) : bonus} points !`, 'success');
            }
            if (typeof createConfetti === 'function') createConfetti();
        }
        setTimeout(() => {
            closeOpenaiAttack();
        }, 500);
    };
}

function finishOpenaiAttack() {
    const progressBar = document.getElementById('openai-attack-progress-bar');
    const closeBtn = document.getElementById('openai-attack-close-btn');
    const warningText = document.querySelector('#openai-video-screen .attack-warning');

    if (openaiAttackInterval) {
        clearInterval(openaiAttackInterval);
        openaiAttackInterval = null;
    }

    progressBar.style.width = '100%';
    closeBtn.classList.remove('hidden');
    warningText.textContent = 'PROTECTION ACTIVÉE !';

    if (!openaiBonusGiven) {
        openaiBonusGiven = true;
        const bonus = Math.floor(gameState.productionPerSecond * 30 + 600);
        if (typeof playSound === 'function') playSound('achievement');
        warningText.innerHTML = `DONNÉES PROTÉGÉES ! <span class="attack-bonus">+${typeof formatNumber === 'function' ? formatNumber(bonus) : bonus} points</span>`;
    }
}

function closeOpenaiAttack() {
    const modal = document.getElementById('openai-attack-modal');
    const video = document.getElementById('openai-attack-video');
    const alertScreen = document.getElementById('openai-alert-screen');
    const videoScreen = document.getElementById('openai-video-screen');

    if (!modal) return;

    stopVideoVibration();

    if (video) {
        video.pause();
        video.currentTime = 0;
        video.onended = null;
    }

    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    if (alertScreen) alertScreen.classList.remove('hidden');
    if (videoScreen) videoScreen.classList.add('hidden');

    if (openaiAttackInterval) {
        clearInterval(openaiAttackInterval);
        openaiAttackInterval = null;
    }

    if (!openaiBonusGiven) {
        openaiBonusGiven = true;
        const bonus = Math.floor(gameState.productionPerSecond * 30 + 600);
        gameState.score += bonus;
        gameState.totalScore += bonus;
        if (typeof showNotification === 'function') showNotification(`OpenAI repoussé ! +${typeof formatNumber === 'function' ? formatNumber(bonus) : bonus} points !`, 'success');
        if (typeof createConfetti === 'function') createConfetti();
    }

    if (typeof updateUI === 'function') updateUI();

    openaiAttackActive = false;

    if (typeof saveGame === 'function') saveGame();
}

function scheduleOpenaiAttack() {
    const minDelay = 180000; // 3 minutes
    const maxDelay = 300000; // 5 minutes
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    setTimeout(() => {
        if (gameState.totalScore >= 7000 && !openaiAttackActive) {
            triggerOpenaiAttack();
        }
        scheduleOpenaiAttack();
    }, delay);
}

setTimeout(() => {
    scheduleOpenaiAttack();
}, 60000);

window.closeOpenaiAttack = closeOpenaiAttack;
window.triggerOpenaiAttack = triggerOpenaiAttack;
window.startOpenaiVideo = startOpenaiVideo;

