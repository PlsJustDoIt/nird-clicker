/**
 * @file NIRD Clicker - Système audio
 * @description Sons synthétisés en temps réel via la Web Audio API (aucun fichier à charger).
 *              Chaîne : voix -> bus maître (+ réverbération légère) -> compresseur -> sortie.
 *              Chaque son utilise de vraies enveloppes (pas de « clic » numérique),
 *              des timbres de cloche FM et de légères variations aléatoires pour éviter la lassitude.
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

/** @type {AudioContext | null} Contexte audio (singleton) */
var audioContext = null;

/** @type {{input: GainNode, reverb: GainNode} | null} Bus de mixage */
var audioBus = null;

/** @type {AudioBuffer | null} Bruit blanc réutilisable */
var noiseBuffer = null;

/** Nombre de voix actives (limite pour les clics très rapides) */
var activeVoices = 0;
var MAX_VOICES = 28;

/** Horodatage du dernier clic (adoucit les rafales) */
var lastClickAt = 0;

/** Volume général (0 à 1) */
var MASTER_VOLUME = 0.9;

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le contexte audio et le bus de mixage
 */
function initAudio() {
    if (audioContext) return;

    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioContext = new Ctx();
        buildAudioBus();

        // Les navigateurs exigent une interaction avant de jouer du son
        const unlock = () => resumeAudio();
        ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
            window.addEventListener(ev, unlock, { once: true, passive: true })
        );
    } catch (e) {
        console.log('Audio non supporté:', e.message);
    }
}

/**
 * Construit la chaîne de mixage : compresseur, réverbération et bus maître
 */
