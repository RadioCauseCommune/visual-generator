
import React from 'react';
import { AssetType, Layer } from '../../types';
import { DIMENSIONS } from '../../constants';
import { calculateCanvasScale } from '../../utils/canvasUtils';
import DraggableLayer from './DraggableLayer';
import ContextualToolbar from './ContextualToolbar';

interface CanvasAreaProps {
    assetType: AssetType;
    layers: Layer[];
    selectedLayerId: string | null;
    setSelectedLayerId: (id: string | null) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    activeGuides: { x?: number, y?: number } | null;
    setActiveGuides: (guides: { x?: number, y?: number } | null) => void;
    onDuplicate?: (id: string) => void;
    onDelete?: (id: string) => void;
    isTransparent?: boolean;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
    assetType,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    activeGuides,
    setActiveGuides,
    onDuplicate,
    onDelete,
    isTransparent
}) => {
    const dimensions = DIMENSIONS[assetType] || DIMENSIONS[AssetType.INSTA_POST_SQUARE];
    const canvasScale = calculateCanvasScale(dimensions.w, dimensions.h);

    return (
        <main
            className="flex-1 bg-[#FFFAE5] relative overflow-auto flex items-start justify-center p-10"
            onClick={() => setSelectedLayerId(null)}
        >
            <div id="canvas-container" className="relative">
                <div
                    id="canvas"
                    className={`neo-border neo-shadow-lg relative overflow-hidden ${isTransparent ? 'bg-transparency' : 'bg-white'}`}
                    style={{
                        width: dimensions.w / canvasScale,
                        height: dimensions.h / canvasScale,
                    }}
                >
                    {[...layers].sort((a, b) => a.zIndex - b.zIndex).map((layer) => (
                        <DraggableLayer
                            key={layer.id}
                            layer={layer}
                            otherLayers={layers}
                            isSelected={selectedLayerId === layer.id}
                            onSelect={(e) => { e.stopPropagation(); setSelectedLayerId(layer.id); }}
                            onUpdate={(updates) => updateLayer(layer.id, updates)}
                            canvasScale={canvasScale}
                            canvasDimensions={dimensions}
                            setActiveGuides={setActiveGuides}
                        />
                    ))}

                    {/* Guides d'alignement */}
                    {activeGuides && (
                        <>
                            {activeGuides.x !== undefined && (
                                <div
                                    className="absolute bg-[#D20A33] z-[1000] pointer-events-none"
                                    style={{
                                        left: `${activeGuides.x / canvasScale}px`,
                                        top: 0,
                                        bottom: 0,
                                        width: '1.5px',
                                        boxShadow: '0 0 4px rgba(210, 10, 51, 0.5)'
                                    }}
                                />
                            )}
                            {activeGuides.y !== undefined && (
                                <div
                                    className="absolute bg-[#D20A33] z-[1000] pointer-events-none"
                                    style={{
                                        top: `${activeGuides.y / canvasScale}px`,
                                        left: 0,
                                        right: 0,
                                        height: '1.5px',
                                        boxShadow: '0 0 4px rgba(210, 10, 51, 0.5)'
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>

                {selectedLayerId && layers.find(l => l.id === selectedLayerId) && (
                    <ContextualToolbar
                        layer={layers.find(l => l.id === selectedLayerId)!}
                        onDuplicate={() => onDuplicate?.(selectedLayerId)}
                        onDelete={() => onDelete?.(selectedLayerId)}
                        onUpdate={(updates) => updateLayer(selectedLayerId, updates)}
                        style={{
                            left: `${(layers.find(l => l.id === selectedLayerId)!.x + layers.find(l => l.id === selectedLayerId)!.width / 2) / canvasScale}px`,
                            top: `${(layers.find(l => l.id === selectedLayerId)!.y + layers.find(l => l.id === selectedLayerId)!.height) / canvasScale}px`,
                            transform: 'translate(-50%, 0) translateY(10px)',
                            transformOrigin: 'top center'
                        }}
                    />
                )}
            </div>
        </main>
    );
};

export default CanvasArea;
