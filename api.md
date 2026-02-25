# Documentation de l'API FLUX.1 Studio Pro+

Cette API permet d'interagir programmatiquement avec le moteur de génération d'images.

## Configuration de base
*   **URL de base** : `http://your-internal-ip:8000`
*   **Format** : JSON
*   **CORS** : Activé (toutes origines autorisées)

---

## 1. Génération d'image
`POST /generate`

Génère une image à partir d'un texte (Text2Img) ou d'une image existante (Img2Img).

### Paramètres de la requête
| Champ | Type | Défaut | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | string | (Obligatoire) | Description textuelle de l'image souhaitée. |
| `num_inference_steps` | int | 4 | Nombre d'étapes (1-10). Flux-schnell excelle à 4. |
| `width` | int | 1024 | Largeur de l'image (multiple de 64). |
| `height` | int | 1024 | Hauteur de l'image (multiple de 64). |
| `seed` | int | null | Pour la reproductibilité (optionnel). |
| `no_text` | boolean | false | Si vrai, ajoute des contraintes au prompt pour éviter le texte. |
| `performance_mode` | string | "balanced" | "balanced" (économe) ou "fast" (plus rapide, consomme plus de VRAM). |
| `image` | string | null | Image de référence encodée en **Base64** (Data URL). |
| `mask` | string | null | Masque de retouche encodée en **Base64** (Zones blanches = à modifier). |
| `strength` | float | 0.6 | Force de transformation (0.01 à 1.0). |
| `model` | string | "flux" | Moteur d'inpainting : `"flux"` (Haute qualité) ou `"lama"` (Ultra-rapide/Eraser). |

### Réponse (JSON)
```json
{
  "url": "/outputs/a1b2c3d4.png",
  "seed": 12345
}
```
*Note: L'image est accessible à `http://your-internal-ip:8000/outputs/a1b2c3d4.png`.*

---

## 2. Upscaling (Super-Résolution)
`POST /upscale`

Multiplie par 4 la résolution d'une image en restaurant les détails via Real-ESRGAN.

### Paramètres de la requête
| Champ | Type | Description |
| :--- | :--- | :--- |
| `image` | string | Image à agrandir en **Base64** (Data URL). |

### Réponse (JSON)
```json
{
  "url": "/outputs/upscale_x1y2z3.png"
}
```

---

## 3. Exemples d'implémentation

### JavaScript (Fetch)
```javascript
const response = await fetch("http://your-internal-ip:8000/generate", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "A neon sign in a rainy street",
    no_text: true,
    width: 512,
    height: 512
  })
});
const data = await response.json();
console.log("URL Image:", data.url);
```

### Python
```python
import requests

payload = {
    "prompt": "An oil painting of a cat",
    "num_inference_steps": 4,
    "performance_mode": "fast"
}

r = requests.post("http://your-internal-ip:8000/generate", json=payload)
print(r.json())
```

### Exemple Upscale (JavaScript)
```javascript
const response = await fetch("http://your-internal-ip:8000/upscale", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: "data:image/png;base64,iVBORw0..." // Votre image source
  })
});
const data = await response.json();
window.open(data.url); // Ouvre l'image agrandie x4
```

---

## 4. Maintenance
Le serveur tourne en tant que service système :
---

---

## 5. Dépannage : Erreurs CSP (Content Security Policy)

Si votre application React (Vite) affiche une erreur `Content-Security-Policy` avec la directive `connect-src`, cela signifie que le navigateur bloque la requête vers votre serveur local pour des raisons de sécurité définies dans votre projet React.

### La solution
Vous devez modifier la directive `connect-src` dans votre application cliente pour autoriser :
1. L'IP de votre Z440.
2. Les schémas `data:` (si vous envoyez des images en Base64).

#### Exemple de modification (dans l'index.html ou la config de votre serveur React) :
Modifiez votre balise Meta CSP ou votre configuration de headers pour inclure votre IP locale :

```html
<!-- Exemple de directive connect-src mise à jour -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  connect-src 'self' 
              https://router.huggingface.co 
              https://*.supabase.co 
              http://your-internal-ip:8000 
              data:;
  ...
">
```

> [!TIP]
> Si vous utilisez un framework comme Supabase ou un template Hugging Face, vérifiez les fichiers de configuration (comme `vercel.json`, `netlify.toml` ou les réglages de headers dans votre code React) pour y ajouter l'adresse de votre serveur local.
