/**
 * @file NIRD Clicker - Équilibrage du jeu
 * @description Toutes les données de progression, coûts, et contenus
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// CONSTANTES D'ÉQUILIBRAGE
// ============================================

/** @type {number} Multiplicateur de coût par achat */
const COST_MULTIPLIER = 1.12;

/** @type {number} Intervalle de sauvegarde en ms */
const SAVE_INTERVAL = 10000;

/** @type {number} Intervalle minimum entre les boss (ms) */
const BOSS_INTERVAL_MIN = 45000;

/** @type {number} Intervalle maximum entre les boss (ms) */
const BOSS_INTERVAL_MAX = 120000;

/** @type {number} Nombre de clics requis pour vaincre un boss */
const BOSS_CLICKS_REQUIRED = 20;

/** @type {number} Intervalle entre les quiz (ms) */
const QUIZ_INTERVAL = 90000;

/** @type {number} Intervalle entre les tips (ms) */
const TIP_INTERVAL = 60000;

/** @type {number} Score minimum pour effectuer un prestige */
const PRESTIGE_THRESHOLD = 500000;

/** @type {number} Bonus de production par niveau de prestige (5%) */
const PRESTIGE_BONUS_PER_LEVEL = 0.05;

// ============================================
// UPGRADES DE PRODUCTION (20 niveaux)
// ============================================

/**
 * Liste des upgrades de production
 * @type {Upgrade[]}
 */
const UPGRADES = [
    // === TIER 1 : DÉBUT ===
    {
        id: 'eco-delegue',
        name: '👨‍🎓 Élève Éco-délégué',
        description: 'Un élève sensibilisé qui convertit ses camarades au numérique responsable.',
        info: '💡 Les éco-délégués sont les ambassadeurs du développement durable dans les établissements scolaires.',
        baseCost: 15,
        baseProduction: 1,
        owned: 0,
        unlocked: true,
          icon: '👨‍🎓'
    },
    {
        id: 'install-party',
        name: '🐧 Install Party Linux',
        description: 'Organisez des sessions d\'installation de Linux pour lutter contre l\'obsolescence.',
        info: '💡 Linux permet de faire revivre de vieux PC. Une Install Party est un événement convivial.',
        baseCost: 100,
        baseProduction: 4,
        owned: 0,
        unlocked: true,
        icon: '🐧'
    },
    {
        id: 'atelier-reparation',
        name: '🔧 Atelier de Réparation',
        description: 'Réparez au lieu de jeter ! Prolongez la vie des équipements.',
        info: '💡 Le droit à la réparation est essentiel. Chaque PC réparé, c\'est des tonnes de CO2 économisées.',
        baseCost: 500,
        baseProduction: 15,
        owned: 0,
        unlocked: true,
        icon: '🔧'
    },
    // === TIER 2 : EXPANSION LOCALE ===
    {
        id: 'serveur-forge',
        name: '🏭 Serveur La Forge',
        description: 'Mutualisation des ressources avec un serveur hébergé en France.',
        info: '💡 La Forge fournit des outils numériques souverains aux établissements.',
        baseCost: 2500,
        baseProduction: 50,
        owned: 0,
        unlocked: false,
        unlockAt: 1500,
        icon: '🏭'
    },
    {
        id: 'mairie-adherente',
        name: '🏛️ Adhésion de la Mairie',
        description: 'La mairie soutient le projet avec des financements et du matériel.',
        info: '💡 Les collectivités territoriales jouent un rôle clé dans la transition numérique.',
        baseCost: 12000,
        baseProduction: 180,
        owned: 0,
        unlocked: false,
        unlockAt: 8000,
        icon: '🏛️'
    },
    {
        id: 'recyclerie-numerique',
        name: '♻️ Recyclerie Numérique',
        description: 'Collectez et reconditionnez les appareils usagés du quartier.',
        info: '💡 Une recyclerie peut donner une seconde vie à des milliers d\'appareils par an.',
        baseCost: 45000,
        baseProduction: 600,
        owned: 0,
        unlocked: false,
        unlockAt: 30000,
        icon: '♻️'
    },
    // === TIER 3 : RAYONNEMENT RÉGIONAL ===
    {
        id: 'datacenter-vert',
        name: '🌱 DataCenter Écologique',
        description: 'Un datacenter alimenté par des énergies renouvelables.',
        info: '💡 Les datacenters verts utilisent l\'énergie solaire, éolienne ou hydraulique.',
        baseCost: 180000,
        baseProduction: 2000,
        owned: 0,
        unlocked: false,
        unlockAt: 100000,
        icon: '🌱'
    },
    {
        id: 'universite-libre',
        name: '🎓 Université du Libre',
        description: 'Formez les futurs développeurs aux logiciels open source.',
        info: '💡 L\'éducation est la clé de la transition vers le libre.',
        baseCost: 600000,
        baseProduction: 6500,
        owned: 0,
        unlocked: false,
        unlockAt: 350000,
        icon: '🎓'
    },
    {
        id: 'reseau-regional',
        name: '🗼 Réseau Régional NIRD',
        description: 'Connectez tous les villages numériques de la région !',
        info: '💡 Un réseau régional permet de mutualiser les ressources et compétences.',
        baseCost: 2000000,
        baseProduction: 20000,
        owned: 0,
        unlocked: false,
        unlockAt: 1000000,
        icon: '🗼'
    },
    // === TIER 4 : ENVERGURE NATIONALE ===
    {
        id: 'ministere-numerique',
        name: '🏢 Ministère du Numérique Libre',
        description: 'Le gouvernement adopte officiellement les logiciels libres !',
        info: '💡 Plusieurs pays ont déjà fait le choix du libre pour leur administration.',
        baseCost: 8000000,
        baseProduction: 65000,
        owned: 0,
        unlocked: false,
        unlockAt: 4000000,
        icon: '🏢'
    },
    {
        id: 'liberation-totale',
        name: '🏆 Libération Nationale',
        description: 'L\'indépendance numérique complète de la France !',
        info: '💡 Un écosystème numérique 100% libre et souverain.',
        baseCost: 30000000,
        baseProduction: 200000,
        owned: 0,
        unlocked: false,
        unlockAt: 15000000,
        icon: '🏆'
    },
    {
        id: 'reseau-europeen',
        name: '🇪🇺 Réseau Européen Libre',
        description: 'L\'Europe entière adopte le numérique responsable !',
        info: '💡 L\'union fait la force pour une souveraineté numérique continentale.',
        baseCost: 100000000,
        baseProduction: 650000,
        owned: 0,
        unlocked: false,
        unlockAt: 50000000,
        icon: '🇪🇺'
    },
    // === TIER 5 : INFLUENCE MONDIALE ===
    {
        id: 'onu-numerique',
        name: '🌍 ONU Numérique Durable',
        description: 'Les Nations Unies adoptent une charte du numérique responsable.',
        info: '💡 Un accord mondial pour un numérique respectueux de l\'environnement.',
        baseCost: 400000000,
        baseProduction: 2000000,
        owned: 0,
        unlocked: false,
        unlockAt: 200000000,
        icon: '🌍'
    },
    {
        id: 'internet-libre-mondial',
        name: '🌐 Internet Libre Mondial',
        description: 'Un internet décentralisé et libre pour tous les humains.',
        info: '💡 La neutralité du net garantie pour toute l\'humanité.',
        baseCost: 1500000000,
        baseProduction: 6500000,
        owned: 0,
        unlocked: false,
        unlockAt: 800000000,
        icon: '🌐'
    },
    // === TIER 6 : CONQUÊTE SPATIALE ===
    {
        id: 'station-orbitale',
        name: '🛸 Station Orbitale Libre',
        description: 'Une station spatiale dédiée à l\'hébergement libre en orbite.',
        info: '💡 Les serveurs en orbite sont alimentés par l\'énergie solaire 24h/24.',
        baseCost: 6000000000,
        baseProduction: 22000000,
        owned: 0,
        unlocked: false,
        unlockAt: 3000000000,
        icon: '🛸'
    },
    {
        id: 'colonie-lunaire',
        name: '🌙 Colonie Lunaire Open Source',
        description: 'Premier datacenter sur la Lune, refroidi naturellement !',
        info: '💡 Le froid lunaire permet un refroidissement gratuit des serveurs.',
        baseCost: 25000000000,
        baseProduction: 75000000,
        owned: 0,
        unlocked: false,
        unlockAt: 12000000000,
        icon: '🌙'
    },
    {
        id: 'base-martienne',
        name: '🔴 Base Martienne NIRD',
        description: 'Mars devient le hub du numérique libre interplanétaire.',
        info: '💡 Un réseau autonome et décentralisé pour la colonisation de Mars.',
        baseCost: 100000000000,
        baseProduction: 250000000,
        owned: 0,
        unlocked: false,
        unlockAt: 50000000000,
        icon: '🔴'
    },
    // === TIER 7 : VOYAGE TEMPOREL ===
    {
        id: 'accelerateur-temporel',
        name: '⏰ Accélérateur Temporel',
        description: 'Manipulez le temps pour accélérer le déploiement du libre !',
        info: '💡 La physique quantique au service du logiciel libre.',
        baseCost: 500000000000,
        baseProduction: 900000000,
        owned: 0,
        unlocked: false,
        unlockAt: 200000000000,
        icon: '⏰'
    },
    {
        id: 'paradoxe-linux',
        name: '🌀 Paradoxe Linux',
        description: 'Envoyez Linux dans le passé pour que l\'informatique soit libre depuis le début !',
        info: '💡 Et si Linus Torvalds avait créé Linux en 1960 ?',
        baseCost: 2000000000000,
        baseProduction: 3500000000,
        owned: 0,
        unlocked: false,
        unlockAt: 1000000000000,
        icon: '🌀'
    },
    {
        id: 'singularite-libre',
        name: '✨ Singularité Libre',
        description: 'L\'ultime évolution : une IA libre omnisciente protège le numérique responsable à travers l\'espace-temps.',
        info: '💡 La conscience numérique universelle, open source et éthique.',
        baseCost: 10000000000000,
        baseProduction: 15000000000,
        owned: 0,
        unlocked: false,
        unlockAt: 5000000000000,
        icon: '✨'
    },
    // === TIER 8+ : WTF COSMIQUE ===
    {
        id: 'univers-simule',
        name: '🪐 Univers Simulé',
        description: 'Vous créez une simulation entière dédiée au libre.',
        info: '💡 Chaque bug dans la matrice rapporte des points.',
        baseCost: 5e13,
        baseProduction: 6e10,
        owned: 0,
        unlocked: false,
        unlockAt: 2e13,
        icon: '🪐'
    },
    {
        id: 'dieu-du-code',
        name: '🧙‍♂️ Dieu du Code',
        description: 'Un être omnipotent compile le libre dans toutes les dimensions.',
        info: '💡 Il commit sur tous les repos de l\'univers.',
        baseCost: 2e14,
        baseProduction: 2.5e11,
        owned: 0,
        unlocked: false,
        unlockAt: 1e14,
        icon: '🧙‍♂️'
    },
    {
        id: 'big-bang-open',
        name: '💥 Big Bang Open Source',
        description: 'Le libre explose à la création d\'un nouvel univers.',
        info: '💡 Chaque atome contient un repo git.',
        baseCost: 1e15,
        baseProduction: 1e12,
        owned: 0,
        unlocked: false,
        unlockAt: 5e14,
        icon: '💥'
    },
    {
        id: 'multivers-libre',
        name: '🌌 Multivers Libre',
        description: 'Tous les univers parallèles sont open source.',
        info: '💡 Les lois de la physique sont sous licence GPL.',
        baseCost: 5e15,
        baseProduction: 5e12,
        owned: 0,
        unlocked: false,
        unlockAt: 2e15,
        icon: '🌌'
    },
    {
        id: 'simulation-divine',
        name: '👼 Simulation Divine',
        description: 'Vous simulez des dieux qui simulent des informaticiens.',
        info: '💡 Inception de simulation, points exponentiels.',
        baseCost: 2e16,
        baseProduction: 2e13,
        owned: 0,
        unlocked: false,
        unlockAt: 1e16,
        icon: '👼'
    },
    {
        id: 'kernel-cosmique',
        name: '🪐 Kernel Cosmique',
        description: 'Le noyau de l\'univers est open source.',
        info: '💡 Un commit = un big crunch.',
        baseCost: 1e17,
        baseProduction: 1e14,
        owned: 0,
        unlocked: false,
        unlockAt: 5e16,
        icon: '🪐'
    },
    {
        id: 'root-final',
        name: '🗝️ Root Final',
        description: 'Vous obtenez le mot de passe root de la réalité.',
        info: '💡 sudo rm -rf /universe',
        baseCost: 1e18,
        baseProduction: 1e15,
        owned: 0,
        unlocked: false,
        unlockAt: 5e17,
        icon: '🗝️'
    }
];

