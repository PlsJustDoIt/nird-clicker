/**
 * NIRD Clicker - Logique du jeu
 * Gestion de l'état, des calculs et de la progression
 * Licence MIT - GPT MEN'S - Nuit de l'Info 2025
 */

// État global du jeu
let gameState = {
    score: 0,
    totalScore: 0, // Score total gagné depuis le début
    totalClicks: 0,
    totalUpgrades: 0,
    clickPower: 1,
    productionPerSecond: 0,
    bossDefeated: 0,
    activeEffects: [],
    lastSave: Date.now(),
    startTime: Date.now(),
    currentVillageLevel: 0
};

// Initialisation du jeu
function initGame() {
    loadGame();
    calculateProductionPerSecond();
    startGameLoop();
    checkUnlocks();
    updateUI();
}

// Calcul du coût d'une upgrade
function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, upgrade.owned));
}

// Calcul de la production par seconde
function calculateProductionPerSecond() {
    let baseProduction = 0;
    
    UPGRADES.forEach(upgrade => {
        baseProduction += upgrade.baseProduction * upgrade.owned;
    });
    
    // Appliquer les effets actifs
    let multiplier = 1;
    gameState.activeEffects.forEach(effect => {
        if (effect.type === 'production_doubled') multiplier *= 2;
        if (effect.type === 'production_tripled') multiplier *= 3;
        if (effect.type === 'production_halved') multiplier *= 0.5;
        if (effect.type === 'clicks_only') multiplier = 0;
    });
    
    gameState.productionPerSecond = Math.floor(baseProduction * multiplier);
    return gameState.productionPerSecond;
}

// Gestion du clic
function handleClick() {
    const points = gameState.clickPower;
    gameState.score += points;
    gameState.totalScore += points;
    gameState.totalClicks++;
    
    // Animation et feedback
    showClickFeedback(points);
    createFloatingNumber(points);
    
    // Vérifier les succès
    checkAchievements();
    
    // Mise à jour UI
    updateScoreDisplay();
    updateStatsDisplay();
    
    // Mise à jour des upgrades en mode MAX (toutes les 10 clics pour performance)
    if (buyMode === 'max' && gameState.totalClicks % 10 === 0) {
        updateUpgradesList();
    }
}

// Mode d'achat actuel (1, 10, 50, 'max')
let buyMode = 1;

// Changer le mode d'achat
function setBuyMode(mode) {
    buyMode = mode;
    updateBuyModeButtons();
    updateUpgradesList();
}

// Calculer le coût total pour acheter N upgrades
function getMultiUpgradeCost(upgrade, count) {
    let totalCost = 0;
    for (let i = 0; i < count; i++) {
        totalCost += Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, upgrade.owned + i));
    }
    return totalCost;
}

// Calculer combien d'upgrades on peut acheter avec le score actuel
function getMaxAffordable(upgrade) {
    let count = 0;
    let totalCost = 0;
    let tempOwned = upgrade.owned;
    
    while (true) {
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(COST_MULTIPLIER, tempOwned));
        if (totalCost + nextCost > gameState.score) break;
        totalCost += nextCost;
        tempOwned++;
        count++;
        if (count > 1000) break; // Sécurité
    }
    
    return { count, totalCost };
}

// Acheter une upgrade (avec support multi-achat)
function buyUpgrade(upgradeId, forceCount = null) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    let count = forceCount || buyMode;
    let totalCost;
    
    if (count === 'max') {
        const maxInfo = getMaxAffordable(upgrade);
        count = maxInfo.count;
        totalCost = maxInfo.totalCost;
    } else {
        totalCost = getMultiUpgradeCost(upgrade, count);
    }
    
    if (count === 0) {
        showNotification('Pas assez de points !', 'error');
        return false;
    }
    
    if (gameState.score >= totalCost) {
        gameState.score -= totalCost;
        upgrade.owned += count;
        gameState.totalUpgrades += count;
        
        calculateProductionPerSecond();
        checkUnlocks();
        checkAchievements();
        updateUI();
        
        // Notification
        if (count > 1) {
            showNotification(`${upgrade.icon} ${upgrade.name} x${count} acheté !`, 'success');
        } else {
            showNotification(`${upgrade.icon} ${upgrade.name} acheté !`, 'success');
        }
        
        return true;
    } else {
        showNotification('Pas assez de points !', 'error');
        return false;
    }
}

// Acheter une amélioration de clic
function buyClickUpgrade(upgradeId) {
    const upgrade = CLICK_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased) return false;
    
    if (gameState.score >= upgrade.cost) {
        gameState.score -= upgrade.cost;
        gameState.clickPower += upgrade.bonus;
        upgrade.purchased = true;
        
        updateUI();
        showNotification(`${upgrade.name} acheté ! +${upgrade.bonus} par clic`, 'success');
        
        return true;
    }
    return false;
}

// Vérifier les débloquages
function checkUnlocks() {
    UPGRADES.forEach(upgrade => {
        if (!upgrade.unlocked && upgrade.unlockAt && gameState.totalScore >= upgrade.unlockAt) {
            upgrade.unlocked = true;
            showNotification(`🔓 Nouveau : ${upgrade.name} débloqué !`, 'unlock');
        }
    });
    
    // Vérifier le niveau du village
    let newLevel = 0;
    for (let i = VILLAGE_LEVELS.length - 1; i >= 0; i--) {
        if (gameState.totalScore >= VILLAGE_LEVELS[i].minScore) {
            newLevel = i;
            break;
        }
    }
    
    if (newLevel > gameState.currentVillageLevel) {
        gameState.currentVillageLevel = newLevel;
        const level = VILLAGE_LEVELS[newLevel];
        showNotification(`🎉 Niveau atteint : ${level.emoji} ${level.name} !`, 'level-up');
    }
}

