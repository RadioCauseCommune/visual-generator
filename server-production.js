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
import crypto from 'crypto';

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
// ROUTES PUBLICATION SOCIALE
// ========================================

// Helpers chiffrement tokens OAuth (AES-256-GCM)
function encryptToken(plaintext) {
  const key = Buffer.from(process.env.SOCIAL_TOKEN_ENCRYPTION_KEY || '', 'hex');
  if (key.length !== 32) throw new Error('SOCIAL_TOKEN_ENCRYPTION_KEY doit être une clé hex de 64 caractères (32 bytes)');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptToken(ciphertext) {
  const key = Buffer.from(process.env.SOCIAL_TOKEN_ENCRYPTION_KEY || '', 'hex');
  const [ivHex, tagHex, dataHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf8');
}

// Store PKCE state en mémoire (TTL 10 min) — en production, utiliser Redis ou Supabase
const oauthStateStore = new Map();
function cleanExpiredStates() {
  const now = Date.now();
  for (const [k, v] of oauthStateStore.entries()) {
    if (now > v.expiresAt) oauthStateStore.delete(k);
  }
}

// ── Lister les comptes sociaux connectés ──────────────────────────────────────
app.get('/api/social/accounts', apiLimiter, async (req, res) => {
  try {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    if (!supabaseServiceKey || !supabaseUrl) {
      return res.status(500).json({ error: 'Configuration Supabase manquante' });
    }

    // Récupérer l'utilisateur depuis le token Bearer passé par le client
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    const userToken = authHeader.replace('Bearer ', '');

    // Vérifier le token utilisateur via Supabase Auth
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${userToken}`, 'apikey': supabaseServiceKey }
    });
    if (!authRes.ok) return res.status(401).json({ error: 'Token invalide' });
    const { id: userId } = await authRes.json();

    // Lire les comptes depuis social_tokens (comptes de l'user + comptes par défaut)
    const dbRes = await fetch(
      `${supabaseUrl}/rest/v1/social_tokens?or=(user_id.eq.${userId},is_default.eq.true)&select=id,platform,account_id,account_name,is_default,token_expires_at`,
      { headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'apikey': supabaseServiceKey } }
    );
    const accounts = await dbRes.json();
    res.json({ accounts: accounts || [] });
  } catch (error) {
    console.error('Erreur social/accounts:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ── Initier le flow OAuth Instagram ──────────────────────────────────────────
app.post('/api/social/instagram/oauth/initiate', apiLimiter, async (req, res) => {
  try {
    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI;
    if (!appId || !redirectUri) {
      return res.status(500).json({ error: 'META_APP_ID ou META_OAUTH_REDIRECT_URI manquant' });
    }

    // Générer un state PKCE anti-CSRF
    const state = crypto.randomBytes(16).toString('hex');
    cleanExpiredStates();
    oauthStateStore.set(state, { expiresAt: Date.now() + 10 * 60 * 1000 });

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list',
      response_type: 'code',
      state,
    });

    res.json({ authUrl: `https://www.facebook.com/v19.0/dialog/oauth?${params}`, state });
  } catch (error) {
    console.error('Erreur OAuth initiate:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ── Callback OAuth Instagram ──────────────────────────────────────────────────
app.get('/api/social/instagram/oauth/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`/?social_error=${encodeURIComponent(oauthError)}`);
    }

    // Valider le state PKCE
    if (!state || !oauthStateStore.has(state)) {
      return res.status(400).send('State OAuth invalide ou expiré');
    }
    oauthStateStore.delete(state);

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

    if (!appId || !appSecret || !redirectUri || !supabaseServiceKey || !supabaseUrl) {
      return res.status(500).send('Configuration serveur incomplète');
    }

    // Échanger le code contre un short-lived token
    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.status(400).send(`Erreur Meta: ${tokenData.error.message}`);

    // Échanger contre un long-lived token (60 jours)
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const longTokenData = await longTokenRes.json();
    if (longTokenData.error) return res.status(400).send(`Erreur token long-lived: ${longTokenData.error.message}`);

    const longToken = longTokenData.access_token;
    const expiresIn = longTokenData.expires_in || 5184000; // 60 jours par défaut

    // Récupérer les Pages Facebook et les comptes Instagram liés
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=${longToken}`);
    const pagesData = await pagesRes.json();

    const igAccounts = (pagesData.data || [])
      .filter(p => p.instagram_business_account)
      .map(p => ({ accountId: p.instagram_business_account.id, accountName: p.name }));

    if (igAccounts.length === 0) {
      return res.redirect('/?social_error=no_instagram_account');
    }

    // Stocker le token chiffré pour chaque compte Instagram trouvé
    // Note: on utilise l'user_id depuis un cookie de session si disponible
    // (Dans une implémentation complète, passer l'user_id via le state OAuth)
    const encryptedToken = encryptToken(longToken);
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    for (const ig of igAccounts) {
      await fetch(`${supabaseUrl}/rest/v1/social_tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          account_id: ig.accountId,
          account_name: ig.accountName,
          platform: 'instagram',
          access_token: encryptedToken,
          token_expires_at: tokenExpiresAt,
          is_default: false,
        }),
      });
    }

    res.redirect('/?social_connected=instagram');
  } catch (error) {
    console.error('Erreur OAuth callback:', error);
    res.redirect(`/?social_error=${encodeURIComponent(error instanceof Error ? error.message : 'Erreur inconnue')}`);
  }
});

