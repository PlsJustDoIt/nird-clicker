
// Audio context singleton (var pour compatibilité)
/**
 * NIRD Clicker - Système Audio
 * Sons synthétisés via Web Audio API
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 * @type {AudioContext | null}
 */
var audioContext = null;

/**
 * Initialise le contexte audio
 */
function initAudio() {
    if (audioContext) return;
    
    try {
        audioContext = new (window.AudioContext || window.AudioContext)();
        console.log('🔊 Audio initialisé');
    } catch (e) {
        console.log('🔇 Audio non supporté:', e.message);
    }
}

/**
 * Reprend le contexte audio (nécessaire après interaction utilisateur)
 */
function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Cache pour les sons MP3
var audioCache = {};

/**
 * Joue un fichier audio MP3
 * @param {string} src - Chemin vers le fichier audio
 */
function playAudioFile(src) {
    if (typeof gameState !== 'undefined' && !gameState.soundEnabled) return;
    
    try {
        // Créer ou réutiliser l'élément audio
        if (!audioCache[src]) {
            audioCache[src] = new Audio(src);
            audioCache[src].volume = 0.3;
        }
        
        // Remettre au début si déjà en cours
        audioCache[src].currentTime = 0;
        audioCache[src].play().catch(() => {});
    } catch (e) {
        console.log('Erreur lecture audio:', e.message);
    }
}

/**
 * Joue un son synthétisé
 * @param {string} type - Type de son: 'click', 'upgrade', 'achievement', 'boss', 'levelup', 'prestige', 'error'
 */
function playSound(type) {
    // Vérifier si le son est activé
    if (typeof gameState !== 'undefined' && !gameState.soundEnabled) return;
    if (!audioContext) return;
    
    // Son spécial pour le skin Star of David
    if (type === 'click' && typeof gameState !== 'undefined' && gameState.currentSkin === 'star-of-david') {
        playAudioFile('assets/Goy.mp3');
        return;
    }
    
    // Reprendre le contexte si suspendu
    resumeAudio();
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        
        switch(type) {
            case 'click':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.1;
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;
                
            case 'upgrade':
                oscillator.frequency.value = 523;
                oscillator.type = 'triangle';
                gainNode.gain.value = 0.15;
                oscillator.start(now);
                oscillator.frequency.exponentialRampToValueAtTime(1047, now + 0.15);
                oscillator.stop(now + 0.2);
                break;
                
            case 'achievement':
                oscillator.frequency.value = 440;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.2;
                oscillator.start(now);
                oscillator.frequency.setValueAtTime(554, now + 0.1);
                oscillator.frequency.setValueAtTime(659, now + 0.2);
                oscillator.stop(now + 0.4);
                break;
                
            case 'boss':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.value = 0.2;
                oscillator.start(now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                oscillator.stop(now + 0.3);
                break;
                
            case 'levelup':
                oscillator.frequency.value = 330;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.2;
                oscillator.start(now);
                oscillator.frequency.setValueAtTime(440, now + 0.1);
                oscillator.frequency.setValueAtTime(554, now + 0.2);
                oscillator.frequency.setValueAtTime(659, now + 0.3);
                oscillator.stop(now + 0.5);
                break;
                
            case 'prestige':
                oscillator.frequency.value = 220;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.25;
                oscillator.start(now);
                oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.5);
                oscillator.stop(now + 0.6);
                break;
                
            case 'error':
                oscillator.frequency.value = 200;
                oscillator.type = 'square';
                gainNode.gain.value = 0.1;
                oscillator.start(now);
                oscillator.frequency.setValueAtTime(150, now + 0.1);
                oscillator.stop(now + 0.2);
                break;
                
            case 'bonus':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.15;
                oscillator.start(now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.stop(now + 0.2);
                break;
                
            default:
                // Son générique
                oscillator.frequency.value = 440;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.1;
                oscillator.start(now);
                oscillator.stop(now + 0.1);
        }
    } catch (e) {
        console.log('Erreur audio:', e.message);
    }
}

/**
 * Joue une séquence de notes (pour les mélodies)
 * @param {Array} notes - Tableau de {freq, duration, delay}
 */
function playMelody(notes) {
    if (typeof gameState !== 'undefined' && !gameState.soundEnabled) return;
    if (!audioContext) return;
    
    resumeAudio();
    
    const now = audioContext.currentTime;
    
    notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.15;
        
        const startTime = now + (note.delay || 0);
        oscillator.start(startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
        oscillator.stop(startTime + note.duration);
    });
}

// Exposer globalement
window.initAudio = initAudio;
window.playSound = playSound;
window.playMelody = playMelody;
window.resumeAudio = resumeAudio;
