/**
 * Utilitaires de validation et sanitization des fichiers
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valide un fichier uploadé
 */
export function validateFile(file: File): ValidationResult {
  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Fichier trop volumineux. Maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  // Vérifier le type MIME
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WebP ou SVG.`,
    };
  }

  return { isValid: true };
}

/**
 * Vérifie si un type MIME est autorisé
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.some(allowed => mimeType === allowed);
}

/**
 * Formate la taille d'un fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