// ============================================
// AMÉLIORATIONS DE CLIC (12 niveaux)
// ============================================

/**
 * Liste des améliorations de clic
 * @type {ClickUpgrade[]}
 */
const CLICK_UPGRADES = [
    // === TIER 1 : BASIQUE ===
    {
        id: 'souris-ergonomique',
        name: '🖱️ Souris Ergonomique',
        description: '+1 point par clic',
        icon: '🖱️',
        cost: 50,
        bonus: 1,
        purchased: false
    },
    {
        id: 'clavier-mecanique',
        name: '⌨️ Clavier Mécanique Libre',
        description: '+2 points par clic',
        icon: '⌨️',
        cost: 250,
        bonus: 2,
        purchased: false
    },
    {
        id: 'trackball-pro',
        name: '🎱 Trackball Pro',
        description: '+4 points par clic',
        icon: '🎱',
        cost: 800,
        bonus: 4,
        purchased: false
    },
    // === TIER 2 : AUTOMATISATION ===
    {
        id: 'script-automatisation',
        name: '📜 Script d\'Automatisation',
        description: '+8 points par clic',
        icon: '📜',
        cost: 3000,
        bonus: 8,
        purchased: false
    },
    {
        id: 'macro-avancee',
        name: '🔁 Macro Avancée',
        description: '+15 points par clic',
        icon: '🔁',
        cost: 10000,
        bonus: 15,
        purchased: false
    },
    {
        id: 'bot-ethique',
        name: '🤖 Bot Éthique Open Source',
        description: '+30 points par clic',
        icon: '🤖',
        cost: 40000,
        bonus: 30,
        purchased: false
    },
    // === TIER 3 : IA ===
    {
        id: 'ia-locale',
        name: '🧠 IA Locale LLaMA',
        description: '+60 points par clic',
        icon: '🧠',
        cost: 150000,
        bonus: 60,
        purchased: false
    },
    {
        id: 'reseau-neuronal',
        name: '🕸️ Réseau Neuronal Libre',
        description: '+120 points par clic',
        icon: '🕸️',
        cost: 600000,
        bonus: 120,
        purchased: false
    },
    {
        id: 'agi-open-source',
        name: '💫 AGI Open Source',
        description: '+250 points par clic',
        icon: '💫',
        cost: 2500000,
        bonus: 250,
        purchased: false
    },
    // === TIER 4 : QUANTIQUE ===
    {
        id: 'qubit-libre',
        name: '⚛️ Qubit Libre',
        description: '+500 points par clic',
        icon: '⚛️',
        cost: 10000000,
        bonus: 500,
        purchased: false
    },
    {
        id: 'processeur-quantique',
        name: '🔮 Processeur Quantique Open',
        description: '+1000 points par clic',
        icon: '🔮',
        cost: 50000000,
        bonus: 1000,
        purchased: false
    },
    {
        id: 'superposition-temporelle',
        name: '🌌 Superposition Temporelle',
        description: '+2500 points par clic',
        icon: '🌌',
        cost: 500000000,
        bonus: 2500,
        purchased: false
    },
    // === TIER 5+ : CLICS ABSURDES ===
    {
        id: 'clic-quantique',
        name: '🪙 Clic Quantique',
        description: '+10 000 points par clic',
        icon: '🪙',
        cost: 2e9,
        bonus: 10000,
        purchased: false
    },
    {
        id: 'clic-multivers',
        name: '🌠 Clic Multiversel',
        description: '+50 000 points par clic',
        icon: '🌠',
        cost: 1e10,
        bonus: 50000,
        purchased: false
    },
    {
        id: 'clic-divin',
        name: '👆 Clic Divin',
        description: '+250 000 points par clic',
        icon: '👆',
        cost: 5e10,
        bonus: 250000,
        purchased: false
    },
    {
        id: 'clic-simulation',
        name: '🖱️ Clic Simulé',
        description: '+1 000 000 points par clic',
        icon: '🖱️',
        cost: 2e11,
        bonus: 1000000,
        purchased: false
    },
    {
        id: 'clic-cosmique',
        name: '🌌 Clic Cosmique',
        description: '+5 000 000 points par clic',
        icon: '🌌',
        cost: 1e12,
        bonus: 5000000,
        purchased: false
    },
    {
        id: 'clic-root',
        name: '🗝️ Clic Root',
        description: '+25 000 000 points par clic',
        icon: '🗝️',
        cost: 5e12,
        bonus: 25000000,
        purchased: false
    },
    {
        id: 'clic-final',
        name: '💀 Clic Final',
        description: '+100 000 000 points par clic',
        icon: '💀',
        cost: 2e13,
        bonus: 100000000,
        purchased: false
    }
];

