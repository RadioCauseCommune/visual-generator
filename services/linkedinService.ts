/**
 * Service LinkedIn — appels vers les endpoints Express proxy
 * Flow : OAuth → upload image binaire → ugcPost
 * Contrairement à Instagram, LinkedIn n'accepte pas les URLs publiques :
 * l'image est envoyée directement en binaire via un upload en deux étapes.
 */

import { PublishOptions, PublishResult, SocialAccount } from '../types';
import { supabase } from './supabase';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { 'Authorization': `Bearer ${session.access_token}` };
}

/**
 * Lance le flow OAuth LinkedIn.
 * Redirige vers LinkedIn puis revient sur /?social_connected=linkedin
 */
export async function initiateLinkedInOAuth(): Promise<void> {
  const authHeaders = await getAuthHeader();
  const res = await fetch('/api/social/linkedin/oauth/initiate', { method: 'POST', headers: authHeaders });
  if (!res.ok) throw new Error('Impossible d\'initier la connexion LinkedIn');
  const { authUrl } = await res.json();
  window.location.href = authUrl;
}

/**
 * Publie une image sur LinkedIn via le proxy Express.
 * L'image est passée en data URL base64 (retourné par captureImage()).
 * Le serveur Express gère l'upload binaire vers l'API LinkedIn.
 */
export async function publishToLinkedIn(
  imageDataUrl: string,
  options: PublishOptions,
  _projectId?: string
): Promise<PublishResult> {
  if (!options.accountId || options.accountId === 'default') {
    return { success: false, error: 'LinkedIn requiert un compte connecté. Cliquez sur "Connecter mon LinkedIn".' };
  }

  const captionWithHashtags = [
    options.caption,
    options.hashtags.length > 0
      ? '\n\n' + options.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')
      : '',
  ].filter(Boolean).join('');

  const res = await fetch('/api/social/linkedin/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: imageDataUrl,
      caption: captionWithHashtags,
      accountId: options.accountId,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error || 'Publication LinkedIn échouée' };
  }

  return { success: true, postId: data.postId, postUrl: data.postUrl };
}

/**
 * Récupère les comptes LinkedIn connectés de l'utilisateur.
 */
export async function getLinkedInAccounts(): Promise<SocialAccount[]> {
  const authHeaders = await getAuthHeader();
  const res = await fetch('/api/social/accounts', { headers: authHeaders });
  if (!res.ok) return [];
  const { accounts } = await res.json();
  return (accounts as SocialAccount[]).filter(a => a.platform === 'linkedin');
}
