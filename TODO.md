# 📋 TODO - Optimisations NIRD Clicker

## 🔴 Priorité HAUTE - Performances

### 1. Consolider les setIntervals
- **Fichier** : `public/js/gameLogic.js`
- **Problème** : 7+ setIntervals non coordonnés (lignes 593, 764, 852, 870, 873, 880, 886)
- **Impact** : Surcharge CPU, mises à jour UI redondantes
- **Solution** : Un seul game loop avec `requestAnimationFrame` ou setInterval unique à 1s

### 2. Optimiser `updateUpgradesList()`
- **Fichiers** : `public/js/gameLogic.js`, `public/js/ui.js`
- **Problème** : Appelé à chaque clic + setInterval 1s + dans `updateUI()`
- **Impact** : Recalculs DOM constants
- **Solution** : Debouncer + flag dirty pour rebuild conditionnel

### 3. Pool d'objets pour particules/animations
- **Fichier** : `public/js/ui.js`
- **Problème** : `createFloatingNumber()` et `createParticles()` créent/suppriment des éléments DOM à chaque clic
- **Impact** : Milliers d'opérations DOM avec clics rapides
- **Solution** : Pool d'objets réutilisables ou Canvas

---

## 🟡 Priorité MOYENNE - Organisation

### 4. Modulariser les fichiers JS
| Fichier | Lignes | Problème |
|---------|--------|----------|
| `ui.js` | 2245 | Mélange UI, animations, modals, snake game |
| `gameLogic.js` | 1179 | Logique + quiz + missions + prestige |
| `balancing.js` | 1159 | Données de config (OK mais splittable) |
| `style.css` | 3834 | CSS monolithique |

**Structure cible** :
```
js/
├── core/
│   ├── gameState.js
│   ├── gameLoop.js
│   └── saveSystem.js
├── systems/
│   ├── upgrades.js
│   ├── prestige.js
│   ├── quiz.js
│   └── missions.js
├── ui/
│   ├── modals.js
│   ├── animations.js
│   └── notifications.js
└── main.js
```

### 5. Refactorer les variables globales
- **Problème** : `gameState`, `buyMode`, `currentQuiz` partagés entre fichiers
- **Impact** : Code fragile, difficile à maintenir
- **Solution** : Store centralisé ou modules ES6

### 6. Ajouter build/minification
- **Problème** : 6 fichiers JS chargés séparément, CSS non minifié
- **Impact** : 6 requêtes HTTP, temps de chargement
- **Solution** : Vite, esbuild ou concat + minify

---

## 🟢 Priorité BASSE - Qualité

### 7. Supprimer code dupliqué
- `getMaxAffordable()` ≈ `getEffectiveQuantity()`
- Logique de coût calculée à plusieurs endroits
- Système de queue d'événements partiellement dupliqué

### 8. Gestion d'erreurs localStorage
- **Problème** : Pas de try/catch sur les appels `localStorage`
- **Impact** : Crash possible en navigation privée
- **Solution** : Wrapper avec fallback gracieux

### 9. Optimiser les images
- **Dossier** : `public/images/`
- **Problème** : Formats mixtes (.png, .webp, .svg)
- **Solution** : Convertir en formats optimisés (WebP, SVG quand possible)

---

## ✅ Complété

- [x] Créer `core/state.js` - État global centralisé
- [x] Créer `utils/helpers.js` - Fonctions utilitaires (formatNumber, shuffleArray, debounce, throttle)
- [x] Créer `core/audio.js` - Système audio Web Audio API
- [x] Créer `core/save.js` - Sauvegarde/chargement localStorage
- [x] Créer `core/loop.js` - Game loop unifié (1 seul setInterval au lieu de 7+)
- [x] Créer `ui/display.js` - Affichage score, stats, jauge
- [x] Créer `ui/animations.js` - Particules, nombres flottants (avec pool d'objets)
- [x] Créer `ui/notifications.js` - Notifications et bannières
- [x] Créer `ui/modals.js` - Settings, achievements, encyclopedia, leaderboard
- [x] Créer `ui/upgrades-ui.js` - Affichage des upgrades, prestige, skins
- [x] Créer `ui/boss.js` - Système de boss GAFAM complet
- [x] Créer `ui-lite.js` - Version allégée (450 lignes vs 2243 originales)
- [x] Mettre à jour `index.html` - Utilise ui-lite.js + modules UI

---

## 📊 Récapitulatif Refactorisation

### Avant
| Fichier | Lignes |
|---------|--------|
| ui.js | 2243 |
| gameLogic.js | 1144 |
| balancing.js | 1159 |
| events.js | 558 |
| **Total** | **5104** |

### Après (Modules)
| Fichier | Lignes | Rôle |
|---------|--------|------|
| **core/** | | |
| state.js | ~320 | État global centralisé |
| audio.js | ~180 | Système audio |
| save.js | ~295 | Sauvegarde/chargement |
| loop.js | ~200 | Game loop unifié |
| **utils/** | | |
| helpers.js | ~330 | Utilitaires |
| **ui/** | | |
| display.js | ~225 | Affichage principal |
| animations.js | ~250 | Particules, effets |
| notifications.js | ~195 | Notifications |
| modals.js | ~555 | Menus/modals |
| upgrades-ui.js | ~480 | Interface upgrades |
| boss.js | ~680 | Système de boss |
| **Fichiers allégés** | | |
| ui-lite.js | ~460 | Event queue + Snake game |

### Gains
- ✅ **7+ setIntervals → 1 game loop** (core/loop.js)
- ✅ **Code modulaire** - Chaque fichier a une responsabilité claire
- ✅ **ui.js réduit de 80%** - 2243 → 460 lignes (ui-lite.js)
- ✅ **Fallbacks conditionnels** - Robustesse si module manquant
- ✅ **Pool d'objets** pour animations (animations.js)

---

## 📊 Tableau récapitulatif

| Priorité | Tâche | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 | Consolider setIntervals | Performance majeure | Moyen |
| 🔴 | Optimiser updateUpgradesList | Performance | Faible |
| 🔴 | Pool d'objets particules | Performance | Moyen |
| 🟡 | Modulariser JS | Maintenabilité | Élevé |
| 🟡 | Refactorer globales | Qualité code | Élevé |
| 🟡 | Build/minification | Temps chargement | Faible |
| 🟢 | Supprimer doublons | Dette technique | Faible |
| 🟢 | Erreurs localStorage | Robustesse | Faible |
| 🟢 | Optimiser images | Temps chargement | Faible |
