
/**
 * Calcule le scale optimal du canvas en fonction des dimensions pour l'affichage
 */
export const calculateCanvasScale = (width: number, height: number): number => {
  // Pour les formats très larges et peu hauts (bannières), on utilise un scale plus petit
  const aspectRatio = width / height;
  const maxDim = Math.max(width, height);
  
  // Bannières très larges (ratio > 3.5, comme LinkedIn 1584x396 = 4:1)
  if (aspectRatio > 3.5) {
    return 3; // Scale de 3 pour les bannières très larges
  }
  
  // Formats larges (ratio > 2, comme Twitter 1500x500 = 3:1)
  if (aspectRatio > 2) {
    return 2.5; // Scale de 2.5 pour les bannières larges
  }
  
  // Très grands formats (ex: 3000x3000)
  if (maxDim >= 3000) {
    return 5;
  }

  // Grands formats (ex: 1920x1080, 2048x1152)
  if (maxDim >= 2000) {
    return 3;
  }
  
  // Formats standards (largeur > 1500px)
  if (width > 1500) {
    return 2.5;
  }
  
  // Formats standards (largeur <= 1500px)
  return 2;
};

/**
 * Découpe le texte en plusieurs lignes pour le rendu canvas (fallback ou utilitaire)
 */
export const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width < maxWidth && currentLine.length > 0) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};
