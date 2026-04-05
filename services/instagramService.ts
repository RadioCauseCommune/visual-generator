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

  // 2. Construire la caption finale (texte + hashtags)
  const captionWithHashtags = [
    options.caption,
    options.hashtags.length > 0 ? '\n\n' + options.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ') : '',
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
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error || 'Publication échouée' };
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
