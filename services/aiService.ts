/// <reference types="vite/client" />

import { AiParameters, AiStyle, AiStyleType, AiModelType } from '../types';
import { AI_MODELS, getModelById } from './aiModels';

export const AI_STYLES: AiStyle[] = [
  { id: 'none', label: 'Aucun' },
  {
    id: 'studio',
    label: 'Studio Radio',
    prompt_prefix: "Professional radio studio photography, ",
    prompt_suffix: ", high quality, detailed, broadcast equipment, warm lighting"
  },
  {
    id: 'cinematic',
    label: 'Cinématique',
    prompt_prefix: "Cinematic shot, ",
    prompt_suffix: ", dramatic lighting, depth of field, 8k, highly detailed"
  },
  {
    id: 'punk',
    label: 'Collage Punk',
    prompt_prefix: "Dadaist punk rock collage art style, ",
    prompt_suffix: ", xerox textures, ripped paper, high contrast, anarchist aesthetic"
  },
  {
    id: 'minimalist',
    label: 'Minimaliste',
    prompt_prefix: "Clean minimalist graphic design, ",
    prompt_suffix: ", flat colors, geometric shapes, Bauhaus influence"
  },
  {
    id: 'vintage',
    label: 'Vintage 70s',
    prompt_prefix: "1970s grainy film photography, ",
    prompt_suffix: ", faded colors, retro aesthetic, nostalgic atmosphere"
  },
  {
    id: 'neon',
    label: 'Néon/Cyber',
    prompt_prefix: "Cyberpunk aesthetic with neon lights, ",
    prompt_suffix: ", glowing red and blue colors, synthwave atmosphere"
  },
];

/**
 * Generates an image based on a text prompt using the specified model via HuggingFace Inference API.
 */
export async function generateImage(
  prompt: string,
  params?: Partial<AiParameters>,
  styleId: AiStyleType = 'none'
): Promise<string> {
  // Récupérer le modèle spécifié ou utiliser le défaut
  const modelType = params?.model || 'flux-schnell';
  const model = getModelById(modelType) || getModelById('flux-schnell');

  // Gestion du modèle local FLUX.1
  if (modelType === 'flux-local') {
    // Utiliser le proxy local pour éviter les problèmes CORS/Connectivité
    const apiUrl = `/api/flux-local/generate`;

    // Appliquer le style
    const style = AI_STYLES.find(s => s.id === styleId) || AI_STYLES[0];
    const finalPrompt = `${style.prompt_prefix || ''}${prompt}${style.prompt_suffix || ''}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          num_inference_steps: params?.num_inference_steps || 4,
          width: params?.width || 1024,
          height: params?.height || 1024,
          seed: params?.seed,
          no_text: params?.no_text,
          performance_mode: params?.performance_mode
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Locale: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error("Format de réponse invalide: URL manquante.");
      }

      // Fetch l'image depuis l'URL locale pour la convertir en base64
      // Fetch l'image depuis l'URL locale pour la convertir en base64
      // Si l'URL retournée est absolue (commence par http), on doit quand même passer par le proxy
      // pour que le serveur Node fasse la requête (car le navigateur ne peut pas atteindre l'IP interne du LAN)

      let imageUrl = data.url;
      if (data.url.startsWith('http')) {
        // Enlever le protocole et domaine pour ne garder que le path
        // Ex: http://your-internal-ip:8000/images/abc.png -> /images/abc.png
        try {
          const urlObj = new URL(data.url);
          imageUrl = urlObj.pathname + urlObj.search;
        } catch (e) {
          console.warn("Impossible de parser l'URL de l'image locale", e);
        }
      }

      // Construire l'URL via le proxy
      const proxyImageUrl = `/api/flux-local${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

      const imageResponse = await fetch(proxyImageUrl);
      const imageBlob = await imageResponse.blob();

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

    } catch (error) {
      console.error(error);
      throw error instanceof Error ? error : new Error("Erreur lors de la génération locale.");
    }
  }

  const apiUrl = `/api/huggingface/models/${model!.modelId}`;

  // Appliquer le style
  const style = AI_STYLES.find(s => s.id === styleId) || AI_STYLES[0];
  const finalPrompt = `${style.prompt_prefix || ''}${prompt}${style.prompt_suffix || ''}`;

  // Limiter les dimensions selon le modèle
  const maxWidth = model?.maxWidth || 1440;
  const maxHeight = model?.maxHeight || 1440;
  const width = params?.width ? Math.min(params.width, maxWidth) : 1024;
  const height = params?.height ? Math.min(params.height, maxHeight) : 1024;

  try {
    const payload = {
      inputs: {
        prompt: finalPrompt,
        negative_prompt: "text, typography, letters, words, writing, signs, labels, text overlay, text elements, readable text, visible text, text on image",
        width,
        height,
        num_inference_steps: params?.num_inference_steps || model?.defaultSteps || 4,
        guidance_scale: params?.guidance_scale || 3.5,
        seed: params?.seed !== undefined ? params.seed : Math.floor(Math.random() * 1000000)
      }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 503) {
        // Model is loading, wait and retry
        const estimatedTime = errorData.estimated_time || 20;
        throw new Error(`Le modèle est en cours de chargement. Veuillez réessayer dans ${Math.ceil(estimatedTime)} secondes.`);
      }
      throw new Error(errorData.error || `Erreur API HuggingFace: ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });

    return base64;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erreur lors de la génération d'image avec FLUX.1-schnell.");
  }
}

/**
 * Performs image-to-image editing using the specified model.
 * Note: Support de l'image-to-image dépend du modèle.
 */
export async function imageToImage(
  imageBlob: Blob,
  prompt: string,
  modelType: AiModelType = 'flux-schnell'
): Promise<string> {
  const model = getModelById(modelType) || getModelById('flux-schnell');

  // Gestion du modèle local FLUX.1 (Img2Img)
  if (modelType === 'flux-local') {
    const apiUrl = `/api/flux-local/generate`;

    // Convert image to base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // On envoie le Data URL complet ou juste le contenu, selon ce que l'API attend
        // D'après la doc API: "image": string | null (Base64 Data URL)
        resolve(result);
      };
      reader.readAsDataURL(imageBlob);
    });

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          image: base64Data,
          strength: 0.6,
          num_inference_steps: 4,
          performance_mode: 'balanced'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Locale Img2Img: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.url) throw new Error("URL manquante dans la réponse Img2Img locale.");

      // Fetch result image
      let imageUrl = data.url;
      if (data.url.startsWith('http')) {
        try {
          const urlObj = new URL(data.url);
          imageUrl = urlObj.pathname + urlObj.search;
        } catch (e) { }
      }
      const proxyImageUrl = `/api/flux-local${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

      const imageResponse = await fetch(proxyImageUrl);
      const resBlob = await imageResponse.blob();

      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(resBlob);
      });
    } catch (err) {
      console.error(err);
      throw err instanceof Error ? err : new Error("Erreur Img2Img Local");
    }
  }

  const apiUrl = `/api/huggingface/models/${model!.modelId}`;

  // Convert blob to base64 string (excluding metadata prefix)
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || result);
    };
    reader.readAsDataURL(imageBlob);
  });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          image: base64Data,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 503) {
        const estimatedTime = errorData.estimated_time || 20;
        throw new Error(`Le modèle est en cours de chargement. Veuillez réessayer dans ${Math.ceil(estimatedTime)} secondes.`);
      }
      throw new Error(errorData.error || `Erreur API HuggingFace: ${response.statusText}`);
    }

    const resultBlob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(resultBlob);
    });

    return base64;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erreur lors de l'édition d'image avec FLUX.1-schnell.");
  }
}

