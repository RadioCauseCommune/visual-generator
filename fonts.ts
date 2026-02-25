/**
 * Import des polices locales via @fontsource
 * Ces polices sont hébergées localement dans node_modules
 * et seront incluses dans le bundle, résolvant les problèmes d'export PNG
 */

// Syne - Police principale pour les titres (700, 800 seulement - pas de 900)
import '@fontsource/syne/700.css';
import '@fontsource/syne/800.css';

// Roboto Condensed - Police pour les sous-titres (700, 800, 900)
import '@fontsource/roboto-condensed/700.css';
import '@fontsource/roboto-condensed/800.css';
import '@fontsource/roboto-condensed/900.css';

// Anton (400)
import '@fontsource/anton/400.css';

// Archivo Black (400)
import '@fontsource/archivo-black/400.css';

// Space Grotesk (700)
import '@fontsource/space-grotesk/700.css';

// Lexend Zetta (900)
import '@fontsource/lexend-zetta/900.css';

// Bungee (400)
import '@fontsource/bungee/400.css';

// Ultra (400)
import '@fontsource/ultra/400.css';

// Permanent Marker (400)
import '@fontsource/permanent-marker/400.css';

// Special Elite (400)
import '@fontsource/special-elite/400.css';

// Rock Salt (400)
import '@fontsource/rock-salt/400.css';

// UnifrakturMaguntia (400)
import '@fontsource/unifrakturmaguntia/400.css';

// VT323 (400)
import '@fontsource/vt323/400.css';

console.log('✅ Toutes les polices locales sont chargées');

