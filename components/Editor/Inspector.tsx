
import React from 'react';
import { Layer, AssetType } from '../../types';
import { DIMENSIONS, LOGO_OPTIONS, COLORS, FONTS, HEADER_LOGO } from '../../constants';

import UpscaleTool from './UpscaleTool';

interface InspectorProps {
    selectedLayer: Layer | undefined;
    assetType: AssetType;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    setLayers: (layers: Layer[] | ((prev: Layer[]) => Layer[])) => void;
    setSelectedLayerId: (id: string | null) => void;
    moveLayer: (direction: 'up' | 'down') => void;
    layers: Layer[];
    onOpenInpainting?: (layer: Layer) => void;
}

const Inspector: React.FC<InspectorProps> = ({
    selectedLayer,
    assetType,
    updateLayer,
    setLayers,
    setSelectedLayerId,
    moveLayer,
    layers,
    onOpenInpainting
}) => {
    const selectedLayerId = selectedLayer?.id || null;

    return (
        <aside className="w-72 bg-white neo-border border-t-0 border-b-0 border-r-0 p-4 space-y-6 overflow-y-auto shadow-inner">
            <h3 className="font-syne font-black text-lg uppercase flex items-center gap-2">
                <span className="w-3 h-3 bg-[#D20A33] rounded-full"></span>
                Réglages
            </h3>

            {selectedLayer ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="p-3 bg-gray-50 neo-border-fine text-center uppercase font-black text-xs">
                        Élément: {selectedLayer.role.replace('_', ' ')}
                    </div>

                    {selectedLayer.type === 'text' && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Police d'écriture</label>
                                <select
                                    value={selectedLayer.fontFamily}
                                    onChange={e => updateLayer(selectedLayerId as string, { fontFamily: e.target.value })}
                                    className="w-full neo-border-fine p-2 text-sm bg-white font-bold"
                                >
                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Texte</label>
                                <textarea
                                    value={selectedLayer.content}
                                    onChange={e => updateLayer(selectedLayerId as string, { content: e.target.value })}
                                    className="w-full neo-border-fine p-2 text-sm bg-white font-bold h-24 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase flex justify-between">Taille <span>{selectedLayer.fontSize || 24}px</span></label>
                                <input type="range" min="10" max="400" value={selectedLayer.fontSize || 24} onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, fontSize: parseInt(e.target.value) } : l))} className="w-full accent-[#D20A33]" />
                            </div>

                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <p className="text-[10px] font-black uppercase">Mise en forme</p>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[9px] font-bold uppercase cursor-pointer" htmlFor="scratch-toggle">Effet "Scratch"</label>
                                        <input
                                            id="scratch-toggle"
                                            type="checkbox"
                                            checked={selectedLayer.hasScratch || false}
                                            onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? {
                                                ...l,
                                                hasScratch: e.target.checked,
                                                scratchColor: l.scratchColor || COLORS.BLACK,
                                                scratchBorderColor: l.scratchBorderColor || COLORS.BLACK
                                            } : l))}
                                            className="w-4 h-4 accent-black"
                                        />
                                    </div>

                                    {selectedLayer.hasScratch && (
                                        <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
                                            <div>
                                                <label className="text-[10px] font-black uppercase mb-1 block">Couleur de fond</label>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {Object.values(COLORS).map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, scratchColor: c } : l))}
                                                            className={`w-full aspect-square neo-border-fine ${selectedLayer.scratchColor === c ? 'ring-2 ring-black' : ''}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase mb-1 block">Couleur de bordure</label>
                                                <div className="grid grid-cols-5 gap-1">
                                                    {Object.values(COLORS).map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, scratchBorderColor: c } : l))}
                                                            className={`w-full aspect-square neo-border-fine ${selectedLayer.scratchBorderColor === c ? 'ring-2 ring-black' : ''}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black uppercase flex justify-between">Opacité du surlignage <span>{selectedLayer.scratchOpacity ?? 100}%</span></label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={selectedLayer.scratchOpacity ?? 100}
                                                    onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, scratchOpacity: parseInt(e.target.value) } : l))}
                                                    className="w-full accent-black"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-2 bg-[#A3FF00]/20 neo-border-fine">
                                                <label className="text-[8px] font-black uppercase cursor-pointer flex-1" htmlFor="scratch-shadow-toggle">Style Néo-brutaliste (Ombre & Bordure)</label>
                                                <input
                                                    id="scratch-shadow-toggle"
                                                    type="checkbox"
                                                    checked={selectedLayer.scratchShadow || false}
                                                    onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, scratchShadow: e.target.checked } : l))}
                                                    className="w-3 h-3 accent-black"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase mb-1 block">Casse & Style</label>
                                    <div className="flex gap-1 mb-2">
                                        {[
                                            { label: 'Abc', value: 'none' as const },
                                            { label: 'ABC', value: 'uppercase' as const },
                                            { label: 'abc', value: 'lowercase' as const },
                                            { label: 'A/b', value: 'capitalize' as const }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => updateLayer(selectedLayerId as string, { textTransform: opt.value })}
                                                className={`flex-1 py-1 px-2 neo-border-fine text-[10px] font-black transition-all ${selectedLayer.textTransform === opt.value || (!selectedLayer.textTransform && opt.value === 'none') ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => updateLayer(selectedLayerId as string, { fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                            className={`flex-1 py-1 px-2 neo-border-fine text-[10px] font-black transition-all ${selectedLayer.fontWeight === 'bold' ? 'bg-black text-white' : 'bg-white'}`}
                                        >
                                            B
                                        </button>
                                        <button
                                            onClick={() => updateLayer(selectedLayerId as string, { fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                            className={`flex-1 py-1 px-2 neo-border-fine text-[10px] font-black transition-all ${selectedLayer.fontStyle === 'italic' ? 'bg-black text-white' : 'bg-white'}`}
                                        >
                                            I
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase mb-1 block">Alignement</label>
                                    <div className="flex gap-1">
                                        {[
                                            { label: '←', value: 'left' as const },
                                            { label: '↔', value: 'center' as const },
                                            { label: '→', value: 'right' as const },
                                            { label: '≡', value: 'justify' as const }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => updateLayer(selectedLayerId as string, { textAlign: opt.value })}
                                                className={`flex-1 py-1 px-2 neo-border-fine text-[10px] font-black transition-all ${selectedLayer.textAlign === opt.value || (!selectedLayer.textAlign && opt.value === 'center' && selectedLayer.hasScratch) || (!selectedLayer.textAlign && opt.value === 'left' && !selectedLayer.hasScratch) ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-bold uppercase cursor-pointer" htmlFor="hyphen-toggle">Césure automatique</label>
                                    <input
                                        id="hyphen-toggle"
                                        type="checkbox"
                                        checked={selectedLayer.hyphens || false}
                                        onChange={e => updateLayer(selectedLayerId as string, { hyphens: e.target.checked })}
                                        className="w-4 h-4 accent-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase flex justify-between">Interlignage <span>{selectedLayer.lineHeight || 0.9}</span></label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.5"
                                        step="0.1"
                                        value={selectedLayer.lineHeight || 0.9}
                                        onChange={e => updateLayer(selectedLayerId as string, { lineHeight: parseFloat(e.target.value) })}
                                        className="w-full accent-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase flex justify-between">Largeur du bloc <span>{selectedLayer.width || 400}px</span></label>
                                    <input
                                        type="range"
                                        min="50"
                                        max={DIMENSIONS[assetType].w}
                                        value={selectedLayer.width || 400}
                                        onChange={e => updateLayer(selectedLayerId as string, { width: parseInt(e.target.value) })}
                                        className="w-full accent-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Couleur</label>
                                <div className="grid grid-cols-5 gap-1">
                                    {Object.values(COLORS).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, color: c } : l))}
                                            className={`w-full aspect-square neo-border-fine ${selectedLayer.color === c ? 'ring-2 ring-black' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <p className="text-[10px] font-black uppercase">Effets de texte</p>

                                <div>
                                    <label className="text-[9px] font-bold uppercase flex justify-between">Contour <span>{selectedLayer.strokeWidth || 0}px</span></label>
                                    <div className="flex gap-2 items-center">
                                        <input type="range" min="0" max="20" value={selectedLayer.strokeWidth || 0} onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, strokeWidth: parseInt(e.target.value) } : l))} className="flex-1 accent-black" />
                                        <div className="flex gap-1">
                                            {[COLORS.BLACK, COLORS.WHITE].map(c => (
                                                <button key={c} onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, strokeColor: c } : l))} className={`w-4 h-4 neo-border-fine ${selectedLayer.strokeColor === c ? 'ring-1 ring-black' : ''}`} style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase flex justify-between">Ombre portée <span>{selectedLayer.shadowBlur || 0}px</span></label>
                                    <input type="range" min="0" max="30" value={selectedLayer.shadowBlur || 0} onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, shadowBlur: parseInt(e.target.value), shadowColor: 'rgba(0,0,0,0.5)', shadowOffsetX: 5, shadowOffsetY: 5 } : l))} className="w-full accent-black" />
                                </div>
                            </div>
                        </>
                    )}

                    {selectedLayer.type === 'logo' && (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Logo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {LOGO_OPTIONS.map(logo => (
                                            <button
                                                key={logo.value}
                                                onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, content: logo.path } : l))}
                                                className={`neo-border-fine p-2 flex flex-col items-center gap-1 ${selectedLayer.content === logo.path ? 'bg-[#A3FF00] ring-2 ring-black' : 'bg-white'}`}
                                            >
                                                <img src={logo.path} alt={logo.label} className="w-12 h-12 object-contain" />
                                                <span className="text-[9px] font-black uppercase">{logo.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase mb-2 block">Masque de découpe</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, clipShape: 'square' } : l))} className={`neo-border-fine flex-1 py-1 text-[10px] font-black ${selectedLayer.clipShape === 'square' || !selectedLayer.clipShape ? 'bg-black text-white' : 'bg-white'}`}>CARRÉ</button>
                                        <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, clipShape: 'circle' } : l))} className={`neo-border-fine flex-1 py-1 text-[10px] font-black ${selectedLayer.clipShape === 'circle' ? 'bg-black text-white' : 'bg-white'}`}>CERCLE</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block">Fond du logo</label>
                                    <div className="grid grid-cols-5 gap-1 mb-2">
                                        {Object.values(COLORS).map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, overlayColor: c } : l))}
                                                className={`w-full aspect-square neo-border-fine ${selectedLayer.overlayColor === c ? 'ring-2 ring-black' : ''}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, overlayColor: undefined } : l))}
                                        className="w-full neo-border-fine bg-white font-black py-1 text-[9px] uppercase hover:bg-gray-100"
                                    >
                                        Sans fond
                                    </button>
                                </div>

                                {selectedLayer.clipShape === 'circle' && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase flex justify-between">Marge interne <span>{selectedLayer.logoPadding ?? 10}%</span></label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="45"
                                            value={selectedLayer.logoPadding ?? 10}
                                            onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, logoPadding: parseInt(e.target.value) } : l))}
                                            className="w-full accent-[#D20A33]"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-black uppercase flex justify-between">Taille <span>{selectedLayer.width || 200}px</span></label>
                                    <input
                                        type="range"
                                        min="50"
                                        max={Math.min(DIMENSIONS[assetType].w * 0.4, 800)}
                                        value={selectedLayer.width || 200}
                                        onChange={e => {
                                            const newSize = parseInt(e.target.value);
                                            setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, width: newSize, height: newSize } : l));
                                        }}
                                        className="w-full accent-[#D20A33]"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {selectedLayer.type === 'image' && selectedLayer.role === 'guest_photo' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase mb-2 block">Masque de découpe</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, clipShape: 'square' } : l))} className={`neo-border-fine flex-1 py-2 text-[10px] font-black ${selectedLayer.clipShape === 'square' ? 'bg-black text-white' : 'bg-white'}`}>CARRÉ</button>
                                    <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, clipShape: 'circle' } : l))} className={`neo-border-fine flex-1 py-2 text-[10px] font-black ${selectedLayer.clipShape === 'circle' ? 'bg-black text-white' : 'bg-white'}`}>CERCLE</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase flex justify-between">Taille <span>{selectedLayer.width || 400}px</span></label>
                                <input
                                    type="range"
                                    min="100"
                                    max={Math.min(DIMENSIONS[assetType].w, DIMENSIONS[assetType].h)}
                                    value={selectedLayer.width || 400}
                                    onChange={e => {
                                        const newSize = parseInt(e.target.value);
                                        setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, width: newSize, height: newSize } : l));
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between p-2 bg-[#A3FF00]/20 neo-border-fine mt-2">
                                <label className="text-[8px] font-black uppercase cursor-pointer flex-1" htmlFor="guest-scratch-shadow-toggle">Style Néo-brutaliste (Ombre & Bordure)</label>
                                <input
                                    id="guest-scratch-shadow-toggle"
                                    type="checkbox"
                                    checked={selectedLayer.scratchShadow || false}
                                    onChange={e => updateLayer(selectedLayerId as string, { scratchShadow: e.target.checked })}
                                    className="w-3 h-3 accent-black"
                                />
                            </div>
                        </div>
                    )}

                    {selectedLayer.type === 'image' && selectedLayer.role === 'background' && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase flex justify-between">Zoom de l'image <span>{selectedLayer.imageScale ?? 100}%</span></label>
                                <input
                                    type="range"
                                    min="50"
                                    max="200"
                                    value={selectedLayer.imageScale ?? 100}
                                    onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageScale: parseInt(e.target.value) } : l))}
                                    className="w-full accent-[#D20A33]"
                                />
                                <div className="flex justify-between mt-1">
                                    <button
                                        onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageScale: 100 } : l))}
                                        className="neo-border-fine px-2 py-0.5 text-[8px] font-black uppercase bg-white hover:bg-gray-100 neo-active"
                                    >
                                        Réinitialiser (100%)
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Couleur de l'overlay</label>
                                <div className="grid grid-cols-5 gap-1">
                                    {Object.values(COLORS).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, overlayColor: c, overlayOpacity: l.overlayOpacity ?? 50 } : l))}
                                            className={`w-full aspect-square neo-border-fine ${selectedLayer.overlayColor === c ? 'ring-2 ring-black' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, overlayColor: undefined, overlayOpacity: 0 } : l))}
                                    className="w-full mt-2 neo-border-fine bg-white font-black py-2 text-[10px] uppercase neo-active"
                                >
                                    Désactiver overlay
                                </button>
                            </div>

                            {selectedLayer.overlayColor && (
                                <div>
                                    <label className="text-[10px] font-black uppercase flex justify-between">Opacité <span>{selectedLayer.overlayOpacity ?? 50}%</span></label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={selectedLayer.overlayOpacity ?? 50}
                                        onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, overlayOpacity: parseInt(e.target.value) } : l))}
                                        className="w-full accent-[#D20A33]"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {selectedLayer.type === 'gradient' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Couleur 1</label>
                                <div className="grid grid-cols-5 gap-1">
                                    {Object.values(COLORS).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, gradientColor1: c } : l))}
                                            className={`w-full aspect-square neo-border-fine ${selectedLayer.gradientColor1 === c ? 'ring-2 ring-black' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase mb-1 block">Couleur 2</label>
                                <div className="grid grid-cols-5 gap-1">
                                    {Object.values(COLORS).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, gradientColor2: c } : l))}
                                            className={`w-full aspect-square neo-border-fine ${selectedLayer.gradientColor2 === c ? 'ring-2 ring-black' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase flex justify-between">Direction <span>{selectedLayer.gradientDirection ?? 135}°</span></label>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={selectedLayer.gradientDirection ?? 135}
                                    onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, gradientDirection: parseInt(e.target.value) } : l))}
                                    className="w-full accent-[#D20A33]"
                                />
                                <div className="grid grid-cols-4 gap-1 mt-2">
                                    {[
                                        { label: '↑', value: 0 },
                                        { label: '↗', value: 45 },
                                        { label: '→', value: 90 },
                                        { label: '↘', value: 135 },
                                        { label: '↓', value: 180 },
                                        { label: '↙', value: 225 },
                                        { label: '←', value: 270 },
                                        { label: '↖', value: 315 },
                                    ].map(preset => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, gradientDirection: preset.value } : l))}
                                            className={`neo-border-fine py-1 text-sm font-black transition-all ${(selectedLayer.gradientDirection ?? 135) === preset.value ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div
                                className="w-full h-16 neo-border-fine"
                                style={{
                                    background: `linear-gradient(${selectedLayer.gradientDirection ?? 135}deg, ${selectedLayer.gradientColor1 || '#D20A33'}, ${selectedLayer.gradientColor2 || '#9D00FF'})`
                                }}
                            />
                        </div>
                    )}

                    {selectedLayer.type === 'image' && (
                        <div className="space-y-3 pt-2 border-t border-gray-100">
                            <div>
                                <label className="text-[10px] font-black uppercase mb-2 block">Position de l'image</label>
                                <p className="text-[8px] text-gray-600 mb-2">Déplacez l'image pour choisir la zone visible</p>

                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase flex justify-between">Horizontal <span>{selectedLayer.imageOffsetX ?? 50}%</span></label>
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageOffsetX: Math.max(0, (l.imageOffsetX ?? 50) - 5) } : l))} className="neo-border-fine px-2 py-1 bg-white font-black text-xs neo-active">←</button>
                                            <input type="range" min="0" max="100" value={selectedLayer.imageOffsetX ?? 50} onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageOffsetX: parseInt(e.target.value) } : l))} className="flex-1 accent-[#D20A33]" />
                                            <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageOffsetX: Math.min(100, (l.imageOffsetX ?? 50) + 5) } : l))} className="neo-border-fine px-2 py-1 bg-white font-black text-xs neo-active">→</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-bold uppercase flex justify-between">Vertical <span>{selectedLayer.imageOffsetY ?? 50}%</span></label>
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageOffsetY: Math.max(0, (l.imageOffsetY ?? 50) - 5) } : l))} className="neo-border-fine px-2 py-1 bg-white font-black text-xs neo-active">↑</button>
                                            <input type="range" min="0" max="100" value={selectedLayer.imageOffsetY ?? 50} onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageOffsetY: parseInt(e.target.value) } : l))} className="flex-1 accent-[#D20A33]" />
                                            <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageOffsetY: Math.min(100, (l.imageOffsetY ?? 50) + 5) } : l))} className="neo-border-fine px-2 py-1 bg-white font-black text-xs neo-active">↓</button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, imageOffsetX: 50, imageOffsetY: 50 } : l))}
                                        className="w-full neo-border-fine bg-[#FFFAE5] font-black py-2 text-[9px] uppercase neo-active"
                                    >
                                        Centrer l'image
                                    </button>
                                </div>
                            </div>

                            <UpscaleTool
                                layer={selectedLayer}
                                onUpdate={updateLayer}
                            />

                            <button
                                onClick={() => onOpenInpainting?.(selectedLayer)}
                                className="w-full neo-border-fine bg-[#00F0FF] hover:bg-[#00d0ff] font-black py-3 text-xs uppercase neo-active transition-all"
                            >
                                ✨ Retoucher (IA Inpainting)
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black uppercase flex justify-between">Rotation <span>{selectedLayer.rotation}°</span></label>
                        <input type="range" min="-180" max="180" value={selectedLayer.rotation} onChange={e => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, rotation: parseInt(e.target.value) } : l))} className="w-full accent-black" />
                    </div>

                    <div className="p-3 bg-blue-50 neo-border-fine space-y-2">
                        <p className="text-[10px] font-black uppercase mb-1">Astuces Pro :</p>
                        <ul className="text-[9px] font-bold space-y-1 opacity-70">
                            <li>• Flèches : Déplacer (1px)</li>
                            <li>• Shift + Flèches : Déplacer (10px)</li>
                            <li>• Suppr : Supprimer</li>
                            <li>• Ctrl + D : Dupliquer</li>
                        </ul>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase mb-1 block">Ordre des calques</label>
                        <div className="flex gap-2">
                            <button onClick={() => moveLayer('up')} className="neo-border-fine flex-1 bg-white font-black py-2 neo-active">MONTER ↑</button>
                            <button onClick={() => moveLayer('down')} className="neo-border-fine flex-1 bg-white font-black py-2 neo-active">DESCENDRE ↓</button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button onClick={() => { setLayers(prev => prev.filter(l => l.id !== selectedLayerId)); setSelectedLayerId(null); }} className="w-full bg-[#D20A33] text-white p-3 font-black uppercase text-xs neo-border-fine neo-active shadow-md">
                            Supprimer l'élément
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 text-center py-10">
                    <div className="w-16 h-16 neo-border-fine mx-auto flex items-center justify-center bg-[#FFFAE5] opacity-30">
                        <img src={HEADER_LOGO} alt="Cause Commune" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs font-black uppercase italic text-gray-400 px-6 leading-relaxed">
                        Sélectionnez un élément sur le canevas pour ajuster sa police, sa taille ou ses effets.
                    </p>

                    <div className="pt-10 space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-left border-b-2 border-black pb-1">Réglages Globaux</h4>
                        <div className="text-left space-y-2">
                            <p className="text-[9px] font-bold uppercase">Format: {assetType}</p>
                            <p className="text-[9px] font-bold uppercase">Calques: {layers.length}</p>
                        </div>
                    </div>
                </div>
            )
            }
        </aside >
    );
};

export default Inspector;