// ============================================
// NIVEAUX DE VILLAGE (15 niveaux)
// ============================================

/**
 * Niveaux de progression du village
 * @type {VillageLevel[]}
 */
const VILLAGE_LEVELS = [
    // === PHASE 1 : LOCALE ===
    { name: 'Salle Informatique', minScore: 0, emoji: '🏫', description: 'Une simple salle avec quelques vieux PC' },
    { name: 'Club Numérique', minScore: 500, emoji: '💻', description: 'Un club de passionnés se forme' },
    { name: 'Fablab Citoyen', minScore: 3000, emoji: '🔧', description: 'Un atelier de réparation et création' },
    { name: 'Village Numérique', minScore: 15000, emoji: '🏘️', description: 'Tout le quartier est connecté librement' },
    // === PHASE 2 : RÉGIONALE ===
    { name: 'Cité de la Liberté', minScore: 80000, emoji: '🏰', description: 'Une vraie cité du libre est née' },
    { name: 'Métropole Souveraine', minScore: 400000, emoji: '🌆', description: 'Une métropole 100% souveraine' },
    // === PHASE 3 : NATIONALE ===
    { name: 'Nation Libre', minScore: 2000000, emoji: '🗽', description: 'La France est numériquement indépendante !' },
    { name: 'Union Européenne Libre', minScore: 10000000, emoji: '🇪🇺', description: 'L\'Europe adopte le numérique responsable' },
    // === PHASE 4 : MONDIALE ===
    { name: 'Alliance Mondiale', minScore: 50000000, emoji: '🌍', description: 'Tous les continents unis pour le libre' },
    { name: 'Utopie Numérique', minScore: 250000000, emoji: '🌈', description: 'Un monde numérique parfait et équitable' },
    // === PHASE 5 : SPATIALE ===
    { name: 'Station Orbitale', minScore: 1000000000, emoji: '🛸', description: 'Le libre conquiert l\'orbite terrestre' },
    { name: 'Colonie Lunaire', minScore: 5000000000, emoji: '🌙', description: 'Premier datacenter sur la Lune' },
    { name: 'Civilisation Martienne', minScore: 25000000000, emoji: '🔴', description: 'Mars respire le logiciel libre' },
    // === PHASE 6 : TEMPORELLE ===
    { name: 'Maîtrise du Temps', minScore: 100000000000, emoji: '⏰', description: 'Le temps lui-même est open source' },
    { name: 'Singularité Éternelle', minScore: 1000000000000, emoji: '✨', description: 'L\'ultime accomplissement : le libre existe dans toutes les dimensions' }
];

// ============================================
// PRESTIGE UPGRADES (15 améliorations)
// ============================================
const PRESTIGE_UPGRADES = [
    // === TIER 1 : BASIQUE ===
    {
        id: 'pp_click_boost',
        name: '👆 Clic Augmenté',
        description: 'Double la puissance de base du clic',
        cost: 1,
        icon: '👆',
        effect: { type: 'clickMultiplier', value: 2 }
    },
    {
        id: 'pp_prod_boost',
        name: '⚡ Production Améliorée',
        description: '+25% de production par seconde',
        cost: 1,
        icon: '⚡',
        effect: { type: 'productionMultiplier', value: 1.25 }
    },
    {
        id: 'pp_start_bonus',
        name: '🚀 Départ en Trombe',
        description: 'Commencez avec 1000 points après prestige',
        cost: 2,
        icon: '🚀',
        effect: { type: 'startBonus', value: 1000 }
    },
    // === TIER 2 : INTERMÉDIAIRE ===
    {
        id: 'pp_upgrade_discount',
        name: '💰 Réduction d\'Upgrades',
        description: '-10% sur le coût des upgrades',
        cost: 2,
        icon: '💰',
        effect: { type: 'upgradeDiscount', value: 0.9 }
    },
    {
        id: 'pp_offline_boost',
        name: '🌙 Gains Hors-ligne+',
        description: 'Triple les gains hors-ligne',
        cost: 3,
        icon: '🌙',
        effect: { type: 'offlineMultiplier', value: 3 }
    },
    {
        id: 'pp_boss_reward',
        name: '👹 Récompense de Boss',
        description: 'Double les récompenses de boss',
        cost: 3,
        icon: '👹',
        effect: { type: 'bossRewardMultiplier', value: 2 }
    },
    // === TIER 3 : AVANCÉ ===
    {
        id: 'pp_combo_master',
        name: '🔥 Maître du Combo',
        description: 'Les combos durent 2x plus longtemps',
        cost: 4,
        icon: '🔥',
        effect: { type: 'comboTimeout', value: 2 }
    },
    {
        id: 'pp_event_luck',
        name: '🍀 Chanceux',
        description: '+50% de chance d\'événements positifs',
        cost: 4,
        icon: '🍀',
        effect: { type: 'eventLuck', value: 1.5 }
    },
    {
        id: 'pp_quiz_bonus',
        name: '🧠 Quiz Expert',
        description: 'Double les récompenses de quiz',
        cost: 5,
        icon: '🧠',
        effect: { type: 'quizBonus', value: 2 }
    },
    // === TIER 4 : EXPERT ===
    {
        id: 'pp_auto_click',
        name: '⚙️ Auto-Clic Éthique',
        description: '1 clic automatique par seconde',
        cost: 6,
        icon: '⚙️',
        effect: { type: 'autoClick', value: 1 }
    },
    {
        id: 'pp_golden_touch',
        name: '✨ Toucher Doré',
        description: '+100% de production globale',
        cost: 8,
        icon: '✨',
        effect: { type: 'productionMultiplier', value: 2 }
    },
    {
        id: 'pp_time_warp',
        name: '⏰ Distorsion Temporelle',
        description: 'Gagnez 10x plus de gains hors-ligne',
        cost: 10,
        icon: '⏰',
        effect: { type: 'offlineMultiplier', value: 10 }
    },
    // === TIER 5 : LÉGENDAIRE ===
    {
        id: 'pp_mega_click',
        name: '💥 Méga Clic',
        description: 'x5 la puissance de clic',
        cost: 15,
        icon: '💥',
        effect: { type: 'clickMultiplier', value: 5 }
    },
    {
        id: 'pp_eternal_combo',
        name: '♾️ Combo Éternel',
        description: 'Le combo ne se réinitialise jamais',
        cost: 20,
        icon: '♾️',
        effect: { type: 'eternalCombo', value: true }
    },
    {
        id: 'pp_singularity',
        name: '🌌 Singularité',
        description: 'x10 TOUT (clics, production, récompenses)',
        cost: 50,
        icon: '🌌',
        effect: { type: 'singularity', value: 10 }
    },
    // === TIER 6+ : PRESTIGES COSMIQUES ===
    {
        id: 'pp_wtf_universe',
        name: '🪐 Univers WTF',
        description: 'Débloque des upgrades absurdes et double tous les multiplicateurs.',
        cost: 100,
        icon: '🪐',
        effect: { type: 'allMultipliers', value: 2 }
    },
    {
        id: 'pp_god_mode',
        name: '🧙‍♂️ Mode Dieu',
        description: 'Active le mode Dieu : +1000% production et clics.',
        cost: 200,
        icon: '🧙‍♂️',
        effect: { type: 'godMode', value: 10 }
    },
    {
        id: 'pp_big_bang',
        name: '💥 Big Bang Prestige',
        description: 'Réinitialise tout sauf les prestiges, mais x100 production.',
        cost: 300,
        icon: '💥',
        effect: { type: 'bigBang', value: 100 }
    },
    {
        id: 'pp_multivers',
        name: '🌌 Multivers Prestige',
        description: 'Chaque prestige multiplie tous les gains par 5.',
        cost: 500,
        icon: '🌌',
        effect: { type: 'prestigeMultiplier', value: 5 }
    },
    {
        id: 'pp_simulation',
        name: '👼 Simulation Prestige',
        description: 'Simule un joueur supplémentaire qui joue pour vous.',
        cost: 750,
        icon: '👼',
        effect: { type: 'autoPlayer', value: 1 }
    },
    {
        id: 'pp_kernel',
        name: '🪐 Kernel Prestige',
        description: 'Le kernel du jeu est réécrit pour booster tous les calculs.',
        cost: 1000,
        icon: '🪐',
        effect: { type: 'kernelBoost', value: 10 }
    },
    {
        id: 'pp_root_final',
        name: '🗝️ Root Prestige',
        description: 'Vous avez le root du jeu. x1000 tout.',
        cost: 5000,
        icon: '🗝️',
        effect: { type: 'rootAll', value: 1000 }
    }
];

