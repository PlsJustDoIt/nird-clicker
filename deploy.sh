#!/bin/bash
# ===========================================
# NIRD Clicker - Build & Deploy
# ===========================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration - À MODIFIER
SERVER_USER="leo"                          # Utilisateur SSH
SERVER_HOST="86.219.194.18"         # IP ou domaine du serveur
SERVER_PATH="/var/www/nird-clicker"         # Chemin sur le serveur
DOMAIN="nird-clicker.mehmetates.fr"

# Répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/dist"

echo -e "${CYAN}🐧 NIRD Clicker - Build & Deploy${NC}"
echo "=================================="

# ===========================================
# Fonction: Build
# ===========================================
build() {
    echo -e "\n${YELLOW}📦 Build du projet...${NC}"
    
    # Nettoyer le dossier dist
    rm -rf "$BUILD_DIR"
    mkdir -p "$BUILD_DIR"
    
    # Copier les fichiers nécessaires (pas node_modules, pas .git)
    cp -r "$SCRIPT_DIR/public" "$BUILD_DIR/"
    cp "$SCRIPT_DIR/index.js" "$BUILD_DIR/"
    cp "$SCRIPT_DIR/package.json" "$BUILD_DIR/"
    cp "$SCRIPT_DIR/package-lock.json" "$BUILD_DIR/" 2>/dev/null || true
    cp "$SCRIPT_DIR/ecosystem.config.cjs" "$BUILD_DIR/"
    
    # Copier les configs serveur
    mkdir -p "$BUILD_DIR/server-config"
    cp "$SCRIPT_DIR/nginx/nird-clicker.conf" "$BUILD_DIR/server-config/"
    cp "$SCRIPT_DIR/init_database.sql" "$BUILD_DIR/server-config/"
    cp "$SCRIPT_DIR/.env.example" "$BUILD_DIR/server-config/"
    
    echo -e "${GREEN}✅ Build terminé dans $BUILD_DIR${NC}"
    
    # Afficher la taille
    du -sh "$BUILD_DIR"
}

# ===========================================
# Fonction: Deploy
# ===========================================
deploy() {
    echo -e "\n${YELLOW}🚀 Déploiement sur $SERVER_HOST...${NC}"
    
    if [ ! -d "$BUILD_DIR" ]; then
        echo -e "${RED}❌ Pas de build trouvé. Lancez d'abord: $0 build${NC}"
        exit 1
    fi
    
    # Vérifier la connexion SSH
    echo "Test de connexion SSH..."
    if ! ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo 'OK'" &>/dev/null; then
        echo -e "${RED}❌ Impossible de se connecter à $SERVER_USER@$SERVER_HOST${NC}"
        echo "Vérifiez votre clé SSH et l'adresse du serveur"
        exit 1
    fi
    
    # Créer le répertoire sur le serveur
    ssh -t "$SERVER_USER@$SERVER_HOST" "sudo mkdir -p $SERVER_PATH"
    
    # Synchroniser les fichiers (exclut node_modules)
    echo "Synchronisation des fichiers..."
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.env' \
        "$BUILD_DIR/" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    
    # Vérifier si .env existe sur le serveur, sinon avertir
    if ! ssh "$SERVER_USER@$SERVER_HOST" "[ -f $SERVER_PATH/.env ]"; then
        echo -e "${RED}⚠️  Fichier .env absent sur le serveur !${NC}"
        echo -e "${YELLOW}   Créez-le manuellement sur le serveur :${NC}"
        echo -e "   ssh $SERVER_USER@$SERVER_HOST"
        echo -e "   cp $SERVER_PATH/server-config/.env.example $SERVER_PATH/.env"
        echo -e "   nano $SERVER_PATH/.env  # Configurer les variables"
        echo -e "${YELLOW}   Puis relancez : $0 deploy${NC}"
        exit 1
    fi
    
    # Installer les dépendances et redémarrer
    echo "Installation des dépendances sur le serveur..."
    ssh "$SERVER_USER@$SERVER_HOST" << 'REMOTE'
        cd /var/www/nird-clicker
        npm install --production
        
        # Créer le dossier de logs PM2
        sudo mkdir -p /var/log/pm2
        sudo chown $USER:$USER /var/log/pm2
        
        # Redémarrer avec PM2 (ou démarrer si pas encore lancé)
        if pm2 list | grep -q "nird-clicker"; then
            pm2 restart ecosystem.config.cjs
        else
            pm2 start ecosystem.config.cjs
            pm2 save
        fi
        
        echo "Status:"
        pm2 status nird-clicker
REMOTE
    
    echo -e "${GREEN}✅ Déploiement terminé !${NC}"
    echo -e "🌐 https://$DOMAIN"
}

