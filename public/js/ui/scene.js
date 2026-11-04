/**
 * @file NIRD Clicker - Scène de jeu
 * @description Poste cliquable illustré, vitrine du village, infobulles,
 *              fil d'actualité, pluie de jetons et jauge de flux.
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// ICÔNES STATIQUES (attribut data-icon dans le HTML)
// ============================================

/**
 * Injecte les icônes SVG dans tous les éléments portant data-icon
 * @param {ParentNode} [root=document] - Racine de recherche
 */
function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
        if (el.dataset.iconDone) return;
        el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
        el.dataset.iconDone = '1';
    });
}

// ============================================
// LE POSTE (objet cliquable principal)
// ============================================

/**
 * Construit le SVG du poste informatique pour un skin donné
 * @param {Skin} skin - Skin à afficher
 * @returns {string} Markup SVG
 */
function buildClickerSVG(skin) {
    const tint = (skin && skin.tint) || '#8fe3a1';
    let screen;

    if (skin && skin.image && gameState.skinsUnlocked && gameState.skinsUnlocked.includes(skin.id)) {
        screen = `<image href="${skin.image}" x="84" y="54" width="72" height="72" preserveAspectRatio="xMidYMid meet" opacity=".92"/>`;
    } else if (!skin || skin.id === 'default') {
        screen = `
            <text x="62" y="78" class="pc-term" fill="${tint}" opacity=".55">~/village $</text>
            <text x="62" y="104" class="pc-term pc-term-big" fill="${tint}">sudo libre</text>
            <rect x="62" y="114" width="12" height="4" fill="${tint}" class="pc-caret"/>`;
    } else {
        const paths = (typeof ICON_PATHS !== 'undefined' && ICON_PATHS[skin.icon]) || '';
        screen = `
            <svg x="88" y="56" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${tint}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" color="${tint}">${paths}</svg>
            <text x="120" y="134" text-anchor="middle" class="pc-term pc-term-small" fill="${tint}" opacity=".6">${(skin.name || '').toUpperCase()}</text>`;
    }

    return `
<svg class="pc-svg" viewBox="0 0 240 240" role="img" aria-label="Poste informatique">
    <defs>
        <linearGradient id="pcCase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#f1ebdb"/>
            <stop offset="1" stop-color="#cbc1a6"/>
        </linearGradient>
        <linearGradient id="pcStand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#bdb397"/>
            <stop offset="1" stop-color="#d8cfb6"/>
        </linearGradient>
        <radialGradient id="pcScreen" cx="50%" cy="42%" r="75%">
            <stop offset="0" stop-color="${tint}" stop-opacity=".22"/>
            <stop offset=".55" stop-color="#0c1310"/>
            <stop offset="1" stop-color="#040705"/>
        </radialGradient>
        <pattern id="pcScan" width="4" height="3" patternUnits="userSpaceOnUse">
            <rect width="4" height="1.2" fill="#ffffff" opacity=".045"/>
        </pattern>
    </defs>
    <ellipse class="pc-shadow" cx="120" cy="224" rx="82" ry="8" fill="#000" opacity=".35"/>
    <path d="M98 178h44l9 28H89Z" fill="url(#pcStand)" stroke="#8a816a" stroke-width="2" stroke-linejoin="round"/>
    <rect x="64" y="203" width="112" height="15" rx="6" fill="#ddd4bc" stroke="#8a816a" stroke-width="2"/>
    <rect x="22" y="18" width="196" height="166" rx="22" fill="url(#pcCase)" stroke="#8a816a" stroke-width="2.5"/>
    <rect x="27" y="23" width="186" height="156" rx="18" fill="none" stroke="#fffaf0" stroke-opacity=".55" stroke-width="1.5"/>
    <rect x="37" y="32" width="166" height="122" rx="14" fill="#34342d"/>
    <rect x="45" y="40" width="150" height="106" rx="10" fill="url(#pcScreen)"/>
    <g class="pc-screen-content">${screen}</g>
    <rect x="45" y="40" width="150" height="106" rx="10" fill="url(#pcScan)" pointer-events="none"/>
    <path d="M53 47c28-5 58-5 84-1l-5 16c-26-4-52-4-76 1Z" fill="#ffffff" opacity=".05"/>
    <path d="M48 164h36M48 170h36" stroke="#a69d84" stroke-width="2.4" stroke-linecap="round"/>
    <text x="120" y="171" text-anchor="middle" class="pc-brand" fill="#8a816a">NIRD</text>
    <circle class="pc-led" cx="188" cy="167" r="3.6" fill="${tint}"/>
</svg>`;
}

