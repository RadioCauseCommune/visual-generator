# 🗺️ Roadmap - Cause Commune Visual Generator

**Version actuelle**: 1.2.0  
**Date de création**: 27 décembre 2025  
**Dernière mise à jour**: 25 février 2026

---

## 📊 Vue d'Ensemble

| Phase       | Tâches | Complétées | En cours | À faire |
| ----------- | ------ | ---------- | -------- | ------- |
| **Phase 1** | 11     | 8          | 0        | 3       |
| **Phase 2** | 14     | 7          | 0        | 7       |
| **Phase 3** | 18     | 9          | 0        | 9       |
| **Phase 4** | 13     | 2          | 0        | 11      |
| **TOTAL**   | 56     | 26         | 0        | 30      |

---

## 📅 Phase 1 : Fondamentaux & Sécurité (1-2 mois)

### 🔒 Priorité 1 - Sécurité (High)

#### ✅ 1.1 Installation locale des dépendances

- [x] Installer **Tailwind CSS** localement via npm
- [x] Installer **html-to-image** localement via npm
- [x] Supprimer les CDNs externes de `index.html`
- [x] Créer `tailwind.config.js` avec couleurs Cause Commune personnalisées
- [x] Créer `postcss.config.js` avec `@tailwindcss/postcss`
- [x] Créer `index.css` avec directives Tailwind et styles personnalisés

**Fichiers créés** :

- `tailwind.config.js`
- `postcss.config.js`
- `index.css`

**Impact** :

- Sécurité améliorée (pas de dépendances externes)
- Performance améliorée (chargement local)
- Bundle optimisé (Tree-shaking possible)

---

#### ✅ 1.2 Subresource Integrity (SRI)

- [x] Retirer les CDNs Tailwind et html-to-image
- [x] Les CDNs restants (polices) n'ont plus besoin de SRI car polices locales via @fontsource

**Impact** :

- Aucun risque d'injection via CDN compromis

---

#### ✅ 1.3 Restreindre CORS

- [x] Configurer CORS dans `server-production.js` avec `ALLOWED_ORIGINS`
- [x] Remplacer `'*'` par les domaines autorisés
- [x] Configuration via variable d'environnement `ALLOWED_ORIGINS`

**Fichier modifié** :

- `server-production.js` (lignes 87-97)

**Impact** :

- Protection contre les requêtes cross-origin non autorisées
- Conformité aux best practices sécurité

---

#### ✅ 1.4 Validation des uploads de fichiers

- [x] Créer `utils/fileValidation.ts`
- [x] Validation de la taille (max 10MB)
- [x] Validation des types MIME (JPEG, PNG, GIF, WebP, SVG)
- [x] Fonctions utilitaires (`formatFileSize()`, `isAllowedMimeType()`)
- [x] Intégration dans `handleFileUpload()` de App.tsx
- [x] Remplacer `alert()` par `showError()` pour les erreurs

**Fichiers créés** :

- `utils/fileValidation.ts`

**Impact** :

- Protection contre les fichiers malveillants
- Protection contre les DoS (taille limite)
- UX améliorée (erreurs explicites)

---

#### ✅ 1.5 Protection XSS

- [x] Installer `dompurify` et `@types/dompurify`
- [x] Créer `utils/sanitization.ts` avec fonctions :
  - [x] `sanitizeText()` : Nettoie les textes utilisateur
  - [x] `sanitizeHTML()` : Nettoie le HTML avec tags autorisés
  - [x] `sanitizeURL()` : Valide et nettoie les URLs
  - [x] `sanitizeMetadata()` : Sanitise les métadonnées de projets
- [x] Intégration dans `useEffect` de App.tsx pour sanitization des métadonnées
- [x] Sanitization des champs titre, sous-titre, guest_name, date, extra1, extra2

**Fichiers créés** :

- `utils/sanitization.ts`

**Impact** :

- Protection contre les attaques XSS
- Conformité OWASP Top 10

---

### 🤖 Priorité 2 - IA - Modèles Alternatifs (Medium)

#### ✅ 1.6 Système de modèles IA

- [x] Créer `types.ts` extension avec `AiModelType` et `AiModel`
- [x] Créer `services/aiModels.ts` avec **5 modèles** :
  - [x] **FLUX.1-schnell** (défaut) - Rapide et gratuit
  - [x] **SDXL Turbo** - Ultra-rapide (2-4 steps), preview instantanée
  - [x] **SDXL Base 1.0** - Haute qualité, assets finaux
  - [x] **Stable Diffusion 1.5** - Écosystème vaste, styles variés
  - [x] **Kandinsky 3** - Approche unique, art abstrait
- [x] Métadonnées par modèle (vitesse, qualité, gratuité, steps max, résolution max)

**Fichiers créés** :

- `services/aiModels.ts`

**Comparatif des modèles** :

| Modèle         | Vitesse    | Qualité    | Gratuit | Steps Max | Résolution Max |
| -------------- | ---------- | ---------- | ------- | --------- | -------------- |
| FLUX.1-schnell | ⚡⚡⚡     | ⭐⭐⭐⭐   | ✅      | 4         | 1440x1440      |
| SDXL Turbo     | ⚡⚡⚡⚡⚡ | ⭐⭐⭐     | ✅      | 4         | 1024x1024      |
| SDXL Base 1.0  | ⚡⚡       | ⭐⭐⭐⭐⭐ | ✅      | 50        | 1024x1024      |
| SD 1.5         | ⚡⚡⚡     | ⭐⭐⭐⭐   | ✅      | 50        | 768x768        |
| Kandinsky 3    | ⚡⚡⚡     | ⭐⭐⭐     | ✅      | 50        | 1024x1024      |

