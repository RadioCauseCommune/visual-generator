import React, { useState } from 'react';

type SectionId =
  | 'intro'
  | 'demarrage'
  | 'interface'
  | 'rss'
  | 'templates'
  | 'format'
  | 'texte'
  | 'ia'
  | 'visuels'
  | 'logos'
  | 'edition'
  | 'export'
  | 'publication'
  | 'voeux'
  | 'raccourcis'
  | 'astuces';

interface Section {
  id: SectionId;
  label: string;
  color: string;
}

const SECTIONS: Section[] = [
  { id: 'intro', label: 'Introduction', color: '#D20A33' },
  { id: 'demarrage', label: 'Démarrage rapide', color: '#A3FF00' },
  { id: 'interface', label: 'L\'interface', color: '#00F0FF' },
  { id: 'rss', label: 'Import RSS', color: '#9D00FF' },
  { id: 'templates', label: 'Templates', color: '#0047FF' },
  { id: 'format', label: 'Format de sortie', color: '#D20A33' },
  { id: 'texte', label: 'Contenu texte', color: '#A3FF00' },
  { id: 'ia', label: 'Génération IA', color: '#00F0FF' },
  { id: 'visuels', label: 'Visuels & fonds', color: '#9D00FF' },
  { id: 'logos', label: 'Logos & réseaux', color: '#0047FF' },
  { id: 'edition', label: 'Édition fine', color: '#D20A33' },
  { id: 'export', label: 'Export & projets', color: '#A3FF00' },
  { id: 'publication', label: 'Publication sociale', color: '#00F0FF' },
  { id: 'voeux', label: 'Onglet Vœux', color: '#9D00FF' },
  { id: 'raccourcis', label: 'Raccourcis', color: '#0047FF' },
  { id: 'astuces', label: 'Astuces', color: '#D20A33' },
];

const Step: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div className="flex gap-4">
    <div className="shrink-0 w-10 h-10 bg-black text-white neo-border-fine flex items-center justify-center font-syne font-black text-lg">
      {n}
    </div>
    <div className="flex-1">
      <h4 className="font-syne font-black uppercase text-sm mb-1">{title}</h4>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  </div>
);

const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-[#A3FF00] neo-border-fine p-3 text-sm font-bold">
    <span className="font-black uppercase text-[10px] block mb-1">💡 Astuce</span>
    {children}
  </div>
);

const Warn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-[#FFFAE5] neo-border-fine p-3 text-sm">
    <span className="font-black uppercase text-[10px] block mb-1 text-[#D20A33]">⚠️ Attention</span>
    {children}
  </div>
);

