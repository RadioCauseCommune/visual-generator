import { CarouselProject } from './types';

export const PRESET_CAROUSELS: CarouselProject[] = [
  {
    id: 'carousel-economie',
    title: "L'Économie d'une radio libre & Le FSER",
    defaultFooterMedia: 'Radio Cause Commune 93.1 FM',
    slides: [
      {
        id: 'c1-s1',
        layout: 'cover',
        theme: 'vanilla',
        badgeText: 'TIERS-SECTEUR • NON MARCHAND',
        badgeColor: 'red',
        coverTitle: '60 000 € DE BUDGET.\n0 € DE PUB.\n0 SALARIÉ.',
        coverHighlight: '0 € DE PUB.',
        coverSubtitle: 'Comment fait-on tourner une radio FM à Paris en 2026 ?',
        coverDescription: "Plongée dans nos comptes certifiés et le modèle d'une antenne 100% autogérée.",
        footerText: 'Swipe ➔ 1/6'
      },
      {
        id: 'c1-s2',
        layout: 'stats',
        theme: 'white',
        badgeText: 'COMPTES CERTIFIÉS 2025-2026',
        badgeColor: 'yellow',
        statsTitle: '4 chiffres pour comprendre notre réalité :',
        stats: [
          { id: 'st-1', number: '60 k€', label: 'Budget Réel', sub: 'Loyer, fibre, diffusion, serveurs.', style: 'white' },
          { id: 'st-2', number: '31 k€', label: 'Subvention FSER', sub: 'Unique ressource publique.', style: 'accent' },
          { id: 'st-3', number: '19,8 k€', label: 'Coût Diffusion FM', sub: 'Frais incompressibles 93.1 FM.', style: 'white' },
          { id: 'st-4', number: '0 €', label: 'Masse Salariale', sub: '100% autogestion bénévole.', style: 'dark' }
        ],
        footerText: 'Modèle frugal & transparent • 2/6'
      },
      {
        id: 'c1-s3',
        layout: 'bullets',
        theme: 'dark',
        badgeText: 'ALERTE DÉMOCRATIQUE',
        badgeColor: 'green',
        bulletsTitle: 'Le FSER en danger de mort',
        leadText: "Le Fonds de Soutien à l’Expression Radiophonique garantit le pluralisme local depuis 1982.",
        bullets: [
          "Des menaces régulières de coupes budgétaires (-44% dans le projet PLF 2026) mettent en péril la survie des radios associatives face aux conglomérats privés.",
          "Une mobilisation nationale sans précédent du tiers-secteur pour sanctuariser ce financement d'intérêt général."
        ],
        footerText: 'Défendre le tiers-secteur • 3/6'
      },
      {
        id: 'c1-s4',
        layout: 'bullets',
        theme: 'vanilla',
        badgeText: 'LE GRAND DÉCALAGE',
        badgeColor: 'white',
        bulletsTitle: "Exigences de 1982, moyens d'aujourd'hui",
        bullets: [
          "Ce qu'on nous demande : éducation aux médias, ateliers dans les quartiers, intégration sociale, formation technique.",
          "Ce qu'on nous donne : des budgets publics gelés et des charges de diffusion en hausse.",
          "Notre réponse : une solidarité horizontale entre producteurs bénévoles pour continuer à faire école sans compromis."
        ],
        footerText: 'cause-commune.fm • 4/6'
      },
      {
        id: 'c1-s5',
        layout: 'badges',
        theme: 'white',
        badgeText: 'ZÉRO PUBLICITÉ',
        badgeColor: 'red',
        badgesTitle: 'Un choix politique radical',
        badgeItems: [
          { id: 'b1', badge: 'ZÉRO', badgeColor: 'red', text: 'Pas de spots pour des SUV ou des crédits entre deux débats sur le climat.' },
          { id: 'b2', badge: 'ZÉRO', badgeColor: 'red', text: "Pas de sponsors ni d'actionnaires pour nous dicter nos invités." },
          { id: 'b3', badge: '100%', badgeColor: 'dark', text: "Notre antenne appartient exclusivement à celles et ceux qui la font et qui l'écoutent." }
        ],
        footerText: 'Indépendance absolue • 5/6'
      },
      {
        id: 'c1-s6',
        layout: 'cta',
        theme: 'vanilla',
        badgeText: 'APPEL À ACTION',
        badgeColor: 'green',
        ctaTitle: 'Rejoignez la Cause Commune.',
        ctaDescription: 'Écoutez, lisez nos bilans, soutenez financièrement ou rejoignez la grille des programmes.',
        ctaButtonText: 'cause-commune.fm',
        ctaButtonColor: 'red',
        badgeItems: [
          { id: 'cta-b1', badge: '93.1 FM', badgeColor: 'red', text: 'Écouter : En direct à Paris & en DAB+' },
          { id: 'cta-b2', badge: 'RAPPORT', badgeColor: 'yellow', text: "Lire : Bilan d'activité 2025-2026 en libre accès" },
          { id: 'cta-b3', badge: 'SOUTIEN', badgeColor: 'green', text: "Donner : Dons déductibles d'impôt à 66%" },
          { id: 'cta-b4', badge: 'ANTENNE', badgeColor: 'dark', text: 'Participer : Proposer une émission bénévole' }
        ],
        footerText: 'Association Libre à Toi • 6/6'
      }
    ]
  },
  {
    id: 'carousel-tech',
    title: 'Souveraineté technique & IA Libre',
    defaultFooterMedia: 'Radio Cause Commune 93.1 FM',
    slides: [
      {
        id: 'c2-s1',
        layout: 'cover',
        theme: 'vanilla',
        badgeText: 'SOUVERAINETÉ • OPEN SOURCE',
        badgeColor: 'red',
        coverTitle: 'POURQUOI NOTRE RADIO REFUSE LES GAFAM',
        coverHighlight: 'LES GAFAM',
        coverSubtitle: 'Et transcrit ses directs avec sa propre IA locale et éthique.',
        coverDescription: 'Découvrez notre infrastructure technique 100% libre et auto-hébergée à Paris.',
        footerText: 'Swipe ➔ 1/6'
      },
      {
        id: 'c2-s2',
        layout: 'bullets',
        theme: 'white',
        badgeText: 'LE CONSTAT',
        badgeColor: 'white',
        bulletsTitle: 'Le cloud propriétaire : un piège politique',
        leadText: 'Sous-traiter nos flux et archives à des multinationales étrangères :',
        bullets: [
          'Menace la confidentialité des sources journalistiques et des débats.',
          'Enferme les médias indépendants dans des abonnements ruineux.',
          'Alimente des modèles prédateurs au détriment des biens communs.'
        ],
        footerText: 'Refuser la dépendance • 2/6'
      },
      {
        id: 'c2-s3',
        layout: 'bullets',
        theme: 'dark',
        badgeText: 'IA LOCALE & OPEN SOURCE',
        badgeColor: 'green',
        bulletsTitle: 'Voxtral + WhisperV3 + Diarisation Pyannote',
        leadText: 'Notre pipeline de transcription maison :',
        bullets: [
          'Flux audio capté par le bridge BUTT AES67.',
          'Transcription temps réel par le modèle Voxtral.',
          'En post-production : reconnaissance et séparation des voix par Pyannote.',
          '100% exécuté en local : zéro donnée envoyée aux serveurs de la Silicon Valley.'
        ],
        footerText: 'Confidentialité garantie • 3/6'
      },
      {
        id: 'c2-s4',
        layout: 'bullets',
        theme: 'vanilla',
        badgeText: 'OUTILS PRODUCTEURS',
        badgeColor: 'yellow',
        bulletsTitle: 'Des outils simples pour nos bénévoles',
        bullets: [
          'Radio Upload (DropZone) : Dépôt direct d’émissions dans le navigateur sans FTP complexe.',
          'DropFX (StereoTool) : Normalisation audio automatique conforme aux normes broadcast.',
          'RTMP Multistream : Plateaux direct en WebTV continue et diffusion simultanée PeerTube.'
        ],
        footerText: 'Autonomie technique • 4/6'
      },
      {
        id: 'c2-s5',
        layout: 'bullets',
        theme: 'white',
        badgeText: 'VIE PRIVÉE',
        badgeColor: 'red',
        bulletsTitle: "Mesure d'audience certifiée IAB v2",
        leadText: 'Mesurer notre audience sans jamais espionner nos auditeurs :',
        bullets: [
          'Zéro cookie commercial ou pixel tiers.',
          'Conformité stricte à la norme internationale IAB v2.',
          'Respect absolu du RGPD et de l’anonymat de l’écoute.'
        ],
        footerText: 'Éthique numérique • 5/6'
      },
      {
        id: 'c2-s6',
        layout: 'cta',
        theme: 'vanilla',
        badgeText: 'COMMUNS NUMÉRIQUES',
        badgeColor: 'green',
        ctaTitle: 'La tech est un bien commun.',
        ctaDescription: 'Tous nos outils, générateurs visuels et architectures logicielles sont publiés en accès libre pour le monde associatif.',
        ctaButtonText: 'github.com/RadioCauseCommune',
        ctaButtonColor: 'green',
        footerText: 'cause-commune.fm • 6/6'
      }
    ]
  },
  {
    id: 'carousel-terrain',
    title: 'L’Antenne Hors-Les-Murs & Studio B PMR',
    defaultFooterMedia: 'Radio Cause Commune 93.1 FM',
    slides: [
      {
        id: 'c3-s1',
        layout: 'cover',
        theme: 'vanilla',
        badgeText: 'RADIO NOMADE • ÎLE-DE-FRANCE',
        badgeColor: 'yellow',
        coverTitle: 'QUAND LA RADIO SORT DU STUDIO POUR PRENDRE LA RUE',
        coverHighlight: 'PRENDRE LA RUE',
        coverSubtitle: "Plateaux nomades, luttes sociales et notre grand projet d'inclusion 2027.",
        coverDescription: 'Présence de terrain, couverture des mobilisations et accès citoyen.',
        footerText: 'Swipe ➔ 1/6'
      },
      {
        id: 'c3-s2',
        layout: 'bullets',
        theme: 'white',
        badgeText: 'Chapiteau Anti Fachos 2026',
        badgeColor: 'red',
        bulletsTitle: 'Enquête sur le système Stérin',
        leadText: 'Au Cirque électrique, Paris 19 :',
        bullets: [
          'Sur le projet PÉRICLÈS & financement d’extrême-droite.',
          'Trois tables rondes : décryptages, débats et solutions d’action populaire.'
        ],
        footerText: 'Archives sur cause-commune.fm • 2/6'
      },
      {
        id: 'c3-s3',
        layout: 'bullets',
        theme: 'white',
        badgeText: 'COMBATS SYNDICAUX',
        badgeColor: 'white',
        bulletsTitle: 'Cultures en Luttes Antifascistes',
        leadText: 'Rencontres avec la CNT-SO, Sud Culture et Book Bloc :',
        bullets: [
          'Débats publics et infokiosques radiophoniques.',
          'Parole aux éditeurs critiques, syndicalistes et artistes engagés.',
          'Faire de la radio un outil d’émancipation collective.'
        ],
        footerText: 'Résistance collective • 3/6'
      },
      {
        id: 'c3-s4',
        layout: 'bullets',
        theme: 'vanilla',
        badgeText: 'LEÇON DES COMMUNS',
        badgeColor: 'yellow',
        bulletsTitle: 'Équiper ne suffit pas : la gouvernance d’abord',
        leadText: 'Après avoir équipé un studio radio coopératif dans un tiers-lieu parisien :',
        bullets: [
          'Nous avons vu sa gouvernance dériver vers une privatisation de son usage.',
          'Notre leçon : Sans gouvernance démocratique garantie, les équipements partagés risquent toujours d’être privatisés.'
        ],
        footerText: 'Clarté & Cohérence • 4/6'
      },
      {
        id: 'c3-s5',
        layout: 'bullets',
        theme: 'dark',
        badgeText: 'OBJECTIF 2026-2027',
        badgeColor: 'red',
        bulletsTitle: 'Studio B : Le plateau PMR',
        leadText: 'Un second plateau de plain-pied au 22 rue Bernard Dimey (Paris 18ᵉ) :',
        bullets: [
          '100% accessible aux personnes à mobilité réduite.',
          'Espace de formation populaire et citoyenne.',
          'Espace d’ateliers pour la formation et l’expérimentation.',
          'Budget : 40 000 € • Campagne citoyenne à venir !'
        ],
        footerText: 'Inclusion universelle • 5/6'
      },
      {
        id: 'c3-s6',
        layout: 'cta',
        theme: 'vanilla',
        badgeText: 'DONNEZ DE LA VOIX',
        badgeColor: 'green',
        ctaTitle: 'La Cause Commune a besoin de vous.',
        ctaDescription: 'Écoutez, rejoignez l’association Libre à Toi, et faites entendre vos voix.',
        ctaButtonText: 'cause-commune.fm',
        ctaButtonColor: 'red',
        badgeItems: [
          { id: 'c3-b1', badge: '93.1 FM', badgeColor: 'red', text: 'Écouter : À Paris et en DAB+ régional' },
          { id: 'c3-b2', badge: 'ADHÉSION', badgeColor: 'green', text: "Rejoindre : L'association Libre à Toi" },
          { id: 'c3-b3', badge: 'ANTENNE', badgeColor: 'dark', text: 'Participer : Proposer une émission' }
        ],
        footerText: '93.1 FM Paris • 6/6'
      }
    ]
  }
];

export const createEmptySlide = (index: number, total: number): CarouselSlide => ({
  id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  layout: 'cover',
  theme: 'vanilla',
  badgeText: 'RADIO LIBRE',
  badgeColor: 'red',
  coverTitle: 'NOUVEAU TITRE CHOC',
  coverSubtitle: 'Un sous-titre clair et percutant',
  coverDescription: 'Description détaillée pour poser le contexte.',
  footerText: `Swipe ➔ ${index}/${total}`
});
