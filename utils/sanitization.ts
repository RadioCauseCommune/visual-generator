/**
 * Utilitaires de sanitization XSS
 */

import DOMPurify from 'dompurify';

/**
 * Nettoie une chaîne de texte pour éviter les attaques XSS
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Nettoie du contenu HTML en autorisant uniquement certains tags
 */
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [],
  });
}

/**
 * Nettoie une URL pour éviter les attaques XSS via javascript:
 */
export function sanitizeURL(url: string): string {
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Vérifier que c'est une URL valide (http, https, data:)
  const validProtocols = ['http:', 'https:', 'data:', '/'];
  try {
    const parsed = new URL(sanitized, window.location.origin);
    if (validProtocols.includes(parsed.protocol) || sanitized.startsWith('/')) {
      return sanitized;
    }
  } catch {
    // URL invalide
  }

  return '';
}

/**
 * Valide et nettoie les métadonnées d'un projet
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeMetadata(value);
    }
  }

  return sanitized;
}
