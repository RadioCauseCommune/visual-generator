
import React, { useState } from 'react';
import { Layer } from '../../types';
import { upscaleImage } from '../../services/aiService';

interface UpscaleToolProps {
    layer: Layer;
    onUpdate: (id: string, updates: Partial<Layer>) => void;
}

const UpscaleTool: React.FC<UpscaleToolProps> = ({ layer, onUpdate }) => {
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleUpscale = async () => {
        if (!layer.content || isUpscaling) return;

        setIsUpscaling(true);
        setError(null);
        setStatus('Préparation...');

        try {
            // Replicate supporte les data URIs. Si c'est déjà un data URI, on l'utilise.
            // Si c'est une URL externe, Replicate la téléchargera.
            const resultUrl = await upscaleImage(layer.content, (msg) => setStatus(msg));

            // Mettre à jour le calque avec les nouvelles dimensions natives
            const img = new Image();
            img.onload = () => {
                onUpdate(layer.id, {
                    content: resultUrl,
                    imageNaturalWidth: img.naturalWidth,
                    imageNaturalHeight: img.naturalHeight
                });
                setStatus('Terminé !');
                setTimeout(() => setStatus(''), 3000);
            };
            img.onerror = () => {
                onUpdate(layer.id, { content: resultUrl });
                setStatus('Terminé !');
                setTimeout(() => setStatus(''), 3000);
            };
            img.src = resultUrl;
        } catch (err) {
            console.error('Upscale error:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsUpscaling(false);
        }
    };

    return (
        <div className="space-y-2 mt-2">
            <button
                onClick={handleUpscale}
                disabled={isUpscaling}
                className={`w-full neo-border-fine font-black py-3 text-xs uppercase neo-active transition-all ${isUpscaling ? 'bg-gray-200 cursor-wait' : 'bg-[#FFDE59] hover:bg-[#ffe580]'
                    }`}
            >
                {isUpscaling ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin text-lg">⏳</span>
                        Traitement...
                    </span>
                ) : (
                    '🚀 Upscaler en Ultra-HD (x4)'
                )}
            </button>

            {status && !error && (
                <p className="text-[10px] font-bold text-blue-600 animate-pulse text-center uppercase tracking-tight">
                    {status}
                </p>
            )}

            {error && (
                <div className="p-2 bg-red-100 neo-border-fine border-red-500 text-[10px] text-red-600 font-bold uppercase leading-tight">
                    Erreur: {error}
                </div>
            )}

            <p className="text-[8px] font-bold opacity-60 text-center uppercase leading-tight px-4">
                Utilise Real-ESRGAN pour restaurer les détails (x4).
            </p>
        </div>
    );
};

export default UpscaleTool;