const Manuel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('intro');

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`manuel-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Table des matières */}
      <nav className="w-56 shrink-0 bg-white neo-border border-t-0 border-b-0 border-l-0 overflow-y-auto p-3 space-y-1">
        <p className="font-syne font-black uppercase text-xs mb-3 px-2 underline decoration-[#D20A33] decoration-4">
          Sommaire
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`w-full text-left px-3 py-2 font-roboto-condensed font-bold uppercase text-[11px] transition-all neo-active ${
              activeSection === s.id
                ? 'bg-black text-white neo-border-fine'
                : 'hover:bg-[#FFFAE5] text-black'
            }`}
          >
            <span
              className="inline-block w-2 h-2 mr-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        ))}
      </nav>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto p-8 space-y-12 max-w-4xl mx-auto">
        {/* Introduction */}
        <section id="manuel-intro">
          <h2 className="font-syne font-black text-3xl uppercase mb-4">
            Manuel d'utilisation
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            Bienvenue dans le <strong>Studio Cause Commune</strong>, l'outil de création de visuels
            pour la communication de Radio Cause Commune. Ce guide vous accompagne pas à pas pour
            produire des visuels professionnels pour vos émissions, sans formation préalable.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '27 formats', desc: 'Instagram, Facebook, X, LinkedIn, YouTube, TikTok, Podcast…', color: '#A3FF00' },
              { label: 'IA intégrée', desc: 'Génération FLUX Local + upscale Real-ESRGAN (×4)', color: '#00F0FF' },
              { label: 'Export multi', desc: 'PNG, WebP, SVG et packs sociaux en un clic', color: '#9D00FF' },
            ].map((card) => (
              <div key={card.label} className="neo-border-fine p-4 neo-shadow-sm" style={{ backgroundColor: card.color }}>
                <p className="font-syne font-black uppercase text-sm">{card.label}</p>
                <p className="text-xs mt-1 font-bold">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Démarrage rapide */}
        <section id="manuel-demarrage" className="space-y-6">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#A3FF00] decoration-4">
            Démarrage rapide — Créer un visuel en 6 étapes
          </h2>
          <p className="text-sm text-gray-700">
            Voici le parcours type pour produire un visuel d'émission. Chaque étape correspond à une
            section numérotée dans le panneau de gauche (onglet <strong>Studio</strong>).
          </p>
          <div className="space-y-5">
            <Step n={1} title="Choisir le format de sortie">
              Sélectionnez le format adapté à la plateforme cible (ex. <em>Instagram Post Carré 1080×1080</em>).
              Cochez <em>Fond Transparent (PNG)</em> si vous avez besoin d'un fond sans arrière-plan.
            </Step>
            <Step n={2} title="Renseigner le contenu texte">
              Saisissez le <strong>titre</strong> et le <strong>sous-titre</strong> de l'émission — ils
              apparaissent automatiquement sur le canevas. Ajoutez optionnellement l'invité, la date ou
              des champs extra via le bouton <strong>+</strong>.
            </Step>
            <Step n={3} title="Générer ou importer un visuel de fond">
              Avec le modèle <strong>FLUX.1 (Local)</strong> sélectionné, décrivez l'ambiance souhaitée
              (ex. « studio de radio futuriste ») puis cliquez <strong>Créer l'image</strong>.
              Si le résultat vous convient, upscaler l'image en Ultra-HD (×4) depuis le panneau
              <strong> Réglages</strong>. Vous pouvez aussi importer une photo via
              <strong> Changer le Fond</strong> ou utiliser l'import RSS (voir section dédiée).
            </Step>
            <Step n={4} title="Ajouter logos et éléments visuels">
              Placez le logo Radio Cause Commune, des photos d'invités, un fond dégradé ou des icônes
              de plateformes selon vos besoins.
            </Step>
            <Step n={5} title="Ajuster la mise en page">
              Cliquez sur un élément du canevas pour le déplacer, le redimensionner ou modifier ses
              propriétés dans le panneau <strong>Réglages</strong> (à droite).
            </Step>
            <Step n={6} title="Exporter ou publier">
              Menu <strong>Exporter</strong> → PNG, WebP, SVG ou Pack Social. Sauvegardez votre projet
              via <strong>Projet → Sauvegarder</strong> pour le retrouver plus tard.
            </Step>
          </div>
          <Tip>
            Pour gagner du temps, commencez par l'<strong>import RSS</strong> : titre, sous-titre, date
            et image de couverture sont remplis automatiquement depuis le flux podcast.
          </Tip>
        </section>

        {/* Interface */}
        <section id="manuel-interface" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#00F0FF] decoration-4">
            L'interface
          </h2>
          <p className="text-sm leading-relaxed">
            L'onglet <strong>Studio</strong> est organisé en trois colonnes :
          </p>
          <div className="space-y-3">
            <div className="neo-border-fine p-4 bg-white">
              <p className="font-black uppercase text-xs mb-1">Panneau gauche — Workflow</p>
              <p className="text-sm">Les 6 sections numérotées pour construire votre visuel, plus l'import RSS et les templates en haut.</p>
            </div>
            <div className="neo-border-fine p-4 bg-[#FFFAE5]">
              <p className="font-black uppercase text-xs mb-1">Centre — Canevas</p>
              <p className="text-sm">Prévisualisation en temps réel. Cliquez pour sélectionner, glissez pour déplacer, tirez les poignées pour redimensionner.</p>
            </div>
            <div className="neo-border-fine p-4 bg-white">
              <p className="font-black uppercase text-xs mb-1">Panneau droit — Réglages</p>
              <p className="text-sm">Propriétés du calque sélectionné : police, couleurs, effet Scratch, ordre des calques, retouche IA…</p>
            </div>
          </div>
          <p className="text-sm">
            La barre rouge en haut donne accès aux onglets (<strong>Studio</strong>, <strong>Vœux</strong>,
            <strong> Manuel</strong>), à l'historique (↺ ↻), et aux menus <strong>Projet</strong> et <strong>Exporter</strong>.
          </p>
        </section>

        {/* RSS */}
        <section id="manuel-rss" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#9D00FF] decoration-4">
            Import RSS — Podcast Autopilot
          </h2>
          <p className="text-sm leading-relaxed">
            En haut du panneau gauche, la section <strong>Podcast RSS Autopilot</strong> permet
            d'importer automatiquement les métadonnées d'un épisode Cause Commune.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Recherchez une émission dans la liste déroulante, ou collez un lien RSS direct.</li>
            <li>Sélectionnez l'épisode souhaité dans la liste des épisodes récents.</li>
            <li>Cliquez <strong>Importer</strong> — le titre, sous-titre et la date sont remplis.</li>
            <li>Si l'épisode a une image de couverture, vous pouvez l'utiliser comme fond du visuel.</li>
          </ol>
          <Tip>
            L'import RSS est le moyen le plus rapide de créer un visuel pour une émission déjà publiée
            sur causecommune.fm.
          </Tip>
        </section>

        {/* Templates */}
        <section id="manuel-templates" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#0047FF] decoration-4">
            Templates
          </h2>
          <p className="text-sm leading-relaxed">
            Quatre mises en page prédéfinies sont disponibles juste sous l'import RSS :
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Standard', desc: 'Mise en page classique titre + sous-titre' },
              { name: 'Interview', desc: 'Mise en avant de l\'invité avec photo' },
              { name: 'Débat / Table Ronde', desc: 'Format multi-intervenants' },
              { name: 'Chronique', desc: 'Style éditorial pour les chroniques' },
            ].map((t) => (
              <div key={t.name} className="neo-border-fine p-3 bg-white">
                <p className="font-syne font-black uppercase text-xs">{t.name}</p>
                <p className="text-[11px] mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
          <Warn>
            L'application d'un template <strong>remplace tous les calques existants</strong>.
            Une confirmation vous est demandée avant l'application.
          </Warn>
        </section>

        {/* Format */}
        <section id="manuel-format" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#D20A33] decoration-4">
            Format de sortie
          </h2>
          <p className="text-sm leading-relaxed">
            <strong>27 formats</strong> couvrent les principales plateformes. Quelques exemples :
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Instagram</strong> — Post carré, Story, Reel vertical</li>
            <li><strong>Facebook</strong> — Couverture, post, événement</li>
            <li><strong>X / Twitter</strong> — Post et header</li>
            <li><strong>LinkedIn</strong> — Post et bannière</li>
            <li><strong>YouTube</strong> — Miniature et bannière chaîne</li>
            <li><strong>Podcast</strong> — Cover 3000×3000</li>
            <li><strong>Générique</strong> — Formats 16:9, 9:16, carré…</li>
          </ul>
          <p className="text-sm">
            L'option <strong>Fond Transparent (PNG)</strong> supprime l'arrière-plan du canevas à
            l'export — utile pour des overlays ou des visuels superposables.
          </p>
          <Tip>
            Utilisez le <strong>Pack Social (Batch)</strong> (menu Exporter) pour générer plusieurs
            formats d'un coup : Essentiels Radio, Pack Instagram, Pack Facebook, Pack X/Twitter.
          </Tip>
        </section>

        {/* Texte */}
        <section id="manuel-texte" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#A3FF00] decoration-4">
            Contenu texte
          </h2>
          <p className="text-sm leading-relaxed">
            Le <strong>titre</strong> et le <strong>sous-titre</strong> sont obligatoires et se
            synchronisent en direct avec les calques texte du canevas.
          </p>
          <p className="text-sm leading-relaxed">
            Les champs optionnels (invité, date, extra 1 & 2) fonctionnent différemment : saisissez
            le texte, puis cliquez le bouton <strong>+</strong> pour l'ajouter comme calque indépendant
            sur le canevas. Le champ se vide ensuite, prêt pour un nouvel ajout.
          </p>
          <p className="text-sm">
            Une fois sur le canevas, modifiez le texte, la police, la taille et les couleurs dans le
            panneau <strong>Réglages</strong>.
          </p>
        </section>

        {/* IA */}
        <section id="manuel-ia" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#00F0FF] decoration-4">
            Génération IA
          </h2>
          <p className="text-sm leading-relaxed">
            La section <strong>3. IA — Génération</strong> crée des images de fond à partir d'une
            description textuelle (prompt). L'outil s'appuie sur l'infrastructure locale de
            Radio Cause Commune — privilégiez toujours le modèle <strong>FLUX.1 (Local)</strong>.
          </p>

          <div className="neo-border-fine p-4 bg-[#00F0FF] neo-shadow-sm">
            <p className="font-syne font-black uppercase text-sm mb-1">Modèle recommandé : FLUX.1 (Local)</p>
            <p className="text-sm">
              C'est le modèle <strong>par défaut</strong> et le seul garanti en production.
              Il tourne sur la workstation interne (haute qualité, jusqu'à 2048×2048 px).
              D'autres modèles apparaissent dans la liste (FLUX Schnell, SDXL…), mais ils
              ne sont <strong>pas forcément disponibles</strong> — en cas d'erreur, restez sur FLUX Local.
            </p>
          </div>

          <h3 className="font-syne font-black uppercase text-sm">Créer une image</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Vérifiez que <strong>FLUX.1 (Local)</strong> est sélectionné dans le menu Modèle IA.</li>
            <li>Choisissez un <strong>style visuel</strong> : Studio Radio, Cinématique, Collage Punk, Minimaliste, Vintage 70s, Néon/Cyber…</li>
            <li>Décrivez l'image souhaitée en français ou en anglais.</li>
            <li>Cliquez <strong>Créer l'image</strong> — l'image générée s'ajoute au canevas.</li>
          </ol>

          <p className="text-sm font-bold uppercase text-[10px]">Paramètres avancés FLUX Local (optionnel)</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Étapes</strong> — Plus de steps = plus de détails, mais plus lent (4 par défaut)</li>
            <li><strong>Guidance</strong> — Fidélité au prompt (7–12 recommandé)</li>
            <li><strong>Taille</strong> — Dimensions en pixels (multiples de 64, max 2048)</li>
            <li><strong>Seed</strong> — Pour reproduire exactement la même image</li>
            <li><strong>No Text</strong> — Cochez pour éviter le texte parasite dans l'image générée</li>
            <li><strong>Performance Mode</strong> — <em>Balanced</em> (qualité) ou <em>Fast</em> (plus rapide)</li>
          </ul>

          <h3 className="font-syne font-black uppercase text-sm mt-4">Upscale Ultra-HD — Real-ESRGAN (×4)</h3>
          <p className="text-sm leading-relaxed">
            Une fois une image générée ou importée, vous pouvez la passer en <strong>haute définition</strong>
            grâce à <strong>Real-ESRGAN</strong>, un modèle de super-résolution qui multiplie la
            résolution par <strong>4</strong> tout en restaurant les détails. C'est l'un des outils
            les plus fiables de l'application.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Sélectionnez un calque image sur le canevas (fond, photo invité, image IA…).</li>
            <li>Dans le panneau <strong>Réglages</strong> (à droite), cliquez
              <strong> Upscaler en Ultra-HD (×4)</strong>.</li>
            <li>Patientez quelques instants — l'image est remplacée par sa version haute résolution.</li>
          </ol>
          <Tip>
            <strong>Workflow conseillé :</strong> générez d'abord une image en taille modeste
            (ex. 1024×1024) pour itérer rapidement, puis upscaler le résultat final une fois
            satisfait. Gain de temps considérable !
          </Tip>

          <h3 className="font-syne font-black uppercase text-sm mt-4">Varier une image (image-to-image)</h3>
          <p className="text-sm leading-relaxed">
            Sélectionnez une image sur le canevas et utilisez le bouton <strong>Varier</strong> dans
            la barre d'outils flottante. Décrivez les modifications souhaitées — l'outil repart de
            l'image existante via FLUX Local pour en produire une variante.
          </p>
        </section>

        {/* Visuels */}
        <section id="manuel-visuels" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#9D00FF] decoration-4">
            Visuels, fond & composition multi-images
          </h2>
          <p className="text-sm leading-relaxed">La section <strong>4. Visuels & Fond</strong> propose :</p>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li><strong>Changer Fond (1 ou plusieurs)</strong> — Téléverser une ou plusieurs images simultanément (JPG, PNG, WebP…) pour créer automatiquement une composition (mosaïque, split vertical/horizontal, grille 2x2) selon le format de réseau social sélectionné.</li>
            <li><strong>➕ Ajouter Image</strong> — Ajouter une ou plusieurs images supplémentaires à la composition de fond existante.</li>
            <li><strong>Mises en page & Grilles</strong> — Choisir parmi plusieurs agencements adaptés au format (2 colonnes, 2 lignes, 1+2, 2x2, bandes) et régler la gouttière (espacement entre images).</li>
            <li><strong>Gestionnaire de vignettes</strong> — Permuter l'ordre des images (← / →), remplacer une case spécifique (🔄) ou retirer une image (✕).</li>
            <li><strong>Ajouter Fond Gradient</strong> — Dégradé rouge-violet par défaut, personnalisable dans les Réglages.</li>
            <li><strong>+ Ajouter Photo Invité</strong> — Photo portrait, masquable en cercle ou carré via les Réglages.</li>
          </ul>
          <p className="text-sm">
            Chaque image d'une composition est un calque autonome que vous pouvez sélectionner pour ajuster son cadrage intérieur (pan horizontal/vertical, zoom), son filtre de couleur ou appliquer des retouches IA (Inpainting).
          </p>
        </section>

        {/* Logos */}
        <section id="manuel-logos" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#0047FF] decoration-4">
            Logos & réseaux sociaux
          </h2>
          <p className="text-sm leading-relaxed">
            <strong>Section 5 — Logos</strong> : cinq variantes du logo Radio Cause Commune
            (Noir & Blanc, Vert, Orange, Violet, Rouge) en un clic. Vous pouvez aussi importer un
            logo partenaire.
          </p>
          <p className="text-sm leading-relaxed">
            <strong>Section 6 — Réseaux Sociaux</strong> : icônes X, Twitch, PeerTube, YouTube et
            Facebook à placer sur le visuel (utile pour indiquer où écouter/regarder l'émission).
          </p>
          <p className="text-sm">
            Tous les logos et icônes sont déplaçables et redimensionnables comme n'importe quel calque.
          </p>
        </section>

        {/* Édition */}
        <section id="manuel-edition" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#D20A33] decoration-4">
            Édition fine
          </h2>

          <h3 className="font-syne font-black uppercase text-sm">Sur le canevas</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Clic</strong> — Sélectionner un calque</li>
            <li><strong>Glisser</strong> — Déplacer</li>
            <li><strong>Poignées</strong> — Redimensionner</li>
            <li><strong>Barre flottante</strong> — Varier (IA), Dupliquer, Supprimer</li>
          </ul>

          <h3 className="font-syne font-black uppercase text-sm mt-4">Panneau Réglages (texte)</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Police, taille, contenu du texte</li>
            <li>Effet <strong>Scratch</strong> — texture typographique signature Cause Commune</li>
            <li>Couleur de fond, couleur du texte, rotation</li>
            <li>Ordre des calques (avant / arrière)</li>
          </ul>

          <h3 className="font-syne font-black uppercase text-sm mt-4">Outils image avancés</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Upscale Real-ESRGAN (×4)</strong> — Bouton jaune dans Réglages ; multiplie la résolution par 4 avec restauration des détails. Voir section Génération IA.</li>
            <li><strong>Inpainting</strong> — Retoucher une zone précise d'une image par IA (masque dessiné à la souris)</li>
            <li><strong>Masque circulaire</strong> — Pour les photos d'invités</li>
            <li><strong>Overlay</strong> — Superposer une couleur semi-transparente sur une image</li>
          </ul>
        </section>

        {/* Export */}
        <section id="manuel-export" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#A3FF00] decoration-4">
            Export & gestion des projets
          </h2>

          <h3 className="font-syne font-black uppercase text-sm">Exporter une image</h3>
          <p className="text-sm">Menu <strong>Exporter</strong> (barre rouge) :</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>PNG (HQ Asset)</strong> — Haute qualité, format standard</li>
            <li><strong>WebP (Opti Web)</strong> — Fichier léger pour le web</li>
            <li><strong>SVG (Vecteur)</strong> — Pour les éléments vectoriels</li>
            <li><strong>Pack Social (Batch)</strong> — ZIP avec plusieurs formats prédéfinis</li>
          </ul>

          <h3 className="font-syne font-black uppercase text-sm mt-4">Sauvegarder & charger</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Projet → Sauvegarder</strong> — Sauvegarde locale (navigateur) ou cloud si connecté</li>
            <li><strong>Projet → Mes Projets</strong> — Galerie de tous vos projets sauvegardés</li>
            <li><strong>Local : Exporter / Importer JSON</strong> — Partager un projet par fichier</li>
            <li><strong>SE CONNECTER (Cloud)</strong> — Compte Supabase pour synchroniser entre appareils</li>
          </ul>
          <Tip>
            Votre brouillon est <strong>sauvegardé automatiquement</strong> dans le navigateur.
            En cas de fermeture accidentelle, rouvrez l'application : votre travail devrait être restauré.
          </Tip>
        </section>

        {/* Publication */}
        <section id="manuel-publication" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#00F0FF] decoration-4">
            Publication sociale
          </h2>
          <p className="text-sm leading-relaxed">
            Pour les formats <strong>Instagram</strong> et <strong>LinkedIn</strong>, un panneau de
            publication apparaît en bas du panneau gauche.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Connectez votre compte via le panneau de publication.</li>
            <li>Rédigez la légende et ajoutez des hashtags.</li>
            <li>Cliquez <strong>Publier</strong> — le visuel est envoyé directement sur la plateforme.</li>
          </ol>
          <p className="text-sm">
            L'<strong>historique des publications</strong> récentes est affiché sous le panneau.
            La <strong>Modération Instagram</strong> (menu Projet) permet de gérer les commentaires
            des derniers posts.
          </p>
        </section>

        {/* Vœux */}
        <section id="manuel-voeux" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#9D00FF] decoration-4">
            Onglet Vœux
          </h2>
          <p className="text-sm leading-relaxed">
            L'onglet <strong>Vœux</strong> (barre rouge) est un outil séparé pour créer des cartes
            de vœux au format Cause Commune.
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Importez une image de fond</li>
            <li>Personnalisez le texte logo <code>[ libre @ toi ]</code>, le hashtag et le pied de page</li>
            <li>Choisissez la disposition (texte à gauche ou à droite)</li>
            <li>Téléchargez l'image en PNG haute résolution</li>
          </ul>
        </section>

        {/* Raccourcis */}
        <section id="manuel-raccourcis" className="space-y-4">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#0047FF] decoration-4">
            Raccourcis clavier
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'Ctrl + Z', action: 'Annuler la dernière action' },
              { key: 'Ctrl + Y', action: 'Rétablir' },
              { key: 'Ctrl + Shift + Z', action: 'Rétablir (alternative)' },
              { key: 'Ctrl + C', action: 'Copier le calque sélectionné' },
              { key: 'Ctrl + V', action: 'Coller le calque' },
            ].map((r) => (
              <div key={r.key} className="neo-border-fine p-3 bg-white flex items-center gap-3">
                <kbd className="bg-black text-white px-2 py-1 font-mono text-xs font-bold shrink-0">{r.key}</kbd>
                <span className="text-sm">{r.action}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Les boutons ↺ et ↻ dans la barre rouge offrent la même fonction d'annulation/rétablissement
            (jusqu'à 50 actions).
          </p>
        </section>

        {/* Astuces */}
        <section id="manuel-astuces" className="space-y-4 pb-16">
          <h2 className="font-syne font-black text-2xl uppercase underline decoration-[#D20A33] decoration-4">
            Astuces & bonnes pratiques
          </h2>
          <div className="space-y-3">
            <Tip>
              <strong>Workflow recommandé :</strong> RSS → Template → Format → Ajuster textes →
              Génération FLUX Local → Upscale Real-ESRGAN → Logos → Export Batch.
            </Tip>
            <Tip>
              <strong>Prompts IA efficaces :</strong> décrivez l'ambiance, les couleurs et le sujet.
              Cochez <strong>No Text</strong> pour éviter les caractères parasites. Exemple :
              « fond abstrait rouge et violet, style radio underground ».
            </Tip>
            <Tip>
              <strong>Itération rapide :</strong> générez en 1024 px, ajustez le prompt ou utilisez
              <strong> Varier</strong>, puis upscaler uniquement la version retenue.
            </Tip>
            <Tip>
              <strong>Partage de projet :</strong> exportez en JSON (menu Projet) et envoyez le fichier
              à un collègue qui pourra l'importer et reprendre le travail.
            </Tip>
            <Warn>
              L'application d'un <strong>template</strong> ou le changement de <strong>format</strong>
              peut réorganiser les calques. Sauvegardez avant une modification majeure.
            </Warn>
          </div>
          <div className="neo-border neo-shadow p-6 bg-[#D20A33] text-white mt-6">
            <p className="font-syne font-black uppercase text-lg">Besoin d'aide ?</p>
            <p className="text-sm mt-2">
              Pour toute question ou suggestion d'amélioration, contactez l'équipe technique de
              Radio Cause Commune. Ce manuel sera enrichi au fil des retours utilisateurs.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Manuel;