/**
 * Affiche un skin sur le poste cliquable
 * @param {Skin} skin - Skin à appliquer
 */
function renderClickerSkin(skin) {
    const holder = document.querySelector('#main-clicker .pc-icon');
    if (!holder) return;
    holder.innerHTML = buildClickerSVG(skin);
    const stage = document.querySelector('.clicker-stage');
    if (stage && skin && skin.tint) stage.style.setProperty('--skin-tint', skin.tint);
}

// ============================================
// EN-TÊTE DU VILLAGE
// ============================================

/**
 * Affiche le palier actuel du village
 * @param {HTMLElement} container - Conteneur
 * @param {VillageLevel} level - Palier actuel
 */
function renderVillageHeader(container, level) {
    if (!container || !level) return;
    const index = gameState.currentVillageLevel || 0;
    const total = typeof VILLAGE_LEVELS !== 'undefined' ? VILLAGE_LEVELS.length : 1;
    container.innerHTML = `
        <div class="village-badge">${icon(level.icon || 'houses')}</div>
        <div class="village-text">
            <span class="village-kicker">Palier ${index + 1} / ${total}</span>
            <h2 class="village-name">${level.name}</h2>
            <p class="village-description">${level.description || ''}</p>
        </div>`;
}

// ============================================
// VITRINE : RANGÉES DE BÂTIMENTS
// ============================================

/** @type {Record<string, number>} Nombre d'icônes déjà dessinées par rangée */
var showcaseCounts = {};

/** Nombre maximal d'icônes dessinées par rangée */
var SHOWCASE_CAP = 60;

/**
 * Petit générateur pseudo-aléatoire déterministe
 * @param {number} seed - Graine
 * @returns {number} Valeur entre 0 et 1
 */
