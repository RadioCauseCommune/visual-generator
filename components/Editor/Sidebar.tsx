
import React from 'react';
import { AssetType, Layer, LayerRole, AiStyleType, AiModelType, AiParameters } from '../../types';
import { DIMENSIONS, LOGO_OPTIONS, COLORS, SOCIAL_ICONS } from '../../constants';
import { AI_STYLES } from '../../services/aiService';
import { getModelById } from '../../services/aiModels';
import { ModelSelector } from '../ModelSelector';
import TemplateSelector from './TemplateSelector';
import RssImporter from './RssImporter';
import { RssEpisode } from '../../services/rssService';

interface SidebarProps {
    assetType: AssetType;
    setAssetType: (type: AssetType) => void;
    meta: any;
    setMeta: (meta: any) => void;
    layers: Layer[];
    addOptionalLayer: (role: LayerRole) => void;
    selectedLayerId: string | null;
    setSelectedLayerId: (id: string | null) => void;
    setLayers: (layers: Layer[] | ((prev: Layer[]) => Layer[])) => void;
    applyTemplate: (templateId: string) => void;

    // AI props
    prompt: string;
    setPrompt: (p: string) => void;
    selectedModel: AiModelType;
    setSelectedModel: (m: AiModelType) => void;
    isGenerating: boolean;
    selectedAiStyle: AiStyleType;
    setSelectedAiStyle: (s: AiStyleType) => void;
    showAiAdvanced: boolean;
    setShowAiAdvanced: (s: boolean) => void;
    aiParams: AiParameters;
    setAiParams: (p: AiParameters) => void;
    handleAiGenerate: () => void;

