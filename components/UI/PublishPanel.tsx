/**
 * PublishPanel — panneau de publication directe sur Instagram et LinkedIn
 * Visible conditionnellement selon l'asset type sélectionné.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AssetType, PublishOptions, SocialAccount, SocialPlatform, isInstagramAsset, isLinkedInAsset } from '../../types';
import { publishVisual, savePublicationRecord } from '../../services/socialPublishing';
import { getInstagramAccounts, initiateInstagramOAuth } from '../../services/instagramService';
import { getLinkedInAccounts, initiateLinkedInOAuth } from '../../services/linkedinService';

interface PublishPanelProps {
  assetType: AssetType;
  /** Fonction qui capture le canvas et retourne une data URL base64 (depuis useProject) */
  captureImage: () => Promise<string | null>;
  projectId?: string;
  user: any;
}

const MAX_CAPTION_LENGTH = 2200;

type PublishState = 'idle' | 'uploading' | 'publishing' | 'success' | 'error';

// ── Sous-composant partagé pour caption + hashtags ────────────────────────────
const CaptionHashtagFields: React.FC<{
  caption: string;
  setCaption: (v: string) => void;
  hashtagInput: string;
  setHashtagInput: (v: string) => void;
  hashtags: string[];
  addHashtag: () => void;
  removeHashtag: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  maxLength?: number;
}> = ({ caption, setCaption, hashtagInput, setHashtagInput, hashtags, addHashtag, removeHashtag, onKeyDown, maxLength = MAX_CAPTION_LENGTH }) => (
  <>
    <div>
      <label className="block text-xs font-roboto-condensed font-bold uppercase mb-1">
        Caption{' '}
        <span className={`font-normal ${caption.length > maxLength ? 'text-red-500' : 'text-gray-400'}`}>
          ({caption.length}/{maxLength})
        </span>
      </label>
      <textarea
        value={caption}
        onChange={e => setCaption(e.target.value)}
        maxLength={maxLength}
        rows={3}
        placeholder="Décrivez votre publication..."
        className="w-full border-2 border-black px-2 py-1 text-sm font-roboto-condensed resize-none focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
      />
    </div>
    <div>
      <label className="block text-xs font-roboto-condensed font-bold uppercase mb-1">Hashtags</label>
      <div className="flex gap-1 mb-1">
        <input
          type="text"
          value={hashtagInput}
          onChange={e => setHashtagInput(e.target.value)}
          onKeyDown={onKeyDown}
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
              <button onClick={() => removeHashtag(tag)} className="text-black hover:text-red-600 font-black leading-none">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  </>
);

// ── Sous-composant feedback publication ───────────────────────────────────────
const PublishFeedback: React.FC<{
  status: PublishState;
  postUrl?: string;
  error?: string;
  onReset: () => void;
  platformLabel: string;
}> = ({ status, postUrl, error, onReset, platformLabel }) => {
  if (status === 'success' && postUrl) return (
    <div className="border-2 border-[#A3FF00] bg-[#A3FF00]/10 p-2 text-sm font-roboto-condensed">
      <p className="font-bold">Publication réussie !</p>
      <a href={postUrl} target="_blank" rel="noopener noreferrer" className="text-[#D20A33] underline break-all">
        Voir le post {platformLabel}
      </a>
      <button onClick={onReset} className="block mt-1 text-xs text-gray-500 underline">Nouvelle publication</button>
    </div>
  );
  if (status === 'error' && error) return (
    <div className="border-2 border-[#D20A33] bg-red-50 p-2 text-sm font-roboto-condensed text-[#D20A33]">
      <p className="font-bold">Erreur</p>
      <p className="text-xs">{error}</p>
      <button onClick={onReset} className="block mt-1 text-xs underline">Réessayer</button>
    </div>
  );
  return null;
};

