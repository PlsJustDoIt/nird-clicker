/**
 * NIRD Clicker - Définitions de types JSDoc
 * Ce fichier contient toutes les définitions de types utilisées dans le jeu
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// ============================================
// TYPES DE BASE
// ============================================

/**
 * @typedef {object} Upgrade
 * @property {string} id - Identifiant unique de l'upgrade
 * @property {string} name - Nom affiché de l'upgrade
 * @property {string} description - Description de l'upgrade
 * @property {string} info - Information bonus sur l'upgrade
 * @property {number} baseCost - Coût de base de l'upgrade
 * @property {number} baseProduction - Production par seconde de base
 * @property {number} owned - Nombre d'upgrades possédées
 * @property {boolean} unlocked - Si l'upgrade est débloquée
 * @property {number} [unlockAt] - Score requis pour débloquer (optionnel)
 * @property {string} icon - Emoji ou icône de l'upgrade
 */

/**
 * @typedef {object} ClickUpgrade
 * @property {string} id - Identifiant unique
 * @property {string} name - Nom affiché
 * @property {string} description - Description de l'upgrade
 * @property {string} [info] - Information bonus
 * @property {number} cost - Coût de l'upgrade
 * @property {number} bonus - Bonus de clic apporté
 * @property {boolean} purchased - Si l'upgrade a été achetée
 * @property {number} [unlockAt] - Score requis pour débloquer
 * @property {string} icon - Emoji ou icône
 */

/**
 * @typedef {object} Boss
 * @property {string} id - Identifiant unique du boss
 * @property {string} name - Nom du boss
 * @property {string} description - Description du boss
 * @property {string} icon - Emoji du boss
 * @property {number} difficulty - Difficulté (1-10)
 * @property {number} reward - Récompense en points
 * @property {number} [unlockAt] - Score minimum pour apparition
 */

/**
 * @typedef {object} GameEvent
 * @property {string} id - Identifiant unique de l'événement
 * @property {string} name - Nom de l'événement
 * @property {string} description - Description de l'événement
 * @property {string} icon - Emoji de l'événement
 * @property {number} duration - Durée en millisecondes
 * @property {string} effect - Type d'effet appliqué
 * @property {number} [chance] - Probabilité d'apparition (0-1)
 */

/**
 * @typedef {object} Effect
 * @property {string} type - Type de l'effet (ex: 'production_doubled')
 * @property {number} endTime - Timestamp de fin de l'effet
 * @property {string} [name] - Nom de l'effet pour l'affichage
 * @property {string} [icon] - Icône de l'effet
 */

/**
 * @typedef {object} PrestigeUpgrade
 * @property {string} id - Identifiant unique
 * @property {string} name - Nom de l'amélioration prestige
 * @property {string} description - Description
 * @property {number} cost - Coût en points de prestige
 * @property {string} effect - Type d'effet
 * @property {number} value - Valeur de l'effet
 * @property {string} icon - Emoji
 * @property {boolean} [purchased] - Si déjà acheté
 */

/**
 * @typedef {object} VillageLevel
 * @property {string} name - Nom du niveau du village
 * @property {number} minScore - Score minimum pour atteindre ce niveau
 * @property {string} description - Description du niveau
 * @property {string} emoji - Emoji du niveau
 */

/**
 * @typedef {object} Milestone
 * @property {string} id - Identifiant unique
 * @property {string} type - Type de milestone ('score', 'clicks', 'upgrades', etc.)
 * @property {number} value - Valeur à atteindre
 * @property {string} title - Titre du milestone
 * @property {string} description - Description
 * @property {string} icon - Emoji
 * @property {number} [reward] - Récompense optionnelle
 */

/**
 * @typedef {object} QuizQuestion
 * @property {string} question - La question posée
 * @property {string[]} answers - Liste des réponses possibles
 * @property {number} correct - Index de la bonne réponse (0-based)
 * @property {string} explanation - Explication de la réponse
 * @property {string} [category] - Catégorie de la question
 */

/**
 * @typedef {object} Achievement
 * @property {string} id - Identifiant unique
 * @property {string} name - Nom du succès
 * @property {string} description - Description
 * @property {string} icon - Emoji
 * @property {string} condition - Type de condition ('score', 'clicks', etc.)
 * @property {number} value - Valeur à atteindre
 * @property {boolean} [unlocked] - Si débloqué
 */

/**
 * @typedef {object} DailyMission
 * @property {string} id - Identifiant unique
 * @property {string} type - Type de mission
 * @property {string} description - Description de la mission
 * @property {number} target - Objectif à atteindre
 * @property {number} progress - Progression actuelle
 * @property {number} reward - Récompense
 * @property {boolean} completed - Si complétée
 */

