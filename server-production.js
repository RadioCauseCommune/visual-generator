/**
 * Serveur de production pour Cause Commune Visual Generator
 * 
 * Ce serveur sert les fichiers statiques buildés et proxy les requêtes API
 * vers HuggingFace avec authentification sécurisée.
 * 
 * Installation:
 *   npm install express dotenv cors helmet express-rate-limit
 * 
 * Variables d'environnement requises (.env):
 *   - HUGGINGFACE_TOKEN: Token d'API HuggingFace
 *   - SUPABASE_URL: URL complète du projet Supabase (optionnel, ex: https://xxx.supabase.co)
 *   - ALLOWED_ORIGINS: Origines CORS autorisées (séparées par des virgules)
 *   - PORT: Port du serveur (défaut: 3000)
 *   - HOST: Host du serveur (défaut: 0.0.0.0)
 * 
 * Utilisation:
 *   1. Build l'application: npm run build
 *   2. Lancer le serveur: node server-production.js
 */

import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
config();
config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Faire confiance au proxy (Nginx/Cloudflare/etc.) pour X-Forwarded-For
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ========================================
// MIDDLEWARE DE SÉCURITÉ
// ========================================

// Configuration CSP avec variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseDomains = supabaseUrl
  ? [supabaseUrl, `https://*.supabase.co`]
  : [`https://*.supabase.co`];

// Helmet pour les headers de sécurité de base
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Nécessaire pour Tailwind CDN
        "https://cdn.tailwindcss.com",
        "https://cdnjs.cloudflare.com",
        "https://esm.sh"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:", // Autoriser toutes les images HTTPS externes
        "https://www.transparenttextures.com",
        "http://your-internal-ip:8000"
      ],
      connectSrc: [
        "'self'",
        "data:", // Autoriser les data URIs pour fetch (nécessaire pour Img2Img)
        "https://router.huggingface.co",
        "http://your-internal-ip:8000",
        ...supabaseDomains
      ],
    },
  },
}));

// CORS configuré avec origines autorisées
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (comme les apps mobiles ou curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
}));

// Parser JSON
// Parser JSON - Augmenté pour supporter les images base64 larges
app.use(express.json({ limit: '50mb' }));

// Rate limiting sur l'API HuggingFace
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requêtes max par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ========================================
// ROUTES API
// ========================================

