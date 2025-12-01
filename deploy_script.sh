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
# Si votre projet utilise PHP natif, alors il n'y a rien à faire. Ce script n'a rien de spécial à faire
# echo "J'ai perdu (https://fr.wikipedia.org/wiki/Le_Jeu_(divertissement)"

# ---------------------------------------------------------------------------------------------------------------------
# Si votre projet utilise nodeJS, décommenter la suite
# export NVM_DIR="/custom-git-hooks/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || fail "Impossible de charger nvm"
# nvm use default || fail "Impossible de passer à la bonne version de node ($(nvm alias default))"

# echo "C'est parti pour \`npm install --production\` !"
# npm install --production || fail "npm install raté"

# echo "Redémarrage du serveur pm2 \`server-gpt-men-s\`"
# # Needs sudo because server has been started as root
# sudo /custom-git-hooks/.nvm/versions/node/v18.12.1/bin/pm2 --silent restart "server-gpt-men-s" || fail "Redémarrage du serveur échoué "
