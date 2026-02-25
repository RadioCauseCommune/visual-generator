import { AiModel, AiModelType } from '../types';

export const AI_MODELS: AiModel[] = [
  {
    id: 'flux-schnell',
    name: 'FLUX.1-schnell',
    description: 'Modèle par défaut - Rapide et gratuit',
    modelId: 'black-forest-labs/FLUX.1-schnell',
    maxSteps: 4,
    defaultSteps: 4,
    maxWidth: 1440,
    maxHeight: 1440,
    isFree: true,
    speed: 'fast',
    quality: 'excellent',
  },
  {
    id: 'flux-local',
    name: 'FLUX.1 (Local)',
    description: 'Workstation local (HP Z440)',
    modelId: 'local/flux-1',
    maxSteps: 50,
    defaultSteps: 4,
    maxWidth: 2048,
    maxHeight: 2048,
    isFree: true,
    speed: 'fast',
    quality: 'outstanding',
  },
  {
    id: 'sdxl-turbo',
    name: 'SDXL Turbo',
    description: 'Ultra-rapide (2-4 steps) - Preview instantanée',
    modelId: 'stabilityai/sdxl-turbo',
    maxSteps: 4,
    defaultSteps: 2,
    maxWidth: 1024,
    maxHeight: 1024,
    isFree: true,
    speed: 'fast',
    quality: 'good',
  },
  {
    id: 'sdxl-base',
    name: 'SDXL Base 1.0',
    description: 'Haute qualité - Pour assets finaux',
    modelId: 'stabilityai/stable-diffusion-xl-base-1.0',
    maxSteps: 50,
    defaultSteps: 30,
    maxWidth: 1024,
    maxHeight: 1024,
    isFree: true,
    speed: 'medium',
    quality: 'outstanding',
  },
  {
    id: 'sd15',
    name: 'Stable Diffusion 1.5',
    description: 'Écosystème vaste - Styles variés',
    modelId: 'runwayml/stable-diffusion-v1-5',
    maxSteps: 50,
    defaultSteps: 25,
    maxWidth: 768,
    maxHeight: 768,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
  {
    id: 'kandinsky3',
    name: 'Kandinsky 3',
    description: 'Approche unique - Art abstrait',
    modelId: 'kandinsky-community/kandinsky-3',
    maxSteps: 50,
    defaultSteps: 25,
    maxWidth: 1024,
    maxHeight: 1024,
    isFree: true,
    speed: 'medium',
    quality: 'good',
  },
  {
    id: 'sd-inpainting',
    name: 'SD Inpainting',
    description: 'Spécialisé pour la retouche de zones',
    modelId: 'runwayml/stable-diffusion-inpainting',
    maxSteps: 50,
    defaultSteps: 30,
    maxWidth: 512,
    maxHeight: 512,
    isFree: true,
    speed: 'medium',
    quality: 'excellent',
  },
];

export const DEFAULT_MODEL: AiModelType = 'flux-local';

export const getModelById = (id: AiModelType): AiModel | undefined => {
  return AI_MODELS.find(model => model.id === id);
};

export const getFreeModels = (): AiModel[] => {
  return AI_MODELS.filter(model => model.isFree);
};

export const getFastModels = (): AiModel[] => {
  return AI_MODELS.filter(model => model.speed === 'fast');
};