/**
 * Performs inpainting editing using the specified model.
 */
export async function generateInpainting(
  imageContent: string, // base64
  maskContent: string,  // base64
  prompt: string,
  params?: Partial<AiParameters>
): Promise<string> {
  const modelType = params?.model || 'sd-inpainting';
  const model = getModelById(modelType) || getModelById('sd-inpainting');

  if (modelType === 'flux-local') {
    const apiUrl = `/api/flux-local/generate`;

    try {
      // Pour FLUX.1 Fill, on envoie :
      // - image (base64)
      // - mask (base64)
      // - prompt
      // - strength
      // - num_inference_steps
      // - performance_mode
      const payload = {
        prompt: prompt,
        image: imageContent, // Data URL
        mask: maskContent,   // Data URL
        strength: params?.strength ?? 0.6,
        num_inference_steps: params?.num_inference_steps || 4,
        performance_mode: params?.performance_mode || 'balanced',
        no_text: params?.no_text,
        seed: params?.seed,
        width: params?.width || 1024,
        height: params?.height || 1024
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur API Locale Inpainting: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.url) throw new Error("URL manquante dans la réponse Inpainting locale.");

      // Fetch result image
      let imageUrl = data.url;
      if (data.url.startsWith('http')) {
        try {
          const urlObj = new URL(data.url);
          imageUrl = urlObj.pathname + urlObj.search;
        } catch (e) { }
      }
      const proxyImageUrl = `/api/flux-local${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

      const imageResponse = await fetch(proxyImageUrl);
      const resBlob = await imageResponse.blob();

      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(resBlob);
      });

    } catch (error) {
      console.error(error);
      throw error instanceof Error ? error : new Error("Erreur Inpainting Local");
    }
  }

  const apiUrl = `/api/huggingface/models/${model!.modelId}`;

  try {
    const payload = {
      inputs: {
        image: imageContent.split(',')[1],
        mask: maskContent.split(',')[1],
        prompt: prompt,
      },
      parameters: {
        num_inference_steps: params?.num_inference_steps || model?.defaultSteps || 30,
        guidance_scale: params?.guidance_scale || 7.5,
      }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 503) {
        const estimatedTime = errorData.estimated_time || 20;
        throw new Error(`Le modèle est en cours de chargement. Veuillez réessayer dans ${Math.ceil(estimatedTime)} secondes.`);
      }
      throw new Error(errorData.error || `Erreur API HuggingFace: ${response.statusText}`);
    }

    const resultBlob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(resultBlob);
    });

    return base64;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Erreur lors de l'inpainting.");
  }
}

/**
 * Performs AI upscaling on an image using local Real-ESRGAN.
 */
export async function upscaleImage(
  imageContent: string, // base64 data URI
  onStatus?: (status: string) => void
): Promise<string> {
  const apiUrl = "/api/flux-local/upscale";

  try {
    if (onStatus) onStatus("Démarrage de l'upscale...");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageContent })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur API locale: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error("Format de réponse invalide: URL manquante.");
    }

    if (onStatus) onStatus("Téléchargement de l'image HD...");

    let imageUrl = data.url;
    if (data.url.startsWith('http')) {
      try {
        const urlObj = new URL(data.url);
        imageUrl = urlObj.pathname + urlObj.search;
      } catch (e) {
        console.warn("Impossible de parser l'URL de l'image upscalée", e);
      }
    }

    const proxyImageUrl = `/api/flux-local${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    const imageResponse = await fetch(proxyImageUrl);
    if (!imageResponse.ok) {
      throw new Error("Impossible de récupérer l'image upscalée.");
    }

    const imageBlob = await imageResponse.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Erreur lors de l'upscaling de l'image.");
  }
}