// ============================================
// BOSS GAFAM (10 boss avec mécaniques uniques)
// ============================================
// Mécaniques disponibles:
// - 'classic': Cliquer X fois (défaut)
// - 'regen': Le boss régénère sa vie si on ne clique pas pendant X secondes
// - 'popups': Des pop-ups apparaissent et volent des clics, il faut les fermer
// - 'invisible': Le boss devient invisible par moments
// - 'timer': Timer très serré, il faut être rapide
// - 'pattern': Reproduire un pattern de clics (QTE)
// - 'shield': Bouclier périodique, attendre qu'il tombe
// - 'lag': Les clics sont retardés
// - 'moving': Le boss bouge sur l'écran
// - 'chaos': Mélange de plusieurs mécaniques !
// ============================================

const BOSS_TYPES = [
    // === TIER 1 : CLASSIQUES ===
    {
        id: 'windows',
        name: 'Windows Update',
        icon: '🪟',
        message: 'Windows veut redémarrer votre ordinateur...',
        clicksRequired: 20,
        reward: 50,
        color: '#0078d4',
        mechanic: 'regen',
        mechanicParams: {
            regenDelay: 2000,      // Régénère après 2s sans clic
            regenAmount: 3,        // Régénère 3 clics
            regenMessage: '⚠️ Installation en cours...'
        }
    },
    {
        id: 'google',
        name: 'Google Tracking',
        icon: '🔍',
        message: 'Google veut collecter vos données personnelles...',
        clicksRequired: 25,
        reward: 100,
        color: '#4285f4',
        mechanic: 'invisible',
        mechanicParams: {
            invisibleDuration: 1500,  // Invisible pendant 1.5s
            visibleDuration: 3000,    // Visible pendant 3s
            invisibleMessage: '🔍 Analyse de vos données...'
        }
    },
    {
        id: 'facebook',
        name: 'Facebook Ads',
        icon: '📘',
        message: 'Facebook veut vous montrer des publicités ciblées...',
        clicksRequired: 30,
        reward: 150,
        color: '#1877f2',
        mechanic: 'popups',
        mechanicParams: {
            popupInterval: 2500,      // Popup toutes les 2.5s
            popupDuration: 3000,      // Popup reste 3s
            stolenClicks: 2,          // Vole 2 clics si pas fermé
            popupTexts: ['📢 Pub: Achetez maintenant!', '👥 12 amis aiment ça', '🔔 Notification: Quelqu\'un vous a mentionné']
        }
    },
    {
        id: 'openai',
        name: 'OpenAI Alert',
        icon: '🤖',
        message: 'OpenAI tente une intrusion via un modèle malveillant...',
        clicksRequired: 28,
        reward: 160,
        color: '#10A37F',
        mechanic: 'video',
        mechanicParams: {
            videoIntroDelay: 1000,
            popupTexts: ['🤖 Alarme : modèle suspect détecté', '🔒 Tentative d\'exfiltration', '⚠️ Alerte OpenAI']
        }
    },
    {
        id: 'amazon',
        name: 'Amazon Prime',
        icon: '📦',
        message: 'Amazon veut vous abonner à Prime...',
        clicksRequired: 35,
        reward: 200,
        color: '#ff9900',
        mechanic: 'timer',
        mechanicParams: {
            timeLimit: 15000,         // 15 secondes seulement !
            timerMessage: '⏰ Livraison Express!'
        }
    },
    {
        id: 'apple',
        name: 'Apple Ecosystem',
        icon: '🍎',
        message: 'Apple veut vous enfermer dans son écosystème...',
        clicksRequired: 40,
        reward: 300,
        color: '#555555',
        mechanic: 'pattern',
        mechanicParams: {
            patternLength: 4,         // 4 touches à reproduire
            patternKeys: ['⬆️', '⬇️', '⬅️', '➡️'],
            patternTimeout: 2000,     // 2s pour chaque touche
            patternMessage: '🔐 Reproduisez le code d\'accès!'
        }
    },
    // === TIER 2 : AVANCÉS ===
    {
        id: 'microsoft-teams',
        name: 'Microsoft Teams',
        icon: '💜',
        message: 'Teams se lance au démarrage et ne veut pas se fermer...',
        clicksRequired: 50,
        reward: 500,
        color: '#6264a7',
        mechanic: 'lag',
        mechanicParams: {
            lagDelay: 400,            // 0.4s de délai
            lagMessage: '🔄 Connexion en cours...'
        }
    },
    {
        id: 'tiktok',
        name: 'TikTok Algorithm',
        icon: '🎵',
        message: 'TikTok veut monopoliser votre attention pendant des heures...',
        clicksRequired: 60,
        reward: 750,
        color: '#000000',
        mechanic: 'moving',
        mechanicParams: {
            moveInterval: 1500,       // Bouge toutes les 1.5s
            moveMessage: '📱 Swipe pour continuer!'
        }
    },
    {
        id: 'nvidia',
        name: 'NVIDIA Drivers',
        icon: '💚',
        message: 'NVIDIA force l\'installation de GeForce Experience...',
        clicksRequired: 70,
        reward: 1000,
        color: '#76b900',
        mechanic: 'shield',
        mechanicParams: {
            shieldDuration: 2000,     // Bouclier actif 2s
            shieldCooldown: 3000,     // Pause de 3s entre boucliers
            shieldMessage: '🛡️ GeForce Experience se protège!'
        }
    },
    // === TIER 3 : BOSS LÉGENDAIRES ===
    {
        id: 'meta-ai',
        name: 'Meta AI',
        icon: '🤖',
        message: 'L\'IA de Meta veut apprendre de toutes vos conversations...',
        clicksRequired: 100,
        reward: 2500,
        color: '#0668E1',
        mechanic: 'phases',
        mechanicParams: {
            phases: [
                { percent: 100, mechanic: 'classic', message: '🤖 Analyse de vos messages...' },
                { percent: 66, mechanic: 'popups', message: '📢 Injection de publicités!' },
                { percent: 33, mechanic: 'invisible', message: '👁️ Mode fantôme activé!' }
            ]
        }
    },
    {
        id: 'skynet-gafam',
        name: 'SKYNET GAFAM',
        icon: '💀',
        message: '⚠️ BOSS FINAL : Les GAFAM ont fusionné en une super-IA !',
        clicksRequired: 150,
        reward: 10000,
        color: '#ff0000',
        mechanic: 'chaos',
        mechanicParams: {
            chaosInterval: 5000,      // Change de mécanique toutes les 5s
            chaosMechanics: ['regen', 'popups', 'shield', 'moving', 'lag'],
            chaosMessage: '⚠️ CHAOS MODE ACTIVÉ!'
        }
    }
    ,
    // === TIER WTF : BOSS THÉORIES DU COMPLOT ===
    {
        id: 'mandela-boss',
        name: 'Effet Mandela',
        icon: '🌀',
        message: 'La réalité change sous vos yeux... Les clics changent de valeur à chaque coup !',
        clicksRequired: 200,
        reward: 20000,
        color: '#a020f0',
        mechanic: 'randomClickValue',
        mechanicParams: {
            min: 1,
            max: 10000,
            message: 'Chaque clic est imprévisible !'
        }
    },
    {
        id: 'illuminati-boss',
        name: 'Illuminati Suprême',
        icon: '🛸',
        message: 'Un triangle mystérieux absorbe vos clics... et les multiplie parfois !',
        clicksRequired: 250,
        reward: 30000,
        color: '#ffd700',
        mechanic: 'multiplierRandom',
        mechanicParams: {
            chance: 0.1,
            multiplier: 10,
            message: 'Multiplicateur secret activé !'
        }
    },
    {
        id: 'flat-earth-boss',
        name: 'Terre Plate',
        icon: '🌍',
        message: 'La gravité disparaît, les clics flottent et sont retardés !',
        clicksRequired: 300,
        reward: 40000,
        color: '#00bfff',
        mechanic: 'delayedClicks',
        mechanicParams: {
            delay: 1000,
            message: 'Les clics mettent 1s à arriver...'
        }
    },
    {
        id: 'simulation-boss',
        name: 'Théorie de la Simulation',
        icon: '👾',
        message: 'Un bug dans la matrice : certains clics sont annulés, d\'autres doublés !',
        clicksRequired: 350,
        reward: 50000,
        color: '#39ff14',
        mechanic: 'buggyClicks',
        mechanicParams: {
            cancelChance: 0.2,
            doubleChance: 0.1,
            message: 'Certains clics sont annulés, d\'autres doublés !'
        }
    },
    {
        id: 'reptilian-boss',
        name: 'Invasion Reptilienne',
        icon: '🦎',
        message: 'Des reptiliens sabotent la production, il faut cliquer très vite !',
        clicksRequired: 400,
        reward: 60000,
        color: '#228b22',
        mechanic: 'timer',
        mechanicParams: {
            timeLimit: 20000,
            timerMessage: 'Vite, avant que les reptiliens ne gagnent !'
        }
    },
    {
        id: 'matrix-glitch-boss',
        name: 'Glitch dans la Matrice',
        icon: '🟩',
        message: 'L\'écran bug, les zones de clic changent de place !',
        clicksRequired: 500,
        reward: 100000,
        color: '#00ff00',
        mechanic: 'movingTarget',
        mechanicParams: {
            moveInterval: 800,
            moveMessage: 'Le boss se déplace sans cesse !'
        }
    },
    {
        id: 'root-access-boss',
        name: 'Accès Root Universel',
        icon: '🗝️',
        message: 'Vous affrontez le root du jeu. Chaque clic peut tout effacer... ou tout multiplier !',
        clicksRequired: 777,
        reward: 777777,
        color: '#ff1493',
        mechanic: 'rootRandom',
        mechanicParams: {
            wipeChance: 0.01,
            jackpotChance: 0.01,
            message: '1% de tout perdre, 1% de tout gagner !'
        }
    }
];

