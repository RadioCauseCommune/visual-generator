# 🎨 Cause Commune Visual Generator

> Outil tout-en-un de génération, composition graphique et diffusion sociale pour **Radio Cause Commune (93.1 FM)**.

Création rapide de visuels professionnels, de carrousels pour réseaux sociaux, génération d'images par IA et publication directe sur les plateformes sociales.

---

## 🌟 Vue d'ensemble des Fonctionnalités

### 1. 🖼️ Studio Visuel & Éditeur Graphique
- **27 formats optimisés** pour Instagram, LinkedIn, Facebook, X (Twitter), Mastodon, Bluesky, YouTube, TikTok, Pinterest et plateformes de Podcasts.
- **Éditeur de calques** par glisser-déposer avec alignements magnétiques, rotations, effets typographiques rétro/brutalistes, masques et transparence.
- **Compositions d'arrière-plan multi-images** : grilles de disposition (splits, diptyques, triptyques, mosaïques) avec ajustement de l'écartement (*gap*) et réordonnancement.
- **Import RSS automatique** : récupération instantanée des métadonnées d'émissions (titres, descriptifs, dates, vignettes).
- **Inpainting IA** : retouche ciblée et remplacement partiel d'éléments visuels.

### 2. 📱 Studio Carrousels Néo-Brutaliste *(v2)*
- **Concepteur de carrousels multi-diapositives** au format standard 1080×1080.
- **Modèles prédéfinis** aux couleurs de Cause Commune (Économie, FSER, Débats, Émissions spéciales).
- **Navigation & Réorganisation** : ajout, duplication, réordonnancement par glisser-déposer.
- **Export ZIP** haute définition contenant l'ensemble des diapositives PNG numérotées.
- **Import / Export JSON** des projets de carrousels pour le travail d'équipe.

### 3. 🚀 Diffusion Sociale Directe
- **Instagram (Meta Graph API)** :
  - Publication directe de visuels uniques (Post carré, Portrait, Story).
  - **Publication directe de Carrousels d'images (2 à 10 diapositives)** avec suivi de progression en temps réel (*Rendu HD $\rightarrow$ Stockage sécurisé $\rightarrow$ Publication*).
  - Support du compte officiel Cause Commune et des comptes connectés via OAuth.
  - Gestion des légendes, compteur de caractères (2200 max), suggestions de hashtags thématiques et texte alternatif pour l'accessibilité.
- **LinkedIn** :
  - Publication d'articles visuels sur profils et pages d'organisations.
- **Modération Instagram intégrée** :
  - Consultation des publications récentes du compte.
  - Lecture, réponse en direct, masquage ou suppression de commentaires.
- **Historique de publication** :
  - Traçabilité des posts diffusés avec statuts et liens directs.

### 4. 🤖 Génération d'Images par IA
- Intégration de modèles d'état de l'art : **FLUX.1-schnell** (HuggingFace Inference API), **Replicate** ou instance **FLUX Locale**.
- Styles artistiques prédéfinis (Néo-brutalisme, Collage punk, Radio studio, Vintage 80s, etc.).

### 5. ☁️ Sauvegarde & Mode Collaboratif
- **Cloud (Supabase)** : compte utilisateur, galerie de projets dans le cloud, synchronisation des tokens sociaux.
- **Mode Local & Confidentialité** : export/import complet de projets JSON utilisable sans inscription.
- **Manuel intégré** : guide d'utilisation pas à pas accessible directement depuis l'en-tête de l'application.

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18+ (recommandé 20+)
- **npm** ou **yarn**
- *(Optionnel)* Tokens API : HuggingFace (FLUX), Supabase, Meta / Instagram Graph API, LinkedIn.

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/RadioCauseCommune/visual-generator.git
cd visual-generator

# 2. Installer les dépendances
npm install

# 3. Configuration de l'environnement
cp .env.example .env
# Renseignez vos clés dans le fichier .env (ou lancez le script d'aide)
npm run setup

# 4. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur **http://localhost:5173**.

---

## 🏗️ Architecture & Structure du Projet

```
visual-generator/
├── components/
│   ├── Carousel/             # Studio Carrousels (Éditeur, Rendu, Presets, Modal de Publication)
│   ├── Editor/               # Canvas principal, Inspecteur de calques, Sidebar, Inpainting
│   ├── Greetings/            # Générateur spécifique de cartes de vœux
│   └── UI/                   # Header, Manuel in-app, Modération Instagram, Panneau Social
├── hooks/                    # Logique métier (useLayers, useProject, usePersistence, useAiImage)
├── services/                 # API (instagramService, linkedinService, storage, RSS, cloud)
├── utils/                    # Utilitaires (compositions, sanitization, export)
├── public/                   # Polices, logos et assets statiques
├── server-production.js      # Serveur Express (Proxy IA sécurisé, Meta Graph API, OAuth, Storage)
├── vite.config.ts            # Configuration Vite & proxys de développement
└── types.ts                  # Définitions TypeScript
```

---

## 🔐 Serveur de Production & Déploiement

Le serveur `server-production.js` fournit une couche d'API sécurisée pour la production :
- Chiffrement et sécurisation des tokens d'accès (Meta, LinkedIn, HuggingFace).
- Endpoints de publication et d'upload d'assets temporaires vers Supabase Storage.
- Rate limiting et protection CSRF / CORS.

### Lancement en Production

```bash
# 1. Compiler le frontend pour la production
npm run build

# 2. Démarrer le serveur de production sécurisé
npm run start:prod
```

Par défaut, le serveur démarre sur le port `3001` (configurable via la variable `PORT`).

---

## 🛠️ Commandes Disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Lance le serveur de développement Vite (avec HMR) |
| `npm run build` | Valide le typage TypeScript et compile le bundle de production |
| `npm run preview` | Prévisualise localement le bundle compilé |
| `npm run start:prod` | Démarre le serveur Node.js de production |
| `npm run setup` | Assistant interactif de configuration de l'environnement `.env` |

---

## 📄 Licence & Crédits

Ce projet est sous licence **GNU Affero General Public License v3.0 (AGPL-3.0)**.  
Développé avec passion pour **Radio Cause Commune (93.1 FM)**.
