/**
 * NIRD Clicker - Interface Utilisateur (Version Allégée)
 * Ce fichier contient uniquement ce qui n'est pas dans les modules ui/
 * - Système de queue d'événements
 * - Event listeners
 * - Easter Egg Snake Game
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Variable pour le multiplicateur d'achat
let buyMultiplier = 1;
var buyMode = 1; // Alias pour compatibilité avec les modules

// Variables pour le mouvement boss (utilisées par boss.js)
let lastMoveX = 0;
let lastMoveY = 0;

// ============================================
// SYSTÈME DE QUEUE D'ÉVÉNEMENTS
// Évite les conflits entre boss et quiz
// ============================================
let eventQueue = [];
let isEventInProgress = false;

/**
 * Vérifie si un événement (boss ou quiz) est actuellement actif
 */
function isEventActive() {
    // Vérifier si un boss est actif
    const bossModal = document.getElementById('boss-modal');
    const isBossActive = bossModal && !bossModal.classList.contains('hidden');
    
    // Vérifier si un quiz est actif
    const quizModal = document.querySelector('.quiz-modal');
    const isQuizActive = quizModal !== null;
    
    // Vérifier si un milestone est actif
    const milestoneModal = document.querySelector('.milestone-modal');
    const isMilestoneActive = milestoneModal !== null;
    
    return isBossActive || isQuizActive || isMilestoneActive || isEventInProgress;
}

/**
 * Ajoute un événement à la queue s'il n'y en a pas déjà du même type
 */
function queueEvent(type, data = null) {
    // Éviter les doublons du même type
    const hasSameType = eventQueue.some(e => e.type === type);
    if (!hasSameType) {
        eventQueue.push({ type, data });
        console.log(`📋 Événement "${type}" ajouté à la queue. File d'attente: ${eventQueue.length}`);
    }
}

/**
 * Traite le prochain événement dans la queue
 */
function processEventQueue() {
    // Attendre un court délai pour laisser les modales se fermer proprement
    setTimeout(() => {
        if (eventQueue.length === 0) {
            console.log('📋 Queue d\'événements vide.');
            return;
        }
        
        if (isEventActive()) {
            console.log('📋 Un événement est encore actif, attente...');
            return;
        }
        
        const event = eventQueue.shift();
        console.log(`📋 Traitement de l'événement "${event.type}". Restants: ${eventQueue.length}`);
        
        isEventInProgress = true;
        
        switch(event.type) {
            case 'boss':
                _showBossInternal(event.data);
                break;
            case 'quiz':
                _showQuizInternal();
                break;
            default:
                console.warn('Type d\'événement inconnu:', event.type);
                isEventInProgress = false;
        }
    }, 300);
}

/**
 * Appelé quand un événement se termine
 */
function onEventComplete() {
    isEventInProgress = false;
    processEventQueue();
}

// ============================================
// INITIALISATION DES EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Clic principal
    document.getElementById('main-clicker').addEventListener('click', handleClick);
    
    // Empêcher la fermeture du boss en cliquant sur l'overlay
    document.getElementById('boss-modal').addEventListener('click', (e) => {
        // Bloquer tous les clics sur l'overlay (fond noir)
        e.stopPropagation();
        e.preventDefault();
    });
    
    // Permettre les clics à l'intérieur du contenu du boss
    document.querySelector('#boss-modal .boss-content, #boss-modal .modal-content')?.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher la propagation vers l'overlay
    });
    
    // Boutons multiplicateur
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mult = btn.dataset.mult;
            setBuyMultiplier(mult === 'max' ? 'max' : parseInt(mult));
        });
    });
    
    // Bouton Prestige
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
        prestigeBtn.addEventListener('click', doPrestige);
    }
    
    // Boutons menu
    document.getElementById('settings-btn')?.addEventListener('click', openSettingsMenu);
    document.getElementById('achievements-btn')?.addEventListener('click', openAchievementsMenu);
    document.getElementById('encyclopedia-btn')?.addEventListener('click', openEncyclopedia);
    document.getElementById('stats-btn')?.addEventListener('click', openStatsMenu);
    document.getElementById('leaderboard-btn')?.addEventListener('click', openLeaderboard);
    
    // Easter Egg - Snake Game
    document.getElementById('easter-egg-btn')?.addEventListener('click', openSnakeGame);
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            if (!document.getElementById('boss-modal').classList.contains('hidden')) {
                handleBossClick();
            } else if (!document.querySelector('.quiz-modal')) {
                handleClick();
            }
            e.preventDefault();
        }
        // Fermer les modals avec Escape
        if (e.code === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => {
                if (!m.id) m.remove();
            });
            closeSnakeGame();
        }
    });
}