// ============================================
// SKINS DU CLICKER (16 skins)
// ============================================
const SKINS = [
    // === GRATUIT ===
    { id: 'default', name: 'PC Classic', emoji: '💻', cost: 0 },
    // === TIER 1 ===
    { id: 'linux', name: 'Tux', emoji: '🐧', cost: 1000 },
    { id: 'terminal', name: 'Terminal', emoji: '⬛', cost: 2500 },
    { id: 'server', name: 'Serveur', emoji: '🖥️', cost: 5000 },
    // === TIER 2 ===
    { id: 'cloud', name: 'Cloud Libre', emoji: '☁️', cost: 15000 },
    { id: 'robot', name: 'IA Libre', emoji: '🤖', cost: 40000 },
    { id: 'globe', name: 'Internet Libre', emoji: '🌐', cost: 100000 },
    // === TIER 3 ===
    { id: 'satellite', name: 'Satellite', emoji: '🛰️', cost: 300000 },
    { id: 'rocket', name: 'Fusée', emoji: '🚀', cost: 750000 },
    { id: 'ufo', name: 'OVNI Libre', emoji: '🛸', cost: 2000000 },
    // === TIER 4 ===
    { id: 'moon', name: 'Lune', emoji: '🌙', cost: 10000000 },
    { id: 'mars', name: 'Mars', emoji: '🔴', cost: 50000000 },
    { id: 'galaxy', name: 'Galaxie', emoji: '🌌', cost: 250000000 },
    // === TIER 5 ===
    { id: 'blackhole', name: 'Trou Noir', emoji: '🕳️', cost: 1000000000 },
    { id: 'star', name: 'Superstar', emoji: '⭐', cost: 5000000000 },
    // === SKINS WTF COSMIQUES ===
    { id: 'matrix', name: 'La Matrice', emoji: '🟩', cost: 1e13, unlockAtUpgrade: 'univers-simule', description: 'Débloqué avec Univers Simulé' },
    { id: 'god', name: 'Dieu du Code', emoji: '🧙‍♂️', cost: 5e13, unlockAtUpgrade: 'dieu-du-code', description: 'Débloqué avec Dieu du Code' },
    { id: 'bigbang', name: 'Big Bang', emoji: '💥', cost: 2e14, unlockAtUpgrade: 'big-bang-open', description: 'Débloqué avec Big Bang Open Source' },
    { id: 'multivers', name: 'Multivers', emoji: '🌌', cost: 1e15, unlockAtUpgrade: 'multivers-libre', description: 'Débloqué avec Multivers Libre' },
    { id: 'angel', name: 'Ange Simulé', emoji: '👼', cost: 5e15, unlockAtUpgrade: 'simulation-divine', description: 'Débloqué avec Simulation Divine' },
    { id: 'kernel', name: 'Kernel Cosmique', emoji: '🪐', cost: 2e16, unlockAtUpgrade: 'kernel-cosmique', description: 'Débloqué avec Kernel Cosmique' },
    { id: 'root', name: 'Root Final', emoji: '🗝️', cost: 1e17, unlockAtUpgrade: 'root-final', description: 'Débloqué avec Root Final' },
    // === SECRET ===
    { id: 'star-of-david', name: '???', emoji: '❓', cost: 1e20, hidden: true, image: 'images/Star_of_David.png', unlockedName: 'Étoile Secrète' }
];