function seededRandom(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

/**
 * Met à jour les rangées de la vitrine (ajout incrémental des icônes)
 */
function updateShowcase() {
    const container = document.getElementById('showcase');
    if (!container || typeof UPGRADES === 'undefined') return;

    const owned = UPGRADES.filter(u => u.owned > 0);
    const empty = container.querySelector('.showcase-empty');

    if (owned.length === 0) {
        if (!empty) {
            container.innerHTML = `<div class="showcase-empty">${icon('houses')}<p>Votre village est encore vide.</p><span>Achetez un premier bâtiment dans la boutique pour le voir apparaître ici.</span></div>`;
            showcaseCounts = {};
        }
        return;
    }
    if (empty) container.innerHTML = '';

    owned.forEach((upgrade, index) => {
        let row = container.querySelector(`.showcase-row[data-id="${upgrade.id}"]`);
        if (!row) {
            row = document.createElement('div');
            row.className = 'showcase-row';
            row.dataset.id = upgrade.id;
            row.setAttribute('data-tip', `upgrade:${upgrade.id}`);
            row.innerHTML = `
                <div class="showcase-label"><span class="showcase-name">${upgrade.name}</span><span class="showcase-count"></span></div>
                <div class="showcase-track"></div>`;
            // Insérer dans l'ordre des UPGRADES
            const nextRow = Array.from(container.children).find(r => {
                const idx = UPGRADES.findIndex(u => u.id === r.dataset.id);
                return idx > UPGRADES.indexOf(upgrade);
            });
            container.insertBefore(row, nextRow || null);
            showcaseCounts[upgrade.id] = 0;
        }

        row.querySelector('.showcase-count').textContent = formatNumber(upgrade.owned);

        const track = row.querySelector('.showcase-track');
        const target = Math.min(upgrade.owned, SHOWCASE_CAP);
        let drawn = showcaseCounts[upgrade.id] || 0;
        if (target < drawn) {
            track.innerHTML = '';
            drawn = 0;
        }
        const seedBase = upgrade.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        for (let i = drawn; i < target; i++) {
            const el = document.createElement('span');
            el.className = 'showcase-unit' + (drawn > 0 ? ' is-new' : '');
            const jitterX = (seededRandom(seedBase + i) - 0.5) * 10;
            const jitterY = (seededRandom(seedBase + i * 7) - 0.5) * 18;
            el.style.left = `calc(${(i % SHOWCASE_CAP) * 30 + 8}px + ${jitterX}px)`;
            el.style.top = `calc(50% + ${jitterY}px)`;
            el.innerHTML = icon(upgrade.icon);
            track.appendChild(el);
        }
        showcaseCounts[upgrade.id] = target;
    });

    // Retirer les rangées obsolètes (après un prestige par exemple)
    container.querySelectorAll('.showcase-row').forEach(row => {
        const up = UPGRADES.find(u => u.id === row.dataset.id);
        if (!up || up.owned <= 0) {
            row.remove();
            delete showcaseCounts[row.dataset.id];
        }
    });
}

// ============================================
// INFOBULLES
// ============================================

/** @type {HTMLElement|null} Élément survolé actuellement */
var tooltipAnchor = null;

/**
 * Construit le contenu d'une infobulle à partir de sa clé (type:id)
 * @param {string} key - Clé de l'infobulle
 * @returns {string} HTML
 */
function buildTooltip(key) {
    const [type, id] = key.split(':');

    if (type === 'upgrade' && typeof UPGRADES !== 'undefined') {
        const u = UPGRADES.find(x => x.id === id);
        if (!u) return '';
        const total = u.baseProduction * u.owned;
        const share = gameState.productionPerSecond > 0
            ? Math.min(100, (total / gameState.productionPerSecond) * 100)
            : 0;
        const cost = typeof getUpgradeCost === 'function' ? getUpgradeCost(u) : u.baseCost;
        return `
            <div class="tt-head">
                <span class="tt-icon">${icon(u.icon)}</span>
                <div class="tt-title"><strong>${u.name}</strong><span>${u.owned ? `${formatNumber(u.owned)} possédé${u.owned > 1 ? 's' : ''}` : 'Aucun possédé'}</span></div>
                <span class="tt-price">${priceMarkup(cost)}</span>
            </div>
            <p class="tt-desc">${u.description}</p>
            <ul class="tt-stats">
                <li>Chaque unité produit <strong>${formatRate(u.baseProduction)}</strong> pts/s</li>
                ${u.owned ? `<li>${formatNumber(u.owned)} unité${u.owned > 1 ? 's' : ''} : <strong>${formatRate(total)}</strong> pts/s${share ? ` <em>(${share.toFixed(1)} % du total)</em>` : ''}</li>` : ''}
            </ul>
            ${u.info ? `<p class="tt-quote">${u.info}</p>` : ''}`;
    }

    if (type === 'click' && typeof CLICK_UPGRADES !== 'undefined') {
        const u = CLICK_UPGRADES.find(x => x.id === id);
        if (!u) return '';
        return `
            <div class="tt-head">
                <span class="tt-icon">${icon(u.icon)}</span>
                <div class="tt-title"><strong>${u.name}</strong><span>Amélioration de clic</span></div>
                <span class="tt-price">${u.purchased ? '<span class="tt-owned">Acquise</span>' : priceMarkup(u.cost)}</span>
            </div>
            <p class="tt-desc">${u.description || ''}</p>
            <ul class="tt-stats"><li>Ajoute <strong>+${formatNumber(u.bonus)}</strong> points par clic</li></ul>`;
    }
    return '';
}

/**
 * Positionne l'infobulle à côté de l'élément survolé
 * @param {HTMLElement} tip - Infobulle
 * @param {HTMLElement} anchor - Élément de référence
 */
function positionTooltip(tip, anchor) {
    const r = anchor.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const margin = 12;
    let left;
    let top;

    if (anchor.closest('#upgrades-zone')) {
        // Boutique à droite : infobulle à gauche de la ligne
        left = r.left - tw - margin;
        top = r.top + r.height / 2 - th / 2;
        if (left < margin) {
            left = Math.max(margin, r.left);
            top = r.bottom + margin;
        }
    } else {
        left = r.left + r.width / 2 - tw / 2;
        top = r.top - th - margin;
        if (top < margin) top = r.bottom + margin;
    }

    left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - th - margin));
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
}

/**
 * Affiche l'infobulle pour un élément
 * @param {HTMLElement} anchor - Élément portant data-tip
 */
function showTooltip(anchor) {
    const tip = document.getElementById('tooltip');
    if (!tip) return;
    const html = buildTooltip(anchor.dataset.tip);
    if (!html) return hideTooltip();
    tooltipAnchor = anchor;
    tip.innerHTML = html;
    tip.classList.add('visible');
    positionTooltip(tip, anchor);
}

