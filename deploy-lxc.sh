#!/bin/bash

# Script de déploiement pour LXC
# Usage: ./deploy-lxc.sh

set -e  # Arrêter en cas d'erreur

# Configuration
SSH_JUMP_HOST="user@your-ssh-jump-host:port"
SSH_TARGET="your-user@your-target-ip"

# Chemin de déploiement
# Option 1: Dans le home de l'utilisateur (recommandé, pas besoin de sudo)
# Utiliser ~/apps/ qui sera interprété sur le serveur distant
REMOTE_PATH="~/apps/cause-commune-visual-generator"

# Exemples de variables d'environnement qui pourraient être nécessaires dans .env
# ALLOWED_ORIGINS=https://your-domain.com
# VITE_LOCAL_FLUX_URL=http://your-internal-ip:8000

# Option 2: Dans /opt (nécessite sudo pour la création initiale)
# REMOTE_PATH="/opt/cause-commune-visual-generator"

LOCAL_PATH="."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Déploiement Cause Commune Visual Generator sur LXC${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json introuvable${NC}"
    echo "Assurez-vous d'exécuter ce script depuis la racine du projet."
    exit 1
fi

# Vérifier que .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env introuvable${NC}"
    echo "Création d'un fichier .env.example..."
    echo "N'oubliez pas de créer un fichier .env avec vos variables avant de déployer !"
    exit 1
fi

# Vérifier que le build existe
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  Dossier dist introuvable${NC}"
    read -p "Voulez-vous builder l'application maintenant ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Build de l'application..."
        npm run build
    else
        echo -e "${RED}❌ Déploiement annulé${NC}"
        exit 1
    fi
fi

# Créer le répertoire sur le serveur distant
echo "📁 Création du répertoire sur le serveur..."
# Note: Si vous utilisez /opt, vous devrez peut-être créer le répertoire avec sudo d'abord
# sudo mkdir -p /opt/cause-commune-visual-generator
# sudo chown -R your-user:your-user /opt/cause-commune-visual-generator
# Utiliser des guillemets simples pour que ~ soit interprété sur le serveur distant
ssh -J $SSH_JUMP_HOST $SSH_TARGET "mkdir -p $REMOTE_PATH"

# Transférer les fichiers nécessaires
echo "📤 Transfert des fichiers..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'logs' \
    -e "ssh -J $SSH_JUMP_HOST" \
    $LOCAL_PATH/ $SSH_TARGET:$REMOTE_PATH/

# Transférer le dossier dist séparément
echo "📤 Transfert du dossier dist..."
rsync -avz --progress \
    -e "ssh -J $SSH_JUMP_HOST" \
    $LOCAL_PATH/dist/ $SSH_TARGET:$REMOTE_PATH/dist/

# Transférer le fichier .env (avec confirmation)
echo -e "${YELLOW}⚠️  Transfert du fichier .env${NC}"
read -p "Voulez-vous transférer le fichier .env ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    scp -o ProxyJump=$SSH_JUMP_HOST .env $SSH_TARGET:$REMOTE_PATH/.env
    echo -e "${GREEN}✅ Fichier .env transféré${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier .env non transféré. Assurez-vous qu'il existe sur le serveur.${NC}"
fi

# Exécuter les commandes sur le serveur distant
echo "🔧 Installation et configuration sur le serveur..."
# Utiliser des guillemets simples pour éviter l'expansion locale de ~
ssh -J $SSH_JUMP_HOST $SSH_TARGET << 'REMOTE_SCRIPT'
    set -e
    cd ~/apps/cause-commune-visual-generator
    
    echo "📦 Installation des dépendances..."
    npm install --production
    
    echo "📁 Création du dossier de logs..."
    mkdir -p logs
    
    echo "🔄 Redémarrage avec PM2..."
    pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
    
    echo "💾 Sauvegarde de la configuration PM2..."
    pm2 save
    
    echo -e "${GREEN}✅ Déploiement terminé !${NC}"
    echo ""
    echo "Vérification du statut:"
    pm2 status
REMOTE_SCRIPT

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo ""
echo "Commandes utiles:"
echo "  Voir les logs: ssh -J $SSH_JUMP_HOST $SSH_TARGET 'pm2 logs cause-commune-generator'"
echo "  Voir le statut: ssh -J $SSH_JUMP_HOST $SSH_TARGET 'pm2 status'"
echo "  Redémarrer: ssh -J $SSH_JUMP_HOST $SSH_TARGET 'pm2 restart cause-commune-generator'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
