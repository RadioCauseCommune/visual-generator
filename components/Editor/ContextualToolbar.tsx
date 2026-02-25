import React, { useState } from 'react';
import { Layer } from '../../types';
import { imageToImage } from '../../services/aiService';

interface ContextualToolbarProps {
    layer: Layer;
    onDuplicate: () => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<Layer>) => void;
    canvasScale: number;
    style?: React.CSSProperties;
}

const ContextualToolbar: React.FC<ContextualToolbarProps> = ({
    layer,
    onDuplicate,
    onDelete,
    onUpdate,
    canvasScale,
    style
}) => {
    const [showImg2Img, setShowImg2Img] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("");

    const handleImg2Img = async () => {
        if (!prompt || isProcessing) return;

        setIsProcessing(true);
        setStatus("Génération...");

        try {
            const response = await fetch(layer.content);
            const blob = await response.blob();
            // Force local flux model for now as per context
            const resultBase64 = await imageToImage(blob, prompt, 'flux-local');

            onUpdate({ content: resultBase64 });
            setStatus("Succès !");
            setTimeout(() => {
                setStatus("");
                setShowImg2Img(false);
                setPrompt("");
            }, 1000);
        } catch (error) {
            console.error(error);
            setStatus("Erreur");
            setTimeout(() => setStatus(""), 2000);
        } finally {
            setIsProcessing(false);
        }
    };

    // Prevent click propagation to avoid selecting/deselecting layers when interacting with toolbar
    const stopProp = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div
            className="absolute z-[2000] flex flex-col items-center"
            style={{
                pointerEvents: 'auto',
                ...style
            }}
            onMouseDown={stopProp}
            onClick={stopProp}
        >
            {/* Main Toolbar */}
            <div className="flex bg-white neo-border shadow-lg p-1 gap-1 mb-2">
                {layer.type === 'image' && (
                    <button
                        onClick={() => setShowImg2Img(!showImg2Img)}
                        className={`px-3 py-1.5 text-xs font-black uppercase neo-border-fine transition-all ${showImg2Img ? 'bg-[#A3FF00] -translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'
                            }`}
                        title="Varier avec IA"
                    >
                        ✨ Varier
                    </button>
                )}

                <button
                    onClick={onDuplicate}
                    className="w-8 h-8 flex items-center justify-center bg-white neo-border-fine hover:bg-blue-50"
                    title="Dupliquer"
                >
                    <span className="text-sm">❐</span>
                </button>

                <button
                    onClick={onDelete}
                    className="w-8 h-8 flex items-center justify-center bg-white neo-border-fine hover:bg-red-50 text-red-600"
                    title="Supprimer"
                >
                    <span className="text-lg">×</span>
                </button>
            </div>

            {/* Img2Img Popover */}
            {showImg2Img && (
                <div className="bg-white neo-border p-3 w-64 shadow-xl flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Version cyberpunk..."
                        className="w-full h-20 text-xs neo-border-fine p-2 resize-none focus:outline-none focus:bg-gray-50"
                        autoFocus
                    />

                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">{status}</span>
                        <button
                            onClick={handleImg2Img}
                            disabled={!prompt || isProcessing}
                            className={`px-4 py-2 text-[10px] font-black uppercase neo-border-fine ${isProcessing ? 'bg-gray-200 cursor-wait' : 'bg-[#A3FF00] hover:bg-[#8ee000] neo-active'
                                }`}
                        >
                            {isProcessing ? '...' : 'Générer'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContextualToolbar;
