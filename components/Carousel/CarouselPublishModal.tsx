import React, { useState, useEffect, useCallback } from 'react';
import { CarouselSlide } from './types';
import { renderCarouselSlidesToDataUrls } from './exportUtils';
import {
  getInstagramAccounts,
  uploadCarouselImages,
  publishCarouselToInstagram,
} from '../../services/instagramService';
import { savePublicationRecord } from '../../services/socialPublishing';
import { SocialAccount, PublishOptions } from '../../types';
import { X, CheckCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface CarouselPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: CarouselSlide[];
  mediaName: string;
  projectTitle: string;
  user: any;
}

const MAX_CAPTION_LENGTH = 2200;
const SUGGESTED_HASHTAGS = ['RadioCauseCommune', 'CauseCommune', '931FM', 'LibreAToi', 'RadioLocale', 'Podcast'];

type PublishStep = 'idle' | 'rendering' | 'uploading' | 'publishing' | 'success' | 'error';

export const CarouselPublishModal: React.FC<CarouselPublishModalProps> = ({
  isOpen,
  onClose,
  slides,
  mediaName,
  projectTitle,
  user,
}) => {
  const [caption, setCaption] = useState(
    projectTitle ? `${projectTitle}\n\nRetrouvez nos émissions sur Cause Commune 93.1 FM et sur causecommune.fm` : ''
  );
  const [altText, setAltText] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['RadioCauseCommune', 'CauseCommune']);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('default');
  const [step, setStep] = useState<PublishStep>('idle');
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: slides.length });
  const [postResult, setPostResult] = useState<{ postUrl?: string; error?: string } | null>(null);

  // Mettre à jour le texte par défaut quand le titre change
  useEffect(() => {
    if (projectTitle && !caption) {
      setCaption(`${projectTitle}\n\nRetrouvez nos émissions sur Cause Commune 93.1 FM et sur causecommune.fm`);
    }
  }, [projectTitle]);

  // Charger les comptes
  const loadAccounts = useCallback(async () => {
    try {
      const fetched = await getInstagramAccounts();
      setAccounts(fetched);
    } catch (e) {
      console.warn('Impossible de charger les comptes Instagram:', e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setStep('idle');
      setPostResult(null);
    }
  }, [isOpen, loadAccounts]);

  if (!isOpen) return null;

  const isValidSlideCount = slides.length >= 2 && slides.length <= 10;

  const addHashtag = (tagToAdd?: string) => {
    const raw = tagToAdd || hashtagInput;
    const tag = raw.trim().replace(/^#+/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
    if (!tagToAdd) setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((h) => h !== tag));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    }
  };

  const handlePublish = async () => {
    if (!isValidSlideCount) return;

    setPostResult(null);
    setStep('rendering');
    setProgress({ current: 0, total: slides.length });

    try {
      // 1. Rendu des slides en images Base64
      const dataUrls = await renderCarouselSlidesToDataUrls(
        slides,
        mediaName,
        (current, total) => setProgress({ current, total })
      );

      // 2. Upload des images vers Supabase Storage
      setStep('uploading');
      setProgress({ current: 0, total: dataUrls.length });
      const { imageUrls, storagePaths } = await uploadCarouselImages(
        dataUrls,
        undefined,
        (current, total) => setProgress({ current, total })
      );

      // 3. Publication via l'API Instagram
      setStep('publishing');
      const options: PublishOptions = {
        platform: 'instagram',
        caption: caption.trim(),
        hashtags,
        altText: altText.trim(),
        accountId: selectedAccountId,
      };

      const result = await publishCarouselToInstagram(imageUrls, storagePaths, options);

      if (!result.success) {
        setStep('error');
        setPostResult({ error: result.error || 'Échec de la publication du carrousel' });
        return;
      }

      // 4. Enregistrement dans l'historique
      if (user) {
        savePublicationRecord(result, options, undefined, 'carousel').catch((err) =>
          console.warn('Historique non enregistré:', err)
        );
      }

      setStep('success');
      setPostResult({ postUrl: result.postUrl });
    } catch (err) {
      console.error('Erreur lors de la publication du carrousel:', err);
      setStep('error');
      setPostResult({
        error: err instanceof Error ? err.message : 'Une erreur inattendue est survenue',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFAE5] border-[3px] border-[#0F0F0F] shadow-[8px_8px_0px_#0F0F0F] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-[3px] border-[#0F0F0F] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#D20A33] text-white border-[2px] border-[#0F0F0F]">
              <InstagramIcon size={20} />
            </div>
            <div>
              <h2 className="font-syne font-black text-lg tracking-tight uppercase">
                Publier le Carrousel sur Instagram
              </h2>
              <p className="font-roboto-condensed text-xs text-gray-500 font-bold">
                {slides.length} diapositives prêtes pour Instagram (1080×1080)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={step === 'rendering' || step === 'uploading' || step === 'publishing'}
            className="p-1 border-[2px] border-[#0F0F0F] bg-[#FFFAE5] hover:bg-black hover:text-white transition-colors disabled:opacity-30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps du modal avec scroll si besoin */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Alerte si nombre de slides non valide */}
          {!isValidSlideCount && (
            <div className="flex items-start gap-3 p-3 bg-red-100 border-[2px] border-[#D20A33] text-black">
              <AlertTriangle className="text-[#D20A33] shrink-0 mt-0.5" size={18} />
              <div className="text-xs font-roboto-condensed">
                <p className="font-black uppercase text-[#D20A33]">Format non conforme pour Instagram</p>
                <p>
                  Un carrousel Instagram doit contenir entre <strong>2 et 10 diapositives</strong>. 
                  Votre projet actuel en compte <strong>{slides.length}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Compte cible */}
          <div>
            <label className="block text-xs font-roboto-condensed font-black uppercase mb-1.5 text-gray-700">
              Compte Instagram de destination
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={step !== 'idle' && step !== 'error'}
              className="w-full bg-white border-[2px] border-[#0F0F0F] px-3 py-2 text-sm font-roboto-condensed font-bold focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
            >
              <option value="default">Radio Cause Commune 93.1 FM (Compte officiel)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  @{acc.account_name} ({acc.account_id})
                </option>
              ))}
            </select>
          </div>

          {/* Légende / Caption */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-roboto-condensed font-black uppercase text-gray-700">
                Légende de la publication
              </label>
              <span
                className={`text-xs font-roboto-condensed font-bold ${
                  caption.length > MAX_CAPTION_LENGTH ? 'text-[#D20A33]' : 'text-gray-500'
                }`}
              >
                {caption.length} / {MAX_CAPTION_LENGTH}
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={step !== 'idle' && step !== 'error'}
              rows={4}
              maxLength={MAX_CAPTION_LENGTH}
              placeholder="Écrivez le texte qui accompagnera votre carrousel..."
              className="w-full bg-white border-[2px] border-[#0F0F0F] p-3 text-sm font-roboto-condensed resize-none focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-roboto-condensed font-black uppercase mb-1.5 text-gray-700">
              Hashtags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                disabled={step !== 'idle' && step !== 'error'}
                placeholder="Ajouter un hashtag (ex: emission, culture)..."
                className="flex-1 bg-white border-[2px] border-[#0F0F0F] px-3 py-1.5 text-sm font-roboto-condensed focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
              />
              <button
                type="button"
                onClick={() => addHashtag()}
                disabled={step !== 'idle' && step !== 'error' || !hashtagInput.trim()}
                className="px-4 py-1.5 bg-black text-white font-roboto-condensed font-black text-sm uppercase hover:bg-[#D20A33] transition-colors disabled:opacity-30"
              >
                Ajouter
              </button>
            </div>

            {/* Suggestions rapides */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="text-[11px] font-roboto-condensed font-bold text-gray-500 self-center mr-1">
                Suggestions :
              </span>
              {SUGGESTED_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addHashtag(tag)}
                  disabled={hashtags.includes(tag) || (step !== 'idle' && step !== 'error')}
                  className={`text-[11px] font-roboto-condensed font-bold px-2 py-0.5 border border-black/30 transition-colors ${
                    hashtags.includes(tag)
                      ? 'bg-black/10 text-gray-400 cursor-default'
                      : 'bg-white hover:bg-[#FFFAE5]'
                  }`}
                >
                  +{tag}
                </button>
              ))}
            </div>

            {/* Tags ajoutés */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-white border-[2px] border-[#0F0F0F]">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-[#A3FF00] border-[2px] border-black px-2 py-0.5 text-xs font-roboto-condensed font-black"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      disabled={step !== 'idle' && step !== 'error'}
                      className="hover:text-[#D20A33] font-black text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Texte alternatif (Accessibilité) */}
          <div>
            <label className="block text-xs font-roboto-condensed font-black uppercase mb-1 text-gray-700">
              Texte Alternatif <span className="font-normal text-gray-400 normal-case">(Recommandé pour l'accessibilité)</span>
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              disabled={step !== 'idle' && step !== 'error'}
              placeholder="Description synthétique des diapositives pour les personnes malvoyantes..."
              className="w-full bg-white border-[2px] border-[#0F0F0F] px-3 py-1.5 text-sm font-roboto-condensed focus:outline-none focus:ring-2 focus:ring-[#D20A33]"
            />
          </div>

          {/* Suivi de progression */}
          {(step === 'rendering' || step === 'uploading' || step === 'publishing') && (
            <div className="p-4 bg-white border-[2px] border-[#0F0F0F] space-y-2">
              <div className="flex items-center justify-between text-xs font-roboto-condensed font-black uppercase">
                <span className="flex items-center gap-2 text-black">
                  <Loader2 className="animate-spin text-[#D20A33]" size={16} />
                  {step === 'rendering' && `Étape 1/3 : Rendu des visuels (${progress.current}/${progress.total})...`}
                  {step === 'uploading' && `Étape 2/3 : Téléversement des diapositives (${progress.current}/${progress.total})...`}
                  {step === 'publishing' && `Étape 3/3 : Création de l'album et publication Instagram...`}
                </span>
                <span>
                  {step === 'publishing'
                    ? '90%'
                    : `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%`}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 border border-black overflow-hidden">
                <div
                  className="h-full bg-[#00F0FF] transition-all duration-300"
                  style={{
                    width:
                      step === 'publishing'
                        ? '90%'
                        : `${(progress.current / Math.max(progress.total, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Résultat succès */}
          {step === 'success' && postResult?.postUrl && (
            <div className="p-4 bg-[#A3FF00]/20 border-[3px] border-[#0F0F0F] space-y-3">
              <div className="flex items-center gap-2 text-black">
                <CheckCircle size={22} className="text-black" />
                <h3 className="font-syne font-black text-sm uppercase">
                  Carrousel publié avec succès sur Instagram !
                </h3>
              </div>
              <p className="text-xs font-roboto-condensed text-gray-700">
                Votre carrousel de {slides.length} diapositives est désormais en ligne.
              </p>
              <a
                href={postResult.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-roboto-condensed font-black text-xs uppercase hover:bg-[#D20A33] transition-colors"
              >
                Voir le post sur Instagram <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Résultat erreur */}
          {step === 'error' && postResult?.error && (
            <div className="p-4 bg-red-100 border-[3px] border-[#D20A33] space-y-2">
              <div className="flex items-center gap-2 text-[#D20A33]">
                <AlertTriangle size={20} />
                <h3 className="font-syne font-black text-sm uppercase">Erreur de publication</h3>
              </div>
              <p className="text-xs font-roboto-condensed text-gray-800 break-words">
                {postResult.error}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t-[3px] border-[#0F0F0F] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={step === 'rendering' || step === 'uploading' || step === 'publishing'}
            className="px-4 py-2 border-[2px] border-[#0F0F0F] bg-[#FFFAE5] font-roboto-condensed font-bold text-xs uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-40"
          >
            {step === 'success' ? 'Fermer' : 'Annuler'}
          </button>

          {step !== 'success' ? (
            <button
              type="button"
              onClick={handlePublish}
              disabled={
                !isValidSlideCount ||
                step === 'rendering' ||
                step === 'uploading' ||
                step === 'publishing'
              }
              className="flex items-center gap-2 px-5 py-2 bg-[#D20A33] text-white font-roboto-condensed font-black text-xs uppercase border-[2px] border-[#0F0F0F] shadow-[3px_3px_0px_#0F0F0F] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer"
            >
              <InstagramIcon size={16} />
              {step === 'error' ? 'Réessayer la publication' : 'Publier sur Instagram'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#A3FF00] text-black font-roboto-condensed font-black text-xs uppercase border-[2px] border-[#0F0F0F] shadow-[3px_3px_0px_#0F0F0F]"
            >
              Terminé
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
