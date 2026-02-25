
export enum AssetType {
  // Instagram
  INSTA_POST_SQUARE = 'Instagram Post Carré (1080x1080)',
  INSTA_POST_PORTRAIT = 'Instagram Post Portrait (1080x1350)',
  INSTA_POST_LANDSCAPE = 'Instagram Post Paysage (1080x566)',
  INSTA_STORY = 'Instagram Story/Reel (1080x1920)',

  // Facebook
  FB_POST = 'Facebook Post (1200x630)',
  FB_POST_SQUARE = 'Facebook Post Carré (1080x1080)',
  FB_STORY = 'Facebook Story (1080x1920)',
  FB_COVER = 'Facebook Couverture (820x312)',

  // Twitter / X
  X_POST = 'X/Twitter Post (1200x675)',
  X_POST_SQUARE = 'X/Twitter Carré (1200x1200)',
  X_BANNER = 'X/Twitter Bannière (1500x500)',

  // LinkedIn
  LINKEDIN_POST = 'LinkedIn Post (1200x627)',
  LINKEDIN_BANNER = 'LinkedIn Bannière (1584x396)',

  // YouTube
  YOUTUBE_THUMBNAIL = 'YouTube Miniature (1280x720)',
  YOUTUBE_BANNER = 'YouTube Bannière (2048x1152)',

  // TikTok
  TIKTOK_VIDEO = 'TikTok (1080x1920)',

  // Pinterest
  PINTEREST_STANDARD = 'Pinterest Standard (1000x1500)',
  PINTEREST_SQUARE = 'Pinterest Carré (1000x1000)',

  // Podcast & Web
  PODCAST_COVER = 'Podcast Cover (3000x3000)',
  OG_IMAGE = 'OG Image / Web (1200x630)',

  // Formats Génériques
  SQUARE_1080 = 'Format Carré 1080 (1080x1080)',
  VERTICAL_9_16 = 'Format Vertical 9:16 (1080x1920)',
  HORIZONTAL_16_9 = 'Format Horizontal 16:9 (1920x1080)'
}

export type LayerRole = 'title' | 'subtitle' | 'guest_name' | 'date' | 'extra1' | 'extra2' | 'manual' | 'logo' | 'background' | 'guest_photo';

export interface Layer {
  id: string;
  role: LayerRole;
  type: 'text' | 'image' | 'sticker' | 'logo' | 'gradient';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  zIndex: number;
  rotation: number;
  isLocked?: boolean;
  hasScratch?: boolean;
  scratchShadow?: boolean;
  scratchOpacity?: number; // 0-100
  scratchColor?: string;
  scratchBorderColor?: string;
  logoPadding?: number; // en pourcentage (0-50)
  clipShape?: 'square' | 'circle';
  overlayColor?: string;
  overlayOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // Position de l'image dans le layer (pour déplacer l'image sans déplacer le layer)
  imageOffsetX?: number; // en pourcentage (0 = gauche, 50 = centre, 100 = droite)
  imageOffsetY?: number; // en pourcentage (0 = haut, 50 = centre, 100 = bas)
  // Dimensions originales de l'image (pour calculer le redimensionnement)
  imageNaturalWidth?: number;
  imageNaturalHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  hyphens?: boolean;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: string | number;
  // Propriétés gradient
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: number; // Angle en degrés (0-360)
  imageScale?: number; // Échelle de l'image en % (100 = taille originale cover)
  fontStyle?: 'normal' | 'italic';
}

export interface ProjectExport {
  version: string;
  assetType: AssetType;
  layers: Layer[];
  meta: {
    title: string;
    subtitle: string;
    guest_name?: string;
    date?: string;
    extra1: string;
    extra2: string;
    isTransparent: boolean;
  };
}

export type AiModelType = 'flux-schnell' | 'sdxl-turbo' | 'sdxl-base' | 'sd15' | 'kandinsky3' | 'sd-inpainting' | 'flux-local';

export interface AiModel {
  id: AiModelType;
  name: string;
  description: string;
  modelId: string;
  maxSteps: number;
  defaultSteps: number;
  maxWidth: number;
  maxHeight: number;
  isFree: boolean;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'good' | 'excellent' | 'outstanding';
}

export interface AiParameters {
  num_inference_steps: number;
  guidance_scale: number;
  seed?: number;
  width?: number;
  height?: number;
  model?: AiModelType;
  // Options spécifiques Flux Local
  no_text?: boolean;
  performance_mode?: 'balanced' | 'fast';
  strength?: number;
}

export type AiStyleType = 'none' | 'studio' | 'cinematic' | 'punk' | 'minimalist' | 'vintage' | 'neon';

export interface AiStyle {
  id: AiStyleType;
  label: string;
  prompt_prefix?: string;
  prompt_suffix?: string;
}

export interface Dimensions {
  width: number;
  height: number;
}
