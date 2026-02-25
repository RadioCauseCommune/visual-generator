
import React, { useRef, useState, useEffect } from 'react';
import { Layer } from '../../types';
import { generateInpainting } from '../../services/aiService';

interface InpaintingModalProps {
    isOpen: boolean;
    onClose: () => void;
    layer: Layer;
    onComplete: (newContent: string) => void;
}

const InpaintingModal: React.FC<InpaintingModalProps> = ({ isOpen, onClose, layer, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const [strength, setStrength] = useState(0.6);
    const [steps, setSteps] = useState(4);
    const [performanceMode, setPerformanceMode] = useState<'balanced' | 'fast'>('balanced');
    const [seed, setSeed] = useState<string>('');
    const [noText, setNoText] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current && maskCanvasRef.current) {
            const canvas = canvasRef.current;
            const maskCanvas = maskCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const maskCtx = maskCanvas.getContext('2d');

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                // Resize canvases to fit image aspect ratio
                const maxWidth = 800;
                const maxHeight = 600;
                let width = img.naturalWidth;
                let height = img.naturalHeight;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight / height) * width;
                    height = maxHeight;
                }

                canvas.width = maskCanvas.width = width;
                canvas.height = maskCanvas.height = height;

                ctx?.drawImage(img, 0, 0, width, height);

                // Initialize mask canvas with black (transparent for inpainting)
                maskCtx!.fillStyle = "black";
                maskCtx!.fillRect(0, 0, width, height);
            };
            img.src = layer.content;
        }
    }, [isOpen, layer]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current || !maskCanvasRef.current) return;

        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const maskCtx = maskCanvas.getContext('2d');

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        // Draw on main canvas (semi-transparent red for feedback)
        ctx!.globalCompositeOperation = 'source-over';
        ctx!.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx!.beginPath();
        ctx!.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx!.fill();

        // Draw on mask canvas (white = area to change)
        maskCtx!.fillStyle = 'white';
        maskCtx!.beginPath();
        maskCtx!.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        maskCtx!.fill();
    };

    const handleGenerate = async () => {
        if (!prompt || !maskCanvasRef.current) return;
        setIsProcessing(true);

        try {
            const originalCanvas = document.createElement('canvas');
            const originalImg = new Image();
            originalImg.crossOrigin = "anonymous";

            await new Promise((resolve) => {
                originalImg.onload = resolve;
                originalImg.src = layer.content;
            });

            originalCanvas.width = originalImg.naturalWidth;
            originalCanvas.height = originalImg.naturalHeight;
            const oCtx = originalCanvas.getContext('2d');
            oCtx?.drawImage(originalImg, 0, 0);

            // Scale mask to original image size
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = originalImg.naturalWidth;
            maskCanvas.height = originalImg.naturalHeight;
            const mCtx = maskCanvas.getContext('2d');
            mCtx?.drawImage(maskCanvasRef.current, 0, 0, maskCanvas.width, maskCanvas.height);

            const result = await generateInpainting(
                originalCanvas.toDataURL('image/png'),
                maskCanvas.toDataURL('image/png'),
                prompt,
                {
                    model: 'flux-local',
                    strength,
                    num_inference_steps: steps,
                    performance_mode: performanceMode,
                    seed: seed ? parseInt(seed) : undefined,
                    no_text: noText,
                }
            );

            onComplete(result);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'inpainting. Vérifiez votre prompt ou réessayez.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white neo-border w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
                <header className="bg-[#00F0FF] p-4 neo-border border-t-0 border-l-0 border-r-0 flex justify-between items-center">
                    <h2 className="font-syne font-black text-2xl uppercase italic">Retouche IA (Inpainting)</h2>
                    <button onClick={onClose} className="w-10 h-10 neo-border-fine bg-white neo-active font-black">X</button>
                </header>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-200 overflow-hidden relative">
                        <div className="relative cursor-crosshair neo-border-fine bg-white">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="max-w-full h-auto block"
                            />
                            <canvas ref={maskCanvasRef} className="hidden" />
                        </div>
                        <p className="mt-4 text-[10px] font-black uppercase text-gray-500 italic">
                            Peignez la zone que vous souhaitez modifier (elle apparaîtra en rouge transparent)
                        </p>
                    </div>

                    <div className="w-full md:w-80 p-6 border-l neo-border flex flex-col gap-4 bg-gray-50 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-black uppercase mb-1 italic">Taille du pinceau</label>
                            <input
                                type="range"
                                min="5" max="100"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-full accent-black"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-black uppercase mb-1 italic">Que voulez-vous à cet endroit ?</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ex: Des lunettes de soleil noires, un micro vintage, un chapeau..."
                                className="w-full h-24 neo-border-fine p-3 font-roboto-condensed text-sm resize-none focus:bg-[#A3FF00]/10 focus:outline-none"
                            />
                        </div>

                        {/* Paramètres Avancés */}
                        <div className="pt-2 border-t border-gray-200 space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-gray-500">Paramètres FLUX.1</h4>

                            <div>
                                <label className="block text-[10px] font-bold uppercase mb-1 flex justify-between">
                                    Force de transformation <span>{strength}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.1" max="1.0" step="0.05"
                                    value={strength}
                                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                                    className="w-full accent-black"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase mb-1 flex justify-between">
                                    Étapes (Steps) <span>{steps}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1" max="10" step="1"
                                    value={steps}
                                    onChange={(e) => setSteps(parseInt(e.target.value))}
                                    className="w-full accent-black"
                                />
                            </div>

                            <div className="flex gap-2">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="perf"
                                        className="sr-only peer"
                                        checked={performanceMode === 'balanced'}
                                        onChange={() => setPerformanceMode('balanced')}
                                    />
                                    <div className="neo-border-fine text-center py-1 bg-white peer-checked:bg-black peer-checked:text-white text-[10px] font-bold uppercase">Balanced</div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="perf"
                                        className="sr-only peer"
                                        checked={performanceMode === 'fast'}
                                        onChange={() => setPerformanceMode('fast')}
                                    />
                                    <div className="neo-border-fine text-center py-1 bg-white peer-checked:bg-black peer-checked:text-white text-[10px] font-bold uppercase">Fast</div>
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="no-text"
                                    checked={noText}
                                    onChange={(e) => setNoText(e.target.checked)}
                                    className="w-4 h-4 border-2 border-black rounded-none"
                                />
                                <label htmlFor="no-text" className="text-[10px] font-bold uppercase cursor-pointer select-none">Éviter le texte (No Text)</label>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase mb-1">Seed (Optionnel)</label>
                                <input
                                    type="number"
                                    placeholder="Aléatoire"
                                    value={seed}
                                    onChange={(e) => setSeed(e.target.value)}
                                    className="w-full neo-border-fine p-1 text-xs"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isProcessing || !prompt}
                            className={`w-full py-4 neo-border-fine font-syne font-black uppercase italic transition-all neo-active
                                ${isProcessing || !prompt ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-[#A3FF00] hover:bg-[#8ee000] rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}
                            `}
                        >
                            {isProcessing ? 'Génération en cours...' : 'Générer la retouche'}
                        </button>

                        {isProcessing && (
                            <div className="text-center animate-pulse">
                                <span className="text-[10px] font-black uppercase text-blue-600">L'IA recalcule les pixels...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InpaintingModal;
