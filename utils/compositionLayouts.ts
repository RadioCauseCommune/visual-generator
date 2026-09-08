import { AssetType, CompositionLayoutType, CompositionPreset } from '../types';
import { DIMENSIONS } from '../constants';

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Détermine l'orientation du format d'après ses dimensions
 */
export function getCanvasOrientation(w: number, h: number): 'landscape' | 'portrait' | 'square' {
  const ratio = w / h;
  if (ratio > 1.15) return 'landscape';
  if (ratio < 0.88) return 'portrait';
  return 'square';
}

/**
 * Sélectionne automatiquement le meilleur agencement par défaut
 * selon l'orientation du format de sortie et le nombre d'images
 */
export function autoSelectBestLayout(
  assetType: AssetType,
  count: number
): CompositionLayoutType {
  if (count <= 1) return 'single';

  const dim = DIMENSIONS[assetType] || { w: 1080, h: 1080 };
  const orientation = getCanvasOrientation(dim.w, dim.h);

  if (count === 2) {
    if (orientation === 'landscape') return 'split-v';
    if (orientation === 'portrait') return 'split-h';
    return 'split-v'; // Carré: split vertical par défaut
  }

  if (count === 3) {
    if (orientation === 'landscape') return 'grid-1-2';
    if (orientation === 'portrait') return 'grid-top-bottom';
    return 'grid-1-2';
  }

  if (count === 4) {
    return 'grid-2x2';
  }

  return orientation === 'landscape' ? 'strips-v' : 'strips-h';
}

/**
 * Calcule les coordonnées et dimensions de chaque image pour un agencement donné
 */