// ── Panel Instagram ───────────────────────────────────────────────────────────
const InstagramPanel: React.FC<{ captureImage: () => Promise<string | null>; projectId?: string; user: any }> = ({
  captureImage, projectId, user
}) => {
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('default');
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState<PublishState>('idle');
  const [result, setResult] = useState<{ postUrl?: string; error?: string } | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const loadAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const fetched = await getInstagramAccounts();
      setAccounts(fetched);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => { if (user) loadAccounts(); }, [user, loadAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('social_connected') === 'instagram') {
      loadAccounts();
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('social_error')) {
      setResult({ error: `Erreur connexion: ${params.get('social_error')}` });
      setStatus('error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadAccounts]);

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#+/, '');
    if (tag && !hashtags.includes(tag)) setHashtags(prev => [...prev, tag]);
    setHashtagInput('');
  };
  const removeHashtag = (tag: string) => setHashtags(prev => prev.filter(h => h !== tag));
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') { e.preventDefault(); addHashtag(); }
  };

  const handlePublish = async () => {
    setIsPublishing(true); setStatus('uploading'); setResult(null);
    try {
      const dataUrl = await captureImage();
      if (!dataUrl) { setStatus('error'); setResult({ error: 'Impossible de capturer le visuel' }); return; }
      setStatus('publishing');
      const options: PublishOptions = { caption, hashtags, accountId: selectedAccountId };
      const res = await publishVisual('instagram', dataUrl, options, projectId);
      const accountName = accounts.find(a => a.account_id === selectedAccountId)?.account_name || 'Radio Cause Commune';
      await savePublicationRecord('instagram', res, options, accountName, projectId);
      setStatus(res.success ? 'success' : 'error');
      setResult(res.success ? { postUrl: res.postUrl } : { error: res.error });
    } catch (e) {
      setStatus('error');
      setResult({ error: e instanceof Error ? e.message : 'Erreur inconnue' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Compte */}
      <div>
        <label className="block text-xs font-roboto-condensed font-bold uppercase mb-1">Compte</label>
        {isLoadingAccounts ? (
          <p className="text-xs text-gray-400 italic">Chargement...</p>
        ) : (
          <div className="space-y-1">
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full border-2 border-black px-2 py-1 text-sm font-roboto-condensed focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
            >
              <option value="default">Radio Cause Commune (défaut)</option>
              {accounts.filter(a => !a.is_default).map(acc => (
                <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
              ))}
            </select>
            <button onClick={initiateInstagramOAuth} className="text-xs text-[#D20A33] underline hover:no-underline font-roboto-condensed">
              + Connecter mon compte Instagram
            </button>
          </div>
        )}
      </div>

      <CaptionHashtagFields
        caption={caption} setCaption={setCaption}
        hashtagInput={hashtagInput} setHashtagInput={setHashtagInput}
        hashtags={hashtags} addHashtag={addHashtag}
        removeHashtag={removeHashtag} onKeyDown={handleKeyDown}
      />

      <PublishFeedback status={status} postUrl={result?.postUrl} error={result?.error} onReset={() => { setStatus('idle'); setResult(null); }} platformLabel="Instagram" />

      {status !== 'success' && (
        <button
          onClick={handlePublish}
          disabled={isPublishing || caption.length > MAX_CAPTION_LENGTH}
          className="w-full py-2 bg-[#D20A33] border-2 border-black text-white font-syne font-black uppercase text-sm neo-shadow-sm hover:neo-shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPublishing ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />{status === 'uploading' ? 'Préparation...' : 'Publication...'}</>
          ) : 'Publier sur Instagram'}
        </button>
      )}
    </div>
  );
};