    // File props
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, role: LayerRole) => void;

    // RSS props
    onRssImport: (episode: RssEpisode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    assetType, setAssetType,
    meta, setMeta,
    layers,
    addOptionalLayer,
    selectedLayerId,
    setSelectedLayerId,
    setLayers,
    prompt, setPrompt,
    selectedModel, setSelectedModel,
    isGenerating,
    selectedAiStyle, setSelectedAiStyle,
    showAiAdvanced, setShowAiAdvanced,
    aiParams, setAiParams,
    handleAiGenerate,
    handleFileUpload,
    applyTemplate,
    onRssImport
}) => {
    const currentModel = getModelById(selectedModel);
    const normalizeAiSize = (value: number, max: number) => {
        const min = 256;
        const step = 64;
        const clamped = Math.max(min, Math.min(value, max));
        return Math.floor(clamped / step) * step;
    };

    return (
        <aside className="w-80 bg-white neo-border border-t-0 border-b-0 border-l-0 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <section>
                <RssImporter onImport={onRssImport} />
            </section>

            <section>
                <h3 className="font-syne font-black text-lg mb-2 uppercase underline decoration-[#D20A33] decoration-4">Templates</h3>
                <TemplateSelector onSelectTemplate={applyTemplate} />
            </section>

            <section>
                <h3 className="font-syne font-black text-lg mb-2 uppercase">1. Format de Sortie</h3>
                <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as AssetType)}
                    className="w-full neo-border-fine p-2 font-roboto-condensed font-bold bg-[#FFFAE5]"
                >
                    {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={meta.isTransparent}
                        onChange={e => setMeta({ ...meta, isTransparent: e.target.checked })}
                        className="w-4 h-4 accent-black"
                    />
                    <span className="text-[10px] font-black uppercase group-hover:text-blue-600 transition-colors">Fond Transparent (PNG)</span>
                </label>
            </section>

            <section className="space-y-4">
                <h3 className="font-syne font-black text-lg uppercase underline decoration-[#A3FF00] decoration-4">2. Contenu Texte</h3>

                <div>
                    <label className="text-[10px] font-black uppercase">Titre de l'émission *</label>
                    <input value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} className="w-full neo-border-fine p-2 text-sm bg-[#FFFAE5]" />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase">Sous-Titre / Baseline *</label>
                    <input value={meta.subtitle} onChange={e => setMeta({ ...meta, subtitle: e.target.value })} className="w-full neo-border-fine p-2 text-sm bg-red-50" />
                </div>

                {[
                    { label: 'Nom de l\'Invité', key: 'guest_name', role: 'guest_name' as LayerRole },
                    { label: 'Date / Heure', key: 'date', role: 'date' as LayerRole },
                    { label: 'Champ Extra 1', key: 'extra1', role: 'extra1' as LayerRole },
                    { label: 'Champ Extra 2', key: 'extra2', role: 'extra2' as LayerRole }
                ].map((field) => (
                    <div key={field.key}>
                        <label className="text-[10px] font-black uppercase">{field.label}</label>
                        <div className="flex gap-1">
                            <input
                                value={(meta as any)[field.key]}
                                onChange={e => setMeta({ ...meta, [field.key]: e.target.value })}
                                placeholder="Saisissez ici..."
                                className="flex-1 neo-border-fine p-2 text-sm bg-white focus:bg-[#FFFAE5] transition-colors"
                            />
                            <button
                                onClick={() => {
                                    if (!(meta as any)[field.key]) return;
                                    addOptionalLayer(field.role);
                                    setMeta({ ...meta, [field.key]: '' });
                                }}
                                className={`neo-border-fine px-3 font-bold transition-all neo-active ${(meta as any)[field.key] ? 'bg-[#A3FF00] hover:scale-110' : 'bg-gray-100 opacity-50 cursor-not-allowed'}`}
                                title="Valider et ajouter au canevas"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            <section className="p-4 bg-[#A3FF00] neo-border-fine neo-shadow-sm space-y-3">
                <h3 className="font-syne font-black text-lg uppercase underline decoration-black decoration-4 mb-2">3. IA - Génération</h3>

                <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    disabled={isGenerating}
                />

                <div className="mb-2">
                    <label className="text-[10px] font-black uppercase mb-1 block">Style Visuel</label>
                    <select
                        value={selectedAiStyle}
                        onChange={(e) => setSelectedAiStyle(e.target.value as AiStyleType)}
                        className="w-full neo-border-fine p-2 text-xs bg-white font-bold"
                    >
                        {AI_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </div>

                <textarea
                    placeholder="Ex: Un studio de radio futuriste..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full neo-border-fine p-2 text-xs h-20 mb-2 bg-white"
                />

                <div className="mb-3">
                    <button
                        onClick={() => setShowAiAdvanced(!showAiAdvanced)}
                        className="text-[9px] font-black uppercase flex items-center gap-1 underline"
                    >
                        {showAiAdvanced ? '[-] Masquer paramètres' : '[+] Paramètres avancés'}
                    </button>

                    {showAiAdvanced && (
                        <div className="mt-2 space-y-2 p-2 bg-white/50 neo-border-fine animate-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[9px] font-black uppercase flex justify-between">Étapes (Steps) <span>{aiParams.num_inference_steps}</span></label>
                                <input
                                    type="range" min="1" max={currentModel?.maxSteps || 50}
                                    value={aiParams.num_inference_steps}
                                    onChange={e => setAiParams({ ...aiParams, num_inference_steps: parseInt(e.target.value) })}
                                    className="w-full h-1 accent-black"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase flex justify-between">Guidance <span>{aiParams.guidance_scale}</span></label>
                                <input
                                    type="range" min="1" max="20" step="0.5"
                                    value={aiParams.guidance_scale}
                                    onChange={e => setAiParams({ ...aiParams, guidance_scale: parseFloat(e.target.value) })}
                                    className="w-full h-1 accent-black"
                                />
                            </div>
                            <div className="pt-2 border-t border-black/10 space-y-2">
                                <label className="text-[9px] font-black uppercase">Taille de sortie (px)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[8px] font-black uppercase mb-1">Largeur</label>
                                        <input
                                            type="number"
                                            min={256}
                                            max={currentModel?.maxWidth || 2048}
                                            step={64}
                                            value={aiParams.width ?? ''}
                                            onChange={e => {
                                                const raw = e.target.value;
                                                if (!raw) {
                                                    setAiParams({ ...aiParams, width: undefined });
                                                    return;
                                                }
                                                const parsed = parseInt(raw);
                                                const max = currentModel?.maxWidth || 2048;
                                                setAiParams({ ...aiParams, width: normalizeAiSize(parsed, max) });
                                            }}
                                            className="w-full neo-border-fine p-1 text-[9px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase mb-1">Hauteur</label>
                                        <input
                                            type="number"
                                            min={256}
                                            max={currentModel?.maxHeight || 2048}
                                            step={64}
                                            value={aiParams.height ?? ''}
                                            onChange={e => {
                                                const raw = e.target.value;
                                                if (!raw) {
                                                    setAiParams({ ...aiParams, height: undefined });
                                                    return;
                                                }
                                                const parsed = parseInt(raw);
                                                const max = currentModel?.maxHeight || 2048;
                                                setAiParams({ ...aiParams, height: normalizeAiSize(parsed, max) });
                                            }}
                                            className="w-full neo-border-fine p-1 text-[9px]"
                                        />
                                    </div>
                                </div>
                                <p className="text-[8px] font-bold opacity-60 uppercase">
                                    Multiples de 64, max {currentModel?.maxWidth || 2048}x{currentModel?.maxHeight || 2048}
                                </p>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase">Seed (Optionnel)</label>
                                <input
                                    type="number"
                                    placeholder="Aléatoire"
                                    value={aiParams.seed || ''}
                                    onChange={e => setAiParams({ ...aiParams, seed: e.target.value ? parseInt(e.target.value) : undefined })}
                                    className="w-full neo-border-fine p-1 text-[9px]"
                                />
                            </div>
                            {selectedModel === 'flux-local' && (
                                <>
                                    <div className="pt-2 border-t border-black/10">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={aiParams.no_text || false}
                                                onChange={e => setAiParams({ ...aiParams, no_text: e.target.checked })}
                                                className="w-3 h-3 accent-black"
                                            />
                                            <span className="text-[9px] font-black uppercase">No Text (Éviter le texte)</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase mb-1 block">Performance Mode</label>
                                        <div className="flex bg-[#FFFAE5] neo-border-fine p-1 gap-1">
                                            <button
                                                onClick={() => setAiParams({ ...aiParams, performance_mode: 'balanced' })}
                                                className={`flex-1 text-[8px] font-black uppercase py-1 ${!aiParams.performance_mode || aiParams.performance_mode === 'balanced' ? 'bg-[#A3FF00] neo-border-fine' : 'opacity-50'}`}
                                            >
                                                Balanced
                                            </button>
                                            <button
                                                onClick={() => setAiParams({ ...aiParams, performance_mode: 'fast' })}
                                                className={`flex-1 text-[8px] font-black uppercase py-1 ${aiParams.performance_mode === 'fast' ? 'bg-[#A3FF00] neo-border-fine' : 'opacity-50'}`}
                                            >
                                                Fast
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button onClick={handleAiGenerate} disabled={isGenerating} className="w-full bg-black text-white p-2 font-black uppercase text-xs neo-active">
                    {isGenerating ? 'Génération...' : 'Créer l\'image'}
                </button>
            </section>

            <section className="space-y-3">
                <h3 className="font-syne font-black text-lg uppercase underline decoration-[#0047FF] decoration-4">4. Visuels</h3>
                <div className="space-y-2">
                    <label className="block w-full bg-white neo-border-fine p-2 font-bold uppercase text-xs cursor-pointer text-center neo-hover neo-active">
                        Changer le Fond <input type="file" hidden onChange={e => handleFileUpload(e, 'background')} accept="image/*" />
                    </label>
                    <button
                        onClick={() => {
                            const { w, h } = DIMENSIONS[assetType];
                            const newLayer = {
                                id: Math.random().toString(36).substr(2, 9),
                                role: 'background' as const,
                                type: 'gradient' as const,
                                content: '',
                                x: 0, y: 0, width: w, height: h,
                                zIndex: 0, rotation: 0,
                                gradientColor1: COLORS.RED,
                                gradientColor2: COLORS.VIOLET,
                                gradientDirection: 135,
                            };
                            // Remplacer le fond existant ou ajouter
                            const existingBg = layers.find(l => l.role === 'background');
                            if (existingBg) {
                                setLayers(prev => prev.map(l => l.id === existingBg.id ? { ...l, ...newLayer, id: l.id } : l));
                            } else {
                                setLayers(prev => [newLayer, ...prev]);
                            }
                        }}
                        className="block w-full bg-gradient-to-r from-[#D20A33] to-[#9D00FF] text-white neo-border-fine p-2 font-bold uppercase text-xs cursor-pointer text-center neo-hover neo-active"
                    >
                        Ajouter Fond Gradient
                    </button>

                    {/* Liste des photos invités sur le canevas */}
                    {layers.filter(l => l.role === 'guest_photo').length > 0 && (
                        <div className="space-y-2 pt-2">
                            <p className="text-[10px] font-black uppercase text-gray-400">Photos invités :</p>
                            <div className="flex flex-wrap gap-2">
                                {layers.filter(l => l.role === 'guest_photo').map((photoLayer, idx) => (
                                    <button
                                        key={photoLayer.id}
                                        onClick={() => setSelectedLayerId(photoLayer.id)}
                                        className={`w-12 h-12 neo-border-fine bg-white p-0.5 flex items-center justify-center transition-all overflow-hidden ${photoLayer.id === selectedLayerId ? 'ring-2 ring-[#0047FF]' : 'hover:scale-110'}`}
                                        title={`Invité #${idx + 1}`}
                                        style={{ borderRadius: photoLayer.clipShape === 'circle' ? '50%' : '0' }}
                                    >
                                        <img src={photoLayer.content} alt={`Invité ${idx + 1}`} className="w-full h-full object-cover" style={{ borderRadius: photoLayer.clipShape === 'circle' ? '50%' : '0' }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <label className="block w-full bg-white neo-border-fine p-2 font-bold uppercase text-xs cursor-pointer text-center neo-hover neo-active">
                        + Ajouter Photo Invité <input type="file" hidden onChange={e => handleFileUpload(e, 'guest_photo')} accept="image/*" />
                    </label>
                </div>
            </section>

            <section className="space-y-3">
                <h3 className="font-syne font-black text-lg uppercase underline decoration-[#D20A33] decoration-4">5. Logos</h3>

                {/* Liste des logos déjà présents */}
                {layers.filter(l => l.type === 'logo').length > 0 && (
                    <div className="space-y-2 mb-4">
                        <p className="text-[10px] font-black uppercase text-gray-400">Logos sur le canevas :</p>
                        <div className="flex flex-wrap gap-2">
                            {layers.filter(l => l.type === 'logo').map((logoLayer, idx) => (
                                <button
                                    key={logoLayer.id}
                                    onClick={() => setSelectedLayerId(logoLayer.id)}
                                    className={`w-12 h-12 neo-border-fine bg-white p-1 flex items-center justify-center transition-all ${logoLayer.id === selectedLayerId ? 'ring-2 ring-[#D20A33]' : 'hover:scale-110'}`}
                                    title={`Logo #${idx + 1}`}
                                >
                                    <img src={logoLayer.content} alt="Logo" className="max-w-full max-h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-600 mb-2 italic">Ajouter un logo Radio :</p>
                        <div className="grid grid-cols-5 gap-1">
                            {LOGO_OPTIONS.map(logo => (
                                <button
                                    key={logo.value}
                                    onClick={() => {
                                        const { w, h } = DIMENSIONS[assetType];
                                        const logoSize = Math.max(100, Math.min(w * 0.12, 300));
                                        const newLayer: Layer = {
                                            id: Math.random().toString(36).substr(2, 9),
                                            role: 'logo',
                                            type: 'logo',
                                            content: logo.path,
                                            x: 40 + (layers.filter(l => l.type === 'logo').length * 20),
                                            y: 40 + (layers.filter(l => l.type === 'logo').length * 20),
                                            width: logoSize, height: logoSize, zIndex: 10 + layers.length, rotation: 0
                                        };
                                        setLayers(prev => [...prev, newLayer]);
                                        setSelectedLayerId(newLayer.id);
                                    }}
                                    className="neo-border-fine p-1 bg-white hover:bg-gray-100 flex items-center justify-center"
                                    title={logo.label}
                                >
                                    <img src={logo.path} alt={logo.label} className="w-6 h-6 object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <label className="block w-full bg-black text-white neo-border-fine p-2 font-black uppercase text-[10px] cursor-pointer text-center neo-hover neo-active">
                            + Ajouter Logo Partenaire
                            <input
                                type="file"
                                hidden
                                onChange={e => handleFileUpload(e, 'logo')}
                                accept="image/*"
                            />
                        </label>
                    </div>
                </div>
            </section>

            <section className="space-y-3 pb-8">
                <h3 className="font-syne font-black text-lg uppercase underline decoration-[#A3FF00] decoration-4">6. Réseaux Sociaux</h3>
                <p className="text-[10px] font-black uppercase text-gray-600 mb-2 italic">Ajouter une icône de plateforme :</p>
                <div className="grid grid-cols-5 gap-1">
                    {SOCIAL_ICONS.map(icon => (
                        <button
                            key={icon.id}
                            onClick={() => {
                                const { w, h } = DIMENSIONS[assetType];
                                const iconSize = Math.max(60, Math.min(w * 0.08, 150));
                                const newLayer: Layer = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    role: 'manual',
                                    type: 'logo', // Utiliser le type logo pour profiter du rendu existant
                                    content: icon.path,
                                    x: w / 2 - iconSize / 2,
                                    y: h / 2 - iconSize / 2,
                                    width: iconSize,
                                    height: iconSize,
                                    zIndex: 20 + layers.length,
                                    rotation: 0
                                };
                                setLayers(prev => [...prev, newLayer]);
                                setSelectedLayerId(newLayer.id);
                            }}
                            className="neo-border-fine p-2 bg-white hover:bg-[#FFFAE5] flex items-center justify-center transition-all hover:scale-110"
                            title={icon.label}
                        >
                            <img src={icon.path} alt={icon.label} className="w-6 h-6 object-contain" />
                        </button>
                    ))}
                </div>
            </section>
        </aside>
    );
};

export default Sidebar;
