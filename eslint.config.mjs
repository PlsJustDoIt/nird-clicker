const js = require('@eslint/js');
const globals = require('globals');
const jsdoc = require('eslint-plugin-jsdoc');

export default [
    // Configuration de base
    js.configs.recommended,
    
    // Configuration JSDoc
    jsdoc.configs['flat/recommended'],
    
    // Configuration globale
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script', // Fichiers browser classiques
            globals: {
                ...globals.browser,
                ...globals.node,
                // Variables globales du jeu (définies dans d'autres fichiers)
                gameState: 'writable',
                UPGRADES: 'readonly',
                CLICK_UPGRADES: 'readonly',
                BOSSES: 'readonly',
                EVENTS: 'readonly',
                PRESTIGE_UPGRADES: 'readonly',
                VILLAGE_LEVELS: 'readonly',
                MILESTONES: 'readonly',
                QUIZ_QUESTIONS: 'readonly',
                TIPS: 'readonly',
                ACHIEVEMENTS: 'readonly',
                DAILY_MISSION_TEMPLATES: 'readonly',
                SKINS: 'readonly',
                CLICK_MESSAGES: 'readonly',
                COST_MULTIPLIER: 'readonly',
                SAVE_INTERVAL: 'readonly',
                BOSS_INTERVAL_MIN: 'readonly',
                BOSS_INTERVAL_MAX: 'readonly',
                BOSS_CLICKS_REQUIRED: 'readonly',
                BOSS_TYPES: 'readonly',
                QUIZ_INTERVAL: 'readonly',
                TIP_INTERVAL: 'readonly',
                PRESTIGE_THRESHOLD: 'readonly',
                PRESTIGE_BONUS_PER_LEVEL: 'readonly',
                EDUCATIONAL_TIPS: 'readonly',
                ENCYCLOPEDIA: 'readonly',
                THEMES: 'readonly',
                // Fonctions globales (core)
                initAudio: 'writable',
                playSound: 'writable',
                playMelody: 'writable',
                resumeAudio: 'writable',
                loadGame: 'writable',
                saveGame: 'writable',
                resetGame: 'writable',
                exportSave: 'writable',
                importSave: 'writable',
                startGameLoop: 'writable',
                stopGameLoop: 'writable',
                getStateForSave: 'writable',
                loadStateFromSave: 'writable',
                // Fonctions globales (gameLogic)
                initGame: 'writable',
                handleClick: 'writable',
                buyUpgrade: 'writable',
                buyClickUpgrade: 'writable',
                getUpgradeCost: 'writable',
                getClickUpgradeCost: 'writable',
                calculateProductionPerSecond: 'writable',
                getEffectiveClickPower: 'writable',
                checkUnlocks: 'writable',
                checkMilestoneEvents: 'writable',
                doPrestige: 'writable',
                applyPrestigeUpgrade: 'writable',
                initDailyMissions: 'writable',
                completeMission: 'writable',
                scheduleQuiz: 'writable',
                scheduleTips: 'writable',
                checkMilestone: 'writable',
                checkAchievements: 'writable',
                checkDailyMissions: 'writable',
                canPrestige: 'writable',
                calculatePrestigePoints: 'writable',
                buyPrestigeUpgrade: 'writable',
                buySkin: 'writable',
                fetchLeaderboard: 'writable',
                submitScore: 'writable',
                getMaxAffordable: 'writable',
                getMultiUpgradeCost: 'writable',
                applyTheme: 'writable',
                applySkin: 'writable',
                // Fonctions globales (UI)
                updateUI: 'writable',
                updateScoreDisplay: 'writable',
                updateStatsDisplay: 'writable',
                updateUpgradesList: 'writable',
                updateGauge: 'writable',
                updateClickPower: 'writable',
                updatePrestigeButton: 'writable',
                updatePrestigeDisplay: 'writable',
                showBoss: 'writable',
                showQuiz: 'writable',
                showMilestone: 'writable',
                showNotification: 'writable',
                showTip: 'writable',
                showRandomTip: 'writable',
                showClickFeedback: 'writable',
                isEventActive: 'writable',
                onEventComplete: 'writable',
                processEventQueue: 'writable',
                queueEvent: 'writable',
                startTutorial: 'writable',
                scheduleBoss: 'writable',
                cancelScheduledBoss: 'writable',
                formatNumber: 'writable',
                formatTime: 'writable',
                // Fonctions events
                triggerRandomEvent: 'writable',
                tryRandomEvent: 'writable',
                // Variables loop
                TICK_RATE: 'writable',
                TICK_INTERVALS: 'writable',
                tickCounters: 'writable',
                // Variables UI
                buyMode: 'writable',
                buyMultiplier: 'writable',
                currentQuiz: 'writable',
                audioContext: 'writable',
                bossState: 'writable',
                bossMaxClicks: 'writable',
                isEventInProgress: 'writable',
                lastMoveX: 'writable',
                settingsMenuIndex: 'writable',
                settingsMenuItems: 'writable',
                // Getters/Setters state
                getScore: 'writable',
                getTotalScore: 'writable',
                getClickPower: 'writable',
                getProductionPerSecond: 'writable',
                getPrestigeLevel: 'writable',
                getPrestigePoints: 'writable',
                getCurrentCombo: 'writable',
                getActiveEffects: 'writable',
                addScore: 'writable',
                setScore: 'writable',
                setClickPower: 'writable',
                // Konami
                konamiCode: 'writable',
                konamiIndex: 'writable',
            }
        },
        plugins: {
            jsdoc
        },
        rules: {
            // Règles JavaScript de base
            'no-unused-vars': ['warn', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-undef': 'error',
            'no-console': 'off', // On garde les console.log pour le debug
            'prefer-const': 'warn',
            'no-var': 'off', // On utilise var pour les globales partagées
            'no-redeclare': 'off', // Désactivé car on définit des globales partagées
            'eqeqeq': ['warn', 'smart'],
            'curly': ['warn', 'multi-line'],
            'no-throw-literal': 'error',
            'no-duplicate-imports': 'error',
            'no-prototype-builtins': 'warn',
            
            // Règles JSDoc
            'jsdoc/require-jsdoc': ['warn', {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: true,
                    ClassDeclaration: true,
                    ArrowFunctionExpression: false,
                    FunctionExpression: false
                },
                checkGetters: false,
                checkSetters: false
            }],
            'jsdoc/require-param': 'warn',
            'jsdoc/require-param-type': 'warn',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-returns': 'warn',
            'jsdoc/require-returns-type': 'warn',
            'jsdoc/require-returns-description': 'off',
            'jsdoc/valid-types': 'warn',
            'jsdoc/check-types': 'warn',
            'jsdoc/check-param-names': 'warn',
            'jsdoc/no-defaults': 'off',
            'jsdoc/no-undefined-types': ['warn', {
                definedTypes: [
                    'Upgrade',
                    'ClickUpgrade', 
                    'Boss',
                    'GameEvent',
                    'PrestigeUpgrade',
                    'VillageLevel',
                    'Milestone',
                    'QuizQuestion',
                    'Achievement',
                    'DailyMission',
                    'Skin',
                    'GameState',
                    'Effect',
                    'NodeJS',
                    'TickCounters',
                    'TickIntervals',
                    'SoundType',
                    'ThemeType',
                    'EffectType'
                ]
            }],
            'jsdoc/tag-lines': 'off'
        }
    },
    
    // Configuration spécifique pour les fichiers du serveur Node.js
    {
        files: ['index.js', 'ecosystem.config.cjs'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                ...globals.node
            }
        }
    },
    
    // Ignorer certains fichiers
    {
        ignores: [
            'node_modules/**',
            'public/assets/**',
            'public/videos/**',
            '*.min.js'
        ]
    }
];
