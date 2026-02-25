
import React, { useState, useEffect } from 'react';
import { fetchAndParseRss, fetchEmissions, RssFeedInfo, RssEpisode, WpEmission } from '../../services/rssService';

interface RssImporterProps {
    onImport: (episode: RssEpisode) => void;
}

const RssImporter: React.FC<RssImporterProps> = ({ onImport }) => {
    const [rssUrl, setRssUrl] = useState("");
    const [feed, setFeed] = useState<RssFeedInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Emissions Logic
    const [emissions, setEmissions] = useState<WpEmission[]>([]);
    const [search, setSearch] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchEmissions();
                setEmissions(data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered)));
            } catch (err) {
                console.error("Failed to load emissions", err);
            }
        };
        load();
    }, []);

    const filteredEmissions = emissions.filter(e =>
        e.title.rendered.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectEmission = (e: WpEmission) => {
        const url = `https://cause-commune.fm/feed/podcast/${e.slug}`;
        setRssUrl(url);
        handleFetch(url);
        setIsMenuOpen(false);
        setSearch(e.title.rendered);
    };

    const handleFetch = async (urlToFetch?: string) => {
        const url = urlToFetch || rssUrl;
        if (!url) return;

        setIsLoading(true);
        setError("");
        try {
            const data = await fetchAndParseRss(url);
            setFeed(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 bg-purple-50 neo-border-fine neo-shadow-sm">
            <h3 className="font-syne font-black text-lg uppercase underline decoration-purple-600 decoration-4">Podcast RSS Autopilot</h3>

            <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase block">Rechercher une émission :</label>
                <div className="flex gap-1">
                    <input
                        type="text"
                        value={search}
                        placeholder="Ex: Libre à vous, Konstroy..."
                        onFocus={() => setIsMenuOpen(true)}
                        onChange={e => { setSearch(e.target.value); setIsMenuOpen(true); }}
                        className="flex-1 neo-border-fine p-2 text-xs bg-white"
                    />
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="bg-white neo-border-fine px-2 text-xs font-black uppercase neo-active"
                    >
                        {isMenuOpen ? '▲' : '▼'}
                    </button>
                </div>

                {isMenuOpen && filteredEmissions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white neo-border-fine shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredEmissions.map(e => (
                            <div
                                key={e.id}
                                onClick={() => handleSelectEmission(e)}
                                className="p-2 text-[10px] font-bold uppercase cursor-pointer hover:bg-purple-600 hover:text-white border-b border-gray-100 last:border-0"
                            >
                                {e.title.rendered}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-purple-200">
                <details className="cursor-pointer group">
                    <summary className="text-[9px] font-black uppercase text-purple-600 group-open:mb-2">Lien direct RSS (Optionnel)</summary>
                    <div className="flex gap-1 mt-1">
                        <input
                            type="text"
                            value={rssUrl}
                            onChange={e => setRssUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 neo-border-fine p-2 text-[9px] bg-white h-8"
                        />
                        <button
                            onClick={() => handleFetch()}
                            disabled={isLoading}
                            className="bg-black text-white px-3 h-8 text-xs font-black uppercase neo-active"
                        >
                            {isLoading ? '...' : '→'}
                        </button>
                    </div>
                </details>
            </div>

            {error && <p className="text-red-600 text-[10px] font-black uppercase">{error}</p>}

            {feed && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar border-t border-purple-200 pt-3">
                    <p className="text-[10px] font-black uppercase text-purple-800 italic">
                        {feed.title} ({feed.episodes.length} épisodes)
                    </p>
                    {feed.episodes.map(episode => (
                        <div
                            key={episode.id}
                            className="bg-white neo-border-fine p-2 cursor-pointer hover:bg-purple-100 transition-colors group"
                            onClick={() => onImport(episode)}
                        >
                            <div className="flex gap-2">
                                {episode.imageUrl && (
                                    <img src={`/api/proxy?url=${encodeURIComponent(episode.imageUrl)}`} alt="" className="w-10 h-10 object-cover neo-border-fine flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1">
                                        {episode.number && (
                                            <span className="bg-black text-white text-[8px] px-1 font-black">#{episode.number}</span>
                                        )}
                                        <p className="text-[9px] font-black uppercase truncate group-hover:text-purple-600">{episode.title}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[8px] text-gray-500 font-bold">{new Date(episode.pubDate).toLocaleDateString('fr-FR')}</p>
                                        {episode.duration && <span className="text-[8px] font-black text-purple-600">{episode.duration}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RssImporter;