---

#### ✅ 1.7 Composant de sélection de modèle IA

- [x] Créer `components/ModelSelector.tsx`
- [x] Sélecteur de modèle IA avec dropdown
- [x] Affichage des métadonnées (vitesse, qualité, gratuité)
- [x] Indicateurs visuels (badges)
- [x] États (enabled/disabled)

**Fichiers créés** :

- `components/ModelSelector.tsx`

**Composant** :

```tsx
<ModelSelector
  selectedModel={selectedModel}
  onModelChange={setSelectedModel}
  disabled={isGenerating}
/>
```

---

#### ✅ 1.8 Intégration multi-modèles dans le service IA

- [x] Modifier `services/aiService.ts`
- [x] Ajouter support du paramètre `model` dans `AiParameters`
- [x] Adapter `generateImage()` pour utiliser le modèle spécifié
- [x] Limitation automatique des dimensions selon le modèle
- [x] Adaptation des steps par défaut selon le modèle
- [x] Intégration dans `App.tsx` (ligne ~503)

**Fichiers modifiés** :

- `services/aiService.ts`

---

### 🛠️ Priorité 3 - Code Quality (Medium)

#### ✅ 1.9 ESLint & Prettier

- [x] Installer les packages :
  - [x] `eslint`
  - [x] `@typescript-eslint/parser`
  - [x] `@typescript-eslint/eslint-plugin`
  - [x] `eslint-plugin-react`
  - [x] `eslint-plugin-react-hooks`
  - [x] `eslint-config-prettier`
  - [x] `prettier`
  - [x] `@eslint/js`
- [x] Créer `eslint.config.js` (format flat config v9)
- [x] Configurer les règles :
  - [x] TypeScript recommended
  - [x] React recommended
  - [x] React Hooks recommended
  - [x] Prettier integration
  - [x] React/jsx-scope off
  - [x] React/prop-types off
  - [x] React/no-unescaped-entities off
  - [x] React-hooks/set-state-in-effect warn
- [x] Configurer les globals (browser, Node.js, DOM APIs)
- [x] Créer `.prettierrc.json` :
  - [x] Semi-colons activés
  - [x] Double quotes
  - [x] 100 caractères par ligne

**Fichiers créés** :

- `eslint.config.js`
- `.prettierrc.json`

**Scripts ajoutés à package.json** :

- `npm run lint` - Vérifier le code avec ESLint
- `npm run lint:fix` - Corriger automatiquement avec ESLint
- `npm run format` - Formater le code avec Prettier
- `npm run format:check` - Vérifier le formatage

---

#### ⏳ 1.10 Husky - Pre-commit hooks

- [ ] Installer Husky
- [ ] Installer lint-staged
- [ ] Configurer pre-commit hook :
  - [ ] Lancer ESLint sur les fichiers modifiés
  - [ ] Lancer Prettier sur les fichiers modifiés
  - [ ] Empêcher le commit si des erreurs critiques

**Impact** :

- Qualité du code garantie avant chaque commit
- Automatisation des corrections

---

#### ⏳ 1.11 GitHub Actions - CI/CD

- [ ] Créer `.github/workflows/ci.yml`
- [ ] Configurer :
  - [ ] Checkout du repository
  - [ ] Installation des dépendances (`npm ci`)
  - [ ] Lancer les tests (`npm test`)
  - [ ] Lancer le linter (`npm run lint`)
  - [ ] Builder l'application (`npm run build`)
  - [ ] Déployer sur staging/production

**Impact** :

- Tests automatiques à chaque push
- Déploiement automatisé
- Qualité du code garantie

---

### 📊 Phase 1 - Résumé

**Tâches complétées**: 8/11  
**Tâches restantes**: 3/11  
**Progression**: 73%

**Nouveaux fichiers créés** :

- `tailwind.config.js`
- `postcss.config.js`
- `index.css`
- `utils/fileValidation.ts`
- `utils/sanitization.ts`
- `services/aiModels.ts`
- `components/ModelSelector.tsx`
- `components/Toast.tsx`
- `eslint.config.js`
- `.prettierrc.json`
- `hooks/useHistory.ts`
- `hooks/useLayers.ts` (avec copier/coller)
- `services/templates.ts`
- `components/Editor/TemplateSelector.tsx`
- `services/storage.ts`
- `components/UI/ProjectGallery.tsx`
- `components/UI/BatchExportModal.tsx`
- `components/Editor/InpaintingModal.tsx`
- `components/Editor/UpscaleTool.tsx`
- `services/rssService.ts`
- `components/Editor/RssImporter.tsx`
- `services/auth.ts`
- `services/supabase.ts`
- `services/cloudStorage.ts`
- `components/UI/AuthModal.tsx`
- `Dockerfile`
- `docker-compose.yml`

**Fichiers modifiés** :

- `types.ts` (Ajout AiModelType, AiModel)
- `services/aiService.ts` (Support multi-modèles, upscale, inpainting)
- `App.tsx` (Intégration nouvelles fonctionnalités)
- `index.html` (Suppression CDNs)
- `index.tsx` (Exposition html-to-image)
- `package.json` (Scripts npm, dépendances)
- `server-production.js` (CORS avec ALLOWED_ORIGINS)

**Statistiques** :

