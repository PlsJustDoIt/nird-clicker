/**
 * NIRD Clicker - Équilibrage du jeu
 * Toutes les données de progression, coûts, et contenus
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// CONSTANTES D'ÉQUILIBRAGE
// ============================================
const COST_MULTIPLIER = 1.12;  // Multiplicateur de coût par achat
const SAVE_INTERVAL = 10000;   // Intervalle de sauvegarde (ms)
const BOSS_INTERVAL_MIN = 45000;
const BOSS_INTERVAL_MAX = 120000;
const BOSS_CLICKS_REQUIRED = 20;
const QUIZ_INTERVAL = 90000;
const TIP_INTERVAL = 60000;
const PRESTIGE_THRESHOLD = 500000;  // Score minimum pour prestige
const PRESTIGE_BONUS_PER_LEVEL = 0.05;  // Bonus par niveau de prestige

// ============================================
// UPGRADES DE PRODUCTION (20 niveaux)
// ============================================
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
    }
];

// ============================================
// AMÉLIORATIONS DE CLIC (12 niveaux)
// ============================================
const CLICK_UPGRADES = [
    // === TIER 1 : BASIQUE ===
    {
        id: 'souris-ergonomique',
        name: '🖱️ Souris Ergonomique',
        description: '+1 point par clic',
        cost: 50,
        bonus: 1,
        purchased: false
    },
    {
        id: 'clavier-mecanique',
        name: '⌨️ Clavier Mécanique Libre',
        description: '+2 points par clic',
        cost: 250,
        bonus: 2,
        purchased: false
    },
    {
        id: 'trackball-pro',
        name: '🎱 Trackball Pro',
        description: '+4 points par clic',
        cost: 800,
        bonus: 4,
        purchased: false
    },
    // === TIER 2 : AUTOMATISATION ===
    {
        id: 'script-automatisation',
        name: '📜 Script d\'Automatisation',
        description: '+8 points par clic',
        cost: 3000,
        bonus: 8,
        purchased: false
    },
    {
        id: 'macro-avancee',
        name: '🔁 Macro Avancée',
        description: '+15 points par clic',
        cost: 10000,
        bonus: 15,
        purchased: false
    },
    {
        id: 'bot-ethique',
        name: '🤖 Bot Éthique Open Source',
        description: '+30 points par clic',
        cost: 40000,
        bonus: 30,
        purchased: false
    },
    // === TIER 3 : IA ===
    {
        id: 'ia-locale',
        name: '🧠 IA Locale LLaMA',
        description: '+60 points par clic',
        cost: 150000,
        bonus: 60,
        purchased: false
    },
    {
        id: 'reseau-neuronal',
        name: '🕸️ Réseau Neuronal Libre',
        description: '+120 points par clic',
        cost: 600000,
        bonus: 120,
        purchased: false
    },
    {
        id: 'agi-open-source',
        name: '💫 AGI Open Source',
        description: '+250 points par clic',
        cost: 2500000,
        bonus: 250,
        purchased: false
    },
    // === TIER 4 : QUANTIQUE ===
    {
        id: 'qubit-libre',
        name: '⚛️ Qubit Libre',
        description: '+500 points par clic',
        cost: 10000000,
        bonus: 500,
        purchased: false
    },
    {
        id: 'processeur-quantique',
        name: '🔮 Processeur Quantique Open',
        description: '+1000 points par clic',
        cost: 50000000,
        bonus: 1000,
        purchased: false
    },
    {
        id: 'superposition-temporelle',
        name: '🌌 Superposition Temporelle',
        description: '+2500 points par clic',
        cost: 500000000,
        bonus: 2500,
        purchased: false
    }
];

// ============================================
// NIVEAUX DE VILLAGE (15 niveaux)
// ============================================
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
    }
];

// ============================================
// BOSS GAFAM (10 boss)
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
        color: '#0078d4'
    },
    {
        id: 'google',
        name: 'Google Tracking',
        icon: '🔍',
        message: 'Google veut collecter vos données personnelles...',
        clicksRequired: 25,
        reward: 100,
        color: '#4285f4'
    },
    {
        id: 'facebook',
        name: 'Facebook Ads',
        icon: '📘',
        message: 'Facebook veut vous montrer des publicités ciblées...',
        clicksRequired: 30,
        reward: 150,
        color: '#1877f2'
    },
    {
        id: 'amazon',
        name: 'Amazon Prime',
        icon: '📦',
        message: 'Amazon veut vous abonner à Prime...',
        clicksRequired: 35,
        reward: 200,
        color: '#ff9900'
    },
    {
        id: 'apple',
        name: 'Apple Ecosystem',
        icon: '🍎',
        message: 'Apple veut vous enfermer dans son écosystème...',
        clicksRequired: 40,
        reward: 300,
        color: '#555555'
    },
    // === TIER 2 : AVANCÉS ===
    {
        id: 'microsoft-teams',
        name: 'Microsoft Teams',
        icon: '💜',
        message: 'Teams se lance au démarrage et ne veut pas se fermer...',
        clicksRequired: 50,
        reward: 500,
        color: '#6264a7'
    },
    {
        id: 'tiktok',
        name: 'TikTok Algorithm',
        icon: '🎵',
        message: 'TikTok veut monopoliser votre attention pendant des heures...',
        clicksRequired: 60,
        reward: 750,
        color: '#000000'
    },
    {
        id: 'nvidia',
        name: 'NVIDIA Drivers',
        icon: '💚',
        message: 'NVIDIA force l\'installation de GeForce Experience...',
        clicksRequired: 70,
        reward: 1000,
        color: '#76b900'
    },
    // === TIER 3 : BOSS LÉGENDAIRES ===
    {
        id: 'meta-ai',
        name: 'Meta AI',
        icon: '🤖',
        message: 'L\'IA de Meta veut apprendre de toutes vos conversations...',
        clicksRequired: 100,
        reward: 2500,
        color: '#0668E1'
    },
    {
        id: 'skynet-gafam',
        name: 'SKYNET GAFAM',
        icon: '💀',
        message: '⚠️ BOSS FINAL : Les GAFAM ont fusionné en une super-IA !',
        clicksRequired: 150,
        reward: 10000,
        color: '#ff0000'
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
    // === SECRET ===
    { id: 'star-of-david', name: '???', emoji: '❓', cost: 1000000000000000, hidden: true, image: 'images/Star_of_David.png', unlockedName: 'Étoile Secrète' }
];

// ============================================
// SUCCÈS / ACHIEVEMENTS (29 achievements)
// ============================================
const ACHIEVEMENTS = [
    // === CLICS ===
    { id: 'first-click', name: 'Premier pas', description: 'Faites votre premier clic', condition: (state) => state.totalClicks >= 1, unlocked: false, icon: '👆' },
    { id: 'hundred-clicks', name: 'Cliqueur assidu', description: '100 clics réalisés', condition: (state) => state.totalClicks >= 100, unlocked: false, icon: '💯' },
    { id: 'thousand-clicks', name: 'Cliqueur fou', description: '1000 clics réalisés', condition: (state) => state.totalClicks >= 1000, unlocked: false, icon: '🔥' },
    { id: 'tenthousand-clicks', name: 'Cliqueur légendaire', description: '10 000 clics réalisés', condition: (state) => state.totalClicks >= 10000, unlocked: false, icon: '⚡' },
    { id: 'hundred-thousand-clicks', name: 'Cliqueur cosmique', description: '100 000 clics réalisés', condition: (state) => state.totalClicks >= 100000, unlocked: false, icon: '🌟' },
    // === UPGRADES ===
    { id: 'first-upgrade', name: 'Investisseur', description: 'Achetez votre première amélioration', condition: (state) => state.totalUpgrades >= 1, unlocked: false, icon: '💰' },
    { id: 'linux-master', name: 'Maître Manchot', description: '10 Install Parties organisées', condition: (state) => UPGRADES.find(u => u.id === 'install-party')?.owned >= 10, unlocked: false, icon: '🐧' },
    { id: 'datacenter-owner', name: 'Baron du DataCenter', description: 'Possédez 5 DataCenters verts', condition: (state) => UPGRADES.find(u => u.id === 'datacenter-vert')?.owned >= 5, unlocked: false, icon: '🌱' },
    { id: 'space-pioneer', name: 'Pionnier Spatial', description: 'Possédez une Station Orbitale', condition: (state) => UPGRADES.find(u => u.id === 'station-orbitale')?.owned >= 1, unlocked: false, icon: '🛸' },
    { id: 'time-master', name: 'Maître du Temps', description: 'Possédez un Accélérateur Temporel', condition: (state) => UPGRADES.find(u => u.id === 'accelerateur-temporel')?.owned >= 1, unlocked: false, icon: '⏰' },
    // === BOSS ===
    { id: 'boss-defeated', name: 'Anti-GAFAM', description: 'Fermez une fenêtre GAFAM', condition: (state) => state.bossDefeated >= 1, unlocked: false, icon: '🛡️' },
    { id: 'boss-hunter', name: 'Chasseur de GAFAM', description: 'Fermez 10 fenêtres GAFAM', condition: (state) => state.bossDefeated >= 10, unlocked: false, icon: '⚔️' },
    { id: 'boss-slayer', name: 'Tueur de GAFAM', description: 'Fermez 50 fenêtres GAFAM', condition: (state) => state.bossDefeated >= 50, unlocked: false, icon: '💀' },
    { id: 'gafam-exterminator', name: 'Exterminateur GAFAM', description: 'Fermez 100 fenêtres GAFAM', condition: (state) => state.bossDefeated >= 100, unlocked: false, icon: '☠️' },
    // === SCORE ===
    { id: 'village-complete', name: 'Village Complet', description: 'Atteignez le niveau "Village Numérique"', condition: (state) => state.totalScore >= 15000, unlocked: false, icon: '🏘️' },
    { id: 'millionaire', name: 'Millionnaire Libre', description: 'Atteignez 1 million de points', condition: (state) => state.totalScore >= 1000000, unlocked: false, icon: '💎' },
    { id: 'billionaire', name: 'Milliardaire Libre', description: 'Atteignez 1 milliard de points', condition: (state) => state.totalScore >= 1000000000, unlocked: false, icon: '💠' },
    { id: 'trillionaire', name: 'Trillionaire Cosmique', description: 'Atteignez 1 trillion de points', condition: (state) => state.totalScore >= 1000000000000, unlocked: false, icon: '🌌' },
    // === QUIZ & COMBO ===
    { id: 'quiz-master', name: 'Quiz Master', description: 'Répondez correctement à 5 quiz', condition: (state) => state.quizCorrect >= 5, unlocked: false, icon: '🧠' },
    { id: 'quiz-genius', name: 'Génie du Quiz', description: 'Répondez correctement à 25 quiz', condition: (state) => state.quizCorrect >= 25, unlocked: false, icon: '🎓' },
    { id: 'combo-master', name: 'Combo Master', description: 'Atteignez un combo de 50', condition: (state) => state.maxCombo >= 50, unlocked: false, icon: '⚡' },
    { id: 'combo-legend', name: 'Légende du Combo', description: 'Atteignez un combo de 200', condition: (state) => state.maxCombo >= 200, unlocked: false, icon: '🏆' },
    // === PRESTIGE ===
    { id: 'prestige-1', name: 'Renaissance', description: 'Effectuez votre premier prestige', condition: (state) => state.prestigeCount >= 1 || state.prestigeLevel >= 1, unlocked: false, icon: '🔄' },
    { id: 'prestige-5', name: 'Réincarnation', description: 'Effectuez 5 prestiges', condition: (state) => state.prestigeCount >= 5 || state.prestigeLevel >= 5, unlocked: false, icon: '🌀' },
    { id: 'prestige-master', name: 'Maître du Prestige', description: 'Effectuez 20 prestiges', condition: (state) => state.prestigeCount >= 20 || state.prestigeLevel >= 20, unlocked: false, icon: '👑' },
    // === COLLECTIONS ===
    { id: 'skin-collector', name: 'Collectionneur', description: 'Possédez 5 skins différents', condition: (state) => (state.skinsUnlocked && state.skinsUnlocked.length >= 5), unlocked: false, icon: '🎨' },
    { id: 'skin-master', name: 'Maître des Skins', description: 'Possédez 10 skins différents', condition: (state) => (state.skinsUnlocked && state.skinsUnlocked.length >= 10), unlocked: false, icon: '🖼️' },
    { id: 'all-click-upgrades', name: 'Completionniste Clic', description: 'Possédez toutes les améliorations de clic', condition: (state) => CLICK_UPGRADES.every(u => u.purchased), unlocked: false, icon: '✅' },
    { id: 'singularity-reached', name: 'Singularité Atteinte', description: 'Atteignez le niveau "Singularité Éternelle"', condition: (state) => state.currentVillageLevel >= 14, unlocked: false, icon: '✨' }
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