/**
 * @typedef {object} DailyMissionTemplate
 * @property {string} type - Type de mission
 * @property {string} description - Template de description (avec {target})
 * @property {number} minTarget - Cible minimale
 * @property {number} maxTarget - Cible maximale
 * @property {number} rewardMultiplier - Multiplicateur de récompense
 */

/**
 * @typedef {object} Skin
 * @property {string} id - Identifiant unique du skin
 * @property {string} name - Nom du skin
 * @property {string} description - Description
 * @property {string} icon - Emoji
 * @property {number} [cost] - Coût en points (si achetable)
 * @property {string} [unlockCondition] - Condition de déblocage
 */

// ============================================
// ÉTAT DU JEU
// ============================================

/**
 * @typedef {object} GameState
 * @property {number} score - Score actuel
 * @property {number} totalScore - Score total accumulé
 * @property {number} totalClicks - Nombre total de clics
 * @property {number} clickPower - Puissance de clic actuelle
 * @property {number} currentCombo - Combo actuel
 * @property {number} maxCombo - Combo maximum atteint
 * @property {number} productionPerSecond - Production passive par seconde
 * @property {number} totalUpgrades - Nombre total d'upgrades achetées
 * @property {number} bossDefeated - Nombre de boss vaincus
 * @property {Effect[]} activeEffects - Effets temporaires actifs
 * @property {number} lastSave - Timestamp de la dernière sauvegarde
 * @property {number} startTime - Timestamp du début de la partie
 * @property {number} currentVillageLevel - Niveau actuel du village
 * @property {string[]} triggeredMilestones - IDs des milestones déjà déclenchés
 * @property {number} prestigeLevel - Niveau de prestige
 * @property {number} prestigePoints - Points de prestige disponibles
 * @property {{[key: string]: boolean}} prestigeUpgrades - Upgrades de prestige achetées
 * @property {string} currentSkin - Skin actuellement équipé
 * @property {string[]} skinsUnlocked - Skins débloqués
 * @property {string} currentTheme - Thème actuel ('dark' ou 'light')
 * @property {number} quizCorrect - Nombre de quiz réussis
 * @property {DailyMission[]} dailyMissions - Missions quotidiennes
 * @property {string|null} dailyMissionsDate - Date des missions quotidiennes
 * @property {boolean} soundEnabled - Si le son est activé
 * @property {boolean} particlesEnabled - Si les particules sont activées
 * @property {boolean} tutorialCompleted - Si le tutoriel est terminé
 * @property {number} sessionClicks - Clics de cette session
 * @property {number} sessionScore - Score de cette session
 * @property {number} sessionUpgrades - Upgrades de cette session
 * @property {number} sessionBoss - Boss vaincus cette session
 * @property {number} sessionQuiz - Quiz réussis cette session
 */

// ============================================
// TYPES UTILITAIRES
// ============================================

/**
 * @typedef {'click'|'upgrade'|'boss'|'achievement'|'prestige'|'error'|'bonus'} SoundType
 */

/**
 * @typedef {'dark'|'light'|'ocean'|'forest'} ThemeType
 */

/**
 * @typedef {'production_doubled'|'production_tripled'|'production_x5'|'production_x10'|'production_x20'|'production_halved'|'clicks_only'|'click_doubled'|'click_tripled'} EffectType
 */

/**
 * @typedef {object} TickCounters
 * @property {number} production - Compteur pour la production
 * @property {number} save - Compteur pour la sauvegarde
 * @property {number} effects - Compteur pour les effets
 * @property {number} events - Compteur pour les événements
 * @property {number} tips - Compteur pour les tips
 * @property {number} quiz - Compteur pour les quiz
 * @property {number} uiRefresh - Compteur pour le rafraîchissement UI
 */

/**
 * @typedef {object} TickIntervals
 * @property {number} production - Intervalle de production (en ticks)
 * @property {number} save - Intervalle de sauvegarde (en ticks)
 * @property {number} effects - Intervalle des effets (en ticks)
 * @property {number} events - Intervalle des événements (en ticks)
 * @property {number} tips - Intervalle des tips (en ticks)
 * @property {number} quiz - Intervalle des quiz (en ticks)
 * @property {number} uiRefresh - Intervalle du rafraîchissement UI (en ticks)
 */

// Export vide pour que le fichier soit reconnu comme un module par certains outils
// mais reste compatible avec le chargement par <script>