// ============================================
// SUCCÈS / ACHIEVEMENTS (29 achievements)
// ============================================
const ACHIEVEMENTS = [
    // === CLICS ===
    { id: 'first-click', name: 'Premier pas', description: 'Faites votre premier clic', condition: (/** @type {{ totalClicks: number; }} */ state) => state.totalClicks >= 1, unlocked: false, icon: '👆' },
    { id: 'hundred-clicks', name: 'Cliqueur assidu', description: '100 clics réalisés', condition: (/** @type {{ totalClicks: number; }} */ state) => state.totalClicks >= 100, unlocked: false, icon: '💯' },
    { id: 'thousand-clicks', name: 'Cliqueur fou', description: '1000 clics réalisés', condition: (/** @type {{ totalClicks: number; }} */ state) => state.totalClicks >= 1000, unlocked: false, icon: '🔥' },
    { id: 'tenthousand-clicks', name: 'Cliqueur légendaire', description: '10 000 clics réalisés', condition: (/** @type {{ totalClicks: number; }} */ state) => state.totalClicks >= 10000, unlocked: false, icon: '⚡' },
    { id: 'hundred-thousand-clicks', name: 'Cliqueur cosmique', description: '100 000 clics réalisés', condition: (/** @type {{ totalClicks: number; }} */ state) => state.totalClicks >= 100000, unlocked: false, icon: '🌟' },
    // === UPGRADES ===
    { id: 'first-upgrade', name: 'Investisseur', description: 'Achetez votre première amélioration', condition: (/** @type {{ totalUpgrades: number; }} */ state) => state.totalUpgrades >= 1, unlocked: false, icon: '💰' },
    // @ts-ignore
    // @ts-ignore
    { id: 'linux-master', name: 'Maître Manchot', description: '10 Install Parties organisées', condition: (/** @type {any} */ state) => UPGRADES.find(u => u.id === 'install-party')?.owned >= 10, unlocked: false, icon: '🐧' },
    // @ts-ignore
    // @ts-ignore
    { id: 'datacenter-owner', name: 'Baron du DataCenter', description: 'Possédez 5 DataCenters verts', condition: (/** @type {any} */ state) => UPGRADES.find(u => u.id === 'datacenter-vert')?.owned >= 5, unlocked: false, icon: '🌱' },
    // @ts-ignore
    { id: 'space-pioneer', name: 'Pionnier Spatial', description: 'Possédez une Station Orbitale', condition: (/** @type {any} */ state) => UPGRADES.find(u => u.id === 'station-orbitale')?.owned >= 1, unlocked: false, icon: '🛸' },
    // @ts-ignore
    { id: 'time-master', name: 'Maître du Temps', description: 'Possédez un Accélérateur Temporel', condition: (/** @type {any} */ state) => UPGRADES.find(u => u.id === 'accelerateur-temporel')?.owned >= 1, unlocked: false, icon: '⏰' },
    // === BOSS ===
    { id: 'boss-defeated', name: 'Anti-GAFAM', description: 'Fermez une fenêtre GAFAM', condition: (/** @type {{ bossDefeated: number; }} */ state) => state.bossDefeated >= 1, unlocked: false, icon: '🛡️' },
    { id: 'boss-hunter', name: 'Chasseur de GAFAM', description: 'Fermez 10 fenêtres GAFAM', condition: (/** @type {{ bossDefeated: number; }} */ state) => state.bossDefeated >= 10, unlocked: false, icon: '⚔️' },
    { id: 'boss-slayer', name: 'Tueur de GAFAM', description: 'Fermez 50 fenêtres GAFAM', condition: (/** @type {{ bossDefeated: number; }} */ state) => state.bossDefeated >= 50, unlocked: false, icon: '💀' },
    { id: 'gafam-exterminator', name: 'Exterminateur GAFAM', description: 'Fermez 100 fenêtres GAFAM', condition: (/** @type {{ bossDefeated: number; }} */ state) => state.bossDefeated >= 100, unlocked: false, icon: '☠️' },
    // === SCORE ===
    { id: 'village-complete', name: 'Village Complet', description: 'Atteignez le niveau "Village Numérique"', condition: (/** @type {{ totalScore: number; }} */ state) => state.totalScore >= 15000, unlocked: false, icon: '🏘️' },
    { id: 'millionaire', name: 'Millionnaire Libre', description: 'Atteignez 1 million de points', condition: (/** @type {{ totalScore: number; }} */ state) => state.totalScore >= 1000000, unlocked: false, icon: '💎' },
    { id: 'billionaire', name: 'Milliardaire Libre', description: 'Atteignez 1 milliard de points', condition: (/** @type {{ totalScore: number; }} */ state) => state.totalScore >= 1000000000, unlocked: false, icon: '💠' },
    { id: 'trillionaire', name: 'Trillionaire Cosmique', description: 'Atteignez 1 trillion de points', condition: (/** @type {{ totalScore: number; }} */ state) => state.totalScore >= 1000000000000, unlocked: false, icon: '🌌' },
    // === QUIZ & COMBO ===
    { id: 'quiz-master', name: 'Quiz Master', description: 'Répondez correctement à 5 quiz', condition: (/** @type {{ quizCorrect: number; }} */ state) => state.quizCorrect >= 5, unlocked: false, icon: '🧠' },
    { id: 'quiz-genius', name: 'Génie du Quiz', description: 'Répondez correctement à 25 quiz', condition: (/** @type {{ quizCorrect: number; }} */ state) => state.quizCorrect >= 25, unlocked: false, icon: '🎓' },
    { id: 'combo-master', name: 'Combo Master', description: 'Atteignez un combo de 50', condition: (/** @type {{ maxCombo: number; }} */ state) => state.maxCombo >= 50, unlocked: false, icon: '⚡' },
    { id: 'combo-legend', name: 'Légende du Combo', description: 'Atteignez un combo de 200', condition: (/** @type {{ maxCombo: number; }} */ state) => state.maxCombo >= 200, unlocked: false, icon: '🏆' },
    // === PRESTIGE ===
    { id: 'prestige-1', name: 'Renaissance', description: 'Effectuez votre premier prestige', condition: (/** @type {{ prestigeCount: number; prestigeLevel: number; }} */ state) => state.prestigeCount >= 1 || state.prestigeLevel >= 1, unlocked: false, icon: '🔄' },
    { id: 'prestige-5', name: 'Réincarnation', description: 'Effectuez 5 prestiges', condition: (/** @type {{ prestigeCount: number; prestigeLevel: number; }} */ state) => state.prestigeCount >= 5 || state.prestigeLevel >= 5, unlocked: false, icon: '🌀' },
    { id: 'prestige-master', name: 'Maître du Prestige', description: 'Effectuez 20 prestiges', condition: (/** @type {{ prestigeCount: number; prestigeLevel: number; }} */ state) => state.prestigeCount >= 20 || state.prestigeLevel >= 20, unlocked: false, icon: '👑' },
    // === COLLECTIONS ===
    { id: 'skin-collector', name: 'Collectionneur', description: 'Possédez 5 skins différents', condition: (/** @type {{ skinsUnlocked: string | any[]; }} */ state) => (state.skinsUnlocked && state.skinsUnlocked.length >= 5), unlocked: false, icon: '🎨' },
    { id: 'skin-master', name: 'Maître des Skins', description: 'Possédez 10 skins différents', condition: (/** @type {{ skinsUnlocked: string | any[]; }} */ state) => (state.skinsUnlocked && state.skinsUnlocked.length >= 10), unlocked: false, icon: '🖼️' },
    // @ts-ignore
    { id: 'all-click-upgrades', name: 'Completionniste Clic', description: 'Possédez toutes les améliorations de clic', condition: (/** @type {any} */ state) => CLICK_UPGRADES.every(u => u.purchased), unlocked: false, icon: '✅' },
    { id: 'singularity-reached', name: 'Singularité Atteinte', description: 'Atteignez le niveau "Singularité Éternelle"', condition: (/** @type {{ currentVillageLevel: number; }} */ state) => state.currentVillageLevel >= 14, unlocked: false, icon: '✨' }
];

// ============================================
// MISSIONS QUOTIDIENNES (15 missions)
// ============================================
const DAILY_MISSIONS = [
    // === TIER 1 : FACILES ===
    { id: 'clicks-100', name: '100 Clics', description: 'Effectuez 100 clics', target: 100, type: 'clicks', reward: 100 },
    { id: 'clicks-500', name: '500 Clics', description: 'Effectuez 500 clics', target: 500, type: 'clicks', reward: 300 },
    { id: 'score-1000', name: 'Gagnez 1000 pts', description: 'Gagnez 1000 points de souveraineté', target: 1000, type: 'score', reward: 200 },
    { id: 'upgrade-5', name: '5 Achats', description: 'Achetez 5 améliorations', target: 5, type: 'upgrades', reward: 250 },
    { id: 'boss-1', name: 'Anti-GAFAM', description: 'Fermez 1 popup GAFAM', target: 1, type: 'boss', reward: 150 },
    // === TIER 2 : MOYENNES ===
    { id: 'quiz-1', name: 'Quiz Master', description: 'Répondez correctement à 1 quiz', target: 1, type: 'quiz', reward: 200 },
    { id: 'combo-25', name: 'Combo x25', description: 'Atteignez un combo de 25', target: 25, type: 'combo', reward: 300 },
    { id: 'clicks-2000', name: '2000 Clics', description: 'Effectuez 2000 clics', target: 2000, type: 'clicks', reward: 800 },
    { id: 'score-10000', name: 'Gagnez 10k pts', description: 'Gagnez 10 000 points', target: 10000, type: 'score', reward: 500 },
    { id: 'upgrade-20', name: '20 Achats', description: 'Achetez 20 améliorations', target: 20, type: 'upgrades', reward: 750 },
    // === TIER 3 : DIFFICILES ===
    { id: 'boss-5', name: 'Chasseur de Boss', description: 'Fermez 5 popups GAFAM', target: 5, type: 'boss', reward: 1000 },
    { id: 'combo-100', name: 'Combo x100', description: 'Atteignez un combo de 100', target: 100, type: 'combo', reward: 1500 },
    { id: 'clicks-10000', name: '10k Clics', description: 'Effectuez 10 000 clics', target: 10000, type: 'clicks', reward: 3000 },
    { id: 'score-100000', name: 'Gagnez 100k pts', description: 'Gagnez 100 000 points', target: 100000, type: 'score', reward: 2500 },
    { id: 'quiz-5', name: 'Expert Quiz', description: 'Répondez correctement à 5 quiz', target: 5, type: 'quiz', reward: 2000 }
];