- ✅ **0** CDNs restants (Tailwind, html-to-image)
- ✅ **5** modèles IA intégrés
- ✅ **2** systèmes de validation (fichiers, XSS)
- ✅ **1** système de notifications (Toast, remplace alert())
- ✅ **1** configuration de linting
- ✅ **1** système d'historique (Undo/Redo)
- ✅ **4** templates prédéfinis (Standard, Interview, Débat, Chronique)
- ✅ **1** système de stockage cloud (Supabase)
- ✅ **3** outils IA avancés (Inpainting, Upscale, RSS import)
- ✅ **1** système d'export avancé (Batch, SVG, PNG transparent)

---

## 📅 Phase 2 : UX & Performance (2-3 mois)

### 🎨 Priorité 1 - Améliorations UX (High)

#### ✅ 2.1 Undo/Redo - Historique des actions
- [x] Créer `hooks/useHistory.ts`
- [x] Implémenter un système d'historique d'états
- [x] Raccourcis clavier : `Ctrl+Z` (undo), `Ctrl+Shift+Z` ou `Ctrl+Y` (redo)
- [x] Limite d'historique (50 actions)
- [x] Boutons Undo/Redo dans le Header

**Impact** :

- UX améliorée (possibilité de revenir en arrière)
- Correction d'erreurs facilitée

---

#### ✅ 2.2 Copier/Coller des calques
- [x] Raccourcis clavier : `Ctrl+C` (copier), `Ctrl+V` (coller)
- [x] Stockage du calque copié dans le presse-papiers
- [x] Coller avec position décalée

**Impact** :

- Productivité augmentée
- Workflow accéléré

---

#### ✅ 2.3 Templates d'émissions prédéfinis
- [x] Créer `services/templates.ts`
- [x] Définir des templates : Interview, Débat, Chronique, Standard
- [x] Sélecteur de template dans l'UI (Sidebar)
- [x] Application automatique du template (layers, positions, styles)

**Fichiers à créer** :

- `services/templates.ts`
- `components/TemplateSelector.tsx`

**Impact** :

- Adoption facilitée pour les nouveaux utilisateurs
- Démarrage rapide pour les émissions courantes

---

#### ✅ 2.4 Galerie de projets sauvegardés
- [x] Créer `services/storage.ts`
- [x] Stockage local (localStorage) des projets sauvegardés
- [x] Affichage de la galerie (recherche, métadonnées)
- [x] Actions : Charger, Supprimer
- [x] Intégration dans le Header (Bouton Galerie et Quick Save)

**Fichiers à créer** :

- `services/storage.ts`
- `components/ProjectGallery.tsx`

**Impact** :

- Gestion facilitée des projets
- Réutilisation d'anciens designs

---

#### ✅ 2.5 Toast Notifications - Remplacement des alertes

- [x] Créer `components/Toast.tsx`
- [x] `ToastContainer` : Conteneur de notifications
- [x] `ToastItem` : Composant de notification individuel
- [x] `useToasts` hook : API simple (success, error, warning, info)
- [x] Animations d'entrée/sortie
- [x] Design néo-brutaliste
- [x] Intégration dans `App.tsx`
- [x] Remplacement de toutes les `alert()` par des toasts

**Fichiers créés** :

- `components/Toast.tsx`

**Impact** :

- UX améliorée (notifications non intrusives)
- Feedback utilisateur plus clair

---

### ⚡ Priorité 2 - Performance (Medium)

#### ⏳ 2.6 Code splitting

- [ ] Installer `@loadable/component` ou utiliser `React.lazy()`
- [ ] Lazy loading des composants lourds :
  - [ ] `components/Canvas.tsx`
  - [ ] `components/SettingsPanel.tsx`
  - [ ] `components/ModelSelector.tsx`
- [ ] Splitting par route (si routing futur)

**Impact** :

- Temps de chargement initial réduit
- Performance améliorée

---

#### ⏳ 2.7 Lazy loading des polices

- [ ] Analyser l'utilisation des polices par projet
- [ ] Charger uniquement les polices utilisées dans le projet actuel
- [ ] Précharger les polices populaires en arrière-plan
- [ ] Afficher un loader personnalisé pendant le chargement

**Impact** :

- Bande passante réduite
- Chargement plus rapide

---

#### ⏳ 2.8 Optimisation des images

- [ ] Compression WebP pour les images uploadées
- [ ] Redimensionnement automatique des images > 2048px
- [ ] Cache des images générées par IA
- [ ] Lazy loading des images dans la galerie

**Impact** :

- Stockage réduit
- Performance améliorée

---

#### ⏳ 2.9 Cache des générations IA

- [ ] Implémenter un cache LRU pour les générations IA
- [ ] Stockage dans localStorage ou IndexedDB
- [ ] Clé de cache : `prompt + style + model + params`
- [ ] Expiration du cache (ex: 7 jours)
- [ ] Indicateur visuel "généré depuis cache"

**Impact** :

- Réduction des appels API
- Économie de quota HuggingFace
- Chargement plus rapide (régénérations)

---

### ♿ Priorité 3 - Accessibilité (Medium)

#### ⏳ 2.10 ARIA labels

- [ ] Ajouter `aria-label` sur tous les boutons
- [ ] Ajouter `aria-label` sur tous les inputs
- [ ] Ajouter `aria-label` sur les sliders
- [ ] Ajouter `aria-live` pour les notifications toast
- [ ] Ajouter `aria-describedby` pour les formulaires

**Impact** :

- Accessibilité améliorée (screen readers)
- Conformité WCAG 2.1 Level AA

---

#### ⏳ 2.11 Navigation clavier complète

- [ ] Support de `Tab` pour naviguer entre les éléments
- [ ] Support de `Enter` pour valider
- [ ] Support de `Escape` pour annuler
- [ ] Focus visible sur les éléments actifs
- [ ] Raccourcis clavier documentés

**Impact** :

