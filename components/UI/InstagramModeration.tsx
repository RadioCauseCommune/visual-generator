import React, { useState, useEffect } from 'react';
import { getInstagramAccounts, getInstagramMedia, getInstagramComments, replyToInstagramComment, postInstagramComment, toggleHideInstagramComment, deleteInstagramComment } from '../../services/instagramService';
import { SocialAccount } from '../../types';

interface InstagramModerationProps {
  onClose: () => void;
  user: any;
}

const InstagramModeration: React.FC<InstagramModerationProps> = ({ onClose, user }) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('default');
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Charger les comptes au montage
  useEffect(() => {
    if (user) {
      getInstagramAccounts()
        .then(setAccounts)
        .catch(err => console.error('Erreur accounts', err));
    }
  }, [user]);

  // Charger les posts quand le compte change
  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      setError(null);
      setSelectedMedia(null);
      setComments([]);
      try {
        const res = await getInstagramMedia(selectedAccountId);
        setMediaList(res.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingMedia(false);
      }
    };
    if (user) fetchMedia();
  }, [selectedAccountId, user]);

  // Charger les commentaires quand on sélectionne un post
  const handleSelectMedia = async (media: any) => {
    setSelectedMedia(media);
    setIsLoadingComments(true);
    setError(null);
    try {
      const res = await getInstagramComments(media.id, selectedAccountId);
      setComments(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleReply = async (commentId: string) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    
    setActionLoadingId(`reply_${commentId}`);
    try {
      await replyToInstagramComment(commentId, selectedAccountId, text);
      // Rafraichir les commentaires
      const res = await getInstagramComments(selectedMedia.id, selectedAccountId);
      setComments(res.data || []);
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePostComment = async () => {
    const text = newCommentText.trim();
    if (!text || !selectedMedia) return;

    setActionLoadingId('new_comment');
    try {
      await postInstagramComment(selectedMedia.id, selectedAccountId, text);
      const res = await getInstagramComments(selectedMedia.id, selectedAccountId);
      setComments(res.data || []);
      setNewCommentText('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleHide = async (commentId: string, currentHiddenStatus: boolean) => {
    setActionLoadingId(`hide_${commentId}`);
    try {
      await toggleHideInstagramComment(commentId, selectedAccountId, !currentHiddenStatus);
      const res = await getInstagramComments(selectedMedia.id, selectedAccountId);
      setComments(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire définitivement ?")) return;
    
    setActionLoadingId(`delete_${commentId}`);
    try {
      await deleteInstagramComment(commentId, selectedAccountId);
      const res = await getInstagramComments(selectedMedia.id, selectedAccountId);
      setComments(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderComment = (c: any, isReply = false) => {
    return (
      <div key={c.id} className={`p-3 neo-border-fine mb-2 ${isReply ? 'ml-8 bg-gray-50' : 'bg-white'} ${c.hidden ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start mb-1">
          <div>
            <span className="font-bold text-sm">@{c.username}</span>
            <span className="text-xs text-gray-500 ml-2">{new Date(c.timestamp).toLocaleString()}</span>
            {c.hidden && <span className="text-xs text-red-500 ml-2 font-bold uppercase">[Masqué]</span>}
          </div>
          <div className="flex gap-2">
            {!isReply && (
              <button 
                onClick={() => setReplyText(prev => ({ ...prev, [c.id]: prev[c.id] === undefined ? '' : undefined }))}
                className="text-xs font-bold text-blue-600 uppercase hover:underline"
              >
                Répondre
              </button>
            )}
            <button 
              onClick={() => handleToggleHide(c.id, c.hidden)}
              disabled={actionLoadingId === `hide_${c.id}`}
              className="text-xs font-bold text-gray-600 uppercase hover:underline disabled:opacity-50"
            >
              {c.hidden ? 'Démasquer' : 'Masquer'}
            </button>
            <button 
              onClick={() => handleDelete(c.id)}
              disabled={actionLoadingId === `delete_${c.id}`}
              className="text-xs font-bold text-red-600 uppercase hover:underline disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        </div>
        <p className="text-sm whitespace-pre-wrap">{c.text}</p>
        
        {/* Input de réponse */}
        {!isReply && replyText[c.id] !== undefined && (
          <div className="mt-2 flex gap-2">
            <input 
              type="text" 
              value={replyText[c.id] || ''} 
              onChange={e => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))}
              placeholder="Écrivez une réponse..."
              className="flex-1 text-sm px-2 py-1 neo-border-fine focus:outline-none"
            />
            <button 
              onClick={() => handleReply(c.id)}
              disabled={actionLoadingId === `reply_${c.id}` || !replyText[c.id]?.trim()}
              className="bg-[#D20A33] text-white text-xs font-bold px-3 uppercase disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        )}

        {/* Réponses imbriquées */}
        {c.replies?.data && c.replies.data.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-gray-300 pl-2">
            {c.replies.data.map((reply: any) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
      <div className="bg-[#f4f4f0] w-full max-w-6xl h-[85vh] neo-border flex flex-col shadow-2xl relative">
        {/* Header Modale */}
        <div className="bg-[#D20A33] text-white p-4 neo-border-b flex justify-between items-center shrink-0">
          <h2 className="font-syne font-black text-xl uppercase tracking-wider">Modération Instagram</h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="text-black text-sm px-2 py-1 neo-border-fine focus:outline-none"
            >
              <option value="default">Radio Cause Commune (défaut)</option>
              {accounts.filter(a => !a.is_default).map(acc => (
                <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
              ))}
            </select>
            <button onClick={onClose} className="font-black text-2xl hover:text-black transition-colors leading-none">&times;</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 m-4 shrink-0 text-sm font-bold">
            Erreur: {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Colonne gauche : Liste des posts */}
          <div className="w-1/3 border-r-4 border-black bg-white overflow-y-auto p-4 flex flex-col gap-3">
            <h3 className="font-syne font-black text-lg uppercase mb-2">Derniers Posts</h3>
            {isLoadingMedia ? (
              <p className="text-gray-500 italic text-sm">Chargement des posts...</p>
            ) : mediaList.length === 0 ? (
              <p className="text-gray-500 italic text-sm">Aucun post trouvé.</p>
            ) : (
              mediaList.map((media) => (
                <div 
                  key={media.id} 
                  onClick={() => handleSelectMedia(media)}
                  className={`flex gap-3 p-2 neo-border cursor-pointer transition-all ${selectedMedia?.id === media.id ? 'bg-[#A3FF00]' : 'hover:bg-gray-100'}`}
                >
                  <img 
                    src={media.thumbnail_url || media.media_url} 
                    alt="thumbnail" 
                    className="w-16 h-16 object-cover neo-border-fine shrink-0"
                  />
                  <div className="flex flex-col justify-between overflow-hidden">
                    <p className="text-xs text-gray-500 font-bold">{new Date(media.timestamp).toLocaleDateString()}</p>
                    <p className="text-sm truncate text-gray-800">{media.caption || 'Sans légende'}</p>
                    <a 
                      href={media.permalink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-blue-600 uppercase hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      Voir sur Instagram ↗
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Colonne droite : Commentaires */}
          <div className="w-2/3 bg-gray-100 overflow-y-auto p-4">
            {selectedMedia ? (
              <>
                <h3 className="font-syne font-black text-lg uppercase mb-4 flex items-center justify-between">
                  <span>Commentaires ({comments.length})</span>
                  <button onClick={() => handleSelectMedia(selectedMedia)} className="text-xs bg-white neo-border-fine px-2 py-1">Rafraîchir</button>
                </h3>
                
                {/* Nouveau commentaire de premier niveau */}
                <div className="bg-white p-3 neo-border-fine mb-4 flex gap-2">
                  <input 
                    type="text" 
                    value={newCommentText} 
                    onChange={e => setNewCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire sur ce post..."
                    className="flex-1 text-sm px-3 py-2 neo-border-fine focus:outline-none"
                    disabled={actionLoadingId === 'new_comment'}
                  />
                  <button 
                    onClick={handlePostComment}
                    disabled={actionLoadingId === 'new_comment' || !newCommentText.trim()}
                    className="bg-[#D20A33] text-white text-xs font-bold px-4 uppercase disabled:opacity-50"
                  >
                    Poster
                  </button>
                </div>
                
                {isLoadingComments ? (
                  <p className="text-gray-500 italic text-sm">Chargement des commentaires...</p>
                ) : comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">Aucun commentaire sur ce post.</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map(c => renderComment(c))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-sm">
                Sélectionnez un post pour voir les commentaires
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramModeration;
