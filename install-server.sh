#!/bin/bash

# Script d'installation sur le serveur LXC
# À exécuter directement sur le serveur après avoir transféré les fichiers
# Usage: ./install-server.sh

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 Installation Cause Commune Visual Generator${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js n'est pas installé${NC}"
    echo "Installation de Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js $NODE_VERSION installé${NC}"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm $NPM_VERSION installé${NC}"

# Installer PM2 globalement si pas déjà installé
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installé${NC}"
else
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}✅ PM2 $PM2_VERSION déjà installé${NC}"
fi

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
    cat > .env.example << EOF
# Configuration Cause Commune Visual Generator
HUGGINGFACE_TOKEN=
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://votre-domaine.com
EOF
    echo -e "${YELLOW}⚠️  Veuillez créer un fichier .env avec vos variables avant de continuer${NC}"
    echo "Vous pouvez copier .env.example et le modifier:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --production

# Build de l'application si dist n'existe pas
if [ ! -d "dist" ]; then
    echo "🏗️  Build de l'application..."
    npm run build
else
    echo -e "${GREEN}✅ Dossier dist trouvé${NC}"
fi

# Créer le dossier de logs
echo "📁 Création du dossier de logs..."
mkdir -p logs

# Vérifier que ecosystem.config.cjs existe
if [ ! -f "ecosystem.config.cjs" ]; then
    echo -e "${YELLOW}⚠️  ecosystem.config.cjs introuvable${NC}"
    echo "Création d'un fichier de configuration PM2 basique..."
    cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'cause-commune-generator',
    script: 'server-production.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
EOF
fi

# Démarrer ou redémarrer avec PM2
echo "🚀 Démarrage avec PM2..."
if pm2 list | grep -q "cause-commune-generator"; then
    echo "Redémarrage de l'application existante..."
    pm2 restart ecosystem.config.cjs
else
    echo "Démarrage de la nouvelle application..."
    pm2 start ecosystem.config.cjs
fi

# Sauvegarder la configuration PM2
echo "💾 Sauvegarde de la configuration PM2..."
pm2 save

# Configurer le démarrage automatique
echo "⚙️  Configuration du démarrage automatique..."
pm2 startup | grep -v "PM2" | bash || echo -e "${YELLOW}⚠️  La commande pm2 startup nécessite peut-être des privilèges sudo${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Installation terminée avec succès !${NC}"
echo ""
echo "Statut de l'application:"
pm2 status
echo ""
echo "Commandes utiles:"
echo "  Voir les logs: pm2 logs cause-commune-generator"
echo "  Voir le statut: pm2 status"
echo "  Redémarrer: pm2 restart cause-commune-generator"
echo "  Arrêter: pm2 stop cause-commune-generator"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de configurer Nginx pour exposer l'application !${NC}"
echo "Voir DEPLOIEMENT-LXC.md pour la configuration Nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