// ============================================
// EASTER EGG - SNAKE GAME
// ============================================
let snakeGame = {
    canvas: null,
    ctx: null,
    snake: [],
    food: null,
    direction: 'right',
    nextDirection: 'right',
    gameLoop: null,
    score: 0,
    highScore: 0,
    gridSize: 15,
    tileCount: 20,
    isRunning: false
};

function openSnakeGame() {
    const modal = document.getElementById('snake-modal');
    modal.classList.remove('hidden');
    
    // Fermer l'encyclopédie
    document.getElementById('encyclopedia-modal')?.classList.add('hidden');
    
    // Initialiser le canvas
    snakeGame.canvas = document.getElementById('snake-canvas');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
    snakeGame.tileCount = snakeGame.canvas.width / snakeGame.gridSize;
    
    // Charger le high score
    snakeGame.highScore = parseInt(localStorage.getItem('nirdClicker_snakeHighScore') || '0');
    document.getElementById('snake-high-score').textContent = snakeGame.highScore;
    
    // Dessiner l'écran initial
    drawSnakeGame();
    
    showNotification('🐍 Easter Egg découvert !', 'success');
}

function closeSnakeGame() {
    const modal = document.getElementById('snake-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    stopSnakeGame();
}

function startSnakeGame() {
    // Reset du jeu
    snakeGame.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    snakeGame.direction = 'right';
    snakeGame.nextDirection = 'right';
    snakeGame.score = 0;
    snakeGame.isRunning = true;
    
    document.getElementById('snake-score').textContent = '0';
    document.getElementById('snake-start-btn').disabled = true;
    document.getElementById('snake-start-btn').textContent = '🎮 En cours...';
    
    spawnFood();
    
    // Démarrer la boucle de jeu
    if (snakeGame.gameLoop) clearInterval(snakeGame.gameLoop);
    snakeGame.gameLoop = setInterval(updateSnakeGame, 120);
    
    // Ajouter les contrôles clavier
    document.addEventListener('keydown', handleSnakeKeydown);
}

function stopSnakeGame() {
    snakeGame.isRunning = false;
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
        snakeGame.gameLoop = null;
    }
    document.removeEventListener('keydown', handleSnakeKeydown);
    
    const startBtn = document.getElementById('snake-start-btn');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = '🎮 Rejouer';
    }
}

function handleSnakeKeydown(e) {
    if (!snakeGame.isRunning) return;
    
    const keyMap = {
        'ArrowUp': 'up', 'KeyW': 'up', 'KeyZ': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'ArrowLeft': 'left', 'KeyA': 'left', 'KeyQ': 'left',
        'ArrowRight': 'right', 'KeyD': 'right'
    };
    
    const newDir = keyMap[e.code];
    if (newDir) {
        setSnakeDirection(newDir);
        e.preventDefault();
    }
}

function setSnakeDirection(dir) {
    if (!snakeGame.isRunning) return;
    
    const opposites = {
        'up': 'down', 'down': 'up',
        'left': 'right', 'right': 'left'
    };
    
    // Ne pas permettre de faire demi-tour
    if (opposites[dir] !== snakeGame.direction) {
        snakeGame.nextDirection = dir;
    }
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        snakeGame.food = {
            x: Math.floor(Math.random() * snakeGame.tileCount),
            y: Math.floor(Math.random() * snakeGame.tileCount)
        };
        
        // Vérifier que la nourriture n'est pas sur le serpent
        validPosition = !snakeGame.snake.some(seg => 
            seg.x === snakeGame.food.x && seg.y === snakeGame.food.y
        );
    }
}