- Accessibilité améliorée (navigation sans souris)
- UX améliorée (utilisateurs avancés)

---

#### ⏳ 2.12 Texte alt sur les images générées

- [ ] Ajouter `alt` sur les images uploadées
- [ ] Ajouter `alt` sur les images IA générées
- [ ] Utiliser le prompt comme description alternative
- [ ] Permettre l'édition du texte alt

**Impact** :

- Accessibilité améliorée (images non-visibles)
- SEO amélioré (si web public)

---

### 📊 Priorité 4 - Monitoring (Low)

#### ⏳ 2.13 Intégration Sentry (errors)

- [ ] Installer `@sentry/react` et `@sentry/node`
- [ ] Configurer Sentry dans `App.tsx`
- [ ] Configurer Sentry dans `server-production.js`
- [ ] Définir les niveaux de log (error, warning, info)
- [ ] Filtrer les erreurs non critiques

**Impact** :

- Tracking des erreurs en production
- Debug facilité
- Alertes automatiques

---

#### ⏳ 2.14 Intégration Plausible/Matomo (analytics)

- [ ] Installer l'outil d'analytics
- [ ] Configurer le tracking anonymisé
- [ ] Tracker les événements :
  - [ ] Génération d'images IA
  - [ ] Export PNG
  - [ ] Import/Export JSON
  - [ ] Utilisation des modèles IA
- [ ] Respecter le RGPD (consentement utilisateur)

**Impact** :

- Analyse de l'utilisation
- Identification des fonctionnalités populaires
- Optimisation basée sur les données

---

#### ⏳ 2.15 Logs structurés

- [ ] Installer `pino` ou `winston`
- [ ] Configurer les niveaux de log (debug, info, warn, error)
- [ ] Structurer les logs avec des métadonnées
- [ ] Logs asynchrones (non bloquants)
- [ ] Rotation des logs

**Impact** :

- Debug facilité
- Analyse des logs améliorée
- Performance non affectée

---

#### ⏳ 2.16 Dashboard d'admin

- [ ] Créer `/admin` route
- [ ] Afficher les métriques :
  - [ ] Nombre d'exports
  - [ ] Formats populaires
  - [ ] Modèles IA utilisés
  - [ ] Erreurs rencontrées
- [ ] Graphiques et visualisations
- [ ] Export des logs

**Fichiers à créer** :

- `pages/AdminDashboard.tsx`

**Impact** :

- Visibilité sur l'utilisation
- Identification des problèmes
- Décision basée sur les données

---

---

#### ✅ 2.16 Toolbar Contextuelle
- [x] Création d'une barre d'outils flottante sur le canvas
- [x] Actions rapides : Img2Img, Dupliquer, Supprimer
- [x] Affichage intelligent selon le calque sélectionné
- [x] Suppression des contrôles redondants dans l'Inspector

**Impact** :
- UX plus fluide et directe
- Encombrement réduit de l'interface

---

#### ✅ 2.17 Contrôles avancés des calques
- [x] Redimensionnement précis des photos d'invités
- [x] Masquage circulaire avec padding ajustable pour les logos
- [x] Support des couleurs de fond personnalisées pour les logos masqués

**Impact** :
- Meilleure intégration visuelle des assets
- Professionnalisme accru des designs produits

## 📅 Phase 3 : Fonctionnalités Avancées (3-4 mois)

### 🖼️ Priorité 1 - Export Avancé (High)

#### ✅ 3.1 Export SVG vectoriel
- [x] Conversion des layers en SVG via `html-to-image`
- [x] Préservation des transformations (rotation, scale)
- [x] Préservation des styles (couleurs, polices)
- [x] Bouton d'export dédié dans le header

**Impact** :

- Export vectoriel (scalable sans perte de qualité)
- Usage pour l'impression haute qualité

---

#### ✅ 3.2 Batch export (générer tous les formats en une fois)
- [x] Modal de sélection des formats
- [x] Génération séquentielle avec barre de progression
- [x] Assemblage en fichier ZIP (`jszip`)

**Fichiers à créer** :

- `components/BatchExport.tsx`
- `services/batchExport.ts`

**Impact** :

- Gain de temps énorme (génération automatique)
- Couverture multi-plateforme garantie

---

#### ✅ 3.3 Presets d'export
- [x] Groupes de formats prédéfinis (Pack Insta, Pack Radio, etc.)
- [x] Sélection rapide dans la modal de batch export
- [x] Logique de pré-sélection automatique

**Fichiers à créer** :

- `services/exportPresets.ts`
- `components/ExportPresets.tsx`

**Impact** :

- Démarrage rapide
- Cohérence des assets

---

#### ✅ 3.4 Export transparent PNG
- [x] Toggle "Fond Transparent" dans le sidebar
- [x] Visualisation canvas (pattern damier)
- [x] Gestion du canal Alpha lors de l'export capture

**Impact** :

- Flexibilité accrue
- Support des logos transparents

---

### 👥 Priorité 2 - Collaboratif (High)

#### ✅ 3.5 Stockage distant (Firebase/Supabase)

- [x] Choisir le fournisseur (Supabase)
- [x] Configurer l'authentification (Email/Password)
- [x] Configurer PostgreSQL (Supabase)
- [x] Implémenter les opérations CRUD :
  - [x] Créer un projet
  - [x] Lire les projets de l'utilisateur
  - [x] Mettre à jour un projet
  - [x] Supprimer un projet
- [x] Toggle visibilité publique des projets
- [ ] Synchronisation automatique (auto-save)
- [ ] Gestion des conflits (last-write-wins ou merge)

**Fichiers créés** :