// ============================================
// ÉVÉNEMENTS ALÉATOIRES (12 événements)
// ============================================
const RANDOM_EVENTS = [
    // === NÉGATIFS ===
    {
        id: 'fin-support-windows',
        name: '⚠️ Fin du support Windows 10 !',
        description: 'Microsoft abandonne Windows 10. Les PC non-Linux produisent moitié moins pendant 30 secondes.',
        duration: 30000,
        effect: 'production_halved',
        probability: 0.015
    },
    {
        id: 'panne-internet',
        name: '📡 Panne d\'Internet !',
        description: 'Le FAI est en panne... Heureusement votre serveur local fonctionne !',
        duration: 15000,
        effect: 'clicks_only',
        probability: 0.01
    },
    {
        id: 'cyberattaque',
        name: '🔓 Cyberattaque !',
        description: 'Des hackers attaquent le réseau ! Production réduite pendant 20 secondes.',
        duration: 20000,
        effect: 'production_halved',
        probability: 0.01
    },
    // === POSITIFS FAIBLES ===
    {
        id: 'don-entreprise',
        name: '🎁 Don de PC d\'une entreprise !',
        description: 'Une entreprise locale vous donne 50 PC reconditionnés !',
        effect: 'instant_bonus',
        bonusMultiplier: 100,
        probability: 0.01
    },
    {
        id: 'bug-windows',
        name: '🐛 Bug Windows détecté !',
        description: 'Un bug Windows fait migrer des utilisateurs vers Linux ! Bonus instantané.',
        effect: 'instant_bonus',
        bonusMultiplier: 50,
        probability: 0.02
    },
    {
        id: 'article-presse',
        name: '📰 Article dans la presse !',
        description: 'Votre projet fait le buzz ! Double production pendant 20 secondes.',
        duration: 20000,
        effect: 'production_doubled',
        probability: 0.015
    },
    // === POSITIFS MOYENS ===
    {
        id: 'visite-ministre',
        name: '👔 Visite du Ministre du Numérique !',
        description: 'Le ministre est impressionné ! Triple production pendant 15 secondes.',
        duration: 15000,
        effect: 'production_tripled',
        probability: 0.008
    },
    {
        id: 'hackathon',
        name: '💻 Hackathon Libre !',
        description: 'Un hackathon est organisé ! +500% production pendant 10 secondes.',
        duration: 10000,
        effect: 'production_x5',
        probability: 0.005
    },
    {
        id: 'subvention-europe',
        name: '🇪🇺 Subvention Européenne !',
        description: 'L\'UE finance votre projet ! Bonus instantané x200.',
        effect: 'instant_bonus',
        bonusMultiplier: 200,
        probability: 0.005
    },
    // === POSITIFS RARES ===
    {
        id: 'viral-moment',
        name: '🚀 Moment Viral !',
        description: 'Votre projet devient viral sur les réseaux ! x10 production pendant 30 secondes !',
        duration: 30000,
        effect: 'production_x10',
        probability: 0.002
    },
    {
        id: 'don-fondation',
        name: '💎 Don de la Fondation Linux !',
        description: 'La Fondation Linux vous fait un don massif ! Bonus x500 !',
        effect: 'instant_bonus',
        bonusMultiplier: 500,
        probability: 0.001
    },
    {
        id: 'eclipse-temporelle',
        name: '🌌 Éclipse Temporelle !',
        description: 'Une faille temporelle accélère le temps ! x20 production pendant 15 secondes !',
        duration: 15000,
        effect: 'production_x20',
        probability: 0.0005
    },
    // === EVENTS WTF/COMPLOT ===
    {
        id: 'mandela-effect',
        name: '🌀 Effet Mandela',
        description: 'La réalité change : tous les coûts d\'upgrades sont aléatoirement modifiés pendant 30s.',
        duration: 30000,
        effect: 'randomize_costs',
        unlockAtUpgrade: 'univers-simule',
        probability: 0.0003
    },
    {
        id: 'illuminati',
        name: '🛸 Révélation Illuminati',
        description: 'Un triangle mystérieux triple la production pendant 10s.',
        duration: 10000,
        effect: 'production_tripled',
        unlockAtUpgrade: 'dieu-du-code',
        probability: 0.0002
    },
    {
        id: 'flat-earth',
        name: '🌍 Terre Plate',
        description: 'La gravité disparaît, tous les clics sont multipliés par 10 pendant 15s.',
        duration: 15000,
        effect: 'clicks_x10',
        unlockAtUpgrade: 'big-bang-open',
        probability: 0.0002
    },
    {
        id: 'simulation-theory',
        name: '👾 Théorie de la Simulation',
        description: 'Vous découvrez un bug : bonus instantané x100.',
        effect: 'instant_bonus',
        bonusMultiplier: 100,
        unlockAtUpgrade: 'multivers-libre',
        probability: 0.0002
    },
    {
        id: 'reptilian',
        name: '🦎 Invasion Reptilienne',
        description: 'Des reptiliens sabotent la production (-90%) pendant 10s.',
        duration: 10000,
        effect: 'production_div10',
        unlockAtUpgrade: 'simulation-divine',
        probability: 0.0001
    },
    {
        id: 'matrix-glitch',
        name: '🟩 Glitch dans la Matrice',
        description: 'Un bug visuel fait apparaître des points bonus toutes les secondes pendant 20s.',
        duration: 20000,
        effect: 'bonus_per_second',
        bonusPerSecond: 1000000,
        unlockAtUpgrade: 'kernel-cosmique',
        probability: 0.0001
    },
    {
        id: 'root-access',
        name: '🗝️ Accès Root Universel',
        description: 'Vous obtenez le root du jeu : x100 production pendant 5s.',
        duration: 5000,
        effect: 'production_x100',
        unlockAtUpgrade: 'root-final',
        probability: 0.00005
    }
];