// ── Upload image vers Supabase Storage ────────────────────────────────────────
app.post('/api/social/instagram/upload-image', apiLimiter, async (req, res) => {
  try {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    if (!supabaseServiceKey || !supabaseUrl) {
      return res.status(500).json({ error: 'Configuration Supabase manquante' });
    }

    const { imageBase64, projectId } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 requis' });

    // Décoder le base64 (peut être "data:image/png;base64,..." ou juste le base64)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const filename = `${projectId || 'export'}_${Date.now()}.png`;
    const storagePath = `${filename}`;

    // Upload vers Supabase Storage (bucket publish-temp)
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/publish-temp/${storagePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      },
      body: imageBuffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return res.status(500).json({ error: `Upload Supabase échoué: ${err}` });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/publish-temp/${storagePath}`;
    res.json({ publicUrl, storagePath });
  } catch (error) {
    console.error('Erreur upload image:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ── Publier sur Instagram ─────────────────────────────────────────────────────
app.post('/api/social/instagram/publish', apiLimiter, async (req, res) => {
  try {
    const { imageUrl, caption, accountId, storagePath } = req.body;
    if (!imageUrl || !caption === undefined) {
      return res.status(400).json({ error: 'imageUrl requis' });
    }

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

    // Déterminer quel token utiliser
    let accessToken;
    let igAccountId = accountId;

    if (!accountId || accountId === 'default') {
      // Utiliser le compte par défaut Radio Cause Commune
      accessToken = process.env.META_DEFAULT_ACCESS_TOKEN;
      igAccountId = process.env.META_DEFAULT_INSTAGRAM_ACCOUNT_ID;
      if (!accessToken || !igAccountId) {
        return res.status(500).json({ error: 'Compte Instagram par défaut non configuré' });
      }
    } else {
      // Récupérer le token chiffré depuis Supabase
      const tokenRes = await fetch(
        `${supabaseUrl}/rest/v1/social_tokens?account_id=eq.${accountId}&platform=eq.instagram&select=access_token,token_expires_at`,
        { headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'apikey': supabaseServiceKey } }
      );
      const tokens = await tokenRes.json();
      if (!tokens?.length) return res.status(404).json({ error: 'Compte Instagram non trouvé' });

      // Vérifier l'expiration
      const tokenRecord = tokens[0];
      if (tokenRecord.token_expires_at && new Date(tokenRecord.token_expires_at) < new Date()) {
        return res.status(401).json({ error: 'Token Instagram expiré, veuillez reconnecter votre compte' });
      }

      accessToken = decryptToken(tokenRecord.access_token);
    }

    // Étape 1 : Créer un media container Instagram
    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption || '',
        access_token: accessToken,
      }),
    });
    const containerData = await containerRes.json();
    if (containerData.error) {
      return res.status(400).json({ error: `Meta API: ${containerData.error.message}` });
    }

    const containerId = containerData.id;

    // Étape 2 : Publier le container
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    });
    const publishData = await publishRes.json();
    if (publishData.error) {
      return res.status(400).json({ error: `Meta API publish: ${publishData.error.message}` });
    }

    const postId = publishData.id;
    const postUrl = `https://www.instagram.com/p/${postId}/`;

    // Nettoyage de l'image temporaire Supabase Storage
    if (storagePath && supabaseServiceKey && supabaseUrl) {
      fetch(`${supabaseUrl}/storage/v1/object/publish-temp/${storagePath}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'apikey': supabaseServiceKey },
      }).catch(err => console.warn('Cleanup storage échoué:', err));
    }

    res.json({ success: true, postId, postUrl });
  } catch (error) {
    console.error('Erreur publication Instagram:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ── Sauvegarder l'historique de publication ───────────────────────────────────
app.post('/api/social/publications', apiLimiter, async (req, res) => {
  try {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    if (!supabaseServiceKey || !supabaseUrl) {
      return res.status(500).json({ error: 'Configuration Supabase manquante' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    const userToken = authHeader.replace('Bearer ', '');

    // Vérifier le token utilisateur
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${userToken}`, 'apikey': supabaseServiceKey }
    });
    if (!authRes.ok) return res.status(401).json({ error: 'Token invalide' });
    const { id: userId } = await authRes.json();

    const { platform, account_id, account_name, caption, image_url, platform_post_id, post_url, status, error_message, project_id } = req.body;

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/publications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        project_id: project_id || null,
        platform,
        account_id,
        account_name,
        caption,
        image_url,
        platform_post_id,
        post_url,
        status: status || 'published',
        error_message: error_message || null,
        published_at: status === 'published' ? new Date().toISOString() : null,
      }),
    });

    const publication = await insertRes.json();
    res.status(201).json(publication);
  } catch (error) {
    console.error('Erreur sauvegarde publication:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ── Lire l'historique des publications ───────────────────────────────────────
app.get('/api/social/publications', apiLimiter, async (req, res) => {
  try {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    if (!supabaseServiceKey || !supabaseUrl) {
      return res.status(500).json({ error: 'Configuration Supabase manquante' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    const userToken = authHeader.replace('Bearer ', '');

    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${userToken}`, 'apikey': supabaseServiceKey }
    });
    if (!authRes.ok) return res.status(401).json({ error: 'Token invalide' });
    const { id: userId } = await authRes.json();

    const dbRes = await fetch(
      `${supabaseUrl}/rest/v1/publications?user_id=eq.${userId}&order=created_at.desc&limit=20`,
      { headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'apikey': supabaseServiceKey } }
    );
    const publications = await dbRes.json();
    res.json({ publications: publications || [] });
  } catch (error) {
    console.error('Erreur lecture publications:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ── Rafraîchir un token Instagram long-lived ──────────────────────────────────
app.post('/api/social/token/refresh', apiLimiter, async (req, res) => {
  try {
    const { accountId, platform } = req.body;
    if (!accountId || platform !== 'instagram') {
      return res.status(400).json({ error: 'accountId et platform=instagram requis' });
    }

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    if (!supabaseServiceKey || !supabaseUrl || !appId || !appSecret) {
      return res.status(500).json({ error: 'Configuration incomplète' });
    }

    // Récupérer le token actuel
    const tokenRes = await fetch(
      `${supabaseUrl}/rest/v1/social_tokens?account_id=eq.${accountId}&platform=eq.instagram`,
      { headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'apikey': supabaseServiceKey } }
    );
    const tokens = await tokenRes.json();
    if (!tokens?.length) return res.status(404).json({ error: 'Token non trouvé' });

    const currentToken = decryptToken(tokens[0].access_token);

    // Refresh du long-lived token Instagram
    const refreshRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`
    );
    const refreshData = await refreshRes.json();
    if (refreshData.error) {
      return res.status(400).json({ error: `Meta refresh: ${refreshData.error.message}` });
    }

    const newToken = refreshData.access_token;
    const expiresIn = refreshData.expires_in || 5184000;
    const encryptedToken = encryptToken(newToken);
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Mettre à jour en base
    await fetch(
      `${supabaseUrl}/rest/v1/social_tokens?account_id=eq.${accountId}&platform=eq.instagram`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: encryptedToken, token_expires_at: tokenExpiresAt, updated_at: new Date().toISOString() }),
      }
    );

    res.json({ success: true, expiresAt: tokenExpiresAt });
  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ========================================
// ROUTES PUBLICATION LINKEDIN
// ========================================

// Helper : récupérer et valider l'userId depuis un Bearer token Supabase
async function getSupabaseUserId(authHeader, supabaseUrl, supabaseServiceKey) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const userToken = authHeader.replace('Bearer ', '');
  const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${userToken}`, 'apikey': supabaseServiceKey }
  });
  if (!authRes.ok) return null;
  const { id } = await authRes.json();
  return id || null;
}

// ── Initier le flow OAuth LinkedIn ───────────────────────────────────────────
app.post('/api/social/linkedin/oauth/initiate', apiLimiter, async (req, res) => {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      return res.status(500).json({ error: 'LINKEDIN_CLIENT_ID ou LINKEDIN_OAUTH_REDIRECT_URI manquant' });
    }

    const state = crypto.randomBytes(16).toString('hex');
    cleanExpiredStates();
    oauthStateStore.set(state, { expiresAt: Date.now() + 10 * 60 * 1000 });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: 'openid profile w_member_social',
    });

    res.json({ authUrl: `https://www.linkedin.com/oauth/v2/authorization?${params}`, state });
  } catch (error) {
    console.error('Erreur OAuth LinkedIn initiate:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// ── Callback OAuth LinkedIn ──────────────────────────────────────────────────
app.get('/api/social/linkedin/oauth/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`/?social_error=${encodeURIComponent(oauthError)}`);
    }

    if (!state || !oauthStateStore.has(state)) {
      return res.status(400).send('State OAuth invalide ou expiré');
    }
    oauthStateStore.delete(state);

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

    if (!clientId || !clientSecret || !redirectUri || !supabaseServiceKey || !supabaseUrl) {
      return res.status(500).send('Configuration serveur incomplète');
    }

    // Échanger le code contre un access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.status(400).send(`Erreur LinkedIn: ${tokenData.error_description}`);

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 5184000; // ~60 jours

    // Récupérer le profil LinkedIn (sub = LinkedIn member URN)
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    const linkedinId = profile.sub; // format: "xxxxxxxx"
    const accountName = profile.name || profile.given_name || linkedinId;

    if (!linkedinId) return res.status(400).send('Impossible de récupérer le profil LinkedIn');

    const encryptedToken = encryptToken(accessToken);
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Stocker le token (upsert)
    await fetch(`${supabaseUrl}/rest/v1/social_tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        account_id: linkedinId,
        account_name: accountName,
        platform: 'linkedin',
        access_token: encryptedToken,
        token_expires_at: tokenExpiresAt,
        is_default: false,
      }),
    });

    res.redirect('/?social_connected=linkedin');
  } catch (error) {
    console.error('Erreur OAuth LinkedIn callback:', error);
    res.redirect(`/?social_error=${encodeURIComponent(error instanceof Error ? error.message : 'Erreur inconnue')}`);
  }
});

// ── Publier sur LinkedIn ──────────────────────────────────────────────────────
app.post('/api/social/linkedin/publish', apiLimiter, async (req, res) => {
  try {
    const { imageBase64, caption, accountId } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 requis' });

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

    // Récupérer le token LinkedIn
    let accessToken;
    let authorUrn;

    if (!accountId || accountId === 'default') {
      return res.status(400).json({ error: 'LinkedIn requiert un compte connecté — pas de compte par défaut disponible' });
    }

    if (!supabaseServiceKey || !supabaseUrl) {
      return res.status(500).json({ error: 'Configuration Supabase manquante' });
    }

    const tokenRes = await fetch(
      `${supabaseUrl}/rest/v1/social_tokens?account_id=eq.${accountId}&platform=eq.linkedin&select=access_token,token_expires_at`,
      { headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'apikey': supabaseServiceKey } }
    );
    const tokens = await tokenRes.json();
    if (!tokens?.length) return res.status(404).json({ error: 'Compte LinkedIn non trouvé' });

    const tokenRecord = tokens[0];
    if (tokenRecord.token_expires_at && new Date(tokenRecord.token_expires_at) < new Date()) {
      return res.status(401).json({ error: 'Token LinkedIn expiré, veuillez reconnecter votre compte' });
    }

    accessToken = decryptToken(tokenRecord.access_token);
    authorUrn = `urn:li:person:${accountId}`;

    // Décoder l'image base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Étape 1 : Enregistrer l'upload (obtenir une URL d'upload + asset URN)
    const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          }],
        },
      }),
    });

    const registerData = await registerRes.json();
    if (!registerRes.ok) {
      return res.status(400).json({ error: `LinkedIn register upload: ${JSON.stringify(registerData)}` });
    }

    const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
    const assetUrn = registerData.value?.asset;

    if (!uploadUrl || !assetUrn) {
      return res.status(500).json({ error: 'LinkedIn: uploadUrl ou assetUrn manquant dans la réponse' });
    }

    // Étape 2 : Uploader le binaire de l'image
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/png',
      },
      body: imageBuffer,
    });

    if (!uploadRes.ok) {
      return res.status(500).json({ error: `LinkedIn upload image: ${uploadRes.status} ${uploadRes.statusText}` });
    }

    // Étape 3 : Créer le post (ugcPost)
    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: caption || '' },
            shareMediaCategory: 'IMAGE',
            media: [{
              status: 'READY',
              description: { text: caption || '' },
              media: assetUrn,
            }],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    const postData = await postRes.json();
    if (!postRes.ok) {
      return res.status(400).json({ error: `LinkedIn ugcPost: ${JSON.stringify(postData)}` });
    }

    // L'ID du post LinkedIn est dans le header x-restli-id
    const postId = postRes.headers.get('x-restli-id') || postData.id || '';
    const postUrl = postId ? `https://www.linkedin.com/feed/update/${postId}/` : 'https://www.linkedin.com/feed/';

    res.json({ success: true, postId, postUrl });
  } catch (error) {
    console.error('Erreur publication LinkedIn:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
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

