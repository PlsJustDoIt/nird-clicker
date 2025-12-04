/**
 * NIRD Clicker - Données du jeu
 * Définition des upgrades, événements et constantes du jeu
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// Upgrades disponibles dans le jeu (basées sur la démarche NIRD)
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
        unlockAt: 1000, // Score nécessaire pour débloquer
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

// Multiplicateurs de clic (améliorations du clic manuel)
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

// Événements aléatoires du jeu
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
    }
];

// Niveaux de village (pour la jauge de résistance)
const VILLAGE_LEVELS = [
    { name: 'Salle Informatique', minScore: 0, emoji: '🏫' },
    { name: 'Club Numérique', minScore: 500, emoji: '💻' },
    { name: 'Fablab Citoyen', minScore: 2000, emoji: '🔧' },
    { name: 'Village Numérique', minScore: 10000, emoji: '🏘️' },
    { name: 'Cité de la Liberté', minScore: 50000, emoji: '🏰' },
    { name: 'Métropole Souveraine', minScore: 200000, emoji: '🌆' },
    { name: 'Nation Libre', minScore: 1000000, emoji: '🗽' }
];

// Succès/Achievements
const ACHIEVEMENTS = [
    { id: 'first-click', name: 'Premier pas', description: 'Faites votre premier clic', condition: (state) => state.totalClicks >= 1, unlocked: false },
    { id: 'hundred-clicks', name: 'Cliqueur assidu', description: '100 clics réalisés', condition: (state) => state.totalClicks >= 100, unlocked: false },
    { id: 'first-upgrade', name: 'Investisseur', description: 'Achetez votre première amélioration', condition: (state) => state.totalUpgrades >= 1, unlocked: false },
    { id: 'linux-master', name: 'Maître Manchot', description: '10 Install Parties organisées', condition: (state) => UPGRADES.find(u => u.id === 'install-party')?.owned >= 10, unlocked: false },
    { id: 'boss-defeated', name: 'Anti-GAFAM', description: 'Fermez une fenêtre Windows', condition: (state) => state.bossDefeated >= 1, unlocked: false },
    { id: 'village-complete', name: 'Village Complet', description: 'Atteignez le niveau "Village Numérique"', condition: (state) => state.score >= 10000, unlocked: false },
    { id: 'millionaire', name: 'Millionnaire Libre', description: 'Atteignez 1 million de points', condition: (state) => state.score >= 1000000, unlocked: false }
];

// Messages humoristiques lors des clics
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
    "apt update && apt upgrade"
];

// Constantes de coût
const COST_MULTIPLIER = 1.15; // Augmentation du coût après chaque achat
const SAVE_INTERVAL = 10000; // Sauvegarde toutes les 10 secondes
const BOSS_INTERVAL_MIN = 60000; // Minimum 1 minute entre chaque boss
const BOSS_INTERVAL_MAX = 180000; // Maximum 3 minutes entre chaque boss
const BOSS_CLICKS_REQUIRED = 20; // Clics nécessaires pour fermer le boss
