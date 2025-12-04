# 🖥️ NIRD Clicker - Guide de l'équipe GPT MEN'S

## 📋 Répartition des rôles

| Rôle | Responsabilités | Fichiers |
|------|-----------------|----------|
| **Dev 1 (Cœur)** | Logique du jeu, calculs, progression | `js/gameLogic.js`, `js/gameData.js` |
| **Dev 2 (Interface)** | Composants UI, animations | `js/ui.js`, `styles/style.css` |
| **Game Designer** | Textes, descriptions, équilibrage | `js/gameData.js` (UPGRADES, textes) |
| **Graphiste** | Images, icônes, polish visuel | `images/`, `styles/style.css` |
| **DevOps** | Déploiement, Git, tests | `deploy_script.sh`, commits |

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur
npm start

# Accéder au jeu
# http://localhost:45975
```

## 📁 Structure du projet

```
public/
├── index.html          # Page principale
├── styles/
│   └── style.css       # Tous les styles
├── js/
│   ├── gameData.js     # Données : upgrades, événements, constantes
│   ├── gameLogic.js    # Logique : score, achats, sauvegarde
│   ├── ui.js           # Interface : affichage, animations
│   ├── events.js       # Événements spéciaux, combos
│   └── main.js         # Initialisation
└── images/             # Images et logos
```

## 🎮 Fonctionnalités implémentées

- [x] Système de clic avec animation
- [x] 8 types d'upgrades (Éco-délégué → Libération Totale)
- [x] 4 améliorations de clic
- [x] Sauvegarde automatique (localStorage)
- [x] Boss "Windows Update" à fermer
- [x] Événements aléatoires
- [x] Jauge de résistance (7 niveaux de village)
- [x] Système de combo
- [x] Succès/Achievements
- [x] Gains hors-ligne
- [x] Konami Code (Easter Egg)

## 📝 Améliorations possibles

### Pour le Game Designer
- Ajouter plus de textes pédagogiques NIRD dans `gameData.js`
- Équilibrer les coûts des upgrades
- Créer de nouveaux événements aléatoires

### Pour le Graphiste
- Ajouter des images/icônes personnalisées
- Créer un favicon
- Améliorer les animations CSS

### Pour les Devs
- Ajouter des sons (optionnel)
- Créer un système de prestige/rebirth
- Ajouter un tableau des scores

## 🐛 Debug

Dans la console du navigateur :
```javascript
window.DEBUG.getState()      // Voir l'état du jeu
window.DEBUG.addScore(1000)  // Ajouter des points
window.DEBUG.triggerBoss()   // Déclencher le boss
window.DEBUG.resetGame()     // Reset total
```

## 📜 Licence

MIT - Logiciel libre ! 🐧