# ===========================================
# Fonction: Setup serveur (première fois)
# ===========================================
setup_server() {
    echo -e "\n${YELLOW}🔧 Configuration initiale du serveur...${NC}"
    
    ssh "$SERVER_USER@$SERVER_HOST" << REMOTE
        set -e
        
        echo "📦 Installation des paquets..."
        apt update
        apt install -y nodejs npm nginx mysql-server certbot python3-certbot-nginx
        
        # PM2
        npm install -g pm2
        
        echo "🗄️ Configuration MySQL..."
        # Générer mot de passe
        DB_PASS=\$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9')
        
        mysql -e "CREATE DATABASE IF NOT EXISTS nird_clicker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        mysql -e "CREATE USER IF NOT EXISTS 'nird_user'@'localhost' IDENTIFIED BY '\$DB_PASS';"
        mysql -e "ALTER USER 'nird_user'@'localhost' IDENTIFIED BY '\$DB_PASS';"
        mysql -e "GRANT ALL PRIVILEGES ON nird_clicker.* TO 'nird_user'@'localhost';"
        mysql -e "FLUSH PRIVILEGES;"
        
        echo ""
        echo "=========================================="
        echo "🔑 MOT DE PASSE MySQL : \$DB_PASS"
        echo "=========================================="
        echo "Notez-le et mettez-le dans .env sur le serveur !"
        echo ""
        
        echo "🌐 Configuration Nginx..."
        mkdir -p /var/www/nird-clicker
REMOTE

    # Envoyer la config Nginx
    scp "$SCRIPT_DIR/nginx/nird-clicker.conf" "$SERVER_USER@$SERVER_HOST:/etc/nginx/sites-available/nird-clicker"
    
    ssh "$SERVER_USER@$SERVER_HOST" << REMOTE
        ln -sf /etc/nginx/sites-available/nird-clicker /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t && systemctl reload nginx
        
        echo ""
        echo "🔒 Configuration SSL avec Certbot..."
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@mehmetates.fr || {
            echo "⚠️  Certbot a échoué. Vérifiez que le DNS pointe vers ce serveur."
            echo "   Relancez manuellement : certbot --nginx -d $DOMAIN"
        }
        
        # Renouvellement auto
        systemctl enable certbot.timer
        
        echo ""
        echo "✅ Setup terminé !"
REMOTE
    
    echo -e "${GREEN}✅ Serveur configuré !${NC}"
    echo -e "${YELLOW}Prochaine étape : $0 build && $0 deploy${NC}"
}

# ===========================================
# Fonction: Logs
# ===========================================
logs() {
    echo -e "${CYAN}📋 Logs de l'application...${NC}"
    ssh "$SERVER_USER@$SERVER_HOST" "pm2 logs nird-clicker --lines 50"
}

# ===========================================
# Fonction: Status
# ===========================================
status() {
    echo -e "${CYAN}📊 Status du serveur...${NC}"
    ssh "$SERVER_USER@$SERVER_HOST" << 'REMOTE'
        echo "=== PM2 ==="
        pm2 status
        echo ""
        echo "=== Nginx ==="
        systemctl status nginx --no-pager -l | head -10
        echo ""
        echo "=== MySQL ==="
        systemctl status mysql --no-pager -l | head -5
        echo ""
        echo "=== Certificat SSL ==="
        certbot certificates 2>/dev/null | grep -A3 "Certificate Name" || echo "Pas de certificat"
REMOTE
}

# ===========================================
# Aide
# ===========================================
help() {
    echo "Usage: $0 <commande>"
    echo ""
    echo "Commandes:"
    echo "  build        Créer le build dans ./dist"
    echo "  deploy       Déployer sur le serveur"
    echo "  setup        Configuration initiale du serveur (1ère fois)"
    echo "  logs         Voir les logs PM2"
    echo "  status       Status des services"
    echo "  all          Build + Deploy"
    echo ""
    echo "Configuration:"
    echo "  Modifiez SERVER_USER, SERVER_HOST en haut du script"
}

# ===========================================
# Main
# ===========================================
case "${1:-help}" in
    build)
        build
        ;;
    deploy)
        deploy
        ;;
    setup)
        setup_server
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    all)
        build
        deploy
        ;;
    *)
        help
        ;;
esac