- `services/cloudStorage.ts`
- `services/auth.ts`
- `services/supabase.ts`
- `components/UI/AuthModal.tsx`

**Impact** :

- Accès multi-appareils
- Collaboration possible
- Sauvegarde cloud sécurisée

---

#### ⏳ 3.6 Multi-utilisateur temps réel (WebSocket)

- [ ] Implémenter WebSocket (socket.io ou Firebase Realtime)
- [ ] Diffusion des modifications en temps réel
- [ ] Curseurs collaboratifs (afficher les positions des autres utilisateurs)
- [ ] Notifications de collaboration ("X est en train de modifier...")
- [ ] Gestion des connexions/déconnexions

**Fichiers à créer** :

- `services/collaboration.ts`
- `components/CollaborativeCursors.tsx`

**Impact** :

- Collaboration en temps réel
- Productivité d'équipe améliorée

---

#### ✅ 3.7 Partage de projets (lien publique)
- [x] Générer un lien unique pour chaque projet
- [x] Option "Lien lecture seule" (Deep-linking)
- [x] Visibilité Publique toggle (Supabase RLS)
- [x] Bouton de partage dans la galerie

**Fichiers à créer** :

- `services/sharing.ts`
- `pages/SharePage.tsx`

**Impact** :

- Partage facilité
- Feedback externe possible
- Présentation des projets sans compte

---

#### ⏳ 3.8 Commentaires sur les projets

- [ ] Ajouter système de commentaires
- [ ] Commentaires par projet ou par layer
- [ ] Mentions (@nom)
- [ ] Notifications de nouveaux commentaires
- [ ] Modération (signalement, suppression)

**Fichiers à créer** :

- `services/comments.ts`
- `components/Comments.tsx`

**Impact** :

- Feedback facilité
- Collaboration améliorée

---

### 🤖 Priorité 3 - IA Avancée (Medium)

#### ⏳ 3.9 Génération de variantes (4 versions simultanées)

- [ ] Paralléliser les appels API
- [ ] Générer 4 variantes avec des seeds différents
- [ ] Afficher en grille 2x2
- [ ] Sélection de la variante préférée
- [ ] Option "Régénérer tout"

**Fichiers à créer** :

- `services/aiVariants.ts`
- `components/VariantsGrid.tsx`

**Impact** :

- Choix multiple
- Temps réduit (génération parallèle)

---

#### ✅ 3.10 Inpainting (Retouche de zone)
- [x] Outil de masquage (pinceau) sur les calques image
- [x] Intégration du modèle SD Inpainting
- [x] Remplacement dynamique du contenu du calque
- [x] Interface dédiée (Modal de retouche)

**Fichiers à créer** :

- `services/inpainting.ts`
- `components/InpaintingTool.tsx`

**Impact** :

- Modifications locales précises
- Ne pas régénérer toute l'image

---

#### ✅ 3.11 Upscale (augmenter la résolution)

- [x] Intégrer un modèle upscaling (via Replicate)
- [x] Interface dédiée dans l'Inspector
- [x] Mise à jour automatique du calque avec l'image HD
- [x] Feedback visuel pendant le traitement
- [ ] Configurer les facteurs (2x, 4x, 8x) - actuellement facteur fixe
- [ ] Preview avant/après

**Fichiers créés** :

- `services/aiService.ts` (fonction `upscaleImage`)
- `components/Editor/UpscaleTool.tsx`

**Impact** :

- Qualité finale améliorée
- Support des grandes impressions

---

#### ⏳ 3.12 Prompt templates (suggestions)

- [ ] Créer `services/promptTemplates.ts`
- [ ] Définir des templates :
  - [ ] "Studio radio professionnel"
  - [ ] "Paysage urbain la nuit"
  - [ ] "Abstrait coloré"
  - [ ] "Minimaliste épuré"
- [ ] Affichage des suggestions dans l'UI
- [ ] Recherche dans les templates
- [ ] Ajout de templates personnalisés

**Fichiers à créer** :

- `services/promptTemplates.ts`
- `components/PromptTemplates.tsx`

**Impact** :

- Démarrage facile
- Inspiration pour les prompts

---

#### ⏳ 3.13 Historique des générations IA

- [ ] Stocker toutes les générations IA (localStorage)
- [ ] Afficher l'historique avec miniatures
- [ ] Recharger une génération précédente
- [ ] Re-faire avec des paramètres différents
- [ ] Suppression des générations

**Fichiers à créer** :

- `services/aiHistory.ts`
- `components/AIHistory.tsx`

**Impact** :

- Réutilisation des générations
- Gain de temps (recharger au lieu de régénérer)

---

### 📋 Priorité 4 - Workflow (Low)

#### ⏳ 3.14 Preview responsive

- [ ] Prévisualiser sur plusieurs tailles :
  - [ ] Mobile (375px)
  - [ ] Tablette (768px)
  - [ ] Desktop (1920px)
  - [ ] Format actuel
- [ ] Toggle entre les modes
- [ ] Zoom et pan dans le preview

**Fichiers à créer** :

- `components/ResponsivePreview.tsx`

**Impact** :

- Optimisation multi-écrans
- Détection des problèmes d'affichage

---

#### ⏳ 3.15 Mode "Quick Mode" (assistant pas-à-pas)

- [ ] Créer un assistant guidé
- [ ] Étape 1 : Choisir le format
- [ ] Étape 2 : Saisir le titre
- [ ] Étape 3 : Saisir le sous-titre
- [ ] Étape 4 : Choisir ou générer l'image de fond
- [ ] Étape 5 : Ajouter un logo
- [ ] Étape 6 : Exporter
- [ ] Option "Passer en mode avancé"

