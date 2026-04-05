/**
 * PublishPanel — panneau de publication directe sur Instagram
 * Visible uniquement quand l'asset type est de type Instagram (ou LinkedIn en phase 3)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AssetType, PublishOptions, SocialAccount, isInstagramAsset } from '../../types';
import { publishVisual, savePublicationRecord } from '../../services/socialPublishing';
import { getInstagramAccounts, initiateInstagramOAuth } from '../../services/instagramService';

interface PublishPanelProps {
  assetType: AssetType;
  /** Fonction qui capture le canvas et retourne une data URL base64 (depuis useProject) */
  captureImage: () => Promise<string | null>;
  projectId?: string;
  user: any;
}

const MAX_CAPTION_LENGTH = 2200;

const PublishPanel: React.FC<PublishPanelProps> = ({ assetType, captureImage, projectId, user }) => {
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('default');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'uploading' | 'publishing' | 'success' | 'error'>('idle');
  const [publishResult, setPublishResult] = useState<{ postUrl?: string; error?: string } | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const isInstagram = isInstagramAsset(assetType);

  const loadAccounts = useCallback(async () => {
    if (!isInstagram) return;
    setIsLoadingAccounts(true);
    try {
      const fetched = await getInstagramAccounts();
      setAccounts(fetched);
      // Sélectionner le compte par défaut si disponible
      const defaultAcc = fetched.find(a => a.is_default);
      if (defaultAcc) setSelectedAccountId('default');
    } catch {
      // silencieux
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [isInstagram]);

  useEffect(() => {
    if (user) loadAccounts();
  }, [user, loadAccounts]);

  // Vérifier si on revient d'un OAuth Meta
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('social_connected') === 'instagram') {
      loadAccounts();
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('social_error')) {
      setPublishResult({ error: `Erreur connexion: ${params.get('social_error')}` });
      setPublishStatus('error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadAccounts]);

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#+/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(h => h !== tag));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    setIsPublishing(true);
    setPublishStatus('uploading');
    setPublishResult(null);

    try {
      // Capturer le canvas en data URL PNG
      const dataUrl = await captureImage();
      if (!dataUrl) {
        setPublishStatus('error');
        setPublishResult({ error: 'Impossible de capturer le visuel' });
        return;
      }

      setPublishStatus('publishing');

      const options: PublishOptions = {
        caption,
        hashtags,
        accountId: selectedAccountId,
      };

      const result = await publishVisual('instagram', dataUrl, options, projectId);

      // Sauvegarder dans l'historique
      const accountName = accounts.find(a => a.account_id === selectedAccountId)?.account_name || 'Radio Cause Commune';
      await savePublicationRecord('instagram', result, options, accountName, projectId);

      if (result.success) {
        setPublishStatus('success');
        setPublishResult({ postUrl: result.postUrl });
      } else {
        setPublishStatus('error');
        setPublishResult({ error: result.error });
      }
    } catch (e) {
      setPublishStatus('error');
      setPublishResult({ error: e instanceof Error ? e.message : 'Erreur inconnue' });
    } finally {
      setIsPublishing(false);
    }
  };

  const resetPanel = () => {
    setPublishStatus('idle');
    setPublishResult(null);
  };

  if (!isInstagram) return null;

  return (
    <section className="space-y-3">
      <h3 className="font-syne font-black text-lg mb-2 uppercase underline decoration-[#D20A33] decoration-4">
        Publier sur Instagram
      </h3>

      {!user ? (
        <p className="text-xs text-gray-500 italic">Connectez-vous pour publier directement sur Instagram.</p>
      ) : (
        <div className="space-y-3">
          {/* Sélection du compte */}
          <div>
            <label className="block text-xs font-roboto-condensed font-bold uppercase mb-1">Compte</label>
            {isLoadingAccounts ? (
              <p className="text-xs text-gray-400 italic">Chargement des comptes...</p>
            ) : (
              <div className="space-y-1">
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full border-2 border-black px-2 py-1 text-sm font-roboto-condensed focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
                >
                  <option value="default">Radio Cause Commune (défaut)</option>
                  {accounts.filter(a => !a.is_default).map(acc => (
                    <option key={acc.account_id} value={acc.account_id}>
                      {acc.account_name} (@{acc.account_id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={initiateInstagramOAuth}
                  className="text-xs text-[#D20A33] underline hover:no-underline font-roboto-condensed"
                >
                  + Connecter mon compte Instagram
                </button>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-roboto-condensed font-bold uppercase mb-1">
              Caption{' '}
              <span className={`font-normal ${caption.length > MAX_CAPTION_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                ({caption.length}/{MAX_CAPTION_LENGTH})
              </span>
            </label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={MAX_CAPTION_LENGTH}
              rows={3}
              placeholder="Décrivez votre publication..."
              className="w-full border-2 border-black px-2 py-1 text-sm font-roboto-condensed resize-none focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-roboto-condensed font-bold uppercase mb-1">Hashtags</label>
            <div className="flex gap-1 mb-1">
              <input
                type="text"
                value={hashtagInput}
                onChange={e => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                placeholder="#radio #musique"
                className="flex-1 border-2 border-black px-2 py-1 text-sm font-roboto-condensed focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
              />
              <button
                onClick={addHashtag}
                className="px-3 border-2 border-black bg-black text-white font-roboto-condensed font-black text-sm hover:bg-[#D20A33] hover:border-[#D20A33] transition-colors"
              >
                +
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hashtags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-[#A3FF00] border-2 border-black px-2 py-0.5 text-xs font-roboto-condensed font-bold"
                  >
                    #{tag}
                    <button
                      onClick={() => removeHashtag(tag)}
                      className="text-black hover:text-red-600 font-black leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Feedback publication */}
          {publishStatus === 'success' && publishResult?.postUrl && (
            <div className="border-2 border-[#A3FF00] bg-[#A3FF00]/10 p-2 text-sm font-roboto-condensed">
              <p className="font-bold">Publication réussie !</p>
              <a
                href={publishResult.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D20A33] underline break-all"
              >
                Voir le post Instagram
              </a>
              <button onClick={resetPanel} className="block mt-1 text-xs text-gray-500 underline">
                Nouvelle publication
              </button>
            </div>
          )}

          {publishStatus === 'error' && publishResult?.error && (
            <div className="border-2 border-[#D20A33] bg-red-50 p-2 text-sm font-roboto-condensed text-[#D20A33]">
              <p className="font-bold">Erreur</p>
              <p className="text-xs">{publishResult.error}</p>
              <button onClick={resetPanel} className="block mt-1 text-xs underline">
                Réessayer
              </button>
            </div>
          )}

          {/* Bouton publier */}
          {publishStatus !== 'success' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing || caption.length > MAX_CAPTION_LENGTH}
              className="w-full py-2 bg-[#D20A33] border-2 border-black text-white font-syne font-black uppercase text-sm neo-shadow-sm hover:neo-shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  {publishStatus === 'uploading' ? 'Préparation...' : 'Publication...'}
                </>
              ) : (
                'Publier maintenant'
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default PublishPanel;