// ── Panel LinkedIn ────────────────────────────────────────────────────────────
// LinkedIn ne dispose pas de compte par défaut — connexion OAuth personnelle obligatoire.
const LinkedInPanel: React.FC<{ captureImage: () => Promise<string | null>; projectId?: string; user: any }> = ({
  captureImage, projectId, user
}) => {
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState<PublishState>('idle');
  const [result, setResult] = useState<{ postUrl?: string; error?: string } | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // LinkedIn : 3000 caractères max
  const MAX_LI_CAPTION = 3000;

  const loadAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const fetched = await getLinkedInAccounts();
      setAccounts(fetched);
      if (fetched.length > 0) setSelectedAccountId(fetched[0].account_id);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => { if (user) loadAccounts(); }, [user, loadAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('social_connected') === 'linkedin') {
      loadAccounts();
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('social_error')) {
      setResult({ error: `Erreur connexion: ${params.get('social_error')}` });
      setStatus('error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadAccounts]);

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#+/, '');
    if (tag && !hashtags.includes(tag)) setHashtags(prev => [...prev, tag]);
    setHashtagInput('');
  };
  const removeHashtag = (tag: string) => setHashtags(prev => prev.filter(h => h !== tag));
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') { e.preventDefault(); addHashtag(); }
  };

  const handlePublish = async () => {
    if (!selectedAccountId) return;
    setIsPublishing(true); setStatus('uploading'); setResult(null);
    try {
      const dataUrl = await captureImage();
      if (!dataUrl) { setStatus('error'); setResult({ error: 'Impossible de capturer le visuel' }); return; }
      setStatus('publishing');
      const options: PublishOptions = { caption, hashtags, accountId: selectedAccountId };
      const res = await publishVisual('linkedin', dataUrl, options, projectId);
      const accountName = accounts.find(a => a.account_id === selectedAccountId)?.account_name;
      await savePublicationRecord('linkedin', res, options, accountName, projectId);
      setStatus(res.success ? 'success' : 'error');
      setResult(res.success ? { postUrl: res.postUrl } : { error: res.error });
    } catch (e) {
      setStatus('error');
      setResult({ error: e instanceof Error ? e.message : 'Erreur inconnue' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Compte */}
      <div>
        <label className="block text-xs font-roboto-condensed font-bold uppercase mb-1">Compte LinkedIn</label>
        {isLoadingAccounts ? (
          <p className="text-xs text-gray-400 italic">Chargement...</p>
        ) : accounts.length === 0 ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 italic">Aucun compte LinkedIn connecté.</p>
            <button
              onClick={initiateLinkedInOAuth}
              className="w-full py-1.5 border-2 border-[#0A66C2] text-[#0A66C2] font-roboto-condensed font-black text-sm uppercase hover:bg-[#0A66C2] hover:text-white transition-colors"
            >
              Connecter mon LinkedIn
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full border-2 border-black px-2 py-1 text-sm font-roboto-condensed focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
            >
              {accounts.map(acc => (
                <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
              ))}
            </select>
            <button onClick={initiateLinkedInOAuth} className="text-xs text-[#0A66C2] underline hover:no-underline font-roboto-condensed">
              + Connecter un autre compte
            </button>
          </div>
        )}
      </div>

      {accounts.length > 0 && (
        <>
          <CaptionHashtagFields
            caption={caption} setCaption={setCaption}
            hashtagInput={hashtagInput} setHashtagInput={setHashtagInput}
            hashtags={hashtags} addHashtag={addHashtag}
            removeHashtag={removeHashtag} onKeyDown={handleKeyDown}
            maxLength={MAX_LI_CAPTION}
          />

          <PublishFeedback status={status} postUrl={result?.postUrl} error={result?.error} onReset={() => { setStatus('idle'); setResult(null); }} platformLabel="LinkedIn" />

          {status !== 'success' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing || !selectedAccountId || caption.length > MAX_LI_CAPTION}
              className="w-full py-2 bg-[#0A66C2] border-2 border-black text-white font-syne font-black uppercase text-sm neo-shadow-sm hover:neo-shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />{status === 'uploading' ? 'Préparation...' : 'Publication...'}</>
              ) : 'Publier sur LinkedIn'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

// ── Composant principal ───────────────────────────────────────────────────────
const PublishPanel: React.FC<PublishPanelProps> = ({ assetType, captureImage, projectId, user }) => {
  const isInstagram = isInstagramAsset(assetType);
  const isLinkedIn = isLinkedInAsset(assetType);
  const platform: SocialPlatform | null = isInstagram ? 'instagram' : isLinkedIn ? 'linkedin' : null;

  if (!platform) return null;

  const title = platform === 'instagram' ? 'Publier sur Instagram' : 'Publier sur LinkedIn';
  const accentColor = platform === 'instagram' ? '#D20A33' : '#0A66C2';

  return (
    <section className="space-y-3">
      <h3
        className="font-syne font-black text-lg mb-2 uppercase underline decoration-4"
        style={{ textDecorationColor: accentColor }}
      >
        {title}
      </h3>

      {!user ? (
        <p className="text-xs text-gray-500 italic">Connectez-vous pour publier directement sur {platform === 'instagram' ? 'Instagram' : 'LinkedIn'}.</p>
      ) : platform === 'instagram' ? (
        <InstagramPanel captureImage={captureImage} projectId={projectId} user={user} />
      ) : (
        <LinkedInPanel captureImage={captureImage} projectId={projectId} user={user} />
      )}
    </section>
  );
};

export default PublishPanel;
