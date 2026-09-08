/**
 * Service Instagram — appels vers les endpoints Express proxy
 * Tous les appels Meta Graph API passent par le backend (tokens jamais exposés côté client)
 */

import { PublishOptions, PublishResult, SocialAccount } from '../types';
import { supabase } from './supabase';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { 'Authorization': `Bearer ${session.access_token}` };
}

/**
 * Lance le flow OAuth Meta pour connecter un compte Instagram personnel.
 * Redirige vers Meta puis revient sur /?social_connected=instagram
 */
export async function initiateInstagramOAuth(): Promise<void> {
  const authHeaders = await getAuthHeader();
  const res = await fetch('/api/social/instagram/oauth/initiate', { method: 'POST', headers: authHeaders });
  if (!res.ok) throw new Error('Impossible d\'initier la connexion Instagram');
  const { authUrl } = await res.json();
  window.location.href = authUrl;
}

/**
 * Upload une image (data URL base64) vers Supabase Storage via le serveur Express.
 * Retourne l'URL publique HTTPS nécessaire pour l'API Meta.
 */
export async function uploadImageForPublishing(
  imageDataUrl: string,
  projectId?: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const res = await fetch('/api/social/instagram/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: imageDataUrl, projectId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload échoué');
  }
  const data = await res.json();
  return { publicUrl: data.publicUrl, storagePath: data.storagePath };
}

/**
 * Publie une image sur Instagram via le proxy Express.
 * @param imageDataUrl - Data URL base64 de l'image (retourné par captureImage())
 */
export async function publishToInstagram(
  imageDataUrl: string,
  options: PublishOptions,
  projectId?: string
): Promise<PublishResult> {
  // 1. Upload de l'image vers Supabase Storage
  let publicUrl: string;
  let storagePath: string;
  try {
    ({ publicUrl, storagePath } = await uploadImageForPublishing(imageDataUrl, projectId));
  } catch (e) {
    return { success: false, error: `Upload image: ${e instanceof Error ? e.message : 'Erreur'}` };
  }

  // 2. Construire la caption finale (texte + hashtags + altText)
  const captionWithHashtags = [
    options.caption,
    options.hashtags.length > 0 ? '\n\n' + options.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ') : '',
    options.altText ? `\n\n[Description de l'image : ${options.altText}]` : '',
  ].filter(Boolean).join('');

  // 3. Appel publication via Express
  const res = await fetch('/api/social/instagram/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: publicUrl,
      caption: captionWithHashtags,
      accountId: options.accountId,
      storagePath,
      userTags: options.userTags,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error || 'Publication échouée' };
  }

  return { success: true, postId: data.postId, postUrl: data.postUrl };
}

/**
 * Upload une série d'images (data URLs base64) vers Supabase Storage.
 * Appelle onProgress à chaque image uploadée.
 */
export async function uploadCarouselImages(
  imagesDataUrls: string[],
  projectId?: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ imageUrls: string[]; storagePaths: string[] }> {
  const imageUrls: string[] = [];
  const storagePaths: string[] = [];
  const total = imagesDataUrls.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total);
    const { publicUrl, storagePath } = await uploadImageForPublishing(imagesDataUrls[i], projectId);
    imageUrls.push(publicUrl);
    storagePaths.push(storagePath);
  }

  return { imageUrls, storagePaths };
}

/**
 * Publie un carrousel d'images (2 à 10 slides) sur Instagram via le proxy Express.
 */
export async function publishCarouselToInstagram(
  imageUrls: string[],
  storagePaths: string[],
  options: PublishOptions
): Promise<PublishResult> {
  const captionWithHashtags = [
    options.caption,
    options.hashtags.length > 0 ? '\n\n' + options.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ') : '',
    options.altText ? `\n\n[Description du carrousel : ${options.altText}]` : '',
  ].filter(Boolean).join('');

  const res = await fetch('/api/social/instagram/publish-carousel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrls,
      storagePaths,
      caption: captionWithHashtags,
      accountId: options.accountId,
      userTags: options.userTags,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error || 'Publication du carrousel échouée' };
  }

  return { success: true, postId: data.postId, postUrl: data.postUrl };
}

/**
 * Récupère les comptes Instagram disponibles (compte par défaut + comptes personnels).
 */
export async function getInstagramAccounts(): Promise<SocialAccount[]> {
  const authHeaders = await getAuthHeader();
  const res = await fetch('/api/social/accounts', { headers: authHeaders });
  if (!res.ok) return [];
  const { accounts } = await res.json();
  return (accounts as SocialAccount[]).filter(a => a.platform === 'instagram');
}

// ── Methodes Modération Instagram ─────────────────────────────────────────────

export async function getInstagramMedia(accountId: string) {
  const res = await fetch(`/api/social/instagram/media?accountId=${accountId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors de la récupération des posts');
  }
  return res.json();
}

export async function getInstagramComments(mediaId: string, accountId: string) {
  const res = await fetch(`/api/social/instagram/media/${mediaId}/comments?accountId=${accountId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors de la récupération des commentaires');
  }
  return res.json();
}

export async function replyToInstagramComment(commentId: string, accountId: string, message: string) {
  const res = await fetch(`/api/social/instagram/comments/${commentId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, message })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors de la réponse au commentaire');
  }
  return res.json();
}

export async function postInstagramComment(mediaId: string, accountId: string, message: string) {
  const res = await fetch(`/api/social/instagram/media/${mediaId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, message })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors de l\'envoi du commentaire');
  }
  return res.json();
}

export async function toggleHideInstagramComment(commentId: string, accountId: string, hide: boolean) {
  const res = await fetch(`/api/social/instagram/comments/${commentId}/hide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, hide })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors du masquage/démasquage du commentaire');
  }
  return res.json();
}

export async function deleteInstagramComment(commentId: string, accountId: string) {
  const res = await fetch(`/api/social/instagram/comments/${commentId}?accountId=${accountId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors de la suppression du commentaire');
  }
  return res.json();
}
