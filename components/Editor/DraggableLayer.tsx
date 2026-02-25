
import React, { useRef } from 'react';
import { Layer } from '../../types';
import { COLORS } from '../../constants';

const hexToRgba = (hex: string, opacity: number) => {
    // Supprime le # si présent
    const safeHex = hex.startsWith('#') ? hex : '#000000';
    const r = parseInt(safeHex.slice(1, 3), 16) || 0;
    const g = parseInt(safeHex.slice(3, 5), 16) || 0;
    const b = parseInt(safeHex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

interface DraggableLayerProps {
    layer: Layer;
    otherLayers: Layer[];
    isSelected: boolean;
    onSelect: (e: React.MouseEvent) => void;
    onUpdate: (updates: Partial<Layer>) => void;
    canvasScale: number;
    canvasDimensions: { w: number, h: number };
    setActiveGuides: (guides: { x?: number, y?: number } | null) => void;
}

const DraggableLayer: React.FC<DraggableLayerProps> = ({
    layer,
    otherLayers,
    isSelected,
    onSelect,
    onUpdate,
    canvasScale,
    canvasDimensions,
    setActiveGuides
}) => {
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        onSelect(e);
        isDragging.current = true;
        const canvasElement = (e.currentTarget as HTMLElement).closest('#canvas') as HTMLElement;
        const canvasRect = canvasElement?.getBoundingClientRect();

        if (canvasRect) {
            // Calculer la position relative au canvas (en tenant compte du scale)
            const relativeX = (e.clientX - canvasRect.left) * canvasScale;
            const relativeY = (e.clientY - canvasRect.top) * canvasScale;
            startPos.current = { x: relativeX - layer.x, y: relativeY - layer.y };
        } else {
            startPos.current = { x: e.clientX - layer.x, y: e.clientY - layer.y };
        }

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isDragging.current) return;

            const canvasElement = document.getElementById('canvas');
            const canvasRect = canvasElement?.getBoundingClientRect();

            if (canvasRect) {
                // Calculer la nouvelle position relative au canvas (en tenant compte du scale)
                let newX = (moveEvent.clientX - canvasRect.left) * canvasScale - startPos.current.x;
                let newY = (moveEvent.clientY - canvasRect.top) * canvasScale - startPos.current.y;

                // --- SNAPPING LOGIC ---
                const snapThreshold = 15; // pixels
                const guides: { x?: number, y?: number } = {};

                const layerW = layer.width;
                const layerH = layer.type === 'text' ? (layer.fontSize || 24) * (layer.lineHeight || 1.2) : layer.height;

                // 1. Points d'aimantation verticaux (X)
                const xSnaps = [
                    0, // Bord gauche
                    canvasDimensions.w / 2, // Centre canvas
                    canvasDimensions.w, // Bord droit
                    ...otherLayers.filter(l => l.id !== layer.id).flatMap(l => [
                        l.x, // Bord gauche
                        l.x + l.width / 2, // Centre
                        l.x + l.width // Bord droit
                    ])
                ];

                // Check Left Edge, Center X, Right Edge
                const currentXPoints = [
                    { value: newX, offset: 0 }, // Left edge
                    { value: newX + layerW / 2, offset: -layerW / 2 }, // Center
                    { value: newX + layerW, offset: -layerW } // Right edge
                ];

                let snappedX = false;
                for (const xPoint of currentXPoints) {
                    for (const snapValue of xSnaps) {
                        if (Math.abs(xPoint.value - snapValue) < snapThreshold) {
                            newX = snapValue + xPoint.offset;
                            guides.x = snapValue;
                            snappedX = true;
                            break;
                        }
                    }
                    if (snappedX) break;
                }

                // 2. Points d'aimantation horizontaux (Y)
                const ySnaps = [
                    0, // Bord haut
                    canvasDimensions.h / 2, // Centre canvas
                    canvasDimensions.h, // Bord bas
                    ...otherLayers.filter(l => l.id !== layer.id).flatMap(l => {
                        const h = l.type === 'text' ? (l.fontSize || 24) * (l.lineHeight || 1.2) : l.height;
                        return [
                            l.y, // Bord haut
                            l.y + h / 2, // Centre
                            l.y + h // Bord bas
                        ];
                    })
                ];

                const currentYPoints = [
                    { value: newY, offset: 0 }, // Top edge
                    { value: newY + layerH / 2, offset: -layerH / 2 }, // Center
                    { value: newY + layerH, offset: -layerH } // Bottom edge
                ];

                let snappedY = false;
                for (const yPoint of currentYPoints) {
                    for (const snapValue of ySnaps) {
                        if (Math.abs(yPoint.value - snapValue) < snapThreshold) {
                            newY = snapValue + yPoint.offset;
                            guides.y = snapValue;
                            snappedY = true;
                            break;
                        }
                    }
                    if (snappedY) break;
                }

                setActiveGuides(Object.keys(guides).length > 0 ? guides : null);
                onUpdate({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            setActiveGuides(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${layer.x / canvasScale}px`,
        top: `${layer.y / canvasScale}px`,
        width: layer.type === 'text' ? `${layer.width / canvasScale}px` : `${layer.width / canvasScale}px`,
        height: layer.type === 'text' ? 'auto' : `${layer.height / canvasScale}px`,
        zIndex: layer.zIndex,
        transform: `rotate(${layer.rotation}deg)`,
        cursor: 'move',
        userSelect: 'none',
        border: isSelected
            ? '2px dashed #D20A33'
            : (layer.scratchShadow && layer.clipShape === 'square' ? `${Math.max(2, (layer.width / canvasScale) / 50)}px solid #000` : 'none'),
        boxShadow: (layer.scratchShadow && layer.clipShape === 'square')
            ? `${Math.max(4, (layer.width / canvasScale) / 30)}px ${Math.max(4, (layer.width / canvasScale) / 30)}px 0px 0px #000`
            : 'none',
        outline: isSelected ? '200px solid rgba(210, 10, 51, 0.05)' : 'none',
        borderRadius: layer.clipShape === 'circle' ? '50%' : '0',
        overflow: (layer.type === 'text' || layer.scratchShadow) ? 'visible' : 'hidden', // Permettre au box-shadow de dépasser
        backgroundColor: layer.type === 'logo' && layer.overlayColor ? layer.overlayColor : 'transparent',
        padding: layer.type === 'logo' && layer.clipShape === 'circle' ? `${layer.width * ((layer.logoPadding ?? 10) / 100) / canvasScale}px` : '0',
        boxSizing: 'border-box'
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div style={style} onMouseDown={handleMouseDown} onClick={handleClick}>
            {layer.type === 'text' && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: (layer.textAlign === 'center' || (!layer.textAlign && layer.hasScratch))
                            ? 'center'
                            : (layer.textAlign === 'right' ? 'flex-end' : 'flex-start'),
                        width: '100%'
                    }}
                >
                    <div
                        style={{
                            fontSize: `${(layer.fontSize || 24) / canvasScale}px`,
                            color: layer.color,
                            fontFamily: layer.fontFamily ? `"${layer.fontFamily}", sans-serif` : 'sans-serif',
                            fontWeight: layer.fontWeight || (() => {
                                if (layer.fontFamily === 'Syne') return 800;
                                if (layer.fontFamily === 'Roboto Condensed' || layer.fontFamily === 'Lexend Zetta') return 900;
                                if (layer.fontFamily === 'Space Grotesk') return 700;
                                return 400; // Default for others like Anton, Bungee, etc.
                            })(),
                            fontStyle: layer.fontStyle || 'normal',
                            textAlign: layer.textAlign || (layer.hasScratch ? 'center' : 'left'),
                            textTransform: layer.textTransform || 'none',
                            lineHeight: layer.lineHeight || 0.9,
                            hyphens: layer.hyphens ? 'auto' : 'none',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            WebkitTextStroke: layer.strokeWidth ? `${layer.strokeWidth / canvasScale}px ${layer.strokeColor || '#000'}` : 'none',
                            textShadow: layer.shadowBlur ? `${(layer.shadowOffsetX || 0) / canvasScale}px ${(layer.shadowOffsetY || 0) / canvasScale}px ${(layer.shadowBlur || 0) / canvasScale}px ${layer.shadowColor || 'rgba(0,0,0,0.5)'}` : 'none',
                            ...(layer.hasScratch && layer.scratchColor ? {
                                backgroundColor: hexToRgba(layer.scratchColor, layer.scratchOpacity ?? 100),
                                border: `${Math.max(2, (layer.fontSize || 24) / canvasScale / 25)}px solid ${layer.scratchBorderColor || COLORS.BLACK}`,
                                padding: `${Math.max(4, (layer.fontSize || 24) / canvasScale / 15)}px ${Math.max(8, (layer.fontSize || 24) / canvasScale / 8)}px`,
                                boxSizing: 'border-box',
                                textAlign: layer.textAlign || 'center',
                                display: 'inline-block',
                                width: 'auto',
                                boxShadow: layer.scratchShadow
                                    ? `${Math.max(4, (layer.fontSize || 24) / canvasScale / 8)}px ${Math.max(4, (layer.fontSize || 24) / canvasScale / 8)}px 0px 0px ${layer.scratchBorderColor || COLORS.BLACK}`
                                    : 'none'
                            } : {
                                width: '100%',
                            })
                        } as React.CSSProperties}
                    >
                        {layer.content}
                    </div>
                </div>
            )}
            {layer.type === 'logo' && (
                <img
                    src={layer.content}
                    alt="Logo Cause Commune"
                    className="w-full h-full object-contain"
                    draggable={false}
                    crossOrigin="anonymous"
                    onError={(e) => {
                        console.error('Erreur chargement logo:', layer.content);
                        e.currentTarget.style.display = 'none';
                    }}
                />
            )}
            {layer.type === 'image' && (
                <>
                    <img
                        src={layer.content}
                        className="w-full h-full object-cover"
                        draggable={false}
                        crossOrigin="anonymous"
                        onError={(e) => {
                            console.error('Erreur chargement image layer:', layer.content);
                            e.currentTarget.style.opacity = '0.5'; // Visual indicator of error
                        }}
                        style={{
                            borderRadius: layer.clipShape === 'circle' ? '50%' : '0',
                            objectPosition: layer.imageOffsetX !== undefined && layer.imageOffsetY !== undefined
                                ? `${layer.imageOffsetX}% ${layer.imageOffsetY}%`
                                : '50% 50%',
                            transform: layer.imageScale && layer.imageScale !== 100 ? `scale(${layer.imageScale / 100})` : 'none',
                        }}
                    />
                    {layer.role === 'background' && layer.overlayColor && layer.overlayOpacity !== undefined && layer.overlayOpacity > 0 && (
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundColor: layer.overlayColor,
                                opacity: layer.overlayOpacity / 100,
                                borderRadius: layer.clipShape === 'circle' ? '50%' : '0'
                            }}
                        />
                    )}
                </>
            )}
            {layer.type === 'gradient' && (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(${layer.gradientDirection || 135}deg, ${layer.gradientColor1 || '#D20A33'}, ${layer.gradientColor2 || '#9D00FF'})`,
                        borderRadius: layer.clipShape === 'circle' ? '50%' : '0'
                    }}
                />
            )}
        </div>
    );
};

export default DraggableLayer;
