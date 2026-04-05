/**
 * Service de publication sociale — abstraction partagée Instagram / LinkedIn
 * Gère le flow complet : export → upload → publish → historique
 */

import { PublishOptions, PublishResult, PublicationRecord, SocialPlatform } from '../types';
import { publishToInstagram } from './instagramService';
import { publishToLinkedIn } from './linkedinService';
import { supabase } from './supabase';

/**
 * Publie un visuel sur la plateforme choisie.
 * Point d'entrée unique pour Instagram (et futur LinkedIn).
 * @param imageDataUrl - Data URL base64 de l'image (retourné par captureImage())
 */
export async function publishVisual(
  platform: SocialPlatform,
  imageDataUrl: string,
  options: PublishOptions,
  projectId?: string
): Promise<PublishResult> {
  switch (platform) {
    case 'instagram':
      return publishToInstagram(imageDataUrl, options, projectId);
    case 'linkedin':
      return publishToLinkedIn(imageDataUrl, options, projectId);
    default:
      return { success: false, error: `Plateforme non supportée: ${platform}` };
  }
}

/**
 * Sauvegarde une publication dans l'historique via le serveur Express.
 */
export async function savePublicationRecord(
  platform: SocialPlatform,
  result: PublishResult,
  options: PublishOptions,
  accountName?: string,
  projectId?: string
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch('/api/social/publications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        platform,
        account_id: options.accountId !== 'default' ? options.accountId : undefined,
        account_name: accountName,
        caption: options.caption,
        platform_post_id: result.postId,
        post_url: result.postUrl,
        status: result.success ? 'published' : 'failed',
        error_message: result.error,
        project_id: projectId,
      }),
    });
  } catch (e) {
    console.warn('Impossible de sauvegarder l\'historique de publication:', e);
  }
}

/**
 * Récupère les publications récentes de l'utilisateur.
 */
export async function getPublicationHistory(): Promise<PublicationRecord[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return [];

    const res = await fetch('/api/social/publications', {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!res.ok) return [];
    const { publications } = await res.json();
    return publications || [];
  } catch {
    return [];
  }
}
