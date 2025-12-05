# 🖥️ NIRD Clicker - Guide de l'équipe GPT MEN'S

## 📋 Répartition des rôles

| Rôle | Responsabilités | Fichiers |
|------|-----------------|----------|
| **Dev 1 (Cœur)** | Logique du jeu, calculs, progression | `js/gameLogic.js` |
| **Dev 2 (Interface)** | Composants UI, animations | `js/ui.js`, `styles/style.css` |
| **Game Designer** | Textes, descriptions, équilibrage | `js/balancing.js` ⭐ |
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
│   ├── balancing.js    # ⭐ ÉQUILIBRAGE : upgrades, coûts, progression
│   ├── gameData.js     # (Fichier de compatibilité, vide)
│   ├── gameLogic.js    # Logique : score, achats, sauvegarde
│   ├── ui.js           # Interface : affichage, animations
│   ├── events.js       # Événements spéciaux, combos
│   └── main.js         # Initialisation
└── images/             # Images et logos
```

## 🎮 Fonctionnalités implémentées

- [x] Système de clic avec animation
- [x] **20 types d'upgrades** (Éco-délégué → Singularité Libre)
- [x] **12 améliorations de clic** (Souris → Superposition Temporelle)
- [x] Sauvegarde automatique (localStorage)
- [x] **10 Boss GAFAM** (Windows Update → SKYNET GAFAM)
- [x] **12 événements aléatoires**
- [x] **15 niveaux de jauge** (Salle Info → Singularité Éternelle)
- [x] **15 upgrades de prestige**
- [x] Système de combo
- [x] Succès/Achievements
- [x] Gains hors-ligne
- [x] Konami Code (Easter Egg)

## 📝 Améliorations possibles

### Pour le Game Designer
- Modifier `js/balancing.js` pour ajuster les coûts et productions
- Ajouter de nouvelles upgrades ou événements
- Équilibrer la courbe de progression

### Pour le Graphiste
- Ajouter des images/icônes personnalisées
- Créer un favicon
- Améliorer les animations CSS

### Pour les Devs
- Ajouter des sons (optionnel)
- Améliorer le système de prestige
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