**Fichiers à créer** :

- `components/QuickMode.tsx`
- `services/quickMode.ts`

**Impact** :

- Adoption facilitée pour les débutants
- Guide pas-à-pas clair

---

#### ⏳ 3.16 Intégration CMS (récupérer métadonnées automatiquement)

- [ ] Choisir le CMS (WordPress, Drupal, Contentful)
- [ ] Configurer l'API du CMS
- [ ] Récupérer automatiquement :
  - [ ] Titre de l'émission
  - [ ] Description
  - [ ] Date de publication
  - [ ] Invités
- [ ] Mapping des champs CMS vers les métadonnées
- [ ] Synchronisation bidirectionnelle

**Fichiers à créer** :

- `services/cmsIntegration.ts`
- `components/CMSConnector.tsx`

**Impact** :

- Automatisation complète
- Gain de temps énorme
- Cohérence des données

---

#### ✅ 3.17 Automatisation (générer assets à partir de RSS)

- [x] Parser un flux RSS/Atom
- [x] Extraire les métadonnées (titre, date, description, image)
- [x] Intégration WordPress (récupération des émissions)
- [x] Import automatique des métadonnées dans le projet
- [ ] Générer automatiquement les assets pour chaque épisode
- [ ] Batch export de tous les épisodes
- [ ] Scheduling (cron ou tâches planifiées)

**Fichiers créés** :

- `services/rssService.ts`
- `components/Editor/RssImporter.tsx`

**Impact** :

- Automatisation partielle (import des métadonnées)
- Gain de temps sur la saisie manuelle

---

#### ✅ 3.18 Intégration des icônes réseaux sociaux
- [x] Ajout d'une section dédiée dans les calques
- [x] Support des logos : Twitch, YouTube, X, Facebook, LinkedIn, Instagram, TikTok, Pinterest, Podcast
- [x] Redimensionnement et coloration dynamique des icônes
- [x] Alignement optimisé pour les bas de visuels

**Impact** :
- Création simplifiée de visuels promotionnels complets
- Cohérence visuelle sur tous les supports

## 📅 Phase 4 : Infrastructure & Scalabilité (Ongoing)

### 🚀 Priorité 1 - DevOps (High)

#### ✅ 4.1 Docker multi-stage build

- [x] Créer `Dockerfile` avec multi-stage build
- [x] Stage 1 : `build` (Installation des dépendances + Build)
- [x] Stage 2 : `production` (Image finale optimisée)
- [x] Support des variables d'environnement Vite (Supabase)
- [ ] Optimisation de l'image size (utiliser alpine ou distroless)
- [ ] `.dockerignore` pour optimiser le build

**Fichiers créés** :

- `Dockerfile`
- `docker-compose.yml`

**Impact** :

- Déploiement simplifié
- Images optimisées
- Consistance dev/prod

---

