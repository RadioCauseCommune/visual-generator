# 🎨 Cause Commune Visual Generator

Générateur d'assets visuels pour Radio Cause Commune - Création de visuels pour toutes les plateformes sociales avec génération d'images IA (FLUX.1-schnell).

## ✨ Fonctionnalités

- 🎯 **27 formats optimisés** pour Instagram, Facebook, Twitter/X, LinkedIn, YouTube, TikTok, Pinterest et Podcast
- 🤖 **Génération d'images IA** avec FLUX.1-schnell (HuggingFace) ou FLUX Local
- 🎨 **Éditeur visuel** drag & drop avec calques
- 🎭 **Effets typographers** (scratch, rotations, couleurs personnalisées)
- 📤 **Export PNG haute qualité** et sauvegarde de projets JSON
- 🎭 **Variantes de logo** Radio Cause Commune et icônes réseaux sociaux (X, Twitch, YouTube, etc.) intégrées
- 🔒 **Sécurisé** pour la production (HuggingFace token côté serveur)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ (recommandé 20+)
- Token HuggingFace (gratuit sur https://huggingface.co/settings/tokens pour utiliser le modèle FLUX.1-schnell)

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-compte/cause-commune-visual-generator.git
cd cause-commune-visual-generator

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
# Copiez .env.example vers .env et renseignez vos clés
cp .env.example .env
# Ou utilisez l'assistant
npm run setup

# 4. Lancer l'application en développement
npm run dev
```

L'application est accessible sur **http://localhost:5173** (par défaut avec Vite)

## 📁 Structure du Projet

```
cause-commune-visual-generator/
├── components/              # Composants React (Editor, UI, Greetings)
├── hooks/                  # Hooks React (useProject, useProjectState)
├── services/               # Services (IA, RSS, etc.)
├── utils/                  # Utilitaires
├── public/                 # Assets statiques (logos, fonts)
├── App.tsx                 # Composant principal
├── types.ts                # Types TypeScript
├── constants.tsx           # Configurations (couleurs, logos, formats, icônes)
├── server-production.js    # Serveur de production Node.js sécurisé
├── vite.config.ts          # Configuration Vite
└── package.json
```

## 🔐 Sécurité & Déploiement

### Production
Pour la production, il est recommandé d'utiliser le serveur Node.js fourni qui sert de proxy pour sécuriser votre token HuggingFace :

```bash
# 1. Build l'application frontend
npm run build

# 2. Configurer les variables d'environnement dans .env
# (HUGGINGFACE_TOKEN, ALLOWED_ORIGINS, etc.)

# 3. Lancer le serveur de production
npm run start:prod
```

### Nginx
Un exemple de configuration Nginx est disponible dans `nginx-example.conf` pour mettre en place HTTPS et un reverse proxy.

## 🛠️ Scripts Disponibles

- `npm run dev` - Version de développement (Vite)
- `npm run build` - Compilation pour la production
- `npm run start:prod` - Lancement du serveur de production sécurisé
- `npm run setup` - Assistant de configuration interactif

## 🤝 Contribution

Cette application est développée pour Radio Cause Commune. Les contributions sont les bienvenues via Pull Requests.

## 📄 Licence

Ce projet est sous licence **GNU Affero General Public License v3.0 (AGPL-3.0)**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour Radio Cause Commune**
