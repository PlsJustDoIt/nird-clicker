/**
 * NIRD Clicker - Données du jeu (Version Complète)
 * Définition des upgrades, événements, boss, quiz et constantes
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// UPGRADES DE PRODUCTION
// ============================================
const UPGRADES = [
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
        info: '💡 Linux permet de faire revivre de vieux PC. Une Install Party est un événement convivial où l\'on aide à installer des logiciels libres.',
        baseCost: 100,
        baseProduction: 5,
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
        baseProduction: 20,
        owned: 0,
        unlocked: true,
        icon: '🔧'
    },
    {
        id: 'serveur-forge',
        name: '🏭 Serveur La Forge',
        description: 'Mutualisation des ressources avec un serveur hébergé en France.',
        info: '💡 La Forge est une initiative du gouvernement pour fournir des outils numériques souverains aux établissements.',
        baseCost: 2000,
        baseProduction: 75,
        owned: 0,
        unlocked: false,
        unlockAt: 1000,
        icon: '🏭'
    },
    {
        id: 'mairie-adherente',
        name: '🏛️ Adhésion de la Mairie',
        description: 'La mairie soutient le projet avec des financements et du matériel.',
        info: '💡 Les collectivités territoriales jouent un rôle clé dans la transition numérique responsable.',
        baseCost: 10000,
        baseProduction: 300,
        owned: 0,
        unlocked: false,
        unlockAt: 5000,
        icon: '🏛️'
    },
    {
        id: 'datacenter-vert',
        name: '🌱 DataCenter Écologique',
        description: 'Un datacenter alimenté par des énergies renouvelables.',
        info: '💡 Les datacenters consomment énormément d\'énergie. Les alimenter en renouvelable est crucial.',
        baseCost: 50000,
        baseProduction: 1200,
        owned: 0,
        unlocked: false,
        unlockAt: 25000,
        icon: '🌱'
    },
    {
        id: 'reseau-national',
        name: '🗼 Réseau National NIRD',
        description: 'Connectez tous les villages numériques de France !',
        info: '💡 Le projet NIRD vise à créer un réseau d\'établissements engagés pour un numérique responsable.',
        baseCost: 200000,
        baseProduction: 5000,
        owned: 0,
        unlocked: false,
        unlockAt: 100000,
        icon: '🗼'
    },
    {
        id: 'liberation-totale',
        name: '🏆 Libération Totale',
        description: 'L\'indépendance numérique complète ! Plus aucun GAFAM.',
        info: '💡 L\'objectif ultime : un écosystème numérique 100% libre et souverain.',
        baseCost: 1000000,
        baseProduction: 25000,
        owned: 0,
        unlocked: false,
        unlockAt: 500000,
        icon: '🏆'
    }
];

// ============================================
// AMÉLIORATIONS DE CLIC
// ============================================
const CLICK_UPGRADES = [
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
        cost: 200,
        bonus: 2,
        purchased: false
    },
    {
        id: 'script-automatisation',
        name: '📜 Script d\'Automatisation',
        description: '+5 points par clic',
        cost: 1000,
        bonus: 5,
        purchased: false
    },
    {
        id: 'ia-locale',
        name: '🤖 IA Locale Open Source',
        description: '+15 points par clic',
        cost: 5000,
        bonus: 15,
        purchased: false
    }
];

// ============================================
// SKINS POUR LE PC CLIQUABLE
// ============================================
const PC_SKINS = [
    { id: 'default', name: '💻 PC Standard', emoji: '💻', cost: 0, owned: true },
    { id: 'tux', name: '🐧 Tux le Manchot', emoji: '🐧', cost: 500, owned: false },
    { id: 'raspberry', name: '🍓 Raspberry Pi', emoji: '🍓', cost: 1000, owned: false },
    { id: 'server', name: '🖥️ Serveur Linux', emoji: '🖥️', cost: 2500, owned: false },
    { id: 'retro', name: '📟 PC Rétro', emoji: '📟', cost: 5000, owned: false },
    { id: 'robot', name: '🤖 Robot Libre', emoji: '🤖', cost: 10000, owned: false },
    { id: 'earth', name: '🌍 Planète Verte', emoji: '🌍', cost: 25000, owned: false },
    { id: 'rocket', name: '🚀 Fusée Open Source', emoji: '🚀', cost: 50000, owned: false },
    { id: 'star', name: '⭐ Étoile du Libre', emoji: '⭐', cost: 100000, owned: false }
];

// ============================================
// BOSS GAFAM
// ============================================
const BOSS_TYPES = [
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
    }
];

// ============================================
// QUIZ SUR LE NUMÉRIQUE RESPONSABLE
// ============================================
const QUIZ_QUESTIONS = [
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
        info: "En moyenne, les Français changent de smartphone tous les 2-3 ans, alors qu'il pourrait durer plus longtemps."
    },
    {
        question: "Que signifie le terme 'Open Source' ?",
        answers: ["Code source ouvert et modifiable", "Logiciel gratuit", "Application web", "Service cloud"],
        correct: 0,
        info: "Open Source signifie que le code est accessible, modifiable et redistribuable par tous."
    },
    {
        question: "Quel pourcentage de l'empreinte carbone du numérique vient des terminaux ?",
        answers: ["≈ 70%", "≈ 30%", "≈ 50%", "≈ 10%"],
        correct: 0,
        info: "La fabrication des appareils représente environ 70% de l'impact environnemental du numérique."
    },
    {
        question: "Qu'est-ce que la 'sobriété numérique' ?",
        answers: ["Utiliser le numérique de façon raisonnée", "Ne plus utiliser d'ordinateur", "Utiliser uniquement des logiciels libres", "Avoir moins de 10 apps sur son téléphone"],
        correct: 0,
        info: "La sobriété numérique consiste à modérer ses usages pour réduire l'impact environnemental."
    },
    {
        question: "Quel animal est la mascotte de Linux ?",
        answers: ["Un manchot (Tux)", "Un renard", "Un éléphant", "Un chat"],
        correct: 0,
        info: "Tux le manchot est la mascotte officielle de Linux depuis 1996."
    },
    {
        question: "Combien de litres d'eau faut-il pour fabriquer un ordinateur ?",
        answers: ["≈ 1500 litres", "≈ 100 litres", "≈ 500 litres", "≈ 50 litres"],
        correct: 0,
        info: "La fabrication d'un PC nécessite environ 1500 litres d'eau et de nombreuses ressources rares."
    },
    {
        question: "Que permet le 'droit à la réparation' ?",
        answers: ["Réparer soi-même ses appareils", "Retourner un produit défectueux", "Obtenir une garantie à vie", "Échanger un appareil contre un neuf"],
        correct: 0,
        info: "Le droit à la réparation vise à prolonger la durée de vie des appareils et réduire les déchets."
    }
];

// ============================================
// MISSIONS QUOTIDIENNES
// ============================================
const DAILY_MISSIONS = [
    { id: 'clicks-100', name: '100 Clics', description: 'Effectuez 100 clics', target: 100, type: 'clicks', reward: 100 },
    { id: 'clicks-500', name: '500 Clics', description: 'Effectuez 500 clics', target: 500, type: 'clicks', reward: 300 },
    { id: 'score-1000', name: 'Gagnez 1000 pts', description: 'Gagnez 1000 points de souveraineté', target: 1000, type: 'score', reward: 200 },
    { id: 'upgrade-5', name: '5 Achats', description: 'Achetez 5 améliorations', target: 5, type: 'upgrades', reward: 250 },
    { id: 'boss-1', name: 'Anti-GAFAM', description: 'Fermez 1 popup GAFAM', target: 1, type: 'boss', reward: 150 },
    { id: 'quiz-1', name: 'Quiz Master', description: 'Répondez correctement à 1 quiz', target: 1, type: 'quiz', reward: 200 },
    { id: 'combo-25', name: 'Combo x25', description: 'Atteignez un combo de 25', target: 25, type: 'combo', reward: 300 }
];

// ============================================
// ÉVÉNEMENTS ALÉATOIRES
// ============================================
const RANDOM_EVENTS = [
    {
        id: 'fin-support-windows',
        name: '⚠️ Fin du support Windows 10 !',
        description: 'Microsoft abandonne Windows 10. Les PC non-Linux produisent moitié moins pendant 30 secondes.',
        duration: 30000,
        effect: 'production_halved',
        probability: 0.02
    },
    {
        id: 'don-entreprise',
        name: '🎁 Don de PC d\'une entreprise !',
        description: 'Une entreprise locale vous donne 50 PC reconditionnés !',
        effect: 'instant_bonus',
        bonusMultiplier: 100,
        probability: 0.01
    },
    {
        id: 'article-presse',
        name: '📰 Article dans la presse !',
        description: 'Votre projet fait le buzz ! Double production pendant 20 secondes.',
        duration: 20000,
        effect: 'production_doubled',
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
        id: 'visite-ministre',
        name: '👔 Visite du Ministre du Numérique !',
        description: 'Le ministre est impressionné ! Triple production pendant 15 secondes.',
        duration: 15000,
        effect: 'production_tripled',
        probability: 0.005
    },
    {
        id: 'hackathon',
        name: '💻 Hackathon Libre !',
        description: 'Un hackathon est organisé ! +500% production pendant 10 secondes.',
        duration: 10000,
        effect: 'production_x5',
        probability: 0.003
    },
    {
        id: 'bug-windows',
        name: '🐛 Bug Windows détecté !',
        description: 'Un bug Windows fait migrer des utilisateurs vers Linux ! Bonus instantané.',
        effect: 'instant_bonus',
        bonusMultiplier: 50,
        probability: 0.02
    }
];

// ============================================
// NIVEAUX DE VILLAGE
// ============================================
const VILLAGE_LEVELS = [
    { name: 'Salle Informatique', minScore: 0, emoji: '🏫', description: 'Une simple salle avec quelques vieux PC' },
    { name: 'Club Numérique', minScore: 500, emoji: '💻', description: 'Un club de passionnés se forme' },
    { name: 'Fablab Citoyen', minScore: 2000, emoji: '🔧', description: 'Un atelier de réparation et création' },
    { name: 'Village Numérique', minScore: 10000, emoji: '🏘️', description: 'Tout le quartier est connecté librement' },
    { name: 'Cité de la Liberté', minScore: 50000, emoji: '🏰', description: 'Une vraie cité du libre est née' },
    { name: 'Métropole Souveraine', minScore: 200000, emoji: '🌆', description: 'Une métropole 100% souveraine' },
    { name: 'Nation Libre', minScore: 1000000, emoji: '🗽', description: 'L\'indépendance numérique totale !' }
];

// ============================================
// SUCCÈS / ACHIEVEMENTS
// ============================================
const ACHIEVEMENTS = [
    { id: 'first-click', name: 'Premier pas', description: 'Faites votre premier clic', condition: (state) => state.totalClicks >= 1, unlocked: false, icon: '👆' },
    { id: 'hundred-clicks', name: 'Cliqueur assidu', description: '100 clics réalisés', condition: (state) => state.totalClicks >= 100, unlocked: false, icon: '💯' },
    { id: 'thousand-clicks', name: 'Cliqueur fou', description: '1000 clics réalisés', condition: (state) => state.totalClicks >= 1000, unlocked: false, icon: '🔥' },
    { id: 'first-upgrade', name: 'Investisseur', description: 'Achetez votre première amélioration', condition: (state) => state.totalUpgrades >= 1, unlocked: false, icon: '💰' },
    { id: 'linux-master', name: 'Maître Manchot', description: '10 Install Parties organisées', condition: (state) => UPGRADES.find(u => u.id === 'install-party')?.owned >= 10, unlocked: false, icon: '🐧' },
    { id: 'boss-defeated', name: 'Anti-GAFAM', description: 'Fermez une fenêtre GAFAM', condition: (state) => state.bossDefeated >= 1, unlocked: false, icon: '🛡️' },
    { id: 'boss-hunter', name: 'Chasseur de GAFAM', description: 'Fermez 10 fenêtres GAFAM', condition: (state) => state.bossDefeated >= 10, unlocked: false, icon: '⚔️' },
    { id: 'village-complete', name: 'Village Complet', description: 'Atteignez le niveau "Village Numérique"', condition: (state) => state.totalScore >= 10000, unlocked: false, icon: '🏘️' },
    { id: 'millionaire', name: 'Millionnaire Libre', description: 'Atteignez 1 million de points', condition: (state) => state.totalScore >= 1000000, unlocked: false, icon: '💎' },
    { id: 'quiz-master', name: 'Quiz Master', description: 'Répondez correctement à 5 quiz', condition: (state) => state.quizCorrect >= 5, unlocked: false, icon: '🧠' },
    { id: 'combo-master', name: 'Combo Master', description: 'Atteignez un combo de 50', condition: (state) => state.maxCombo >= 50, unlocked: false, icon: '⚡' },
    { id: 'prestige-1', name: 'Renaissance', description: 'Effectuez votre premier prestige', condition: (state) => state.prestigeCount >= 1, unlocked: false, icon: '🔄' },
    { id: 'skin-collector', name: 'Collectionneur', description: 'Possédez 5 skins différents', condition: (state) => PC_SKINS.filter(s => s.owned).length >= 5, unlocked: false, icon: '🎨' },
    { id: 'all-upgrades', name: 'Completionniste', description: 'Possédez toutes les améliorations de clic', condition: (state) => CLICK_UPGRADES.every(u => u.purchased), unlocked: false, icon: '✅' }
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

// ============================================
// CONSTANTES
// ============================================
const COST_MULTIPLIER = 1.15;
const SAVE_INTERVAL = 10000;
const BOSS_INTERVAL_MIN = 45000;
const BOSS_INTERVAL_MAX = 120000;
const BOSS_CLICKS_REQUIRED = 20;
const QUIZ_INTERVAL = 90000;
const TIP_INTERVAL = 60000;
const PRESTIGE_THRESHOLD = 100000;
const PRESTIGE_BONUS_PER_LEVEL = 0.1;

// ============================================
// PRESTIGE UPGRADES
// ============================================
const PRESTIGE_UPGRADES = [
    {
        id: 'pp_click_boost',
        name: 'Clic Augmenté',
        description: 'Double la puissance de base du clic',
        cost: 1,
        icon: '👆',
        effect: { type: 'clickMultiplier', value: 2 }
    },
    {
        id: 'pp_prod_boost',
        name: 'Production Améliorée',
        description: '+25% de production par seconde',
        cost: 2,
        icon: '⚡',
        effect: { type: 'productionMultiplier', value: 1.25 }
    },
    {
        id: 'pp_start_bonus',
        name: 'Départ en Trombe',
        description: 'Commencez avec 1000 points après prestige',
        cost: 3,
        icon: '🚀',
        effect: { type: 'startBonus', value: 1000 }
    },
    {
        id: 'pp_upgrade_discount',
        name: 'Réduction d\'Upgrades',
        description: '-10% sur le coût des upgrades',
        cost: 4,
        icon: '💰',
        effect: { type: 'upgradeDiscount', value: 0.9 }
    },
    {
        id: 'pp_offline_boost',
        name: 'Gains Hors-ligne+',
        description: 'Triple les gains hors-ligne',
        cost: 5,
        icon: '🌙',
        effect: { type: 'offlineMultiplier', value: 3 }
    },
    {
        id: 'pp_boss_reward',
        name: 'Récompense de Boss',
        description: 'Double les récompenses de boss',
        cost: 6,
        icon: '👹',
        effect: { type: 'bossRewardMultiplier', value: 2 }
    }
];

// ============================================
// SKINS DU CLICKER
// ============================================
const SKINS = [
    { id: 'default', name: 'PC Classic', emoji: '💻', cost: 0 },
    { id: 'linux', name: 'Tux', emoji: '🐧', cost: 1000 },
    { id: 'server', name: 'Serveur', emoji: '🖥️', cost: 5000 },
    { id: 'cloud', name: 'Cloud Libre', emoji: '☁️', cost: 10000 },
    { id: 'robot', name: 'IA Libre', emoji: '🤖', cost: 25000 },
    { id: 'globe', name: 'Internet Libre', emoji: '🌐', cost: 50000 },
    { id: 'rocket', name: 'Décollage', emoji: '🚀', cost: 100000 },
    { id: 'star', name: 'Superstar', emoji: '⭐', cost: 500000 }
];
