import React from 'react';
import { CarouselSlide } from './types';
import { Plus, Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  slides: CarouselSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export const CarouselList: React.FC<Props> = ({
  slides,
  activeIndex,
  onSelect,
  onAdd,
  onDuplicate,
  onRemove,
  onMove
}) => {
  const getSlideSnippet = (slide: CarouselSlide) => {
    switch (slide.layout) {
      case 'cover':
        return slide.coverTitle || 'Titre Choc';
      case 'stats':
        return slide.statsTitle || 'Grille de statistiques';
      case 'bullets':
        return slide.bulletsTitle || 'Liste d’arguments';
      case 'badges':
        return slide.badgesTitle || 'Micro-badges';
      case 'quote':
        return slide.quoteText || 'Citation';
      case 'cta':
        return slide.ctaTitle || 'Appel à l’action';
      default:
        return 'Slide';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-syne font-black text-sm uppercase tracking-wider">
          Diapositives ({slides.length})
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-roboto-condensed font-black uppercase bg-[#A3FF00] text-black px-2.5 py-1 border-[2px] border-[#0F0F0F] shadow-[2px_2px_0px_#0F0F0F] hover:translate-x-[-1px] hover:translate-y-[-1px]"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={slide.id}
              onClick={() => onSelect(idx)}
              className={`p-3 border-[2px] cursor-pointer transition-all ${
                isActive
                  ? 'bg-white border-[#D20A33] shadow-[4px_4px_0px_#0F0F0F] translate-x-1'
                  : 'bg-[#FFFAE5] border-[#0F0F0F] hover:bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-roboto-condensed font-black text-xs px-1.5 py-0.5 border border-black ${
                      isActive ? 'bg-[#D20A33] text-white' : 'bg-white text-black'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {slide.layout}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    title="Monter"
                    disabled={idx === 0}
                    onClick={() => onMove(idx, idx - 1)}
                    className="p-1 hover:bg-black/10 disabled:opacity-30"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    title="Descendre"
                    disabled={idx === slides.length - 1}
                    onClick={() => onMove(idx, idx + 1)}
                    className="p-1 hover:bg-black/10 disabled:opacity-30"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    title="Dupliquer"
                    onClick={() => onDuplicate(idx)}
                    className="p-1 hover:bg-black/10"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    type="button"
                    title="Supprimer"
                    disabled={slides.length <= 1}
                    onClick={() => onRemove(idx)}
                    className="p-1 hover:bg-red-100 text-red-600 disabled:opacity-30"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="text-xs font-bold truncate text-gray-800">
                {getSlideSnippet(slide)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