// Proxy HuggingFace avec authentification sécurisée
app.post('/api/huggingface/models/:modelId(*)', apiLimiter, async (req, res) => {
  try {
    const token = process.env.HUGGINGFACE_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: 'Configuration serveur incorrecte: HUGGINGFACE_TOKEN manquant'
      });
    }

    const modelId = req.params.modelId;
    const targetUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;

    // Reformater le payload
    let payload = req.body;
    if (!payload.inputs || typeof payload.inputs === 'string') {
      const prompt = payload.inputs || payload.prompt;
      payload = {
        inputs: {
          prompt: prompt,
          negative_prompt: payload.negative_prompt || "text, typography, letters, words, writing, signs, labels, text overlay, text elements, readable text, visible text, text on image",
          width: payload.width || 1400,
          height: payload.height || 1400,
          num_inference_steps: payload.num_inference_steps || 4,
          guidance_scale: payload.guidance_scale || 3.5
        }
      };
    }

    // Timeout de 15 minutes pour la génération d'images HuggingFace
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000); // 15 minutes

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || 'application/json';
      const buffer = await response.arrayBuffer();

      res.status(response.status)
        .set('Content-Type', contentType)
        .set('Access-Control-Allow-Origin', '*')
        .send(Buffer.from(buffer));
    } finally {
      // S'assurer que le timeout est toujours nettoyé
      clearTimeout(timeoutId);
    }

  } catch (error) {
    console.error('Erreur API HuggingFace:', error);

    // Gestion spécifique des timeouts
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Timeout: La génération d\'image a pris trop de temps (plus de 15 minutes). Veuillez réessayer avec des paramètres moins complexes.'
      });
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Proxy Replicate avec authentification sécurisée
app.all('/api/replicate/:path(*)', apiLimiter, async (req, res) => {
  try {
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: 'Configuration serveur incorrecte: REPLICATE_API_TOKEN manquant'
      });
    }

    const path = req.params.path;
    const targetUrl = `https://api.replicate.com/v1/${path}`;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      ...(req.method === 'POST' ? { body: JSON.stringify(req.body) } : {})
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const data = await response.text();

    res.status(response.status)
      .set('Content-Type', contentType)
      .set('Access-Control-Allow-Origin', '*')
      .send(data);

  } catch (error) {
    console.error('Erreur API Replicate:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Proxy Flux Local (Workstation LAN)
app.all('/api/flux-local/*', apiLimiter, async (req, res) => {
  try {
    const localUrl = process.env.VITE_LOCAL_FLUX_URL;
    if (!localUrl) {
      return res.status(500).json({
        error: 'Configuration serveur incorrecte: VITE_LOCAL_FLUX_URL manquant'
      });
    }

    // Le path dans l'URL de la requête inclut /api/flux-local/, on doit extraire le reste
    // Utiliser req.path au lieu de req.params[0] car le wildcard n'est pas capturé automatiquement
    const path = req.path || req.url || '';
    const targetPath = path.replace('/api/flux-local', '') || '';
    // Nettoyer les slashes en double
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    const targetUrl = `${localUrl}${cleanPath}`;

    // Timeout généreux pour le flux local (Workstation LAN peut être lent ou chargé)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes

    try {
      // Préparer le body pour les requêtes POST
      let requestBody = null;
      if (req.method === 'POST' && req.body) {
        requestBody = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(requestBody ? { body: requestBody } : {}),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Gérer les erreurs HTTP
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erreur inconnue');
        console.error(`Erreur API Flux Local (${response.status}):`, errorText);
        return res.status(response.status).json({
          error: `Erreur API Flux Local: ${response.statusText}`,
          details: errorText
        });
      }

      const contentType = response.headers.get('content-type') || 'application/json';

      if (contentType.includes('image')) {
        const buffer = await response.arrayBuffer();
        res.status(response.status)
          .set('Content-Type', contentType)
          .set('Access-Control-Allow-Origin', '*')
          .send(Buffer.from(buffer));
      } else {
        const data = await response.text();
        res.status(response.status)
          .set('Content-Type', contentType)
          .set('Access-Control-Allow-Origin', '*')
          .send(data);
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Gestion spécifique des timeouts
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Timeout API Flux Local:', targetUrl);
        return res.status(504).json({
          error: 'Timeout: La requête vers FLUX.1 a pris trop de temps (plus de 10 minutes).'
        });
      }

      console.error('Erreur API Flux Local:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  } catch (error) {
    console.error('Erreur API Flux Local:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Proxy générique (RSS, WP API, etc.)
app.get('/api/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).send('Missing url parameter');
    }

    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || 'application/json';

    res.status(response.status)
      .set('Content-Type', contentType)
      .set('Access-Control-Allow-Origin', '*');

    if (contentType.includes('image')) {
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    console.error('Erreur Proxy:', error);
    res.status(500).send(error instanceof Error ? error.message : 'Proxy Error');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// ========================================
// SERVIR LES FICHIERS STATIQUES
// ========================================

// Servir les fichiers buildés depuis /dist
app.use(express.static(path.join(__dirname, 'dist')));

// Toutes les autres routes renvoient index.html (pour le routing SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ========================================
// GESTION DES ERREURS
// ========================================

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('🚀 Serveur Cause Commune Visual Generator démarré');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Adresse:     http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS:        ${allowedOrigins.join(', ')}`);
  console.log(`🤖 HuggingFace: ${process.env.HUGGINGFACE_TOKEN ? '✓ Configuré' : '✗ Non configuré'}`);
  console.log(`🔑 Supabase:    ${supabaseUrl ? `✓ ${supabaseUrl}` : '⚠️  Utilisation du wildcard *.supabase.co'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// Gestion des arrêts gracieux
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, arrêt gracieux...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, arrêt gracieux...');
  process.exit(0);
});

