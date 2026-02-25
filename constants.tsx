
import React from 'react';

export const COLORS = {
  RED: '#D20A33',
  BLACK: '#0f0f0f',
  WHITE: '#FFFFFF',
  CREAM: '#FFFAE5',
  ACID_GREEN: '#A3FF00',
  VIOLET: '#9D00FF',
  BLUE: '#0047FF',
  RED_DARK: '#A00828',
  RED_LIGHT: '#FFE5EB',
  YELLOW: '#fefe09',
};

export const FONTS = [
  'Syne',
  'Roboto Condensed',
  'Anton',
  'Archivo Black',
  'Space Grotesk',
  'Lexend Zetta',
  'Bungee',
  'Ultra',
  'Permanent Marker',
  'Special Elite',
  'Rock Salt',
  'UnifrakturMaguntia',
  'VT323'
];

export const DIMENSIONS: Record<string, { w: number; h: number }> = {
  // Instagram
  'Instagram Post Carré (1080x1080)': { w: 1080, h: 1080 },
  'Instagram Post Portrait (1080x1350)': { w: 1080, h: 1350 },
  'Instagram Post Paysage (1080x566)': { w: 1080, h: 566 },
  'Instagram Story/Reel (1080x1920)': { w: 1080, h: 1920 },

  // Facebook
  'Facebook Post (1200x630)': { w: 1200, h: 630 },
  'Facebook Post Carré (1080x1080)': { w: 1080, h: 1080 },
  'Facebook Story (1080x1920)': { w: 1080, h: 1920 },
  'Facebook Couverture (820x312)': { w: 820, h: 312 },

  // Twitter / X
  'X/Twitter Post (1200x675)': { w: 1200, h: 675 },
  'X/Twitter Carré (1200x1200)': { w: 1200, h: 1200 },
  'X/Twitter Bannière (1500x500)': { w: 1500, h: 500 },

  // LinkedIn
  'LinkedIn Post (1200x627)': { w: 1200, h: 627 },
  'LinkedIn Bannière (1584x396)': { w: 1584, h: 396 },

  // YouTube
  'YouTube Miniature (1280x720)': { w: 1280, h: 720 },
  'YouTube Bannière (2048x1152)': { w: 2048, h: 1152 },

  // TikTok
  'TikTok (1080x1920)': { w: 1080, h: 1920 },

  // Pinterest
  'Pinterest Standard (1000x1500)': { w: 1000, h: 1500 },
  'Pinterest Carré (1000x1000)': { w: 1000, h: 1000 },

  // Podcast & Web
  'Podcast Cover (3000x3000)': { w: 3000, h: 3000 },
  'OG Image / Web (1200x630)': { w: 1200, h: 630 },

  // Formats Génériques
  'Format Carré 1080 (1080x1080)': { w: 1080, h: 1080 },
  'Format Vertical 9:16 (1080x1920)': { w: 1080, h: 1920 },
  'Format Horizontal 16:9 (1920x1080)': { w: 1920, h: 1080 }
};

// Logos disponibles dans le répertoire public
export const LOGOS = {
  'nb': '/logo-cc-V3-nb-defonce.png', // Noir et blanc (pour header)
  'green': '/logo-cc-V3-green-defonce.png',
  'orange': '/logo-cc-V3-orange-defonce.png',
  'purple': '/logo-cc-V3-purple-defonce.png',
  'red': '/logo-cc-V3-red-defonce.png',
};

export const LOGO_OPTIONS = [
  { value: 'nb', label: 'Noir et Blanc', path: LOGOS.nb },
  { value: 'green', label: 'Vert', path: LOGOS.green },
  { value: 'orange', label: 'Orange', path: LOGOS.orange },
  { value: 'purple', label: 'Violet', path: LOGOS.purple },
  { value: 'red', label: 'Rouge', path: LOGOS.red },
];

// Logo par défaut pour le header
export const HEADER_LOGO = LOGOS.nb;

