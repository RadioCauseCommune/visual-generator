import JSZip from 'jszip';
import React from 'react';
import * as htmlToImage from 'html-to-image';
import { useCallback, useRef } from 'react';
import { AssetType, Layer, ProjectExport, LayerRole } from '../types';
import { DIMENSIONS, FONTS } from '../constants';
import { calculateCanvasScale } from '../utils/canvasUtils';
import { validateFile } from '../utils/fileValidation';
import { autoSelectBestLayout, calculateCompositionLayout } from '../utils/compositionLayouts';

interface LoadedImageInfo {
    url: string;
    naturalWidth: number;
    naturalHeight: number;
}

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

    const readImageData = useCallback((file: File): Promise<{ url: string; naturalWidth: number; naturalHeight: number }> => {
        return new Promise((resolve, reject) => {
            const validation = validateFile(file);
            if (!validation.isValid) {
                reject(new Error(validation.error || "Fichier non valide"));
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const url = ev.target?.result as string;
                const img = new Image();
                img.onload = () => resolve({ url, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
                img.onerror = () => reject(new Error("Erreur de décodage de l'image"));
                img.src = url;
            };
            reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
            reader.readAsDataURL(file);
        });
    }, []);

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, role: LayerRole) => {
        const rawFiles = e.target.files;
        if (!rawFiles || rawFiles.length === 0) return;
        const files = Array.from(rawFiles);
        const { w, h } = DIMENSIONS[assetType];

        // --- GESTION BACKGROUND MULTI-IMAGES OU SIMPLE ---
        if (role === 'background') {
            try {
                const loadedImages: LoadedImageInfo[] = await Promise.all(files.map(f => readImageData(f)));
                if (loadedImages.length === 0) return;

                if (loadedImages.length === 1) {
                    const img = loadedImages[0];
                    const existingBackgrounds = layers.filter(l => l.role === 'background');

                    if (existingBackgrounds.length === 1) {
                        // Remplacement simple de l'unique fond
                        setLayers(prev => prev.map(l => l.role === 'background' ? {
                            ...l,
                            content: img.url,
                            imageNaturalWidth: img.naturalWidth,
                            imageNaturalHeight: img.naturalHeight,
                            imageOffsetX: l.imageOffsetX ?? 50,
                            imageOffsetY: l.imageOffsetY ?? 50,
                            imageScale: 100
                        } : l));
                    } else {
                        // Remplace tout le fond par une seule image plein écran
                        const nonBgLayers = layers.filter(l => l.role !== 'background');
                        const newLayer: Layer = {
                            id: Math.random().toString(36).substr(2, 9),
                            role: 'background',
                            type: 'image',
                            content: img.url,
                            x: 0, y: 0, width: w, height: h,
                            zIndex: 0, rotation: 0,
                            imageNaturalWidth: img.naturalWidth,
                            imageNaturalHeight: img.naturalHeight,
                            imageOffsetX: 50,
                            imageOffsetY: 50,
                            imageScale: 100
                        };
                        setLayers([newLayer, ...nonBgLayers]);
                    }
                } else {
                    // Plusieurs images : création d'une composition
                    const layoutType = autoSelectBestLayout(assetType, loadedImages.length);
                    const boxes = calculateCompositionLayout(layoutType, loadedImages.length, w, h, 0);

                    const newBgLayers: Layer[] = loadedImages.map((img, i) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        role: 'background',
                        type: 'image',
                        content: img.url,
                        x: boxes[i]?.x ?? 0,
                        y: boxes[i]?.y ?? 0,
                        width: boxes[i]?.width ?? w,
                        height: boxes[i]?.height ?? h,
                        zIndex: i,
                        rotation: 0,
                        imageNaturalWidth: img.naturalWidth,
                        imageNaturalHeight: img.naturalHeight,
                        imageOffsetX: 50,
                        imageOffsetY: 50,
                        imageScale: 100
                    }));

                    const nonBgLayers = layers.filter(l => l.role !== 'background');
                    setLayers([...newBgLayers, ...nonBgLayers]);
                    if (newBgLayers[0]) {
                        setSelectedLayerId(newBgLayers[0].id);
                    }
                }
            } catch (err: any) {
                showError(err.message || "Erreur lors du chargement des images de fond.");
            }
            return;
        }

        // --- GESTION AUTRES ROLES (guest_photo, logo, manual) ---
        for (const file of files) {
            try {
                const { url, naturalWidth, naturalHeight }: LoadedImageInfo = await readImageData(file);
                const imageAspectRatio = naturalWidth / naturalHeight;

                if (role === 'guest_photo') {
                    setLayers(prev => {
                        const existingCount = prev.filter(l => l.role === 'guest_photo').length;
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
                        setSelectedLayerId(newLayer.id);
                        return [...prev, newLayer];
                    });
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
            } catch (err: any) {
                showError(err.message || "Erreur de chargement de fichier.");
            }
        }
    }, [assetType, layers, readImageData, setLayers, setSelectedLayerId, showError]);

    // Ajouter des images à la composition de fond existante
    const appendBackgroundFiles = useCallback(async (files: FileList | File[]) => {
        const fileArr = Array.from(files);
        if (fileArr.length === 0) return;
        const { w, h } = DIMENSIONS[assetType];

        try {
            const newLoaded: LoadedImageInfo[] = await Promise.all(fileArr.map(f => readImageData(f)));
            const existingBgs = layers.filter(l => l.role === 'background');
            const totalCount = existingBgs.length + newLoaded.length;

            const layoutType = autoSelectBestLayout(assetType, totalCount);
            const boxes = calculateCompositionLayout(layoutType, totalCount, w, h, 0);

            // Mettre à jour les calques de fond existants avec les nouvelles dimensions
            const updatedExistingBgs = existingBgs.map((l, i) => ({
                ...l,
                x: boxes[i]?.x ?? l.x,
                y: boxes[i]?.y ?? l.y,
                width: boxes[i]?.width ?? l.width,
                height: boxes[i]?.height ?? l.height,
            }));

            // Créer les nouveaux calques de fond
            const createdBgs: Layer[] = newLoaded.map((img, i) => {
                const boxIndex = existingBgs.length + i;
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    role: 'background',
                    type: 'image',
                    content: img.url,
                    x: boxes[boxIndex]?.x ?? 0,
                    y: boxes[boxIndex]?.y ?? 0,
                    width: boxes[boxIndex]?.width ?? w,
                    height: boxes[boxIndex]?.height ?? h,
                    zIndex: boxIndex,
                    rotation: 0,
                    imageNaturalWidth: img.naturalWidth,
                    imageNaturalHeight: img.naturalHeight,
                    imageOffsetX: 50,
                    imageOffsetY: 50,
                    imageScale: 100
                };
            });

            const nonBgLayers = layers.filter(l => l.role !== 'background');
            setLayers([...updatedExistingBgs, ...createdBgs, ...nonBgLayers]);
            if (createdBgs[0]) {
                setSelectedLayerId(createdBgs[0].id);
            }
        } catch (err: any) {
            showError(err.message || "Erreur lors de l'ajout d'images au fond.");
        }
    }, [assetType, layers, readImageData, setLayers, setSelectedLayerId, showError]);

    // Remplacer une image spécifique de la composition
    const replaceBackgroundImageFile = useCallback(async (layerId: string, file: File) => {
        try {
            const { url, naturalWidth, naturalHeight } = await readImageData(file);
            setLayers(prev => prev.map(l => l.id === layerId ? {
                ...l,
                content: url,
                imageNaturalWidth: naturalWidth,
                imageNaturalHeight: naturalHeight,
            } : l));
        } catch (err: any) {
            showError(err.message || "Erreur lors du remplacement de l'image.");
        }
    }, [readImageData, setLayers, showError]);

    // Supprimer une image de la composition et réajuster la grille restante
    const removeBackgroundImage = useCallback((layerId: string) => {
        const { w, h } = DIMENSIONS[assetType];
        setLayers(prev => {
            const remainingBgs = prev.filter(l => l.role === 'background' && l.id !== layerId);
            if (remainingBgs.length === 0) {
                return prev.filter(l => l.id !== layerId);
            }

            const layoutType = autoSelectBestLayout(assetType, remainingBgs.length);
            const boxes = calculateCompositionLayout(layoutType, remainingBgs.length, w, h, 0);

            let bgIdx = 0;
            const updatedBgs = remainingBgs.map((l, i) => ({
                ...l,
                x: boxes[i]?.x ?? l.x,
                y: boxes[i]?.y ?? l.y,
                width: boxes[i]?.width ?? l.width,
                height: boxes[i]?.height ?? l.height,
            }));

            const nonBgs = prev.filter(l => l.role !== 'background');
            return [...updatedBgs, ...nonBgs];
        });
        setSelectedLayerId(null);
    }, [assetType, setLayers, setSelectedLayerId]);

    return {
        handleExportImage,
        handleExportSvg,
        handleExportProject,
        handleImportProject,
        handleFileUpload,
        handleBatchExport,
        captureImage,
        appendBackgroundFiles,
        replaceBackgroundImageFile,
        removeBackgroundImage,
    };
};
