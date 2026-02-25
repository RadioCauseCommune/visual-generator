
import { useState, useCallback, useEffect } from 'react';
import { AiParameters, AiStyleType, AiModelType, Layer, AssetType } from '../types';
import { generateImage } from '../services/aiService';
import { getModelById } from '../services/aiModels';
import { DIMENSIONS } from '../constants';

export const useAiImage = (assetType: AssetType, layersCount: number) => {
    const [prompt, setPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAiAdvanced, setShowAiAdvanced] = useState(false);
    const [selectedAiStyle, setSelectedAiStyle] = useState<AiStyleType>('none');
    const [selectedModel, setSelectedModel] = useState<AiModelType>('flux-local');
    const [aiParams, setAiParams] = useState<AiParameters>({
        num_inference_steps: 4,
        guidance_scale: 3.5,
        seed: undefined
    });

    const clampAiSize = (value: number, max: number) => {
        const min = 256;
        const step = 64;
        const clamped = Math.max(min, Math.min(value, max));
        return Math.floor(clamped / step) * step;
    };

    // Ajuster les paramètres IA quand le modèle change
    useEffect(() => {
        const model = getModelById(selectedModel);
        if (model) {
            setAiParams(prev => ({
                ...prev,
                num_inference_steps: Math.min(prev.num_inference_steps, model.maxSteps),
                width: prev.width !== undefined ? clampAiSize(prev.width, model.maxWidth) : undefined,
                height: prev.height !== undefined ? clampAiSize(prev.height, model.maxHeight) : undefined,
            }));
        }
    }, [selectedModel]);

    const handleAiGenerate = useCallback(async (onImageGenerated: (layer: Layer) => void, showError: (msg: string) => void) => {
        if (!prompt) {
            showError("Veuillez saisir un prompt.");
            return;
        }
        setIsGenerating(true);
        try {
            const { w, h } = DIMENSIONS[assetType];
            const url = await generateImage(
                prompt,
                { ...aiParams, model: selectedModel },
                selectedAiStyle
            );

            const img = new Image();
            img.onload = () => {
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                const imageAspectRatio = naturalWidth / naturalHeight;

                // On veut que l'image occupe une bonne partie du canvas par défaut,
                // mais on ne veut pas l'agrandir au-delà de sa taille naturelle.
                const maxCanvasSize = Math.min(w * 0.9, h * 0.9);

                let layerWidth = naturalWidth;
                let layerHeight = naturalHeight;

                // Si l'image est plus grande que l'espace alloué (90% du canvas)
                if (layerWidth > maxCanvasSize || layerHeight > maxCanvasSize) {
                    if (imageAspectRatio > 1) {
                        layerWidth = maxCanvasSize;
                        layerHeight = maxCanvasSize / imageAspectRatio;
                    } else {
                        layerHeight = maxCanvasSize;
                        layerWidth = maxCanvasSize * imageAspectRatio;
                    }
                }

                const newLayer: Layer = {
                    id: Math.random().toString(36).substr(2, 9),
                    role: 'manual', type: 'image', content: url,
                    x: (w - layerWidth) / 2, y: (h - layerHeight) / 2, width: layerWidth, height: layerHeight,
                    zIndex: layersCount + 1, rotation: 0,
                    imageNaturalWidth: naturalWidth,
                    imageNaturalHeight: naturalHeight,
                    imageOffsetX: 50,
                    imageOffsetY: 50
                };
                onImageGenerated(newLayer);
            };
            img.onerror = () => {
                const newLayer: Layer = {
                    id: Math.random().toString(36).substr(2, 9),
                    role: 'manual', type: 'image', content: url,
                    x: 0, y: 0, width: w, height: h,
                    zIndex: layersCount + 1, rotation: 0,
                    imageOffsetX: 50,
                    imageOffsetY: 50
                };
                onImageGenerated(newLayer);
            };
            img.src = url;
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Erreur lors de la génération d'image.";
            showError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, assetType, aiParams, selectedModel, selectedAiStyle, layersCount]);

    return {
        prompt,
        setPrompt,
        isGenerating,
        setIsGenerating,
        showAiAdvanced,
        setShowAiAdvanced,
        selectedAiStyle,
        setSelectedAiStyle,
        selectedModel,
        setSelectedModel,
        aiParams,
        setAiParams,
        handleAiGenerate
    };
};