export const SOCIAL_ICONS = [
  {
    id: 'x',
    label: 'X (Twitter)',
    path: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTguMjQ0IDIuMjVoMy4zMDhsLTcuMjI3IDguMjYgOC41MDIgMTEuMjRIMTYuMTdsLTUuMjE0LTYuODE3TDQuOTkgMjEuNzVIMS42OGw3LjczLTguODM1TDEuMjU0IDIuMjVIOC4wOGw0LjcxMyA2LjIzMXptLTEuMTYxIDE3LjUyaDEuODMzTDcuMDg0IDQuMTI2SDUuMTE3eiIvPjwvc3ZnPg=='
  },
  {
    id: 'twitch',
    label: 'Twitch',
    path: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuNTcxIDQuNzE0aDEuNzE1djUuMTQzSDExLjU3em00LjcxNSAwSDE4djUuMTQzaC0xLjcxNHpNNiAwTDEuNzE0IDQuMjg2djE1LjQyOGg1LjE0M1YyNGw0LjI4Ni00LjI4NmgzLjQyOEwyMi4yODYgMTJWMHptMTQuNTcxIDExLjE0M2wtMy40MjggMy40MjhoLTMuNDI5bC0zIDN2LTNINi44NTdWMS43MTRoMTMuNzE0WiIvPjwvc3ZnPg=='
  },
  {
    id: 'peertube',
    label: 'PeerTube',
    path: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMEM1LjM3MyAwIDAgNS4zNzMgMCAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMnMtNS4zNzMtMTItMTItMTJ6bS0yIDE3LjV2LTExbDggNS41LTggNS41eiIvPjwvc3ZnPg=='
  },
  {
    id: 'youtube',
    label: 'YouTube',
    path: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjMuNDk4IDYuMTg2YTMuMDE2IDMuMDE2IDAgMCAwLTIuMTIyLTIuMTM2QzE5LjUwNSAzLjU0NSAxMiAzLjU0NSAxMiAzLjU0NXMtNy41MDUgMC05LjM3Ny41MDVBMy4wMTcgMy4wMTcgMCAwIDAgLjUwMiA2LjE4NkMwIDguMDcgMCAxMiAwIDEyczAgMy45My41MDIgNS44MTRhMy4wMTYgMy4wMTYgMCAwIDAgMi4xMjIgMi4xMzZjMS44NzEuNTA1IDkuMzc2LjUwNSA5LjM3Ni41MDVzNy41MDUgMCA5LjM3Ny0uNTA1YTMuMDE1IDMuMDE1IDAgMCAwIDIuMTIyLTIuMTM2QzI0IDE1LjkzIDI0IDEyIDI0IDEyczAtMy45My0uNTAyLTUuODE0ek05LjU0NSAxNS41NjhWOC40MzJMMTUuODE4IDEybC02LjI3MyAzLjU2OHoiLz48L3N2Zz4='
  },
  {
    id: 'facebook',
    label: 'Facebook',
    path: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9ImN1cnJlbnRDb2xvciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjQgMTIuMDczYzAtNi42MjctNS4zNzMtMTItMTItMTJzLTEyIDUuMzczLTEyIDEyYzAgNS45OSA0LjM4OCAxMC45NTQgMTAuMTI1IDExLjg1NHYtOC4zODVINy4wNzh2LTMuNDdoMy4wNDdWOS40M2MwLTMuMDA3IDEuNzkyLTQuNjY5IDQuNTMzLTQuNjY5IDEuMzEyIDAgMi42ODYuMjM1IDIuNjg2LjIzNXYyLjk1M0gxNS44M2MtMS40OTEgMC0xLjk1Ni45MjUtMS45NTYgMS44NzR2Mi4yNWgzLjMyOGwtLjUzMiAzLjQ3aC0yLjc5NnY4LjM4NUMxOS42MTIgMjMuMDI3IDI0IDE4LjA2MiAyNCAxMi4wNzN6Ii8+PC9zdmc+'
  }
];
