import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Plugin pour gérer le proxy HuggingFace avec authentification
  const huggingfaceProxyPlugin = (): Plugin => {
    return {
      name: 'huggingface-proxy',
      configureServer(server) {
        server.middlewares.use('/api/huggingface', async (req, res, next) => {
          if (req.method !== 'POST') {
            return next();
          }

          const token = env.HUGGINGFACE_TOKEN;
          if (!token) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'HUGGINGFACE_TOKEN non configuré' }));
            return;
          }

          // Lire le body de la requête
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              // Extraire le chemin du modèle depuis l'URL
              const modelPath = req.url?.replace('/api/huggingface', '') || '';
              // Utiliser le nouveau endpoint router.huggingface.co avec le format correct
              // Format: /hf-inference/models/{model_id}
              const modelId = modelPath.replace('/models/', '');
              const targetUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;

              // Parser le body pour reformater si nécessaire
              let payload;
              try {
                payload = JSON.parse(body);
                // Si le payload a déjà le bon format (inputs avec prompt), on le garde tel quel
                // Sinon, on reformate pour mettre tout dans inputs
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
              } catch {
                payload = JSON.parse(body);
              }

              const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              // Copier les headers de la réponse
              const contentType = response.headers.get('content-type') || 'application/json';
              res.writeHead(response.status, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
              });

              // Streamer la réponse (peut être une image binaire)
              const buffer = await response.arrayBuffer();
              res.end(Buffer.from(buffer));
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }));
            }
          });
        });
      },
    };
  };

  // Plugin pour gérer le proxy Replicate avec authentification
  const replicateProxyPlugin = (): Plugin => {
    return {
      name: 'replicate-proxy',
      configureServer(server) {
        server.middlewares.use('/api/replicate', async (req, res) => {
          const token = env.REPLICATE_API_TOKEN;
          if (!token) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'REPLICATE_API_TOKEN non configuré' }));
            return;
          }

          const modelPath = req.url || '';
          const targetUrl = `https://api.replicate.com/v1${modelPath}`;

          let body = '';
          if (req.method === 'POST') {
            await new Promise((resolve) => {
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', resolve);
            });
          }

          try {
            const response = await fetch(targetUrl, {
              method: req.method,
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
              ...(req.method === 'POST' && body ? { body } : {})
            });

            const contentType = response.headers.get('content-type') || 'application/json';
            const responseData = await response.text();

            res.writeHead(response.status, {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
            });
            res.end(responseData);
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Replicate Proxy Error' }));
          }
        });
      },
    };
  };

  // Plugin pour gérer le proxy API pour éviter les problèmes de CORS (RSS, WP API, etc.)
  const apiProxyPlugin = (): Plugin => {
    return {
      name: 'api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res) => {
          try {
            const url = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('url');
            if (!url) {
              res.writeHead(400);
              res.end('Missing url parameter');
              return;
            }

            const response = await fetch(url);
            const contentType = response.headers.get('content-type') || 'application/json';

            res.writeHead(response.status, {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
            });

            if (contentType.includes('image')) {
              const buffer = await response.arrayBuffer();
              res.end(Buffer.from(buffer));
            } else {
              const text = await response.text();
              res.end(text);
            }
          } catch (error) {
            res.writeHead(500);
            res.end(error instanceof Error ? error.message : 'Proxy Error');
          }
        });
      },
    };
  };

  // Plugin pour gérer le proxy vers le Flux Local (Workstation LAN)
  const fluxLocalProxyPlugin = (): Plugin => {
    return {
      name: 'flux-local-proxy',
      configureServer(server) {
        server.middlewares.use('/api/flux-local', async (req, res) => {
          const localUrl = env.VITE_LOCAL_FLUX_URL;
          if (!localUrl) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'VITE_LOCAL_FLUX_URL non configuré' }));
            return;
          }

          // On retire '/api/flux-local' du path pour l'append à l'URL cible
          const path = req.url || '';
          const targetUrl = `${localUrl}${path}`;

          // Lire le body de la requête
          let body = '';
          if (req.method === 'POST') {
            await new Promise((resolve) => {
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', resolve);
            });
          }

          try {
            // Timeout généreux pour le flux local (10 minutes)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

            // Utiliser fetch depuis l'environnement Node (Vite dev server)
            const response = await fetch(targetUrl, {
              method: req.method,
              headers: {
                'Content-Type': 'application/json',
              },
              ...(req.method === 'POST' && body ? { body } : {}),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            const contentType = response.headers.get('content-type') || 'application/json';

            // Si l'image est streamée ou binaire
            if (contentType.includes('image') || contentType.includes('stream')) {
              const buffer = await response.arrayBuffer();
              res.writeHead(response.status, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
              });
              res.end(Buffer.from(buffer));
            } else {
              const text = await response.text();
              res.writeHead(response.status, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
              });
              res.end(text);
            }

          } catch (error) {
            console.error('Flux Local Proxy Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Flux Local Proxy Error' }));
          }
        });
      },
    };
  };

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), huggingfaceProxyPlugin(), apiProxyPlugin(), replicateProxyPlugin(), fluxLocalProxyPlugin()],
    // ⚠️ SÉCURITÉ: Ne PAS exposer le token dans le bundle client
    // Le proxy backend (huggingfaceProxyPlugin) gère l'authentification
    // define: {
    //   'process.env.HUGGINGFACE_TOKEN': JSON.stringify(env.HUGGINGFACE_TOKEN), // ❌ SUPPRIMÉ
    // },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