// Vérifier les succès
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition(gameState)) {
            achievement.unlocked = true;
            showNotification(`🏆 Succès : ${achievement.name}`, 'achievement');
        }
    });
}

// Boucle de jeu principale
function startGameLoop() {
    // Production automatique chaque seconde
    setInterval(() => {
        if (gameState.productionPerSecond > 0) {
            gameState.score += gameState.productionPerSecond;
            gameState.totalScore += gameState.productionPerSecond;
            checkUnlocks();
            checkAchievements();
            updateScoreDisplay();
            
            // Toujours mettre à jour les upgrades en mode MAX
            if (buyMode === 'max') {
                updateUpgradesList();
            }
        }
    }, 1000);
    
    // Sauvegarde automatique
    setInterval(() => {
        saveGame();
    }, SAVE_INTERVAL);
    
    // Nettoyage des effets expirés
    setInterval(() => {
        const now = Date.now();
        gameState.activeEffects = gameState.activeEffects.filter(effect => {
            return effect.endTime > now;
        });
        calculateProductionPerSecond();
    }, 1000);
    
    // Événements aléatoires
    setInterval(() => {
        tryRandomEvent();
    }, 5000);
    
    // Boss Windows
    scheduleBoss();
}

// Programmer l'apparition du boss
function scheduleBoss() {
    const delay = BOSS_INTERVAL_MIN + Math.random() * (BOSS_INTERVAL_MAX - BOSS_INTERVAL_MIN);
    setTimeout(() => {
        if (gameState.totalScore >= 100) { // Apparaît seulement après un certain score
            showBoss();
        }
        scheduleBoss();
    }, delay);
}

// Événement aléatoire
function tryRandomEvent() {
    if (gameState.totalScore < 500) return; // Pas d'événements au début
    
    RANDOM_EVENTS.forEach(event => {
        if (Math.random() < event.probability) {
            triggerEvent(event);
        }
    });
}

// Déclencher un événement
function triggerEvent(event) {
    showEventBanner(event.name, event.description);
    
    if (event.effect === 'instant_bonus') {
        const bonus = gameState.productionPerSecond * event.bonusMultiplier;
        gameState.score += bonus;
        gameState.totalScore += bonus;
        showNotification(`+${formatNumber(bonus)} points !`, 'bonus');
    } else if (event.duration) {
        gameState.activeEffects.push({
            type: event.effect,
            endTime: Date.now() + event.duration
        });
        calculateProductionPerSecond();
    }
}

// Sauvegarde du jeu
function saveGame() {
    const saveData = {
        score: gameState.score,
        totalScore: gameState.totalScore,
        totalClicks: gameState.totalClicks,
        totalUpgrades: gameState.totalUpgrades,
        clickPower: gameState.clickPower,
        bossDefeated: gameState.bossDefeated,
        startTime: gameState.startTime,
        currentVillageLevel: gameState.currentVillageLevel,
        upgrades: UPGRADES.map(u => ({ id: u.id, owned: u.owned, unlocked: u.unlocked })),
        clickUpgrades: CLICK_UPGRADES.map(u => ({ id: u.id, purchased: u.purchased })),
        achievements: ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: a.unlocked })),
        savedAt: Date.now()
    };
    
    localStorage.setItem('nirdClicker_save', JSON.stringify(saveData));
    gameState.lastSave = Date.now();
}

// Chargement du jeu
function loadGame() {
    const savedData = localStorage.getItem('nirdClicker_save');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            gameState.score = data.score || 0;
            gameState.totalScore = data.totalScore || 0;
            gameState.totalClicks = data.totalClicks || 0;
            gameState.totalUpgrades = data.totalUpgrades || 0;
            gameState.clickPower = data.clickPower || 1;
            gameState.bossDefeated = data.bossDefeated || 0;
            gameState.startTime = data.startTime || Date.now();
            gameState.currentVillageLevel = data.currentVillageLevel || 0;
            
            // Restaurer les upgrades
            if (data.upgrades) {
                data.upgrades.forEach(savedUpgrade => {
                    const upgrade = UPGRADES.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.owned = savedUpgrade.owned;
                        upgrade.unlocked = savedUpgrade.unlocked;
                    }
                });
            }
            
            // Restaurer les améliorations de clic
            if (data.clickUpgrades) {
                data.clickUpgrades.forEach(savedUpgrade => {
                    const upgrade = CLICK_UPGRADES.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.purchased = savedUpgrade.purchased;
                    }
                });
            }
            
            // Restaurer les succès
            if (data.achievements) {
                data.achievements.forEach(savedAchievement => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.unlocked = savedAchievement.unlocked;
                    }
                });
            }
            
            // Calculer les gains hors-ligne (optionnel - gain réduit)
            if (data.savedAt) {
                const offlineTime = (Date.now() - data.savedAt) / 1000; // en secondes
                const offlineProduction = calculateProductionPerSecond();
                const offlineGain = Math.floor(offlineProduction * offlineTime * 0.1); // 10% des gains hors-ligne
                
                if (offlineGain > 0 && offlineTime > 60) {
                    gameState.score += offlineGain;
                    gameState.totalScore += offlineGain;
                    showNotification(`🌙 Gains hors-ligne : +${formatNumber(offlineGain)} points !`, 'offline');
                }
            }
            
            console.log('Partie chargée !');
        } catch (e) {
            console.error('Erreur lors du chargement :', e);
        }
    }
}

// Reset du jeu
function resetGame() {
    if (confirm('⚠️ Voulez-vous vraiment recommencer ? Toute progression sera perdue !')) {
        localStorage.removeItem('nirdClicker_save');
        location.reload();
    }
}

// Formatage des nombres
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return Math.floor(num).toString();
}