export function calculateCompositionLayout(
  layoutType: CompositionLayoutType,
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  gap: number = 0
): LayoutBox[] {
  const W = canvasWidth;
  const H = canvasHeight;
  const G = Math.max(0, gap);

  if (count <= 0) return [];
  if (count === 1 || layoutType === 'single') {
    return [{ x: 0, y: 0, width: W, height: H }];
  }

  // Résolution auto si demandé
  if (layoutType === 'auto') {
    const orientation = getCanvasOrientation(W, H);
    let resolvedLayout: CompositionLayoutType = 'grid-2x2';
    if (count === 2) resolvedLayout = orientation === 'portrait' ? 'split-h' : 'split-v';
    else if (count === 3) resolvedLayout = orientation === 'portrait' ? 'grid-top-bottom' : 'grid-1-2';
    else if (count === 4) resolvedLayout = 'grid-2x2';
    else resolvedLayout = orientation === 'portrait' ? 'strips-h' : 'strips-v';
    return calculateCompositionLayout(resolvedLayout, count, W, H, G);
  }

  // --- 2 IMAGES ---
  if (layoutType === 'split-v') {
    const itemWidth = (W - G) / 2;
    return [
      { x: 0, y: 0, width: itemWidth, height: H },
      { x: itemWidth + G, y: 0, width: itemWidth, height: H },
    ];
  }

  if (layoutType === 'split-h') {
    const itemHeight = (H - G) / 2;
    return [
      { x: 0, y: 0, width: W, height: itemHeight },
      { x: 0, y: itemHeight + G, width: W, height: itemHeight },
    ];
  }

  if (layoutType === 'split-v-60-40') {
    const leftWidth = (W - G) * 0.6;
    const rightWidth = (W - G) * 0.4;
    return [
      { x: 0, y: 0, width: leftWidth, height: H },
      { x: leftWidth + G, y: 0, width: rightWidth, height: H },
    ];
  }

  if (layoutType === 'split-v-40-60') {
    const leftWidth = (W - G) * 0.4;
    const rightWidth = (W - G) * 0.6;
    return [
      { x: 0, y: 0, width: leftWidth, height: H },
      { x: leftWidth + G, y: 0, width: rightWidth, height: H },
    ];
  }

  // --- 3 IMAGES ---
  if (layoutType === 'grid-1-2') {
    const leftWidth = (W - G) / 2;
    const rightWidth = (W - G) / 2;
    const rightItemHeight = (H - G) / 2;
    return [
      { x: 0, y: 0, width: leftWidth, height: H },
      { x: leftWidth + G, y: 0, width: rightWidth, height: rightItemHeight },
      { x: leftWidth + G, y: rightItemHeight + G, width: rightWidth, height: rightItemHeight },
    ];
  }

  if (layoutType === 'grid-2-1') {
    const leftWidth = (W - G) / 2;
    const rightWidth = (W - G) / 2;
    const leftItemHeight = (H - G) / 2;
    return [
      { x: 0, y: 0, width: leftWidth, height: leftItemHeight },
      { x: 0, y: leftItemHeight + G, width: leftWidth, height: leftItemHeight },
      { x: leftWidth + G, y: 0, width: rightWidth, height: H },
    ];
  }

  if (layoutType === 'grid-top-bottom') {
    const topHeight = (H - G) / 2;
    const bottomHeight = (H - G) / 2;
    const bottomItemWidth = (W - G) / 2;
    return [
      { x: 0, y: 0, width: W, height: topHeight },
      { x: 0, y: topHeight + G, width: bottomItemWidth, height: bottomHeight },
      { x: bottomItemWidth + G, y: topHeight + G, width: bottomItemWidth, height: bottomHeight },
    ];
  }

  if (layoutType === 'grid-bottom-top') {
    const topHeight = (H - G) / 2;
    const bottomHeight = (H - G) / 2;
    const topItemWidth = (W - G) / 2;
    return [
      { x: 0, y: 0, width: topItemWidth, height: topHeight },
      { x: topItemWidth + G, y: 0, width: topItemWidth, height: topHeight },
      { x: 0, y: topHeight + G, width: W, height: bottomHeight },
    ];
  }

  // --- 4 IMAGES ---
  if (layoutType === 'grid-2x2') {
    const itemWidth = (W - G) / 2;
    const itemHeight = (H - G) / 2;
    return [
      { x: 0, y: 0, width: itemWidth, height: itemHeight },
      { x: itemWidth + G, y: 0, width: itemWidth, height: itemHeight },
      { x: 0, y: itemHeight + G, width: itemWidth, height: itemHeight },
      { x: itemWidth + G, y: itemHeight + G, width: itemWidth, height: itemHeight },
    ];
  }

  if (layoutType === 'grid-1-3') {
    const leftWidth = (W - G) * 0.55;
    const rightWidth = (W - G) * 0.45;
    const rightItemHeight = (H - 2 * G) / 3;
    return [
      { x: 0, y: 0, width: leftWidth, height: H },
      { x: leftWidth + G, y: 0, width: rightWidth, height: rightItemHeight },
      { x: leftWidth + G, y: rightItemHeight + G, width: rightWidth, height: rightItemHeight },
      { x: leftWidth + G, y: 2 * (rightItemHeight + G), width: rightWidth, height: rightItemHeight },
    ];
  }

  if (layoutType === 'grid-top-3') {
    const topHeight = (H - G) * 0.55;
    const bottomHeight = (H - G) * 0.45;
    const bottomItemWidth = (W - 2 * G) / 3;
    return [
      { x: 0, y: 0, width: W, height: topHeight },
      { x: 0, y: topHeight + G, width: bottomItemWidth, height: bottomHeight },
      { x: bottomItemWidth + G, y: topHeight + G, width: bottomItemWidth, height: bottomHeight },
      { x: 2 * (bottomItemWidth + G), y: topHeight + G, width: bottomItemWidth, height: bottomHeight },
    ];
  }

  // --- BANDES VERTICALES (N colonnes) ---
  if (layoutType === 'strips-v') {
    const itemWidth = (W - (count - 1) * G) / count;
    return Array.from({ length: count }, (_, i) => ({
      x: i * (itemWidth + G),
      y: 0,
      width: itemWidth,
      height: H,
    }));
  }

  // --- BANDES HORIZONTALES (N lignes) ---
  if (layoutType === 'strips-h') {
    const itemHeight = (H - (count - 1) * G) / count;
    return Array.from({ length: count }, (_, i) => ({
      x: 0,
      y: i * (itemHeight + G),
      width: W,
      height: itemHeight,
    }));
  }

  // --- GRILLE GÉNÉRIQUE (Fallback pour N >= 5) ---
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellWidth = (W - (cols - 1) * G) / cols;
  const cellHeight = (H - (rows - 1) * G) / rows;

  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: col * (cellWidth + G),
      y: row * (cellHeight + G),
      width: cellWidth,
      height: cellHeight,
    };
  });
}

/**
 * Retourne la liste des presets applicables pour un nombre d'images donné
 */
