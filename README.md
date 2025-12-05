# 🐧 NIRD Clicker - GPT MEN'S

**Jeu clicker éducatif sur le logiciel libre** créé pour la Nuit de l'Info 2024.

Libère ton village de la domination propriétaire en cliquant et en recrutant des défenseurs du libre !

## 🚀 Démarrage rapide

### 1. Installation
```bash
npm install
```

### 2. Configuration de la base de données (pour le leaderboard)
```bash
# Initialiser MySQL
sudo mysql < init_database.sql

# Configurer l'environnement
cp .env.example .env
# Modifier .env avec vos paramètres MySQL
```

### 3. Lancer le jeu
```bash
npm start
# Accéder à http://localhost:45975
```

## 🎮 Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Clicker** | Clique pour gagner des points de libération |
| **Upgrades** | 8 types d'upgrades (Éco-délégué → Libération Totale) |
| **Prestige** | Système de rebirth avec bonus permanents |
| **Boss** | Combats contre Windows Update, GAFAM, etc. |
| **Quiz NIRD** | Questions sur le logiciel libre |
| **Skins** | Personnalise ton curseur (Tux, GNU, Firefox...) |
| **Missions** | Défis quotidiens à compléter |
| **Thèmes** | Mode clair/sombre/hacker |
| **Encyclopédie** | Apprends sur le logiciel libre |
| **Tutoriel** | Guide interactif pour les nouveaux joueurs |
| **Leaderboard** | Classement mondial des joueurs |
| **Succès** | 15+ achievements à débloquer |
| **Konami Code** | Easter egg secret 🎉 |

## 🔧 Configuration

### Variables d'environnement (.env)
```env
NODE_ENV=development
PORT=45975
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=nird_clicker
LEADERBOARD_ENABLED=true
```

## 🐛 Debug (Console navigateur)

```javascript
window.DEBUG.getState()      // Voir l'état du jeu
window.DEBUG.addScore(1000)  // Ajouter des points
window.DEBUG.triggerBoss()   // Déclencher un boss
window.DEBUG.resetGame()     // Reset total
```

## 📁 Structure du projet

```
├── index.js              # Serveur Express + API leaderboard
├── init_database.sql     # Script d'initialisation MySQL
├── .env                  # Configuration locale (ignoré par git)
├── .env.example          # Template de configuration
├── .env.production       # Configuration serveur
├── deploy_script.sh      # Script de déploiement
└── public/
    ├── index.html        # Page principale
    ├── styles/style.css  # Styles + thèmes
    ├── images/           # Assets graphiques
    └── js/
        ├── main.js       # Initialisation
        ├── gameData.js   # Données (upgrades, boss, quiz...)
        ├── gameLogic.js  # Logique du jeu
        ├── ui.js         # Interface utilisateur
        └── events.js     # Événements spéciaux
```

## 🚀 Déploiement

Le script `deploy_script.sh` est exécuté automatiquement lors du push sur GitLab :
- Configure l'environnement de production
- Installe les dépendances
- Redémarre le serveur pm2

## 📜 Licence

MIT - Logiciel libre ! 🐧

---

*Fait avec ❤️ par l'équipe GPT MEN'S pour la Nuit de l'Info 2024*
