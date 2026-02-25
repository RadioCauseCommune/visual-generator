
import { useState, useCallback, useRef, useEffect } from 'react';
import { Layer, LayerRole, AssetType } from '../types';
import { DIMENSIONS, LOGOS, COLORS } from '../constants';
import { TEMPLATES, Template } from '../services/templates';

export const useLayers = (assetType: AssetType, meta: any) => {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [activeGuides, setActiveGuides] = useState<{ x?: number, y?: number } | null>(null);
    const clipboard = useRef<Layer | null>(null);

    const applyTemplate = useCallback((templateId: string) => {
        const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
        const newLayers = template.getLayers(assetType, meta);
        setLayers(newLayers);
        setSelectedLayerId(null);
    }, [assetType, meta]);

    const applyDefaultTemplate = useCallback(() => {
        applyTemplate('standard');
    }, [applyTemplate]);

    const adaptLayersToFormat = useCallback((prevType: AssetType, newType: AssetType) => {
        const oldDim = DIMENSIONS[prevType];
        const newDim = DIMENSIONS[newType];

        if (!oldDim || !newDim) return;

        const scaleX = newDim.w / oldDim.w;
        const scaleY = newDim.h / oldDim.h;
        // Use average scale for font sizes to avoid distortion
        const limitScale = Math.min(scaleX, scaleY);
        const fontScale = limitScale;

        setLayers(prevLayers => prevLayers.map(layer => {
            // Calculate new position (relative percentage based) causes less drift than raw scaling
            // But here we use raw scaling based on previous dimensions
            const centerX = layer.x + layer.width / 2;
            const centerY = layer.y + layer.height / 2;

            const newCenterX = centerX * scaleX;
            const newCenterY = centerY * scaleY;

            let newWidth = layer.width * scaleX;
            let newHeight = layer.height * scaleY;

            // For text and circular images, we might want to maintain aspect ratio more strictly
            // or at least ensure font size scales logically
            let newFontSize = layer.fontSize ? layer.fontSize * fontScale : undefined;

            if (layer.type === 'text') {
                // Text width usually needs to adapt to width to avoid wrapping weirdly
                // But simply scaling width is decent for a start
            }

            if (layer.clipShape === 'circle') {
                // Keep circles circular
                const size = Math.min(newWidth, newHeight);
                newWidth = size;
                newHeight = size;
            }

            return {
                ...layer,
                x: newCenterX - newWidth / 2,
                y: newCenterY - newHeight / 2,
                width: newWidth,
                height: newHeight,
                fontSize: newFontSize
            };
        }));
    }, []);


    const syncLayersWithMeta = useCallback(() => {
        setLayers(prev => prev.map(l => {
            if (l.role === 'title') return { ...l, content: meta.title };
            if (l.role === 'subtitle') return { ...l, content: meta.subtitle };
            if (l.role === 'guest_name') return { ...l, content: meta.guest_name };
            if (l.role === 'date') return { ...l, content: meta.date };
            if (l.role === 'extra1') return { ...l, content: meta.extra1 };
            if (l.role === 'extra2') return { ...l, content: meta.extra2 };
            return l;
        }));
    }, [meta]);

    const addOptionalLayer = useCallback((role: LayerRole) => {
        const existing = layers.find(l => l.role === role);
        const { w, h } = DIMENSIONS[assetType];

        if (existing) {
            // "Freeze" the existing layer by changing its role to manual
            // so it stays on canvas and stops syncing with meta
            setLayers(prev => prev.map(l => l.id === existing.id ? { ...l, role: 'manual' } : l));
            setSelectedLayerId(existing.id);
            return;
        }

        // If no existing layer, create a new manual one with current meta content
        const newLayer: Layer = {
            id: Math.random().toString(36).substr(2, 9),
            role: 'manual', // Independent from now on
            type: 'text',
            content: meta[role] || (role === 'guest_name' ? 'NOM DE L\'INVITÉ' : 'INFO COMPLÉMENTAIRE'),
            x: w * 0.1 + (Math.random() * 40 - 20),
            y: h * 0.7 + (Math.random() * 40 - 20),
            width: 400, height: 80,
            fontSize: 40, color: COLORS.WHITE, fontFamily: 'Roboto Condensed',
            zIndex: layers.length + 1, rotation: 0, hasScratch: false
        };
        setLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
    }, [layers, assetType, meta]);

    const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }, []);

    const removeLayer = useCallback((id: string) => {
        setLayers(prev => prev.filter(l => l.id !== id));
        if (selectedLayerId === id) setSelectedLayerId(null);
    }, [selectedLayerId]);

    const duplicateLayer = useCallback((id: string) => {
        const toDuplicate = layers.find(l => l.id === id);
        if (toDuplicate) {
            const newLayer = {
                ...toDuplicate,
                id: Math.random().toString(36).substr(2, 9),
                x: toDuplicate.x + 20,
                y: toDuplicate.y + 20,
                zIndex: layers.length + 1
            };
            setLayers(prev => [...prev, newLayer]);
            setSelectedLayerId(newLayer.id);
        }
    }, [layers]);

    const moveLayer = useCallback((direction: 'up' | 'down') => {
        if (!selectedLayerId) return;

        setLayers(prev => {
            const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
            const currentIndex = sorted.findIndex(l => l.id === selectedLayerId);

            if (direction === 'up' && currentIndex < sorted.length - 1) {
                const currentLayer = sorted[currentIndex];
                const nextLayer = sorted[currentIndex + 1];

                const newLayers = prev.map(l => {
                    if (l.id === currentLayer.id) return { ...l, zIndex: nextLayer.zIndex };
                    if (l.id === nextLayer.id) return { ...l, zIndex: currentLayer.zIndex };
                    return l;
                });

                return newLayers.map(l => {
                    if (l.id === currentLayer.id && l.zIndex === nextLayer.zIndex) {
                        return { ...l, zIndex: l.zIndex + 1 };
                    }
                    return l;
                });
            } else if (direction === 'down' && currentIndex > 0) {
                const currentLayer = sorted[currentIndex];
                const prevLayer = sorted[currentIndex - 1];

                const newLayers = prev.map(l => {
                    if (l.id === currentLayer.id) return { ...l, zIndex: prevLayer.zIndex };
                    if (l.id === prevLayer.id) return { ...l, zIndex: currentLayer.zIndex };
                    return l;
                });

                return newLayers.map(l => {
                    if (l.id === prevLayer.id && l.zIndex === currentLayer.zIndex) {
                        return { ...l, zIndex: l.zIndex + 1 };
                    }
                    return l;
                });
            }
            return prev;
        });
    }, [selectedLayerId]);

    const copyLayer = useCallback(() => {
        const toCopy = layers.find(l => l.id === selectedLayerId);
        if (toCopy) {
            clipboard.current = { ...toCopy };
        }
    }, [layers, selectedLayerId]);

    const pasteLayer = useCallback(() => {
        if (!clipboard.current) return;

        const newLayer = {
            ...clipboard.current,
            id: Math.random().toString(36).substr(2, 9),
            x: clipboard.current.x + 20,
            y: clipboard.current.y + 20,
            zIndex: layers.length + 1
        };

        setLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
    }, [layers.length]);

    // Keyboard shortcuts logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedLayerId) return;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) return;

            const step = e.shiftKey ? 10 : 1;

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                updateLayer(selectedLayerId, { y: (layers.find(l => l.id === selectedLayerId)?.y || 0) - step });
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                updateLayer(selectedLayerId, { y: (layers.find(l => l.id === selectedLayerId)?.y || 0) + step });
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                updateLayer(selectedLayerId, { x: (layers.find(l => l.id === selectedLayerId)?.x || 0) - step });
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                updateLayer(selectedLayerId, { x: (layers.find(l => l.id === selectedLayerId)?.x || 0) + step });
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                removeLayer(selectedLayerId);
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                duplicateLayer(selectedLayerId);
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                copyLayer();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                pasteLayer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedLayerId, layers, updateLayer, removeLayer, duplicateLayer, copyLayer, pasteLayer]);

    return {
        layers,
        setLayers,
        selectedLayerId,
        setSelectedLayerId,
        selectedLayer: layers.find(l => l.id === selectedLayerId),
        activeGuides,
        setActiveGuides,
        applyDefaultTemplate,
        syncLayersWithMeta,
        addOptionalLayer,
        updateLayer,
        removeLayer,
        duplicateLayer,
        moveLayer,
        copyLayer,
        pasteLayer,
        applyTemplate,
        adaptLayersToFormat
    };
};
