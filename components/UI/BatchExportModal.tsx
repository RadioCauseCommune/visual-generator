
import React, { useState } from 'react';
import { AssetType } from '../../types';

interface BatchExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartBatch: (selectedTypes: AssetType[]) => void;
    isProcessing: boolean;
    progress: number;
    total: number;
}

const BatchExportModal: React.FC<BatchExportModalProps> = ({
    isOpen, onClose, onStartBatch, isProcessing, progress, total
}) => {
    const [selected, setSelected] = useState<AssetType[]>([]);

    if (!isOpen) return null;

    const allTypes = Object.values(AssetType);

    const toggleType = (type: AssetType) => {
        setSelected(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const selectAll = () => setSelected(allTypes);
    const selectNone = () => setSelected([]);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white neo-border w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <header className="bg-[#A3FF00] p-4 neo-border border-t-0 border-l-0 border-r-0 flex justify-between items-center">
                    <h2 className="font-syne font-black text-2xl uppercase italic">Exportation Groupée (Batch)</h2>
                    {!isProcessing && (
                        <button onClick={onClose} className="w-10 h-10 neo-border-fine bg-white neo-active font-black">X</button>
                    )}
                </header>

                <div className="p-6 overflow-y-auto flex-1">
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="w-full bg-gray-200 h-8 neo-border-fine overflow-hidden">
                                <div
                                    className="h-full bg-[#A3FF00] transition-all duration-300"
                                    style={{ width: `${(progress / total) * 100}%` }}
                                ></div>
                            </div>
                            <p className="font-syne font-black text-xl uppercase animate-pulse">
                                GÉNÉRATION : {progress} / {total}
                            </p>
                            <p className="text-sm font-bold text-gray-500 italic uppercase">
                                MERCI DE NE PAS FERMER L'ONGLET...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 space-y-2">
                                <p className="font-syne font-black text-[10px] uppercase opacity-60">Préconfigurations :</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Essentiels Radio', types: [AssetType.PODCAST_COVER, AssetType.OG_IMAGE, AssetType.SQUARE_1080] },
                                        { label: 'Pack Instagram', types: [AssetType.INSTA_POST_SQUARE, AssetType.INSTA_POST_PORTRAIT, AssetType.INSTA_STORY] },
                                        { label: 'Pack Facebook', types: [AssetType.FB_POST, AssetType.FB_STORY, AssetType.FB_COVER] },
                                        { label: 'Pack X / Twitter', types: [AssetType.X_POST, AssetType.X_BANNER] },
                                    ].map(preset => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setSelected(preset.types)}
                                            className="bg-white neo-border-fine px-3 py-1 text-[10px] font-black uppercase hover:bg-[#A3FF00] transition-colors"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between mb-4 border-t pt-4">
                                <p className="font-syne font-black text-sm uppercase italic underline">Ou sélectionnez individuellement :</p>
                                <div className="flex gap-2">
                                    <button onClick={selectAll} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Tout cocher</button>
                                    <button onClick={selectNone} className="text-[10px] font-black uppercase text-red-600 hover:underline">Tout décocher</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                                {allTypes.map(type => (
                                    <label
                                        key={type}
                                        className={`flex items-center gap-3 p-2 neo-border-fine cursor-pointer transition-colors ${selected.includes(type) ? 'bg-[#A3FF00]/10 border-[#000]' : 'hover:bg-gray-50 opacity-60'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(type)}
                                            onChange={() => toggleType(type)}
                                            className="w-4 h-4 accent-black"
                                        />
                                        <span className="font-roboto-condensed font-black text-xs uppercase">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {!isProcessing && (
                    <footer className="p-4 bg-gray-50 border-t neo-border border-b-0 border-l-0 border-r-0 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="bg-white text-black neo-border-fine neo-shadow-sm neo-active font-roboto-condensed font-black px-6 py-2 uppercase"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => onStartBatch(selected)}
                            disabled={selected.length === 0}
                            className={`bg-[#A3FF00] text-black neo-border-fine neo-shadow-sm neo-active font-roboto-condensed font-black px-10 py-2 uppercase ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Lancer l'export ({selected.length})
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default BatchExportModal;
