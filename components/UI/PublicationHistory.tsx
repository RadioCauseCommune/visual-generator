/**
 * PublicationHistory — liste des publications récentes sur les réseaux sociaux
 */

import React, { useState, useEffect } from 'react';
import { PublicationRecord } from '../../types';
import { getPublicationHistory } from '../../services/socialPublishing';

interface PublicationHistoryProps {
  user: any;
}

const StatusBadge: React.FC<{ status: PublicationRecord['status'] }> = ({ status }) => {
  const styles = {
    published: 'bg-[#A3FF00] border-black text-black',
    pending: 'bg-yellow-200 border-black text-black',
    failed: 'bg-[#D20A33] border-black text-white',
  };
  const labels = { published: 'Publié', pending: 'En attente', failed: 'Échec' };
  return (
    <span className={`inline-block border text-xs font-roboto-condensed font-bold px-1.5 py-0.5 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  if (platform === 'instagram') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  return <span className="text-xs font-bold">{platform.toUpperCase()}</span>;
};

const PublicationHistory: React.FC<PublicationHistoryProps> = ({ user }) => {
  const [publications, setPublications] = useState<PublicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getPublicationHistory();
      setPublications(data);
    } catch {
      // silencieux
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) load();
  }, [isOpen, user]);

  if (!user) return null;

  return (
    <section className="space-y-2">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between font-syne font-black text-sm uppercase hover:text-[#D20A33] transition-colors"
      >
        <span className="underline decoration-[#D20A33] decoration-4">Historique publications</span>
        <span className="text-lg">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-xs text-gray-400 italic">Chargement...</p>
          ) : publications.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Aucune publication pour l'instant.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {publications.map(pub => (
                <li key={pub.id} className="border-2 border-black p-2 bg-white text-xs font-roboto-condensed">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <PlatformIcon platform={pub.platform} />
                      <span>{pub.account_name || pub.account_id || 'Compte défaut'}</span>
                    </div>
                    <StatusBadge status={pub.status} />
                  </div>
                  {pub.caption && (
                    <p className="text-gray-700 line-clamp-2 mb-1">{pub.caption}</p>
                  )}
                  <div className="flex items-center justify-between text-gray-400">
                    <span>
                      {pub.published_at
                        ? new Date(pub.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : new Date(pub.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                    {pub.post_url && (
                      <a
                        href={pub.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D20A33] underline hover:no-underline"
                      >
                        Voir le post
                      </a>
                    )}
                  </div>
                  {pub.status === 'failed' && pub.error_message && (
                    <p className="text-[#D20A33] mt-1 text-xs">{pub.error_message}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={load}
            className="text-xs text-gray-500 underline hover:no-underline font-roboto-condensed"
          >
            Rafraîchir
          </button>
        </div>
      )}
    </section>
  );
};

export default PublicationHistory;
