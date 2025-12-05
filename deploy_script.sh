#!/bin/bash

# Ce script sera exécuté une fois la dernière version de votre code récupérée depuis GitLab.
# Il faut le personnaliser en fonction de votre projet : récupérer les dépendances, faire des migrations.
# Des exemples sont données en dessous pour du php simple et du nodeJS.

# Pour la personnalisation : pour toute commande, il est conseillé d'ajouter '|| fail "Message"' à la fin
# Cela permet d'afficher le message d'erreur et d'arrêter le script si la commande échoue
# Exemple : npm install || fail "Oh non, npm install n'a pas marché"

# Hésitez pas à faire valider votre script par l'orga-nuit si vous avez un doute

set -o pipefail # if a command in a pipe fails, all the pipe fails

fail() {
	echo "$1"
	exit 1
}

# ---------------------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------------------
#																							Partie à modifier ci-dessous
# ---------------------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------------------------------------------

# ---------------------------------------------------------------------------------------------------------------------
# Configuration pour nodeJS avec leaderboard MySQL
# ---------------------------------------------------------------------------------------------------------------------

export NVM_DIR="/custom-git-hooks/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || fail "Impossible de charger nvm"
nvm use default || fail "Impossible de passer à la bonne version de node ($(nvm alias default))"

# Configuration de l'environnement de production
echo "Configuration de l'environnement de production..."
if [ -f ".env.production" ]; then
    cp .env.production .env || fail "Impossible de copier .env.production vers .env"
    echo "✅ Fichier .env de production configuré"
else
    fail "❌ Fichier .env.production manquant !"
fi

# Installation des dépendances
echo "C'est parti pour \`npm install --production\` !"
npm install --production || fail "npm install raté"

# Redémarrage du serveur pm2
echo "Redémarrage du serveur pm2 \`server-gpt-men-s\`"
# Needs sudo because server has been started as root
sudo /custom-git-hooks/.nvm/versions/node/v18.12.1/bin/pm2 --silent restart "server-gpt-men-s" || fail "Redémarrage du serveur échoué"

echo "🚀 Déploiement terminé avec succès !"