function buildAudioBus() {
    const ctx = audioContext;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.2;
    compressor.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(compressor);

    // Réverbération : réponse impulsionnelle générée (petite salle douce)
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulse(1.8, 2.6);
    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.55;
    const reverbTone = ctx.createBiquadFilter();
    reverbTone.type = 'lowpass';
    reverbTone.frequency.value = 5200;
    convolver.connect(reverbTone);
    reverbTone.connect(reverbReturn);
    reverbReturn.connect(master);

    const reverbSend = ctx.createGain();
    reverbSend.gain.value = 1;
    reverbSend.connect(convolver);

    audioBus = { input: master, reverb: reverbSend };

    // Bruit blanc (1 s) pour les transitoires et les nappes
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

/**
 * Génère une réponse impulsionnelle stéréo pour la réverbération
 * @param {number} duration - Durée en secondes
 * @param {number} decay - Vitesse de décroissance
 * @returns {AudioBuffer} Réponse impulsionnelle
 */
function createImpulse(duration, decay) {
    const ctx = audioContext;
    const length = Math.floor(ctx.sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    return impulse;
}

/**
 * Reprend le contexte audio (nécessaire après interaction utilisateur)
 */
function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// ============================================
// BRIQUES DE SYNTHÈSE
// ============================================

/**
 * Relie un nœud au bus maître, avec panoramique et envoi de réverbération
 * @param {AudioNode} node - Nœud de sortie de la voix
 * @param {number} [reverb=0] - Quantité de réverbération (0 à 1)
 * @param {number} [pan=0] - Panoramique (-1 à 1)
 * @param {number} [endTime] - Fin de la voix (pour le comptage des voix)
 */
function routeVoice(node, reverb = 0, pan = 0, endTime = null) {
    let out = node;
    if (pan && audioContext.createStereoPanner) {
        const panner = audioContext.createStereoPanner();
        panner.pan.value = pan;
        node.connect(panner);
        out = panner;
    }
    out.connect(audioBus.input);
    if (reverb > 0) {
        const send = audioContext.createGain();
        send.gain.value = reverb;
        out.connect(send);
        send.connect(audioBus.reverb);
    }
    if (endTime) {
        activeVoices++;
        setTimeout(() => { activeVoices = Math.max(0, activeVoices - 1); },
            Math.max(0, (endTime - audioContext.currentTime) * 1000) + 50);
    }
}

/**
 * Applique une enveloppe attaque / décroissance exponentielle
 * @param {AudioParam} param - Paramètre de gain
 * @param {number} t - Début
 * @param {number} attack - Durée d'attaque (s)
 * @param {number} peak - Niveau maximal
 * @param {number} decay - Durée de décroissance (s)
 */
function envelope(param, t, attack, peak, decay) {
    param.cancelScheduledValues(t);
    param.setValueAtTime(0.0001, t);
    param.linearRampToValueAtTime(peak, t + attack);
    param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

/**
 * Joue un oscillateur simple avec enveloppe, glissando et filtre optionnels
 * @param {object} o - Options
 * @returns {number} Instant de fin
 */
function tone(o) {
    const ctx = audioContext;
    const t = o.t ?? ctx.currentTime;
    const attack = o.attack ?? 0.004;
    const decay = o.decay ?? 0.2;
    const end = t + attack + decay + 0.05;

    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t + (o.glideTime ?? 0.08));
    if (o.detune) osc.detune.value = o.detune;

    const gain = ctx.createGain();
    envelope(gain.gain, t, attack, o.peak ?? 0.15, decay);

    let last = osc;
    if (o.filter) {
        const f = ctx.createBiquadFilter();
        f.type = o.filter.type || 'lowpass';
        f.Q.value = o.filter.Q ?? 0.7;
        f.frequency.setValueAtTime(o.filter.freq, t);
        if (o.filter.to) f.frequency.exponentialRampToValueAtTime(o.filter.to, t + (o.filter.time ?? decay));
        osc.connect(f);
        last = f;
    }
    last.connect(gain);
    routeVoice(gain, o.reverb || 0, o.pan || 0, end);

    osc.start(t);
    osc.stop(end);
    return end;
}

/**
 * Note de cloche en synthèse FM (attaque brillante, queue douce)
 * @param {number} freq - Fréquence (Hz)
 * @param {number} t - Début
 * @param {object} [o] - Options : decay, peak, reverb, pan, ratio, index
 */
function bell(freq, t, o = {}) {
    const ctx = audioContext;
    const decay = o.decay ?? 0.8;
    const peak = o.peak ?? 0.1;
    const end = t + decay + 0.1;

    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = freq;

    const mod = ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.value = freq * (o.ratio ?? 3.5);
    const modGain = ctx.createGain();
    const index = freq * (o.index ?? 1.6);
    modGain.gain.setValueAtTime(index, t);
    modGain.gain.exponentialRampToValueAtTime(Math.max(1, index * 0.02), t + decay * 0.6);
    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    const gain = ctx.createGain();
    envelope(gain.gain, t, 0.003, peak, decay);
    carrier.connect(gain);

    // Partiel à l'octave pour la brillance
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = freq * 2;
    const shimmerGain = ctx.createGain();
    envelope(shimmerGain.gain, t, 0.002, peak * 0.25, decay * 0.4);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(gain);

    routeVoice(gain, o.reverb ?? 0.3, o.pan || 0, end);

    [carrier, mod, shimmer].forEach(n => { n.start(t); n.stop(end); });
}

/**
 * Bouffée de bruit filtré (transitoire, souffle, montée)
 * @param {object} o - Options : t, decay, peak, type, freq, to, Q, attack, reverb, pan
 */
function noise(o) {
    const ctx = audioContext;
    const t = o.t ?? ctx.currentTime;
    const attack = o.attack ?? 0.002;
    const decay = o.decay ?? 0.05;
    const end = t + attack + decay + 0.05;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.Q.value = o.Q ?? 1;
    f.frequency.setValueAtTime(o.freq ?? 3000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + attack + decay);

    const gain = ctx.createGain();
    envelope(gain.gain, t, attack, o.peak ?? 0.05, decay);

    src.connect(f);
    f.connect(gain);
    routeVoice(gain, o.reverb || 0, o.pan || 0, end);

    src.start(t, Math.random() * 0.5);
    src.stop(end);
}

/**
 * Valeur aléatoire autour de 1 (humanisation)
 * @param {number} amount - Amplitude (ex. 0.03 = ±3 %)
 * @returns {number} Facteur
 */
function jitter(amount) {
    return 1 + (Math.random() * 2 - 1) * amount;
}

// ============================================
// FICHIERS AUDIO
// ============================================

/** Cache pour les fichiers audio */
var audioCache = {};

/**
 * Joue un fichier audio
 * @param {string} src - Chemin vers le fichier audio
 */
function playAudioFile(src) {
    if (typeof gameState !== 'undefined' && !gameState.soundEnabled) return;

    try {
        if (!audioCache[src]) {
            audioCache[src] = new Audio(src);
            audioCache[src].volume = 0.3;
        }
        audioCache[src].currentTime = 0;
        audioCache[src].play().catch(() => {});
    } catch (e) {
        console.log('Erreur lecture audio:', e.message);
    }
}

// ============================================
// SONS DU JEU
// ============================================

/** Fréquences de notes (Hz) */
var NOTE = {
    C4: 261.63, G3: 196.0, E4: 329.63, G4: 392.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.0, B6: 1975.53
};

var SOUNDS = {
    /** Clic : « pop » rond, légèrement plus aigu quand le combo monte */
    click(t) {
        const now = audioContext.currentTime;
        const burst = now - lastClickAt < 0.04;
        lastClickAt = now;
        if (activeVoices > MAX_VOICES) return;

        const combo = (typeof gameState !== 'undefined' && gameState.currentCombo) || 0;
        const base = 440 * (1 + Math.min(combo, 80) * 0.004) * jitter(0.04);
        const level = burst ? 0.6 : 1;
        const pan = (Math.random() - 0.5) * 0.3;

        tone({ t, freq: base * 2.2, glideTo: base, glideTime: 0.035, attack: 0.002, decay: 0.09, peak: 0.22 * level, pan, reverb: 0.06 });
        tone({ t, freq: base * 3, type: 'triangle', attack: 0.001, decay: 0.03, peak: 0.03 * level, pan });
        noise({ t, freq: 4200, Q: 0.8, type: 'bandpass', decay: 0.018, peak: 0.05 * level, pan });
    },

    /** Achat : jeton qui tombe dans la caisse (deux notes de cloche) */
    upgrade(t) {
        bell(NOTE.E6, t, { decay: 0.22, peak: 0.11, reverb: 0.15, index: 1.2 });
        bell(NOTE.B6, t + 0.07, { decay: 0.5, peak: 0.11, reverb: 0.3, index: 1.2 });
        noise({ t: t + 0.07, type: 'highpass', freq: 7000, decay: 0.12, peak: 0.015 });
    },

    /** Succès : accord arpégé lumineux */
    achievement(t) {
        [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) =>
            bell(f, t + i * 0.075, { decay: 1.3, peak: 0.07, reverb: 0.45, pan: (i - 1.5) * 0.15 })
        );
        tone({ t, freq: NOTE.C4, type: 'triangle', attack: 0.05, decay: 0.9, peak: 0.05, filter: { freq: 900 }, reverb: 0.3 });
    },

    /** Nouveau palier / déblocage : montée rapide + scintillement */
    levelup(t) {
        [NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5, NOTE.B5, NOTE.D6].forEach((f, i) =>
            bell(f, t + i * 0.05, { decay: 0.9, peak: 0.055, reverb: 0.4, pan: (i - 2.5) * 0.1 })
        );
        noise({ t: t + 0.1, type: 'highpass', freq: 5000, to: 9000, attack: 0.15, decay: 0.35, peak: 0.02, reverb: 0.5 });
    },

    /** Événement / bonus : pluie de notes pentatoniques */
    event(t) {
        const scale = [NOTE.C6, NOTE.D6, NOTE.E6, NOTE.G6, NOTE.A6];
        for (let i = 0; i < 6; i++) {
            const f = scale[Math.floor(Math.random() * scale.length)] * (i > 3 ? 1 : 0.5);
            bell(f, t + i * 0.055 * jitter(0.2), { decay: 0.6, peak: 0.05, reverb: 0.5, pan: (Math.random() - 0.5) * 0.6 });
        }
    },

    /** Fenêtre GAFAM : alerte grave et filtrée, avec impact */
    boss(t) {
        [0, 0.17].forEach((dt, i) => {
            [-7, 7].forEach(cents => tone({
                t: t + dt, freq: i ? 185 : 220, type: 'sawtooth', detune: cents,
                attack: 0.01, decay: 0.16, peak: 0.07,
                filter: { freq: 2200, to: 380, Q: 5, time: 0.16 }, reverb: 0.15
            }));
        });
        tone({ t, freq: 90, glideTo: 42, glideTime: 0.25, attack: 0.003, decay: 0.3, peak: 0.35 });
        noise({ t, type: 'lowpass', freq: 900, decay: 0.12, peak: 0.08 });
    },

    /** Prestige : nappe qui s'ouvre, montée de souffle, puis cloche finale */
    prestige(t) {
        [NOTE.G3, NOTE.C4, NOTE.E4, NOTE.G4].forEach(f =>
            [-9, 9].forEach(cents => tone({
                t, freq: f, type: 'sawtooth', detune: cents,
                attack: 0.5, decay: 1.6, peak: 0.025,
                filter: { freq: 280, to: 3200, Q: 1.2, time: 1.2 }, reverb: 0.5
            }))
        );
        noise({ t, type: 'bandpass', freq: 400, to: 5000, Q: 2, attack: 0.9, decay: 0.3, peak: 0.035, reverb: 0.5 });
        bell(NOTE.C6, t + 1.05, { decay: 1.8, peak: 0.08, reverb: 0.6 });
        bell(NOTE.G6, t + 1.1, { decay: 1.6, peak: 0.05, reverb: 0.6 });
    },

    /** Erreur : double « bonk » doux */
    error(t) {
        tone({ t, freq: 330, glideTo: 240, glideTime: 0.1, type: 'triangle', attack: 0.004, decay: 0.14, peak: 0.12, filter: { freq: 1200 } });
        tone({ t: t + 0.13, freq: 250, glideTo: 180, glideTime: 0.12, type: 'triangle', attack: 0.004, decay: 0.18, peak: 0.12, filter: { freq: 1000 } });
    },

    /** Son générique : petit « blip » */
    default(t) {
        tone({ t, freq: 880, glideTo: 1100, glideTime: 0.04, attack: 0.003, decay: 0.08, peak: 0.2, reverb: 0.1 });
    }
};

// Alias
SOUNDS.bonus = SOUNDS.event;
SOUNDS.unlock = SOUNDS.levelup;

/**
 * Joue un son du jeu
 * @param {string} type - 'click', 'upgrade', 'achievement', 'boss', 'levelup', 'prestige', 'error', 'bonus', 'event'
 */
function playSound(type) {
    if (typeof gameState !== 'undefined' && !gameState.soundEnabled) return;
    if (!audioContext || !audioBus) return;

    // Son spécial pour le skin secret
    if (type === 'click' && typeof gameState !== 'undefined' && gameState.currentSkin === 'star-of-david') {
        playAudioFile('assets/Goy.mp3');
        return;
    }

    resumeAudio();

    try {
        const play = SOUNDS[type] || SOUNDS.default;
        play(audioContext.currentTime + 0.005);
    } catch (e) {
        console.log('Erreur audio:', e.message);
    }
}

/**
 * Joue une séquence de notes (timbre de cloche)
 * @param {Array<{freq: number, duration: number, delay?: number}>} notes - Notes à jouer
 */
function playMelody(notes) {
    if (typeof gameState !== 'undefined' && !gameState.soundEnabled) return;
    if (!audioContext || !audioBus) return;

    resumeAudio();
    const now = audioContext.currentTime + 0.005;
    notes.forEach(note => {
        bell(note.freq, now + (note.delay || 0), { decay: Math.max(0.2, note.duration), peak: 0.08, reverb: 0.35 });
    });
}

// Exposer globalement
window.initAudio = initAudio;
window.playSound = playSound;
window.playMelody = playMelody;
window.resumeAudio = resumeAudio;
