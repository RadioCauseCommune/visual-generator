
import React, { useState, useEffect } from 'react';
import { storageService, SavedProject } from '../../services/storage';
import { cloudStorageService, CloudProject } from '../../services/cloudStorage';

interface ProjectGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadProject: (project: any) => void;
    user: any;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ isOpen, onClose, onLoadProject, user }) => {
    const [localProjects, setLocalProjects] = useState<SavedProject[]>([]);
    const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [sharingId, setSharingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalProjects(storageService.getProjects());
            if (user) {
                fetchCloudProjects();
            } else {
                setCloudProjects([]);
            }
        }
    }, [isOpen, user]);

    const fetchCloudProjects = async () => {
        setLoading(true);
        try {
            const data = await cloudStorageService.listProjects();
            setCloudProjects(data);
        } catch (err) {
            console.error("Erreur fetch cloud:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const allProjects = [
        ...localProjects.map(p => ({ ...p, isCloud: false })),
        ...cloudProjects.map(p => ({ ...p, isCloud: true }))
    ].sort((a, b) => {
        const dateA = new Date(a.isCloud ? (a as any).updated_at : (a as any).updatedAt).getTime();
        const dateB = new Date(b.isCloud ? (b as any).updated_at : (b as any).updatedAt).getTime();
        return dateB - dateA;
    });

    const filteredProjects = allProjects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p as any).meta.title?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string, isCloud: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Supprimer ce projet ${isCloud ? 'du Cloud' : 'local'} définitivement ?`)) {
            if (isCloud) {
                await cloudStorageService.deleteProject(id);
                fetchCloudProjects();
            } else {
                storageService.deleteProject(id);
                setLocalProjects(storageService.getProjects());
            }
        }
    };

    const handleTogglePublic = async (id: string, currentStatus: boolean) => {
        try {
            await cloudStorageService.toggleProjectPublic(id, !currentStatus);
            fetchCloudProjects();
        } catch (err) {
            console.error("Erreur toggle public:", err);
        }
    };

    const copyShareLink = (id: string) => {
        const url = `${window.location.origin}${window.location.pathname}?p=${id}`;
        navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papier !');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white neo-border w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                <header className="bg-[#A3FF00] p-4 neo-border border-t-0 border-l-0 border-r-0 flex justify-between items-center">
                    <h2 className="font-syne font-black text-2xl uppercase italic">Galerie de Projets</h2>
                    <button onClick={onClose} className="w-10 h-10 neo-border-fine bg-white neo-active font-black">X</button>
                </header>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="RECHERCHER UN PROJET..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full neo-border-fine p-3 font-roboto-condensed font-black uppercase placeholder:text-gray-400 focus:outline-none focus:bg-[#A3FF00]/10"
                        />
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-300">
                            <p className="font-syne font-black text-gray-400 uppercase">Aucun projet trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map(project => (
                                <div
                                    key={project.id}
                                    onClick={() => onLoadProject(project)}
                                    className={`neo-border-fine bg-white p-4 cursor-pointer neo-hover group relative ${project.isCloud ? 'border-blue-600 border-2' : ''}`}
                                >
                                    <div className="aspect-video bg-gray-100 neo-border-fine mb-3 overflow-hidden flex items-center justify-center relative">
                                        {project.thumbnail ? (
                                            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[40px]">📻</span>
                                        )}
                                        {project.isCloud && (
                                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 neo-border-fine uppercase shadow-sm">
                                                Cloud
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-[#A3FF00]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white neo-border-fine px-3 py-1 font-black text-xs uppercase">Charger</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-syne font-black text-sm uppercase truncate flex-1">{project.name}</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (project.isCloud) {
                                                    setSharingId(sharingId === project.id ? null : project.id);
                                                } else {
                                                    alert("Pour partager un projet, vous devez être connecté et l'avoir sauvegardé sur le Cloud. ☁️");
                                                }
                                            }}
                                            className={`ml-2 text-[10px] font-black uppercase neo-border-fine px-2 py-0.5 transition-colors ${project.isCloud ? 'bg-gray-100 hover:bg-[#00F0FF]' : 'bg-gray-200 opacity-50'}`}
                                        >
                                            Partager
                                        </button>
                                    </div>

                                    {sharingId === project.id && project.isCloud && (
                                        <div
                                            className="absolute inset-x-4 top-16 bg-white neo-border-fine p-3 z-20 shadow-xl animate-in fade-in slide-in-from-top-2"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase">Visibilité Publique</span>
                                                <button
                                                    onClick={() => handleTogglePublic(project.id, !!(project as any).is_public)}
                                                    className={`w-10 h-5 neo-border-fine relative transition-colors ${project.isCloud && (project as any).is_public ? 'bg-[#A3FF00]' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white neo-border-fine transition-all ${(project as any).is_public ? 'right-0.5' : 'left-0.5'}`}></div>
                                                </button>
                                            </div>
                                            {(project as any).is_public ? (
                                                <button
                                                    onClick={() => copyShareLink(project.id)}
                                                    className="w-full bg-black text-white py-1.5 text-[10px] font-black uppercase neo-border-fine neo-active"
                                                >
                                                    Copier le lien public
                                                </button>
                                            ) : (
                                                <p className="text-[8px] font-bold text-gray-400 italic leading-tight">Activez la visibilité pour générer un lien de partage.</p>
                                            )}
                                        </div>
                                    )}

                                    <p className="font-roboto-condensed text-[10px] text-gray-500 uppercase truncate">
                                        {new Date(project.isCloud ? (project as any).updated_at : (project as any).updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    <button
                                        onClick={(e) => handleDelete(project.id, !!project.isCloud, e)}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white neo-border-fine flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity neo-active z-10"
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="p-4 bg-gray-50 border-t neo-border border-b-0 border-l-0 border-r-0 flex justify-between items-center">
                    <p className="text-[9px] font-bold text-gray-400 italic uppercase">
                        {user ? "Projets Synchronisés sur le Cloud." : "Mode Local : Les projets sont sauvegardés dans votre navigateur."}
                    </p>
                    {loading && <span className="text-[10px] font-black uppercase text-blue-600 animate-pulse">Sync Cloud...</span>}
                </footer>
            </div>
        </div>
    );
};

export default ProjectGallery;