/**
 * Masque l'infobulle
 */
function hideTooltip() {
    tooltipAnchor = null;
    const tip = document.getElementById('tooltip');
    if (tip) tip.classList.remove('visible');
}

/**
 * Rafraîchit l'infobulle visible (après un achat par exemple)
 */
function refreshTooltip() {
    if (tooltipAnchor && document.body.contains(tooltipAnchor)) showTooltip(tooltipAnchor);
    else hideTooltip();
}

/**
 * Initialise les infobulles (délégation d'événements, souris uniquement)
 */
function initTooltips() {
    if (!document.getElementById('tooltip')) {
        const tip = document.createElement('div');
        tip.id = 'tooltip';
        tip.setAttribute('role', 'tooltip');
        document.body.appendChild(tip);
    }
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (!canHover) return;

    document.addEventListener('mouseover', (e) => {
        const anchor = e.target.closest('[data-tip]');
        if (anchor && anchor !== tooltipAnchor) showTooltip(anchor);
        else if (!anchor && tooltipAnchor) hideTooltip();
    });
    document.addEventListener('scroll', hideTooltip, true);
}

// ============================================
// FIL D'ACTUALITÉ
// ============================================

/** @type {number|null} Intervalle du fil d'actualité */
var newsInterval = null;

/**
 * Choisit un titre d'actualité adapté à la progression
 * @returns {string} Titre
 */
function pickHeadline() {
    const pool = [];
    if (typeof NEWS_HEADLINES !== 'undefined') {
        NEWS_HEADLINES.forEach(h => {
            if ((gameState.totalScore || 0) >= h.minScore) pool.push(h.text);
        });
    }
    if (typeof EDUCATIONAL_TIPS !== 'undefined' && Math.random() < 0.35) {
        const tip = EDUCATIONAL_TIPS[Math.floor(Math.random() * EDUCATIONAL_TIPS.length)];
        return tip;
    }
    if (pool.length === 0) return 'La résistance numérique s\'organise.';
    // Favoriser les titres récents (liés à la progression)
    const recent = pool.slice(-4);
    const list = Math.random() < 0.6 ? recent : pool;
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Affiche un nouveau titre dans le fil d'actualité
 */
function rotateNews() {
    const el = document.getElementById('news-text');
    if (!el) return;
    el.classList.remove('news-in');
    el.classList.add('news-out');
    setTimeout(() => {
        el.textContent = pickHeadline();
        el.classList.remove('news-out');
        void el.offsetWidth;
        el.classList.add('news-in');
    }, 350);
}

/**
 * Démarre le fil d'actualité
 */
function initNewsTicker() {
    const el = document.getElementById('news-text');
    if (!el) return;
    el.textContent = pickHeadline();
    el.classList.add('news-in');
    if (newsInterval) clearInterval(newsInterval);
    newsInterval = setInterval(rotateNews, 9000);
}

// ============================================
// PLUIE DE JETONS (canvas derrière le poste)
// ============================================

var bitsState = {
    canvas: null,
    ctx: null,
    drops: [],
    sparks: [],
    spawnAcc: 0,
    last: 0,
    color: '#8fd694',
    reduced: false
};

/**
 * Lit la couleur d'accent courante depuis les variables CSS
 */
function refreshBitsColor() {
    const c = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    if (c) bitsState.color = c;
}

/**
 * Redimensionne le canvas à la taille de son conteneur
 */
function resizeBitsCanvas() {
    const c = bitsState.canvas;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.parentElement.getBoundingClientRect();
    c.width = Math.max(1, Math.floor(r.width * dpr));
    c.height = Math.max(1, Math.floor(r.height * dpr));
    c.style.width = r.width + 'px';
    c.style.height = r.height + 'px';
    bitsState.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Dessine un petit jeton hexagonal
 * @param {CanvasRenderingContext2D} ctx - Contexte
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {number} size - Rayon
 * @param {number} rot - Rotation
 */
function drawToken(ctx, x, y, size, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = Math.PI / 3 * i + Math.PI / 6;
        const px = Math.cos(a) * size;
        const py = Math.sin(a) * size;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

/**
 * Boucle d'animation de la pluie de jetons
 * @param {number} t - Timestamp
 */
function bitsLoop(t) {
    const s = bitsState;
    if (!s.canvas) return;
    const dt = Math.min(0.05, (t - (s.last || t)) / 1000);
    s.last = t;
    const w = s.canvas.clientWidth;
    const h = s.canvas.clientHeight;
    const ctx = s.ctx;
    ctx.clearRect(0, 0, w, h);

    const enabled = gameState.particlesEnabled !== false && !s.reduced && !document.hidden;

    // Taux d'apparition proportionnel (log) à la production
    if (enabled) {
        const pps = gameState.productionPerSecond || 0;
        const rate = pps > 0 ? Math.min(14, 0.6 + Math.log10(pps + 1) * 1.8) : 0;
        s.spawnAcc += rate * dt;
        while (s.spawnAcc >= 1 && s.drops.length < 90) {
            s.spawnAcc -= 1;
            s.drops.push({
                x: Math.random() * w,
                y: -12,
                v: 40 + Math.random() * 50,
                size: 3 + Math.random() * 4,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 2,
                glyph: Math.random() < 0.45 ? (Math.random() < 0.5 ? '0' : '1') : null,
                alpha: 0.12 + Math.random() * 0.2
            });
        }
    }

    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = 1.4;
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    s.drops = s.drops.filter(d => {
        d.y += d.v * dt;
        d.rot += d.vr * dt;
        ctx.globalAlpha = d.alpha * Math.min(1, (h - d.y) / 80);
        if (d.glyph) ctx.fillText(d.glyph, d.x, d.y);
        else drawToken(ctx, d.x, d.y, d.size, d.rot);
        return d.y < h + 12;
    });

    // Étincelles de clic (gravité)
    s.sparks = s.sparks.filter(p => {
        p.vy += 520 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.rot += p.vr * dt;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.5)) * 0.9;
        ctx.lineWidth = 1.8;
        drawToken(ctx, p.x, p.y, p.size, p.rot);
        return p.life > 0 && p.y < h + 20;
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(bitsLoop);
}

/**
 * Émet des étincelles depuis un point (clic)
 * @param {number} x - Position X relative au canvas
 * @param {number} y - Position Y relative au canvas
 * @param {number} [count=6] - Nombre d'étincelles
 */
function emitSparks(x, y, count = 6) {
    if (!bitsState.canvas || bitsState.reduced) return;
    for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        const speed = 160 + Math.random() * 200;
        bitsState.sparks.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 3,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 10,
            life: 0.9 + Math.random() * 0.4
        });
    }
    if (bitsState.sparks.length > 120) bitsState.sparks.splice(0, bitsState.sparks.length - 120);
}