function updateSnakeGame() {
    if (!snakeGame.isRunning) return;
    
    snakeGame.direction = snakeGame.nextDirection;
    
    // Calculer la nouvelle position de la tête
    const head = { ...snakeGame.snake[0] };
    
    switch (snakeGame.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Vérifier les collisions avec les murs
    if (head.x < 0 || head.x >= snakeGame.tileCount || 
        head.y < 0 || head.y >= snakeGame.tileCount) {
        gameOverSnake();
        return;
    }
    
    // Vérifier les collisions avec soi-même
    if (snakeGame.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOverSnake();
        return;
    }
    
    // Ajouter la nouvelle tête
    snakeGame.snake.unshift(head);
    
    // Vérifier si on mange la nourriture
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score++;
        document.getElementById('snake-score').textContent = snakeGame.score;
        spawnFood();
        playSound('click');
    } else {
        // Retirer la queue si on n'a pas mangé
        snakeGame.snake.pop();
    }
    
    drawSnakeGame();
}

function drawSnakeGame() {
    const ctx = snakeGame.ctx;
    const size = snakeGame.gridSize;
    
    // Effacer le canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    // Dessiner la grille (subtile)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i <= snakeGame.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, snakeGame.canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * size);
        ctx.lineTo(snakeGame.canvas.width, i * size);
        ctx.stroke();
    }
    
    // Dessiner la nourriture (pomme)
    if (snakeGame.food) {
        ctx.font = `${size - 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍎', 
            snakeGame.food.x * size + size / 2, 
            snakeGame.food.y * size + size / 2
        );
    }
    
    // Dessiner le serpent
    snakeGame.snake.forEach((seg, i) => {
        if (i === 0) {
            // Tête avec emoji
            ctx.font = `${size - 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐍', seg.x * size + size / 2, seg.y * size + size / 2);
        } else {
            // Corps avec dégradé
            const gradient = ctx.createRadialGradient(
                seg.x * size + size / 2, seg.y * size + size / 2, 0,
                seg.x * size + size / 2, seg.y * size + size / 2, size / 2
            );
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#22c55e');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(seg.x * size + size / 2, seg.y * size + size / 2, size / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Message de démarrage si le jeu n'est pas en cours
    if (!snakeGame.isRunning && snakeGame.snake.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Appuie sur Jouer !', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2);
    }
}

function gameOverSnake() {
    stopSnakeGame();
    
    // Calculer les points gagnés (10 points par pomme)
    const pointsEarned = snakeGame.score * 10;
    
    // Mettre à jour le high score
    if (snakeGame.score > snakeGame.highScore) {
        snakeGame.highScore = snakeGame.score;
        localStorage.setItem('nirdClicker_snakeHighScore', snakeGame.highScore.toString());
        document.getElementById('snake-high-score').textContent = snakeGame.highScore;
    }
    
    // Ajouter les points au jeu principal
    if (pointsEarned > 0) {
        gameState.score += pointsEarned;
        gameState.totalScore += pointsEarned;
        updateUI();
        saveGame();
    }
    
    // Afficher le message de fin
    const ctx = snakeGame.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 24px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 - 30);
    
    ctx.fillStyle = '#4ade80';
    ctx.font = '16px Roboto, sans-serif';
    ctx.fillText(`Score: ${snakeGame.score} 🍎`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 10);
    
    ctx.fillStyle = '#facc15';
    ctx.fillText(`+${pointsEarned} Points de Souveraineté!`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 40);
    
    if (pointsEarned > 0) {
        showNotification(`🐍 Snake terminé ! +${pointsEarned} points !`, 'success');
    }
}

// Exposer les fonctions globalement
window.initEventListeners = initEventListeners;
window.isEventActive = isEventActive;
window.queueEvent = queueEvent;
window.processEventQueue = processEventQueue;
window.onEventComplete = onEventComplete;
window.openSnakeGame = openSnakeGame;
window.closeSnakeGame = closeSnakeGame;
window.startSnakeGame = startSnakeGame;
window.setSnakeDirection = setSnakeDirection;