export function getAvailablePresets(
  assetType: AssetType,
  imageCount: number
): CompositionPreset[] {
  if (imageCount <= 1) return [];

  const dim = DIMENSIONS[assetType] || { w: 1080, h: 1080 };
  const orientation = getCanvasOrientation(dim.w, dim.h);

  if (imageCount === 2) {
    return [
      {
        id: 'split-v',
        label: 'Côte à côte (2 Colonnes)',
        description: 'Deux images verticales juxtaposées',
        minImages: 2,
        maxImages: 2,
        orientation: 'all',
      },
      {
        id: 'split-h',
        label: 'Superposé (2 Lignes)',
        description: 'Deux images horizontales empilées',
        minImages: 2,
        maxImages: 2,
        orientation: 'all',
      },
      {
        id: 'split-v-60-40',
        label: 'Asymétrique 60 / 40',
        description: 'Image principale à gauche (60%) et secondaire à droite',
        minImages: 2,
        maxImages: 2,
        orientation: 'all',
      },
      {
        id: 'split-v-40-60',
        label: 'Asymétrique 40 / 60',
        description: 'Image secondaire à gauche et principale à droite (60%)',
        minImages: 2,
        maxImages: 2,
        orientation: 'all',
      },
    ];
  }

  if (imageCount === 3) {
    const presets: CompositionPreset[] = [
      {
        id: 'grid-1-2',
        label: '1 Gauche + 2 Droite',
        description: '1 grande image à gauche et 2 empilées à droite',
        minImages: 3,
        maxImages: 3,
        orientation: 'landscape',
      },
      {
        id: 'grid-2-1',
        label: '2 Gauche + 1 Droite',
        description: '2 images empilées à gauche et 1 grande à droite',
        minImages: 3,
        maxImages: 3,
        orientation: 'landscape',
      },
      {
        id: 'grid-top-bottom',
        label: '1 Haut + 2 Bas',
        description: '1 grande image en haut et 2 côte à côte en bas',
        minImages: 3,
        maxImages: 3,
        orientation: 'portrait',
      },
      {
        id: 'grid-bottom-top',
        label: '2 Haut + 1 Bas',
        description: '2 images côte à côte en haut et 1 grande en bas',
        minImages: 3,
        maxImages: 3,
        orientation: 'portrait',
      },
      {
        id: 'strips-v',
        label: '3 Colonnes',
        description: 'Trois bandes verticales égales',
        minImages: 3,
        maxImages: 3,
        orientation: 'all',
      },
      {
        id: 'strips-h',
        label: '3 Lignes',
        description: 'Trois bandes horizontales égales',
        minImages: 3,
        maxImages: 3,
        orientation: 'all',
      },
    ];

    // Prioriser selon l'orientation
    if (orientation === 'portrait') {
      return presets.sort((a, _b) => (a.orientation === 'portrait' ? -1 : 1));
    }
    return presets.sort((a, _b) => (a.orientation === 'landscape' ? -1 : 1));
  }

  if (imageCount === 4) {
    return [
      {
        id: 'grid-2x2',
        label: 'Grille 2x2 (4 cadrans)',
        description: 'Quatre quadrants égaux',
        minImages: 4,
        maxImages: 4,
        orientation: 'all',
      },
      {
        id: 'grid-1-3',
        label: '1 Grande + 3 Droite',
        description: '1 grande image à gauche et 3 petites empilées à droite',
        minImages: 4,
        maxImages: 4,
        orientation: 'landscape',
      },
      {
        id: 'grid-top-3',
        label: '1 Grande + 3 Bas',
        description: '1 grande image en haut et 3 petites alignées en bas',
        minImages: 4,
        maxImages: 4,
        orientation: 'portrait',
      },
      {
        id: 'strips-v',
        label: '4 Colonnes',
        description: 'Quatre bandes verticales',
        minImages: 4,
        maxImages: 4,
        orientation: 'all',
      },
      {
        id: 'strips-h',
        label: '4 Lignes',
        description: 'Quatre bandes horizontales',
        minImages: 4,
        maxImages: 4,
        orientation: 'all',
      },
    ];
  }

  // 5 ou plus
  return [
    {
      id: 'auto',
      label: 'Mosaïque automatique',
      description: 'Distribution équilibrée en grille',
      minImages: 5,
      orientation: 'all',
    },
    {
      id: 'strips-v',
      label: 'Colonnes',
      description: 'Bandes verticales',
      minImages: 5,
      orientation: 'all',
    },
    {
      id: 'strips-h',
      label: 'Lignes',
      description: 'Bandes horizontales',
      minImages: 5,
      orientation: 'all',
    },
  ];
}
