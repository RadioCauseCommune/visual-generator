import JSZip from 'jszip';
import React from 'react';
import * as htmlToImage from 'html-to-image';
import { useCallback, useRef } from 'react';
import { AssetType, Layer, ProjectExport, LayerRole } from '../types';
import { DIMENSIONS, FONTS } from '../constants';
import { calculateCanvasScale } from '../utils/canvasUtils';
import { validateFile } from '../utils/fileValidation';

export const useProject = (
    assetType: AssetType,
    layers: Layer[],
    meta: any,
    setAssetType: (type: AssetType) => void,
    setLayers: (layers: Layer[] | ((prev: Layer[]) => Layer[])) => void,
    setMeta: (meta: any) => void,
    setSelectedLayerId: (id: string | null) => void,
    showError: (msg: string) => void
) => {

    // Cache pour les polices inlinées afin d'éviter de les re-télécharger à chaque export
    const fontCache = useRef<string | null>(null);

    const getSafeFontEmbedCSS = useCallback(async () => {
        if (fontCache.current) return fontCache.current;

        console.log('🏗️ Préparation manuelle des polices (Base64)...');
        let css = '';
        const sheets = Array.from(document.styleSheets);

        for (const sheet of sheets) {
            try {
                const rules = Array.from(sheet.cssRules);
                for (const rule of rules) {
                    if (rule instanceof CSSFontFaceRule) {
                        const family = rule.style.getPropertyValue('font-family').replace(/['"]/g, '');
                        if (FONTS.includes(family)) {
                            css += rule.cssText + '\n';
                        }
                    }
                }
            } catch (e) {
                // Échec de lecture (cross-origin), on ignore
            }
        }

        // Inlining des fichiers de polices
        const urlRegex = /url\(['"]?([^'")]*)['"]?\)/g;
        const matches = Array.from(css.matchAll(urlRegex));
        let inlinedCss = css;

        for (const match of matches) {
            const url = match[1];
            if (url.startsWith('data:')) continue;

            try {
                const absoluteUrl = new URL(url, document.baseURI).href;
                console.log(`  📥 Inlining font: ${absoluteUrl}`);
                const resp = await fetch(absoluteUrl);
                const blob = await resp.blob();
                const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                inlinedCss = inlinedCss.split(url).join(dataUrl);
            } catch (e) {
                console.warn(`  ⚠️ Échec inlining font: ${url}`, e);
            }
        }

        fontCache.current = inlinedCss;
        return inlinedCss;
    }, []);

    const captureImage = useCallback(async (type: AssetType = assetType, format: 'png' | 'webp' = 'png'): Promise<string | null> => {
        const { w, h } = DIMENSIONS[type];
        const canvasElement = document.getElementById('canvas');

        if (!canvasElement) {
            showError("Erreur : Canevas introuvable.");
            return null;
        }

        try {
            // Ensure fonts are loaded in browser first
            console.log('🔤 Vérification des polices locales...');
            const FONT_WEIGHTS: Record<string, string[]> = {
                'Syne': ['700', '800'],
                'Roboto Condensed': ['700', '800', '900'],
                'Anton': ['400'],
                'Archivo Black': ['400'],
                'Space Grotesk': ['700'],
                'Lexend Zetta': ['900'],
                'Bungee': ['400'],
                'Ultra': ['400'],
                'Permanent Marker': ['400'],
                'Special Elite': ['400'],
                'Rock Salt': ['400'],
                'UnifrakturMaguntia': ['400'],
                'VT323': ['400']
            };

            const fontPromises = FONTS.flatMap(fontFamily => {
                const weights = FONT_WEIGHTS[fontFamily] || ['400'];
                return weights.map(weight => {
                    return document.fonts.load(`${weight} 24px "${fontFamily}"`).catch(() => null);
                });
            });

            await Promise.all(fontPromises);
            await document.fonts.ready;
            console.log('✅ Polices prêtes');

            // Collecte manuelle du CSS des polices pour éviter le crash de html-to-image
            const safeFontCSS = await getSafeFontEmbedCSS();

            // Wait for images to be ready and identify broken ones
            const images = Array.from(canvasElement.getElementsByTagName('img'));
            const imagePromises = images.map(img => {
                img.removeAttribute('data-ignore-capture');
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                if (img.complete && img.naturalWidth === 0) {
                    img.setAttribute('data-ignore-capture', 'true');
                    return Promise.resolve();
                }

                return new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => {
                        img.setAttribute('data-ignore-capture', 'true');
                        resolve();
                    };
                    setTimeout(() => {
                        if (!img.complete || img.naturalWidth === 0) {
                            img.setAttribute('data-ignore-capture', 'true');
                        }
                        resolve();
                    }, 4000);
                });
            });

            await Promise.all(imagePromises);
            console.log('✅ Images vérifiées');

            await new Promise(resolve => setTimeout(resolve, 350));

            const scale = calculateCanvasScale(w, h);
            const exportOptions = {
                width: w / scale,
                height: h / scale,
                pixelRatio: scale,
                backgroundColor: meta.isTransparent ? 'transparent' : '#FFFFFF',
                cacheBust: true,
                skipFonts: false, // On réactive car on fournit notre propre CSS
                fontEmbedCSS: safeFontCSS, // Bypass le scan auto de la lib qui plante
                style: { transform: 'scale(1)' },
                filter: (node: HTMLElement) => {
                    if (node.classList?.contains('guide') || node.id === 'canvas-container') return false;
                    if (node.hasAttribute && node.hasAttribute('data-ignore-capture')) return false;
                    return true;
                }
            };

            if (format === 'webp') {
                const canvas = await htmlToImage.toCanvas(canvasElement, exportOptions);
                return canvas.toDataURL('image/webp', 0.9);
            }
            return await htmlToImage.toPng(canvasElement, exportOptions);
        } catch (err) {
            console.error('❌ Erreur capture:', err);
            return null;
        }
    }, [assetType, showError, meta.isTransparent]);

    const handleExportImage = useCallback(async (format: 'png' | 'webp' = 'png') => {
        setSelectedLayerId(null);
        await new Promise(resolve => setTimeout(resolve, 500));

        const dataUrl = await captureImage(assetType, format);
        if (dataUrl) {
            const link = document.createElement('a');
            link.download = `rc-asset-${meta.title.toLowerCase().replace(/\s/g, '-')}.${format}`;
            link.href = dataUrl;
            link.click();
        } else {
            showError(`Erreur lors de l'exportation au format ${format.toUpperCase()}.`);
        }
    }, [captureImage, assetType, meta.title, setSelectedLayerId, showError]);

    const handleExportSvg = useCallback(async () => {
        setSelectedLayerId(null);
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvasElement = document.getElementById('canvas');
        if (!canvasElement) return;

        try {
            const { w, h } = DIMENSIONS[assetType];
            const scale = calculateCanvasScale(w, h);
            const exportOptions = {
                width: w / scale,
                height: h / scale,
                pixelRatio: scale,
                backgroundColor: meta.isTransparent ? 'transparent' : '#FFFFFF',
                cacheBust: true,
                style: { transform: 'scale(1)' },
                filter: (node: HTMLElement) => {
                    return !(node.classList?.contains('guide') || node.id === 'canvas-container');
                }
            };
            const dataUrl = await htmlToImage.toSvg(canvasElement, exportOptions);
            const link = document.createElement('a');
            link.download = `rc-asset-${meta.title.toLowerCase().replace(/\s/g, '-')}.svg`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('❌ Erreur export SVG:', err);
            showError("Erreur lors de l'exportation SVG.");
        }
    }, [assetType, meta.title, meta.isTransparent, setSelectedLayerId, showError]);

    const handleBatchExport = useCallback(async (
        selectedTypes: AssetType[],
        onProgress: (p: number) => void
    ) => {
        if (selectedTypes.length === 0) return;

        const zip = new JSZip();
        setSelectedLayerId(null);

        for (let i = 0; i < selectedTypes.length; i++) {
            const type = selectedTypes[i];
            onProgress(i + 1);
            setAssetType(type);
            await new Promise(resolve => setTimeout(resolve, 800));

            const dataUrl = await captureImage(type, 'png'); // Always PNG for batch for now
            if (dataUrl) {
                const base64Data = dataUrl.split(',')[1];
                const fileName = `${type.split(' (')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
                zip.file(fileName, base64Data, { base64: true });
            }
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = `rc-bundle-${meta.title.toLowerCase().replace(/\s/g, '-')}.zip`;
        link.href = URL.createObjectURL(content);
        link.click();

    }, [captureImage, meta.title, setAssetType, setSelectedLayerId]);

    const handleExportProject = useCallback(() => {
        const project: ProjectExport = { version: '1.2', assetType, layers, meta };
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `rc-project-${meta.title.toLowerCase().replace(/\s/g, '-')}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    }, [assetType, layers, meta]);

    const handleImportProject = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const project = JSON.parse(ev.target?.result as string) as ProjectExport;
                setAssetType(project.assetType);
                setLayers(project.layers);
                setMeta({
                    title: project.meta.title,
                    subtitle: project.meta.subtitle,
                    guest_name: project.meta.guest_name || '',
                    date: project.meta.date || '',
                    extra1: project.meta.extra1 || '',
                    extra2: project.meta.extra2 || '',
                    isTransparent: project.meta.isTransparent || false,
                });
            } catch (err) {
                showError("Fichier JSON invalide.");
            }
        };
        reader.readAsText(file);
    }, [setAssetType, setLayers, setMeta, showError]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, role: LayerRole) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateFile(file);
        if (!validation.isValid) {
            showError(validation.error!);
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const url = ev.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const { w, h } = DIMENSIONS[assetType];
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                const imageAspectRatio = naturalWidth / naturalHeight;

                if (role === 'background') {
                    const existingBackground = layers.find(l => l.role === 'background');
                    if (existingBackground) {
                        setLayers(prev => prev.map(l => l.role === 'background' ? {
                            ...l,
                            content: url,
                            imageNaturalWidth: naturalWidth,
                            imageNaturalHeight: naturalHeight,
                            imageOffsetX: l.imageOffsetX ?? 50,
                            imageOffsetY: l.imageOffsetY ?? 50
                        } : l));
                    } else {
                        const newLayer: Layer = {
                            id: Math.random().toString(36).substr(2, 9),
                            role: 'background', type: 'image', content: url,
                            x: 0, y: 0, width: w, height: h,
                            zIndex: 0, rotation: 0,
                            imageNaturalWidth: naturalWidth,
                            imageNaturalHeight: naturalHeight,
                            imageOffsetX: 50,
                            imageOffsetY: 50
                        };
                        setLayers(prev => [newLayer, ...prev]);
                    }
                } else if (role === 'guest_photo') {
                    // Toujours créer un nouveau layer guest_photo (support multi-invités)
                    const existingCount = layers.filter(l => l.role === 'guest_photo').length;
                    const offset = existingCount * 30;
                    const targetSize = Math.min(w * 0.4, h * 0.4, 500);
                    let layerWidth = targetSize;
                    let layerHeight = targetSize;

                    if (imageAspectRatio > 1) {
                        layerHeight = targetSize / imageAspectRatio;
                    } else {
                        layerWidth = targetSize * imageAspectRatio;
                    }

                    const newLayer: Layer = {
                        id: Math.random().toString(36).substr(2, 9),
                        role: 'guest_photo', type: 'image', content: url,
                        x: w * 0.65 + offset, y: h * 0.15 + offset, width: layerWidth, height: layerHeight,
                        zIndex: 8 + existingCount, rotation: 0, clipShape: 'circle',
                        imageNaturalWidth: naturalWidth,
                        imageNaturalHeight: naturalHeight,
                        imageOffsetX: 50,
                        imageOffsetY: 50
                    };
                    setLayers(prev => [...prev, newLayer]);
                    setSelectedLayerId(newLayer.id);
                } else if (role === 'logo') {
                    const targetSize = Math.max(100, Math.min(w * 0.15, 300));
                    const newLayer: Layer = {
                        id: Math.random().toString(36).substr(2, 9),
                        role: 'logo',
                        type: 'logo',
                        content: url,
                        x: w * 0.05,
                        y: h * 0.05,
                        width: targetSize,
                        height: targetSize,
                        zIndex: layers.length + 1,
                        rotation: 0,
                        imageNaturalWidth: naturalWidth,
                        imageNaturalHeight: naturalHeight
                    };
                    setLayers(prev => [...prev, newLayer]);
                    setSelectedLayerId(newLayer.id);
                } else {
                    const maxSize = Math.min(w * 0.6, h * 0.6, 800);
                    let layerWidth = maxSize;
                    let layerHeight = maxSize;

                    if (imageAspectRatio > 1) {
                        layerHeight = maxSize / imageAspectRatio;
                    } else {
                        layerWidth = maxSize * imageAspectRatio;
                    }

                    const newLayer: Layer = {
                        id: Math.random().toString(36).substr(2, 9),
                        role: 'manual', type: 'image', content: url,
                        x: 50, y: 50, width: layerWidth, height: layerHeight,
                        zIndex: layers.length + 1, rotation: 0,
                        imageNaturalWidth: naturalWidth,
                        imageNaturalHeight: naturalHeight,
                        imageOffsetX: 50,
                        imageOffsetY: 50
                    };
                    setLayers(prev => [...prev, newLayer]);
                    setSelectedLayerId(newLayer.id);
                }
            };
            img.src = url;
        };
        reader.readAsDataURL(file);
    }, [assetType, layers, setLayers, setSelectedLayerId, showError]);

    return {
        handleExportImage,
        handleExportSvg,
        handleExportProject,
        handleImportProject,
        handleFileUpload,
        handleBatchExport
    };
};
