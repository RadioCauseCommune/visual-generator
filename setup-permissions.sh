#!/bin/bash

# Script pour configurer les permissions pour le déploiement
# Usage: ./setup-permissions.sh [option]
# Options: home (défaut) | opt | group | acl

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

METHOD=${1:-home}
APP_NAME="cause-commune-visual-generator"
USER="your-user"

echo -e "${BLUE}🔐 Configuration des permissions pour $APP_NAME${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

case $METHOD in
  home)
    echo -e "${GREEN}✅ Méthode recommandée : Répertoire dans le home${NC}"
    echo ""
    echo "Aucune configuration nécessaire !"
    echo "L'application sera installée dans :"
    echo "  ~/apps/$APP_NAME"
    echo ""
    echo "Avantages :"
    echo "  ✅ Pas besoin de sudo"
    echo "  ✅ Permissions automatiques"
    echo "  ✅ Simple à gérer"
    echo ""
    echo "Pour utiliser cette méthode, dans deploy-lxc.sh :"
    echo "  REMOTE_PATH=\"\$HOME/apps/$APP_NAME\""
    ;;
    
  opt)
    echo -e "${YELLOW}📁 Configuration pour /opt/$APP_NAME${NC}"
    echo ""
    echo "Cette méthode nécessite sudo pour la configuration initiale."
    echo ""
    
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}❌ Ce script doit être exécuté avec sudo${NC}"
        echo "Usage: sudo ./setup-permissions.sh opt"
        exit 1
    fi
    
    echo "Création du répertoire..."
    mkdir -p /opt/$APP_NAME
    
    echo "Configuration du propriétaire..."
    chown -R $USER:$USER /opt/$APP_NAME
    
    echo "Configuration des permissions..."
    chmod 755 /opt/$APP_NAME
    
    echo ""
    echo -e "${GREEN}✅ Configuration terminée !${NC}"
    echo ""
    echo "Le répertoire /opt/$APP_NAME appartient maintenant à $USER"
    echo "Vous pouvez maintenant déployer l'application."
    ;;
    
  group)
    echo -e "${YELLOW}👥 Configuration avec groupe dédié${NC}"
    echo ""
    
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}❌ Ce script doit être exécuté avec sudo${NC}"
        echo "Usage: sudo ./setup-permissions.sh group"
        exit 1
    fi
    
    GROUP_NAME="app-deploy"
    
    echo "Création du groupe $GROUP_NAME..."
    if ! getent group $GROUP_NAME > /dev/null 2>&1; then
        groupadd $GROUP_NAME
        echo "Groupe créé."
    else
        echo "Groupe existe déjà."
    fi
    
    echo "Ajout de $USER au groupe..."
    usermod -aG $GROUP_NAME $USER
    
    echo "Création du répertoire..."
    mkdir -p /opt/$APP_NAME
    
    echo "Configuration du groupe..."
    chown root:$GROUP_NAME /opt/$APP_NAME
    chmod 775 /opt/$APP_NAME
    chmod g+s /opt/$APP_NAME
    
    echo ""
    echo -e "${GREEN}✅ Configuration terminée !${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT : L'utilisateur $USER doit se déconnecter et se reconnecter${NC}"
    echo "pour que les changements de groupe prennent effet."
    echo ""
    echo "Vérification :"
    echo "  groups $USER"
    ;;
    
  acl)
    echo -e "${YELLOW}📋 Configuration avec ACL${NC}"
    echo ""
    
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}❌ Ce script doit être exécuté avec sudo${NC}"
        echo "Usage: sudo ./setup-permissions.sh acl"
        exit 1
    fi
    
    # Vérifier si ACL est installé
    if ! command -v setfacl &> /dev/null; then
        echo "Installation des outils ACL..."
        apt-get update
        apt-get install -y acl
    fi
    
    echo "Création du répertoire..."
    mkdir -p /opt/$APP_NAME
    
    echo "Configuration des ACL..."
    setfacl -R -m u:$USER:rwx /opt/$APP_NAME
    setfacl -R -d -m u:$USER:rwx /opt/$APP_NAME
    
    echo ""
    echo -e "${GREEN}✅ Configuration terminée !${NC}"
    echo ""
    echo "Vérification des ACL :"
    getfacl /opt/$APP_NAME
    ;;
    
  *)
    echo -e "${RED}❌ Option invalide : $METHOD${NC}"
    echo ""
    echo "Usage: ./setup-permissions.sh [option]"
    echo ""
    echo "Options disponibles :"
    echo "  home  - Répertoire dans le home (recommandé, défaut)"
    echo "  opt   - Changer propriétaire de /opt/$APP_NAME"
    echo "  group - Utiliser un groupe dédié"
    echo "  acl   - Utiliser Access Control Lists"
    echo ""
    echo "Voir PERMISSIONS-LXC.md pour plus de détails."
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