/**
 * Initialise le canvas de pluie de jetons
 */
function initBitsRain() {
    const canvas = document.getElementById('bits-canvas');
    if (!canvas) return;
    bitsState.canvas = canvas;
    bitsState.ctx = canvas.getContext('2d');
    bitsState.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    refreshBitsColor();
    resizeBitsCanvas();
    window.addEventListener('resize', resizeBitsCanvas);
    requestAnimationFrame(bitsLoop);
}

// ============================================
// JAUGE DE FLUX (niveau lié aux succès)
// ============================================

/**
 * Met à jour la hauteur du flux selon la proportion de succès débloqués
 */
function updateFlux() {
    const flux = document.getElementById('flux');
    if (!flux || typeof ACHIEVEMENTS === 'undefined') return;
    const ratio = ACHIEVEMENTS.filter(a => a.unlocked).length / ACHIEVEMENTS.length;
    flux.style.setProperty('--flux', (4 + ratio * 26).toFixed(1) + '%');
    flux.title = `Flux libre : ${Math.round(ratio * 100)} % des succès débloqués`;
}

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise tous les éléments de scène
 */
function initScene() {
    hydrateIcons();
    initTooltips();
    initNewsTicker();
    initBitsRain();
    updateShowcase();
    updateFlux();
    setInterval(updateFlux, 5000);
}

window.hydrateIcons = hydrateIcons;
window.buildClickerSVG = buildClickerSVG;
window.renderClickerSkin = renderClickerSkin;
window.renderVillageHeader = renderVillageHeader;
window.updateShowcase = updateShowcase;
window.showTooltip = showTooltip;
window.hideTooltip = hideTooltip;
window.refreshTooltip = refreshTooltip;
window.initNewsTicker = initNewsTicker;
window.emitSparks = emitSparks;
window.refreshBitsColor = refreshBitsColor;
window.updateFlux = updateFlux;
window.initScene = initScene;