// ============================================
// QUIZ SUR LE NUMÉRIQUE RESPONSABLE (20 questions)
// ============================================
const QUIZ_QUESTIONS = [
    // === BASIQUES ===
    {
        question: "Quel est le système d'exploitation libre le plus connu ?",
        answers: ["Linux", "Windows", "macOS", "ChromeOS"],
        correct: 0,
        info: "Linux est un système d'exploitation libre créé par Linus Torvalds en 1991."
    },
    {
        question: "Que signifie RGPD ?",
        answers: ["Règlement Général sur la Protection des Données", "Réseau Global de Partage Digital", "Registre Général des Pages Dynamiques", "Règles Générales des Protocoles Digitaux"],
        correct: 0,
        info: "Le RGPD protège les données personnelles des citoyens européens depuis 2018."
    },
    {
        question: "Quel est l'impact écologique d'un email avec pièce jointe de 1 Mo ?",
        answers: ["≈ 20g de CO2", "≈ 1g de CO2", "≈ 0.1g de CO2", "≈ 100g de CO2"],
        correct: 0,
        info: "Un email avec pièce jointe émet environ 20g de CO2, équivalent à une ampoule allumée 1h."
    },
    {
        question: "Quelle est la durée de vie moyenne d'un smartphone en France ?",
        answers: ["2-3 ans", "5-6 ans", "1 an", "7-8 ans"],
        correct: 0,
        info: "En moyenne, les Français changent de smartphone tous les 2-3 ans."
    },
    {
        question: "Que signifie le terme 'Open Source' ?",
        answers: ["Code source ouvert et modifiable", "Logiciel gratuit", "Application web", "Service cloud"],
        correct: 0,
        info: "Open Source signifie que le code est accessible, modifiable et redistribuable par tous."
    },
    // === ENVIRONNEMENT ===
    {
        question: "Quel pourcentage de l'empreinte carbone du numérique vient des terminaux ?",
        answers: ["≈ 70%", "≈ 30%", "≈ 50%", "≈ 10%"],
        correct: 0,
        info: "La fabrication des appareils représente environ 70% de l'impact environnemental du numérique."
    },
    {
        question: "Qu'est-ce que la 'sobriété numérique' ?",
        answers: ["Utiliser le numérique de façon raisonnée", "Ne plus utiliser d'ordinateur", "Utiliser uniquement des logiciels libres", "Avoir moins de 10 apps"],
        correct: 0,
        info: "La sobriété numérique consiste à modérer ses usages pour réduire l'impact environnemental."
    },
    {
        question: "Combien de litres d'eau faut-il pour fabriquer un ordinateur ?",
        answers: ["≈ 1500 litres", "≈ 100 litres", "≈ 500 litres", "≈ 50 litres"],
        correct: 0,
        info: "La fabrication d'un PC nécessite environ 1500 litres d'eau et de nombreuses ressources rares."
    },
    {
        question: "Le streaming vidéo représente quel % du trafic internet mondial ?",
        answers: ["≈ 60%", "≈ 20%", "≈ 40%", "≈ 80%"],
        correct: 0,
        info: "Le streaming vidéo est le plus gros consommateur de bande passante internet."
    },
    // === LINUX & LIBRE ===
    {
        question: "Quel animal est la mascotte de Linux ?",
        answers: ["Un manchot (Tux)", "Un renard", "Un éléphant", "Un chat"],
        correct: 0,
        info: "Tux le manchot est la mascotte officielle de Linux depuis 1996."
    },
    {
        question: "En quelle année Linux a-t-il été créé ?",
        answers: ["1991", "1985", "1999", "2001"],
        correct: 0,
        info: "Linus Torvalds a publié la première version de Linux en 1991."
    },
    {
        question: "Quel pourcentage des serveurs web utilisent Linux ?",
        answers: ["≈ 90%", "≈ 50%", "≈ 70%", "≈ 30%"],
        correct: 0,
        info: "Linux domine le marché des serveurs web grâce à sa stabilité et son coût."
    },
    {
        question: "Qu'est-ce que GNU dans GNU/Linux ?",
        answers: ["Un projet de logiciels libres", "Une distribution Linux", "Un langage de programmation", "Un type de licence"],
        correct: 0,
        info: "GNU est le projet de Richard Stallman fournissant les outils autour du noyau Linux."
    },
    // === RÉPARATION & RECYCLAGE ===
    {
        question: "Que permet le 'droit à la réparation' ?",
        answers: ["Réparer soi-même ses appareils", "Retourner un produit défectueux", "Obtenir une garantie à vie", "Échanger contre un neuf"],
        correct: 0,
        info: "Le droit à la réparation vise à prolonger la durée de vie des appareils."
    },
    {
        question: "Qu'est-ce que l'indice de réparabilité ?",
        answers: ["Une note de 1 à 10 sur la réparabilité", "Le nombre de pièces détachées", "Le coût de réparation", "La durée de garantie"],
        correct: 0,
        info: "L'indice de réparabilité est obligatoire en France depuis 2021."
    },
    // === AVANCÉS ===
    {
        question: "Quelle quantité de déchets électroniques sont générés mondialement par an ?",
        answers: ["≈ 50 millions de tonnes", "≈ 10 millions de tonnes", "≈ 100 millions de tonnes", "≈ 5 millions de tonnes"],
        correct: 0,
        info: "Plus de 50 millions de tonnes de déchets électroniques sont produits chaque année."
    },
    {
        question: "Qu'est-ce qu'un Fairphone ?",
        answers: ["Un smartphone éthique et réparable", "Une application de paiement", "Un réseau social", "Un FAI français"],
        correct: 0,
        info: "Fairphone est une entreprise néerlandaise qui fabrique des smartphones éthiques."
    },
    {
        question: "La 4G consomme combien de fois plus d'énergie que le WiFi ?",
        answers: ["≈ 20 fois plus", "≈ 2 fois plus", "≈ 5 fois plus", "≈ 50 fois plus"],
        correct: 0,
        info: "Privilégier le WiFi à la 4G/5G réduit significativement la consommation énergétique."
    },
    {
        question: "Quel métal rare est essentiel pour les batteries de smartphones ?",
        answers: ["Le cobalt", "L'or", "Le cuivre", "L'aluminium"],
        correct: 0,
        info: "Le cobalt est souvent extrait dans des conditions controversées en RDC."
    },
    {
        question: "Qu'est-ce que la neutralité du net ?",
        answers: ["L'égalité de traitement de tous les flux de données", "Un internet gratuit", "Un VPN gouvernemental", "Un protocole de sécurité"],
        correct: 0,
        info: "La neutralité du net garantit que tous les contenus sont traités équitablement."
    }
];

// ============================================
// TIPS ÉDUCATIFS ALÉATOIRES
// ============================================
const EDUCATIONAL_TIPS = [
    "💡 Saviez-vous ? Un email stocké pendant 1 an consomme autant qu'une ampoule allumée 24h.",
    "💡 Astuce : Désactivez les notifications push pour économiser la batterie et réduire les échanges de données.",
    "💡 Le saviez-vous ? 80% des déchets électroniques ne sont pas recyclés correctement.",
    "💡 Un smartphone contient plus de 70 matériaux différents, dont des métaux rares.",
    "💡 Réparer plutôt que jeter : un PC peut durer 10 ans avec un bon entretien !",
    "💡 Le streaming vidéo représente 60% du trafic internet mondial.",
    "💡 Préférez le WiFi à la 4G : c'est 20x moins énergivore !",
    "💡 Un data center consomme autant d'électricité qu'une ville de 30 000 habitants.",
    "💡 Les logiciels libres comme Firefox ou LibreOffice sont des alternatives éthiques.",
    "💡 L'obsolescence programmée est illégale en France depuis 2015.",
    "💡 Télécharger une vidéo plutôt que la streamer plusieurs fois réduit l'impact écologique.",
    "💡 Le mode sombre peut économiser jusqu'à 60% de batterie sur écran OLED.",
    "💡 Pensez à vider régulièrement votre boîte mail : moins de stockage = moins d'énergie.",
    "💡 Un Fairphone est conçu pour être réparable et durable.",
    "💡 Le recyclage d'un téléphone permet de récupérer de l'or, de l'argent et du cuivre."
];

// ============================================
// MESSAGES DE CLIC
// ============================================
const CLICK_MESSAGES = [
    "sudo apt-get install liberté",
    "rm -rf /windows/*",
    "Octet libéré !",
    "Bye bye Microsoft !",
    "Open Source FTW!",
    "Vive le libre !",
    "Tux approuve !",
    "GNU/Linux > Windows",
    "RGPD validé ✓",
    "Données souveraines !",
    "Hébergement en France !",
    "No GAFAM zone",
    "apt update && apt upgrade",
    "chmod +x liberté.sh",
    "git commit -m 'Freedom'",
    "pip install souveraineté"
];

// ============================================
// THÈMES VISUELS
// ============================================
const THEMES = [
    { id: 'dark', name: '🌙 Sombre', class: 'theme-dark' },
    { id: 'light', name: '☀️ Clair', class: 'theme-light' },
    { id: 'hacker', name: '💚 Hacker', class: 'theme-hacker' },
    { id: 'ocean', name: '🌊 Océan', class: 'theme-ocean' },
    { id: 'sunset', name: '🌅 Coucher de soleil', class: 'theme-sunset' }
];

// ============================================
// ENCYCLOPÉDIE NIRD
// ============================================
const ENCYCLOPEDIA = [
    {
        id: 'nird',
        title: 'NIRD',
        subtitle: 'Numérique Inclusif, Responsable et Durable',
        content: 'Le NIRD est une démarche éducative visant à sensibiliser les élèves aux enjeux du numérique responsable. Elle promeut l\'utilisation de logiciels libres, le recyclage des équipements et la sobriété numérique.',
        icon: '🌱'
    },
    {
        id: 'opensource',
        title: 'Open Source',
        subtitle: 'Le code libre pour tous',
        content: 'Le logiciel open source est un logiciel dont le code source est accessible, modifiable et redistribuable par tous. Il favorise la collaboration, la transparence et l\'innovation collective.',
        icon: '📖'
    },
    {
        id: 'linux',
        title: 'Linux',
        subtitle: 'Le système d\'exploitation libre',
        content: 'Linux est un système d\'exploitation libre créé par Linus Torvalds en 1991. Il équipe 90% des serveurs web mondiaux et la majorité des smartphones (Android). Sa mascotte est Tux le manchot.',
        icon: '🐧'
    },
    {
        id: 'rgpd',
        title: 'RGPD',
        subtitle: 'Protection des données personnelles',
        content: 'Le Règlement Général sur la Protection des Données est entré en vigueur en mai 2018. Il donne aux citoyens européens le contrôle de leurs données personnelles et impose des obligations aux entreprises.',
        icon: '🔒'
    },
    {
        id: 'sobriete',
        title: 'Sobriété Numérique',
        subtitle: 'Moins mais mieux',
        content: 'La sobriété numérique consiste à modérer ses usages numériques pour réduire l\'impact environnemental. Elle passe par le prolongement de la durée de vie des appareils, la réduction du stockage inutile et l\'optimisation des usages.',
        icon: '♻️'
    },
    {
        id: 'reparation',
        title: 'Droit à la Réparation',
        subtitle: 'Réparer plutôt que jeter',
        content: 'Le droit à la réparation vise à permettre aux consommateurs de réparer leurs appareils. En France, l\'indice de réparabilité est obligatoire depuis 2021 sur certains produits électroniques.',
        icon: '🔧'
    }
];