#### ✅ 4.13 Publication Open Source (Première Release)
- [x] Choix de la licence **GNU AGPL v3**
- [x] Assainissement complet de la base de code (suppression des IPs internes, noms d'utilisateurs, secrets)
- [x] Réinitialisation de l'historique Git pour une base propre
- [x] Mise à jour du README avec instructions d'installation publiques
- [x] Ajout de captures d'écran de l'interface

**Impact** :
- Accessibilité publique du projet
- Collaboration communautaire facilitée
- Protection juridique via AGPL v3

---

#### ⏳ 4.2 Kubernetes (si scalabilité nécessaire)

- [ ] Créer les manifests Kubernetes :
  - [ ] `deployment.yaml`
  - [ ] `service.yaml`
  - [ ] `ingress.yaml`
  - [ ] `configmap.yaml`
  - [ ] `secret.yaml`
- [ ] Configurer HorizontalPodAutoscaler
- [ ] Configurer le LoadBalancer
- [ ] Monitoring (Prometheus, Grafana)

**Fichiers à créer** :

- `k8s/` (dossier avec tous les manifests)

**Impact** :

- Scalabilité horizontale
- Haute disponibilité
- Redondance

---

#### ⏳ 4.3 CDN pour les assets générés

- [ ] Choisir le CDN (CloudFlare, AWS CloudFront, Fastly)
- [ ] Configurer le bucket de stockage (S3, R2, MinIO)
- [ ] Upload automatique des assets générés
- [ ] Distribution mondiale des assets
- [ ] Cache configuré (TTL, purge)

**Impact** :

- Chargement rapide worldwide
- Réduction de la charge serveur
- Scalabilité du stockage

---

#### ⏳ 4.4 Backup automatique (base + fichiers)

- [ ] Configurer les backups automatiques :
  - [ ] Base de données quotidienne
  - [ ] Assets générés hebdomadaire
  - [ ] Configurations mensuelles
- [ ] Rotation des backups (garder 7 jours, 4 semaines, 12 mois)
- [ ] Tests de restauration
- [ ] Notifications de succès/échec des backups

**Impact** :

- Protection contre la perte de données
- Récupération en cas d'incident

---

### 📊 Priorité 2 - Observabilité (Medium)

#### ⏳ 4.5 Distributed tracing (OpenTelemetry)

- [ ] Installer OpenTelemetry
- [ ] Configurer les traces :
  - [ ] Génération d'images IA
  - [ ] Exports PNG
  - [ ] Appels API
  - [ ] Opérations de base de données
- [ ] Intégration avec Jaeger ou Zipkin
- [ ] Dashboard de visualisation

**Fichiers à créer** :

- `services/tracing.ts`

**Impact** :

- Analyse des performances
- Identification des bottlenecks
- Debug facilité

---

#### ⏳ 4.6 Performance monitoring (APM)

- [ ] Intégrer un outil APM (New Relic, Datadog, Dynatrace)
- [ ] Monitorer les métriques :
  - [ ] Time to first byte (TTFB)
  - [ ] First contentful paint (FCP)
  - [ ] Largest contentful paint (LCP)
  - [ ] Cumulative layout shift (CLS)
- [ ] Alertes automatiques (SLA)
- [ ] Profiling en production

**Impact** :

- Performance monitoring en temps réel
- Identification des problèmes utilisateurs
- Optimisation basée sur les données

---

#### ⏳ 4.7 Error tracking avancé

- [ ] Intégration avec Sentry étendue :
  - [ ] Breadcrumbs (historique des actions)
  - [ ] Release tracking
  - [ ] Environnement (dev/staging/prod)
  - [ ] User context (ID, email)
  - [ ] Custom tags
- [ ] Intégration des issues avec GitHub/GitLab
- [ ] Dashboards personnalisables

**Impact** :

- Debug avancé
- Corrélation erreur - commit
- Résolution rapide

---

#### ⏳ 4.8 Alerting (Discord/Email/Slack)

- [ ] Configurer les canaux d'alerte :
  - [ ] Discord webhook
  - [ ] Email SMTP
  - [ ] Slack webhook
- [ ] Définir les règles d'alerte :
  - [ ] Erreurs critiques (Sentry)
  - [ ] Performance dégradée (APM)
  - [ ] Échec de backup
  - [ ] Disk space low
  - [ ] CPU/Memory high
- [ ] Templates de messages
- [ ] Escalation (warning → critical → emergency)

**Impact** :

- Réactivité aux incidents
- Downtime réduite
- Communication automatique

---

### 📈 Priorité 3 - Analytics (Low)

#### ⏳ 4.9 Dashboard d'usage

- [ ] Créer `/analytics` route
- [ ] Afficher les métriques :
  - [ ] Nombre d'exports par jour/semaine/mois
  - [ ] Formats les plus populaires
  - [ ] Modèles IA les plus utilisés
  - [ ] Utilisateurs actifs (DAU, MAU)
  - [ ] Temps moyen de session
- [ ] Graphiques et visualisations (Chart.js, Recharts)
- [ ] Export des données (CSV, JSON)

**Fichiers à créer** :

- `pages/AnalyticsDashboard.tsx`
- `services/analytics.ts`

**Impact** :

- Visibilité sur l'utilisation
- Décision basée sur les données
- Optimisation des fonctionnalités

---

#### ⏳ 4.10 Heatmaps (comportement utilisateur)

- [ ] Intégrer un outil de heatmap (Hotjar, Crazy Egg, Microsoft Clarity)
- [ ] Capturer les clics, scrolls, mouvements
- [ ] Identifier les zones chaudes/froides
- [ ] Optimiser l'UI en conséquence
- [ ] Respecter le RGPD (consentement)

**Impact** :

- Compréhension du comportement utilisateur
- Optimisation de l'UX
- Augmentation des conversions

---

#### ⏳ 4.11 A/B testing

- [ ] Installer un outil d'A/B testing (Optimizely, VWO)
- [ ] Configurer les tests :
  - [ ] Placement des boutons
  - [ ] Couleurs du design
  - [ ] Ordre des étapes
- [ ] Analyse des résultats (statistical significance)
- [ ] Rollout automatique du variant gagnant

**Impact** :

- Optimisation basée sur les données
- Amélioration continue
- ROI des features

---

#### ⏳ 4.12 Feature flags

- [ ] Installer un outil de feature flags (LaunchDarkly, Unleash)
- [ ] Configurer les flags :
  - [ ] `enable-collaboration`
  - [ ] `enable-batch-export`
  - [ ] `enable-ai-advanced`
  - [ ] `enable-new-ui`
- [ ] Segmentation (par utilisateur, géographie, etc.)
- [ ] Rollout progressif (canary, blue/green)

**Fichiers à créer** :

- `services/featureFlags.ts`

**Impact** :

- Déploiement progressif
- Rollback facile
- Tests en production sécurisés

---

## 📊 Statistiques Globales

### Tâches par priorité

| Priorité   | Total | Complétées | En cours | À faire | Progression |
| ---------- | ----- | ---------- | -------- | ------- | ----------- |
| **High**   | 16    | 14         | 0        | 2       | 87%         |
| **Medium** | 22    | 9          | 0        | 13      | 41%         |
| **Low**    | 18    | 3          | 0        | 15      | 16%         |
| **TOTAL**  | 56    | 26         | 0        | 30      | 46%         |

### Tâches par catégorie

| Catégorie                | Total | Complétées | En cours | À faire | Progression |
| ------------------------ | ----- | ---------- | -------- | ------- | ----------- |
| **Sécurité**             | 5     | 5          | 0        | 0       | 100%        |
| **IA**                   | 8     | 4          | 0        | 4       | 50%         |
| **UX/UI**                | 14    | 7          | 0        | 7       | 50%         |
| **Performance**          | 4     | 0          | 0        | 4       | 0%          |
| **Accessibilité**        | 3     | 0          | 0        | 3       | 0%          |
| **Collaboratif**         | 4     | 2          | 0        | 2       | 50%         |
| **Infrastructure**       | 9     | 2          | 0        | 7       | 22%         |
| **Monitoring/Analytics** | 7     | 0          | 0        | 7       | 0%          |
| **Testing/CI/CD**        | 4     | 0          | 0        | 4       | 0%          |
| **Open Source**          | 4     | 4          | 0        | 0       | 100%        |

### Temps estimé

| Phase       | Durée estimée | Temps passé | Temps restant |
| ----------- | ------------- | ----------- | ------------- |
| **Phase 1** | 1-2 mois      | ~2 jours    | ~1 mois       |
| **Phase 2** | 2-3 mois      | 0           | 2-3 mois      |
| **Phase 3** | 3-4 mois      | 0           | 3-4 mois      |
| **Phase 4** | Ongoing       | 0           | Ongoing       |

---

## 🎯 Recommandations Prioritaires

### Immédiat (1-2 semaines)

1. ✅ **Compléter Phase 1** (73% complété)
   - ✅ Restreindre CORS aux domaines autorisés (`server-production.js`)
   - ⏳ Configurer Husky (pre-commit hooks)
   - ⏳ Créer GitHub Actions (test + build)

2. ✅ **Phase 2 - UX** (50% complété)
   - ✅ Undo/Redo (historique des actions)
   - ✅ Copier/Coller des calques
   - ✅ Templates d'émissions prédéfinis
   - ✅ Galerie de projets
   - ✅ Toast notifications
   - ✅ Toolbar Contextuelle
   - ✅ Contrôles avancés (logos, photos)

### Court terme (1-2 mois)

3. ⏳ **Phase 2 - Performance**
   - Code splitting (React.lazy)
   - Lazy loading des polices
   - Optimisation des images (WebP, compression)
   - Cache des générations IA

4. ⏳ **Phase 2 - Accessibilité**
   - ARIA labels sur tous les contrôles
   - Navigation clavier complète
   - Texte alt sur images générées

### Moyen terme (3-6 mois)

5. ✅ **Phase 3 - Export Avancé** (100% complété)
   - ✅ Batch export (générer tous les formats en une fois)
   - ✅ Templates d'export
   - ✅ Export SVG vectoriel
   - ✅ Export transparent PNG

6. ✅ **Phase 3 - Collaboratif** (50% complété)
   - ✅ Stockage distant (Supabase)
   - ✅ Partage de projets (lien public)
   - ⏳ Multi-utilisateur temps réel (WebSocket)

7. ✅ **Phase 3 - IA Avancée** (50% complété)
   - ⏳ Génération de variantes (4 versions simultanées)
   - ✅ Inpainting (modifier une zone)
   - ✅ Upscale (augmenter la résolution)
   - ⏳ Prompt templates (suggestions)
   - ⏳ Historique des générations IA

### Long terme (6-12 mois)

8. ✅ **Phase 4 - Infrastructure** (22% complété)
   - ✅ Docker multi-stage build
   - ✅ Publication Open Source (AGPL v3)
   - ⏳ Kubernetes (si scalabilité nécessaire)
   - ⏳ CDN pour les assets générés
   - ⏳ Backup automatique

9. ⏳ **Phase 4 - Observabilité**
   - Distributed tracing (OpenTelemetry)
   - Performance monitoring (APM)
   - Error tracking avancé
   - Alerting (Discord/Email)

10. ⏳ **Phase 4 - Analytics**

- Dashboard d'usage
- Heatmaps (comportement utilisateur)
- A/B testing
- Feature flags

---

## 📚 Ressources

### Sécurité

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

### Performance

- [Web Vitals](https://web.dev/vitals/)
- [React.lazy()](https://react.dev/reference/react/lazy)
- [Code Splitting](https://react.dev/learn/start-a-new-react-project#code-splitting)

### IA / Machine Learning

- [HuggingFace Inference API](https://huggingface.co/docs/api-inference/index)
- [Diffusers Documentation](https://huggingface.co/docs/diffusers/index)
- [FLUX.1-schnell Model](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- [SDXL Turbo Model](https://huggingface.co/stabilityai/sdxl-turbo)

### Infrastructure

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS S3](https://aws.amazon.com/s3/)
- [CloudFlare CDN](https://developers.cloudflare.com/)

### Monitoring

- [Sentry](https://sentry.io/)
- [New Relic](https://newrelic.com/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)

---

## 🏆 Succès

Critères de succès pour chaque phase :

### Phase 1 ✅

- [x] 0 dépendances via CDN (Tailwind, html-to-image)
- [x] Validation des uploads (taille, types)
- [x] Protection XSS (DOMPurify)
- [x] 5 modèles IA intégrés
- [x] CORS restreint
- [ ] Tests configurés
- [ ] CI/CD configuré

### Phase 2

- [x] Undo/Redo fonctionnel
- [x] Templates disponibles
- [x] Copier/Coller des calques
- [x] Galerie de projets
- [x] Toast notifications
- [x] Toolbar Contextuelle
- [x] Contrôles avancés (logos, photos)
- [ ] Code splitting
- [ ] Accessibilité WCAG 2.1 AA

### Phase 3

- [x] Batch export fonctionnel
- [x] Stockage distant (Supabase)
- [x] Partage de projets (lien public)
- [x] Export SVG vectoriel
- [x] Export transparent PNG
- [x] Presets d'export
- [x] Inpainting
- [x] Upscale
- [x] RSS automation (import métadonnées)
- [ ] Collaboration en temps réel
- [ ] IA avancée (variantes, prompt templates)

### Phase 4

- [x] Docker build fonctionnel (multi-stage)
- [x] Publication Open Source effectuée
- [ ] Kubernetes déployé
- [ ] Monitoring en place
- [ ] Analytics opérationnels

---

**Dernière mise à jour** : 25 février 2026  
**Dernière révision** : 25 février 2026  
**Prochaine révision** : Après stabilisation de la release open source.
