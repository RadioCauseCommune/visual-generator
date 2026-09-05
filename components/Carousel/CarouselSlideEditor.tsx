import React from 'react';
import { CarouselSlide, SlideLayout, SlideTheme, BadgeColor, StatItem, MicroBadgeItem } from './types';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  slide: CarouselSlide;
  onChange: (updated: CarouselSlide) => void;
}

export const CarouselSlideEditor: React.FC<Props> = ({ slide, onChange }) => {
  const updateField = <K extends keyof CarouselSlide>(field: K, value: CarouselSlide[K]) => {
    onChange({ ...slide, [field]: value });
  };

  const layouts: { id: SlideLayout; label: string }[] = [
    { id: 'cover', label: 'Accroche Choc' },
    { id: 'stats', label: 'Stats 2×2' },
    { id: 'bullets', label: 'Liste Puces (▶)' },
    { id: 'badges', label: 'Micro-Badges' },
    { id: 'quote', label: 'Citation' },
    { id: 'cta', label: 'Appel à l’action' }
  ];

  const themes: { id: SlideTheme; label: string; color: string }[] = [
    { id: 'vanilla', label: 'Vanille', color: '#FFFAE5' },
    { id: 'white', label: 'Blanc', color: '#FFFFFF' },
    { id: 'dark', label: 'Dark Néo', color: '#0F0F0F' }
  ];

  const badgeColors: { id: BadgeColor; label: string; bg: string }[] = [
    { id: 'red', label: 'Rouge', bg: '#D20A33' },
    { id: 'yellow', label: 'Jaune', bg: '#FFD600' },
    { id: 'green', label: 'Vert Fluo', bg: '#A3FF00' },
    { id: 'white', label: 'Blanc', bg: '#FFFFFF' },
    { id: 'dark', label: 'Noir', bg: '#0F0F0F' }
  ];

  return (
    <div className="space-y-6 text-sm">
      {/* 1. Gabarit & Thème */}
      <div className="bg-[#FFFAE5] p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-4">
        <div>
          <label className="block font-roboto-condensed font-black uppercase text-xs tracking-wider mb-2">
            Gabarit de Diapositive
          </label>
          <div className="grid grid-cols-2 gap-2">
            {layouts.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => updateField('layout', l.id)}
                className={`py-2 px-3 text-xs font-roboto-condensed font-black uppercase border-[2px] border-[#0F0F0F] text-left transition-all ${
                  slide.layout === l.id
                    ? 'bg-[#A3FF00] text-black shadow-[3px_3px_0px_#0F0F0F] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-white hover:bg-black/5'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-roboto-condensed font-black uppercase text-xs tracking-wider mb-2">
            Ambiance Visuelle
          </label>
          <div className="flex gap-2">
            {themes.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => updateField('theme', th.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-roboto-condensed font-bold uppercase border-[2px] border-[#0F0F0F] flex items-center justify-center gap-2 ${
                  slide.theme === th.id
                    ? 'ring-2 ring-[#D20A33] shadow-[3px_3px_0px_#0F0F0F]'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: th.color, color: th.id === 'dark' ? '#FFF' : '#000' }}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Badge supérieur */}
      <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-3">
        <label className="block font-roboto-condensed font-black uppercase text-xs tracking-wider">
          Badge Thématique
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={slide.badgeText || ''}
            onChange={(e) => updateField('badgeText', e.target.value)}
            placeholder="Ex: TIERS-SECTEUR • NON MARCHAND"
            className="flex-1 p-2 border-[2px] border-[#0F0F0F] font-roboto-condensed font-bold uppercase text-xs"
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold text-gray-600">Couleur :</span>
          <div className="flex gap-2">
            {badgeColors.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() => updateField('badgeColor', c.id)}
                className={`w-6 h-6 border-[2px] border-[#0F0F0F] ${
                  slide.badgeColor === c.id ? 'scale-125 shadow-[2px_2px_0px_#0F0F0F]' : ''
                }`}
                style={{ backgroundColor: c.bg }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Contenu contextuel selon layout */}

      {/* COVER */}
      {slide.layout === 'cover' && (
        <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-4">
          <h3 className="font-roboto-condensed font-black uppercase text-xs border-b-2 border-black/10 pb-1">
            Contenu Titre & Choc
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Titre principal (retours à la ligne autorisés)</label>
            <textarea
              rows={3}
              value={slide.coverTitle || ''}
              onChange={(e) => updateField('coverTitle', e.target.value)}
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-syne font-black uppercase text-sm"
              placeholder="Ex: 60 000 € DE BUDGET."
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Mot ou expression en surbrillance</label>
            <input
              type="text"
              value={slide.coverHighlight || ''}
              onChange={(e) => updateField('coverHighlight', e.target.value)}
              placeholder="Ex: 0 € DE PUB"
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
            />
            <span className="text-[11px] text-gray-500">Ce texte apparaîtra en couleur accentuée (rouge ou vert).</span>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Sous-titre / Question d'accroche</label>
            <input
              type="text"
              value={slide.coverSubtitle || ''}
              onChange={(e) => updateField('coverSubtitle', e.target.value)}
              placeholder="Ex: Comment fait-on tourner une radio FM à Paris ?"
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Description / Chapeau explicatif</label>
            <textarea
              rows={2}
              value={slide.coverDescription || ''}
              onChange={(e) => updateField('coverDescription', e.target.value)}
              placeholder="Ex: Plongée dans nos comptes certifiés..."
              className="w-full p-2 border-[2px] border-[#0F0F0F] text-xs"
            />
          </div>
        </div>
      )}

      {/* STATS (2x2) */}
      {slide.layout === 'stats' && (
        <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-4">
          <h3 className="font-roboto-condensed font-black uppercase text-xs border-b-2 border-black/10 pb-1">
            Grille de 4 Chiffres Clés
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Titre de la diapositive</label>
            <input
              type="text"
              value={slide.statsTitle || ''}
              onChange={(e) => updateField('statsTitle', e.target.value)}
              placeholder="Ex: 4 chiffres pour comprendre notre réalité :"
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
            />
          </div>
          <div className="space-y-3 pt-2">
            {(slide.stats || []).map((st, idx) => (
              <div key={st.id} className="p-3 bg-gray-50 border-[2px] border-[#0F0F0F] space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Boîte #{idx + 1}</span>
                  <select
                    value={st.style}
                    onChange={(e) => {
                      const newStats = [...(slide.stats || [])];
                      newStats[idx].style = e.target.value as any;
                      updateField('stats', newStats);
                    }}
                    className="p-1 border border-black text-[11px] font-bold"
                  >
                    <option value="white">Fond Blanc</option>
                    <option value="accent">Fond Vanille</option>
                    <option value="dark">Fond Dark Néo</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={st.number}
                    onChange={(e) => {
                      const newStats = [...(slide.stats || [])];
                      newStats[idx].number = e.target.value;
                      updateField('stats', newStats);
                    }}
                    placeholder="Grand chiffre (ex: 60 k€)"
                    className="p-1.5 border border-black font-syne font-black text-xs"
                  />
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => {
                      const newStats = [...(slide.stats || [])];
                      newStats[idx].label = e.target.value;
                      updateField('stats', newStats);
                    }}
                    placeholder="Libellé court"
                    className="p-1.5 border border-black font-roboto-condensed font-bold text-xs"
                  />
                </div>
                <input
                  type="text"
                  value={st.sub}
                  onChange={(e) => {
                    const newStats = [...(slide.stats || [])];
                    newStats[idx].sub = e.target.value;
                    updateField('stats', newStats);
                  }}
                  placeholder="Explication complémentaire"
                  className="w-full p-1.5 border border-black text-[11px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BULLETS */}
      {slide.layout === 'bullets' && (
        <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-4">
          <h3 className="font-roboto-condensed font-black uppercase text-xs border-b-2 border-black/10 pb-1">
            Liste d'Arguments (▶)
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Titre de la slide</label>
            <input
              type="text"
              value={slide.bulletsTitle || ''}
              onChange={(e) => updateField('bulletsTitle', e.target.value)}
              placeholder="Ex: Exigences de 1982, moyens d'aujourd'hui"
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Phrase d'introduction (optionnelle)</label>
            <input
              type="text"
              value={slide.leadText || ''}
              onChange={(e) => updateField('leadText', e.target.value)}
              placeholder="Ex: Ce qui guide notre action :"
              className="w-full p-2 border-[2px] border-[#0F0F0F] text-xs"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold">Puces (▶)</label>
              <button
                type="button"
                onClick={() => {
                  const newBullets = [...(slide.bullets || []), 'Nouvel argument percutant'];
                  updateField('bullets', newBullets);
                }}
                className="flex items-center gap-1 text-[11px] font-bold bg-[#A3FF00] px-2 py-1 border border-black"
              >
                <Plus size={12} /> Ajouter une puce
              </button>
            </div>
            {(slide.bullets || []).map((b, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <textarea
                  rows={2}
                  value={b}
                  onChange={(e) => {
                    const newBullets = [...(slide.bullets || [])];
                    newBullets[idx] = e.target.value;
                    updateField('bullets', newBullets);
                  }}
                  className="flex-1 p-2 border border-black text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newBullets = (slide.bullets || []).filter((_, i) => i !== idx);
                    updateField('bullets', newBullets);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 border border-black"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BADGES */}
      {slide.layout === 'badges' && (
        <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-4">
          <h3 className="font-roboto-condensed font-black uppercase text-xs border-b-2 border-black/10 pb-1">
            Liste à Micro-Badges
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Titre de la slide</label>
            <input
              type="text"
              value={slide.badgesTitle || ''}
              onChange={(e) => updateField('badgesTitle', e.target.value)}
              placeholder="Ex: Un choix politique radical"
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold">Éléments</label>
              <button
                type="button"
                onClick={() => {
                  const newItems: MicroBadgeItem[] = [
                    ...(slide.badgeItems || []),
                    {
                      id: `b-${Date.now()}`,
                      badge: 'TAG',
                      badgeColor: 'red',
                      text: 'Explication ou argument'
                    }
                  ];
                  updateField('badgeItems', newItems);
                }}
                className="flex items-center gap-1 text-[11px] font-bold bg-[#A3FF00] px-2 py-1 border border-black"
              >
                <Plus size={12} /> Ajouter un élément
              </button>
            </div>
            {(slide.badgeItems || []).map((item, idx) => (
              <div key={item.id} className="p-3 bg-gray-50 border border-black space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.badge}
                    onChange={(e) => {
                      const newItems = [...(slide.badgeItems || [])];
                      newItems[idx].badge = e.target.value;
                      updateField('badgeItems', newItems);
                    }}
                    placeholder="Badge (ex: ZÉRO)"
                    className="w-24 p-1.5 border border-black font-roboto-condensed font-black text-xs uppercase"
                  />
                  <select
                    value={item.badgeColor}
                    onChange={(e) => {
                      const newItems = [...(slide.badgeItems || [])];
                      newItems[idx].badgeColor = e.target.value as any;
                      updateField('badgeItems', newItems);
                    }}
                    className="p-1.5 border border-black text-xs font-bold"
                  >
                    <option value="red">Rouge</option>
                    <option value="yellow">Jaune</option>
                    <option value="green">Vert fluo</option>
                    <option value="white">Blanc</option>
                    <option value="dark">Noir</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = (slide.badgeItems || []).filter((_, i) => i !== idx);
                      updateField('badgeItems', newItems);
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 border border-black ml-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...(slide.badgeItems || [])];
                    newItems[idx].text = e.target.value;
                    updateField('badgeItems', newItems);
                  }}
                  placeholder="Texte explicatif"
                  className="w-full p-2 border border-black text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUOTE */}
      {slide.layout === 'quote' && (
        <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-4">
          <h3 className="font-roboto-condensed font-black uppercase text-xs border-b-2 border-black/10 pb-1">
            Citation / Déclaration
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Texte de la citation</label>
            <textarea
              rows={3}
              value={slide.quoteText || ''}
              onChange={(e) => updateField('quoteText', e.target.value)}
              placeholder="Ex: La radio est un bien commun à défendre inlassablement."
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Auteur / Source</label>
            <input
              type="text"
              value={slide.quoteAuthor || ''}
              onChange={(e) => updateField('quoteAuthor', e.target.value)}
              placeholder="Ex: Jean B., bénévole"
              className="w-full p-2 border-[2px] border-[#0F0F0F] text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Rôle / Contexte</label>
            <input
              type="text"
              value={slide.quoteRole || ''}
              onChange={(e) => updateField('quoteRole', e.target.value)}
              placeholder="Ex: Émission Libre à Toi"
              className="w-full p-2 border-[2px] border-[#0F0F0F] text-xs"
            />
          </div>
        </div>
      )}

      {/* CTA */}
      {slide.layout === 'cta' && (
        <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-4">
          <h3 className="font-roboto-condensed font-black uppercase text-xs border-b-2 border-black/10 pb-1">
            Appel à l’action (CTA)
          </h3>
          <div>
            <label className="block text-xs font-bold mb-1">Titre d'appel</label>
            <input
              type="text"
              value={slide.ctaTitle || ''}
              onChange={(e) => updateField('ctaTitle', e.target.value)}
              placeholder="Ex: Rejoignez la Cause Commune."
              className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Description</label>
            <textarea
              rows={2}
              value={slide.ctaDescription || ''}
              onChange={(e) => updateField('ctaDescription', e.target.value)}
              placeholder="Ex: Écoutez en direct, soutenez..."
              className="w-full p-2 border-[2px] border-[#0F0F0F] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Texte du bouton</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slide.ctaButtonText || ''}
                onChange={(e) => updateField('ctaButtonText', e.target.value)}
                placeholder="Ex: cause-commune.fm"
                className="flex-1 p-2 border-[2px] border-[#0F0F0F] font-roboto-condensed font-black uppercase text-xs"
              />
              <select
                value={slide.ctaButtonColor || 'red'}
                onChange={(e) => updateField('ctaButtonColor', e.target.value as any)}
                className="p-2 border-[2px] border-[#0F0F0F] text-xs font-bold"
              >
                <option value="red">Bouton Rouge</option>
                <option value="green">Bouton Vert Fluo</option>
                <option value="yellow">Bouton Jaune</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 4. Footer personnalisé (optionnel) */}
      <div className="bg-white p-4 border-[3px] border-[#0F0F0F] shadow-[4px_4px_0px_#0F0F0F] space-y-2">
        <label className="block font-roboto-condensed font-black uppercase text-xs tracking-wider">
          Texte de Pied de Page (Droit)
        </label>
        <input
          type="text"
          value={slide.footerText || ''}
          onChange={(e) => updateField('footerText', e.target.value)}
          placeholder="Laissez vide pour le swipe automatique (ex: 1/6)"
          className="w-full p-2 border-[2px] border-[#0F0F0F] font-bold text-xs"
        />
        <span className="text-[11px] text-gray-500">
          Par défaut : "Swipe ➔ X/N" ou "Titre • X/N"
        </span>
      </div>
    </div>
  );
};
