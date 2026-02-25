
import React from 'react';
import { HEADER_LOGO } from '../../constants';

export type ViewMode = 'studio' | 'greetings';

interface HeaderProps {
    onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExportProject: () => void;
    onExportImage: (format?: 'png' | 'webp') => void;
    onExportSvg: () => void;
    onBatchExport: () => void;
    onQuickSave: () => void;
    onOpenGallery: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    user: any;
    onLogin: () => void;
    onLogout: () => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const Header: React.FC<HeaderProps> = ({
    onImportProject, onExportProject, onExportImage, onExportSvg,
    onBatchExport, onQuickSave, onOpenGallery,
    canUndo, canRedo, onUndo, onRedo,
    user, onLogin, onLogout,
    viewMode, setViewMode
}) => {
    return (
        <header className="bg-[#D20A33] neo-border-fine flex items-center justify-between px-6 py-3 z-50">
            <div className="flex items-center gap-4">
                <img src={HEADER_LOGO} alt="Cause Commune" className="w-12 h-12 object-contain neo-border-fine bg-white" />
                <h1 className="text-white font-syne font-black text-2xl uppercase tracking-tighter">STUDIO CAUSE COMMUNE</h1>

                <div className="flex bg-black/20 p-1 neo-border-fine ml-4">
                    <button
                        onClick={() => setViewMode('studio')}
                        className={`px-4 py-1 font-roboto-condensed font-black uppercase text-sm transition-all ${viewMode === 'studio' ? 'bg-[#A3FF00] text-black neo-shadow-sm' : 'text-white hover:bg-white/10'}`}
                    >
                        Studio
                    </button>
                    <button
                        onClick={() => setViewMode('greetings')}
                        className={`px-4 py-1 font-roboto-condensed font-black uppercase text-sm transition-all ${viewMode === 'greetings' ? 'bg-[#00F0FF] text-black neo-shadow-sm' : 'text-white hover:bg-white/10'}`}
                    >
                        Vœux
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Historique */}
                <div className="flex gap-1">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        title="Annuler (Ctrl+Z)"
                        className={`w-9 h-9 flex items-center justify-center neo-border-fine neo-active font-black transition-all ${canUndo ? 'bg-white hover:bg-gray-100' : 'bg-gray-400 opacity-50 cursor-not-allowed'}`}
                    >
                        ↺
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        title="Rétablir (Ctrl+Y)"
                        className={`w-9 h-9 flex items-center justify-center neo-border-fine neo-active font-black transition-all ${canRedo ? 'bg-white hover:bg-gray-100' : 'bg-gray-400 opacity-50 cursor-not-allowed'}`}
                    >
                        ↻
                    </button>
                </div>

                <div className="flex gap-4">
                    {/* Menu Projet */}
                    <div className="relative group">
                        <button className="bg-white text-black neo-border-fine neo-shadow-sm neo-active font-roboto-condensed font-black px-4 py-1 uppercase flex items-center gap-2 group-hover:bg-[#00F0FF] transition-colors">
                            Projet <span className="text-[10px]">▼</span>
                        </button>
                        <div className="absolute hidden group-hover:block pt-2 left-0 min-w-[200px] z-[100] animate-in text-black">
                            <div className="bg-white neo-border-fine neo-shadow flex flex-col overflow-hidden">
                                {user && (
                                    <div className="px-4 py-2 bg-gray-100 border-b-2 border-black">
                                        <p className="text-[10px] font-black uppercase opacity-60">Session</p>
                                        <p className="text-xs font-bold truncate">{user.email}</p>
                                    </div>
                                )}
                                <button onClick={onOpenGallery} className="w-full text-left px-4 py-2 hover:bg-[#00F0FF] font-roboto-condensed font-bold uppercase text-sm border-b-2 border-black transition-colors">Mes Projets</button>
                                <button onClick={onQuickSave} className="w-full text-left px-4 py-2 bg-[#A3FF00] hover:bg-[#8ee000] font-roboto-condensed font-bold uppercase text-sm border-b-2 border-black transition-colors">Sauvegarder</button>
                                {user ? (
                                    <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white font-roboto-condensed font-bold uppercase text-sm border-b-2 border-black transition-colors">Déconnexion</button>
                                ) : (
                                    <button onClick={onLogin} className="w-full text-left px-4 py-2 bg-[#00F0FF] hover:bg-[#00d0ff] font-roboto-condensed font-bold uppercase text-sm border-b-2 border-black transition-colors underline decoration-2">SE CONNECTER (Cloud)</button>
                                )}
                                <label className="w-full text-left px-4 py-2 hover:bg-[#eee] font-roboto-condensed font-bold uppercase text-[10px] border-b-2 border-black cursor-pointer transition-colors">
                                    Local : Importer JSON <input type="file" hidden onChange={onImportProject} accept=".json" />
                                </label>
                                <button onClick={onExportProject} className="w-full text-left px-4 py-2 hover:bg-[#eee] font-roboto-condensed font-bold uppercase text-[10px] transition-colors">Local : Exporter JSON</button>
                            </div>
                        </div>
                    </div>

                    {/* Menu Exporter */}
                    <div className="relative group">
                        <button className="bg-black text-white neo-border-fine neo-shadow-sm neo-active font-roboto-condensed font-black px-4 py-1 uppercase flex items-center gap-2 group-hover:bg-[#A3FF00] group-hover:text-black transition-colors">
                            Exporter <span className="text-[10px]">▼</span>
                        </button>
                        <div className="absolute hidden group-hover:block pt-2 right-0 min-w-[200px] z-[100] animate-in">
                            <div className="bg-white neo-border-fine neo-shadow flex flex-col overflow-hidden">
                                <button onClick={onBatchExport} className="w-full text-left px-4 py-2 bg-[#A3FF00] hover:bg-[#8ee000] text-black font-roboto-condensed font-black uppercase text-sm border-b-2 border-black italic transition-colors">Pack Social (Batch)</button>
                                <button onClick={onExportSvg} className="w-full text-left px-4 py-2 hover:bg-[#eee] text-black font-roboto-condensed font-bold uppercase text-sm border-b-2 border-black transition-colors">Format SVG (Vecteur)</button>
                                <button onClick={() => onExportImage('webp')} className="w-full text-left px-4 py-2 hover:bg-black hover:text-[#A3FF00] text-black font-roboto-condensed font-bold uppercase text-sm border-b-2 border-black transition-colors">Format WebP (Opti Web)</button>
                                <button onClick={() => onExportImage('png')} className="w-full text-left px-4 py-2 hover:bg-black hover:text-white text-black font-roboto-condensed font-bold uppercase text-sm transition-colors">Format PNG (HQ Asset)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
