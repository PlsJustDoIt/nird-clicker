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
npm run dev # utilise nodemon

# Accéder au jeu
# http://localhost:3000
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
│   ├── gamepad.js      # 🎮 Support manette (Xbox, PlayStation, etc.)
│   ├── core/icons.js   # Icônes SVG (remplacent les emoji) : icon('penguin')
│   ├── ui/scene.js     # Poste illustré, vitrine du village, infobulles, fil info
│   └── main.js         # Initialisation
└── images/             # Images, logos et curseurs (images/cursors/)
```

## 🎮 Fonctionnalités implémentées

- [x] Système de clic avec animation
- [x] **20 types d'upgrades** (Éco-délégué → Singularité Libre)
- [x] **12 améliorations de clic** (Souris → Superposition Temporelle)
- [x] Sauvegarde automatique (localStorage)
- [x] **10 Boss GAFAM** (Windows Update → SKYNET GAFAM)
- [x] **12 événements aléatoires**
- [x] **Support Gamepad** (Xbox, PlayStation, manettes génériques)
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

## 🎨 Charte graphique

- **Pas d'emoji dans l'interface** : les champs `icon` des données (`balancing.js`) sont des noms d'icônes de `js/core/icons.js`. Pour une nouvelle icône, ajouter son tracé SVG (24×24, trait) dans `ICON_PATHS`.
- **Couleurs** : uniquement via les variables CSS de `styles/base.css` (thèmes dans `styles/themes.css`).
- **Polices** : Space Grotesk (titres, chiffres), Inter (texte), JetBrains Mono (prix, compteurs).
- **Curseurs** : `images/cursors/*.svg`, déclarés dans `--cursor`, `--cursor-pointer`, `--cursor-press`.

## 🐛 Debug

Dans la console du navigateur :
```javascript
window.DEBUG.getState()      // Voir l'état du jeu
window.DEBUG.addScore(1000)  // Ajouter des points
window.DEBUG.triggerBoss()   // Déclencher le boss
window.DEBUG.resetGame()     // Reset total
```

> ⚠️ **Note** : Les erreurs TypeScript dans VS Code sont à **ignorer**. Le projet est en JavaScript pur et le linter TypeScript ne reconnaît pas les variables globales partagées entre fichiers (`gameState`, `playSound`, etc.). Le code fonctionne correctement.

## 📜 Licence

MIT - Logiciel libre ! 🐧
