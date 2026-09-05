import React, { useState, useRef, useEffect } from 'react';
import { CarouselProject, CarouselSlide } from './types';
import { PRESET_CAROUSELS, createEmptySlide } from './presets';
import { CarouselSlideRenderer } from './CarouselSlideRenderer';
import { CarouselSlideEditor } from './CarouselSlideEditor';
import { CarouselList } from './CarouselList';
import { exportSingleSlide, exportCarouselZip } from './exportUtils';
import { Download, Archive, FileJson, Upload, Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const CarouselStudio: React.FC = () => {
  // Start with the first preset (Économie & FSER) by default
  const [project, setProject] = useState<CarouselProject>(() => {
    const saved = localStorage.getItem('cc_carousel_project_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved carousel project', e);
      }
    }
    return PRESET_CAROUSELS[0];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [scale, setScale] = useState(0.55);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const activeSlide = project.slides[activeIndex] || project.slides[0];

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('cc_carousel_project_v2', JSON.stringify(project));
  }, [project]);

  // Handle slide update
  const handleUpdateSlide = (updated: CarouselSlide) => {
    setProject((prev) => {
      const newSlides = [...prev.slides];
      newSlides[activeIndex] = updated;
      return { ...prev, slides: newSlides };
    });
  };

  // Add slide
  const handleAddSlide = () => {
    setProject((prev) => {
      const newSlide = createEmptySlide(prev.slides.length + 1, prev.slides.length + 1);
      return { ...prev, slides: [...prev.slides, newSlide] };
    });
    setActiveIndex(project.slides.length);
  };

  // Duplicate slide
  const handleDuplicateSlide = (index: number) => {
    setProject((prev) => {
      const target = prev.slides[index];
      const duplicated: CarouselSlide = {
        ...JSON.parse(JSON.stringify(target)),
        id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        footerText: undefined
      };
      const newSlides = [...prev.slides];
      newSlides.splice(index + 1, 0, duplicated);
      return { ...prev, slides: newSlides };
    });
    setActiveIndex(index + 1);
  };

  // Remove slide
  const handleRemoveSlide = (index: number) => {
    if (project.slides.length <= 1) return;
    setProject((prev) => {
      const newSlides = prev.slides.filter((_, i) => i !== index);
      return { ...prev, slides: newSlides };
    });
    if (activeIndex >= project.slides.length - 1) {
      setActiveIndex(Math.max(0, project.slides.length - 2));
    }
  };

  // Move slide
  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= project.slides.length) return;
    setProject((prev) => {
      const newSlides = [...prev.slides];
      const [moved] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, moved);
      return { ...prev, slides: newSlides };
    });
    setActiveIndex(toIndex);
  };

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const found = PRESET_CAROUSELS.find((p) => p.id === presetId);
    if (found) {
      if (confirm(`Charger le modèle "${found.title}" ? Les modifications non enregistrées seront remplacées.`)) {
        setProject(JSON.parse(JSON.stringify(found)));
        setActiveIndex(0);
      }
    }
  };

  // Single PNG Export
  const handleExportCurrent = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const slideNum = String(activeIndex + 1).padStart(2, '0');
      const filename = `slide-${slideNum}-${Date.now()}.png`;
      await exportSingleSlide(previewRef.current, filename);
    } catch (err) {
      console.error('Erreur export slide', err);
      alert("Erreur lors de l'export de la diapositive.");
    } finally {
      setIsExporting(false);
    }
  };

  // ZIP Export
  const handleExportZip = async () => {
    setIsExporting(true);
    setExportProgress({ current: 1, total: project.slides.length });
    try {
      await exportCarouselZip(
        project.slides,
        project.defaultFooterMedia,
        project.title,
        (current, total) => setExportProgress({ current, total })
      );
    } catch (err) {
      console.error('Erreur export ZIP', err);
      alert("Erreur lors de l'exportation du fichier ZIP.");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `carrousel-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.slides && Array.isArray(imported.slides)) {
          setProject(imported);
          setActiveIndex(0);
        } else {
          alert('Fichier JSON invalide pour un carrousel.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#FFFAE5]">
      {/* Top Sub-Bar Controls */}
      <div className="bg-white neo-border border-t-0 border-l-0 border-r-0 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-roboto-condensed font-black uppercase text-xs text-gray-500">
              Modèle :
            </span>
            <select
              onChange={(e) => handleLoadPreset(e.target.value)}
              value={project.id || ''}
              className="font-roboto-condensed font-bold text-xs p-1.5 bg-[#FFFAE5] border-[2px] border-[#0F0F0F]"
            >
              <option value="" disabled>Choisir un modèle...</option>
              {PRESET_CAROUSELS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="h-6 w-[2px] bg-black/10" />

          <input
            type="text"
            value={project.title}
            onChange={(e) => setProject({ ...project, title: e.target.value })}
            placeholder="Titre du carrousel"
            className="font-syne font-black text-sm px-2 py-1 border-[2px] border-[#0F0F0F] bg-[#FFFAE5] w-64 uppercase"
          />

          <input
            type="text"
            value={project.defaultFooterMedia}
            onChange={(e) => setProject({ ...project, defaultFooterMedia: e.target.value })}
            placeholder="Radio Cause Commune 93.1 FM"
            className="font-roboto-condensed font-bold text-xs px-2 py-1 border-[2px] border-[#0F0F0F] bg-white w-48 uppercase"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {/* JSON buttons */}
          <button
            type="button"
            onClick={handleExportJson}
            title="Exporter le projet en JSON"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-roboto-condensed font-bold uppercase bg-white border-[2px] border-[#0F0F0F] neo-hover neo-active"
          >
            <FileJson size={14} /> JSON
          </button>
          <label
            title="Importer un fichier JSON"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-roboto-condensed font-bold uppercase bg-white border-[2px] border-[#0F0F0F] cursor-pointer neo-hover neo-active"
          >
            <Upload size={14} /> Import
            <input type="file" accept=".json" onChange={handleImportJson} hidden />
          </label>

          <div className="h-6 w-[2px] bg-black/10" />

          {/* Export PNG */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportCurrent}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-roboto-condensed font-black uppercase bg-[#00F0FF] border-[2px] border-[#0F0F0F] shadow-[2px_2px_0px_#0F0F0F] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 disabled:opacity-50"
          >
            <Download size={14} /> Slide #{activeIndex + 1} (PNG)
          </button>

          {/* Export ZIP */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-roboto-condensed font-black uppercase bg-[#A3FF00] text-black border-[2px] border-[#0F0F0F] shadow-[3px_3px_0px_#0F0F0F] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 disabled:opacity-50"
          >
            <Archive size={14} /> Exporter Carrousel (ZIP)
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Slides Thumbnail Strip */}
        <aside className="w-72 bg-white neo-border border-t-0 border-b-0 border-l-0 p-4 flex flex-col flex-shrink-0">
          <CarouselList
            slides={project.slides}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            onAdd={handleAddSlide}
            onDuplicate={handleDuplicateSlide}
            onRemove={handleRemoveSlide}
            onMove={handleMoveSlide}
          />
        </aside>

        {/* Center: Live Scaled Preview with Zoom controls */}
        <main className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-auto custom-scrollbar">
          {/* Zoom Toolbar */}
          <div className="absolute top-4 right-4 bg-white neo-border-fine px-3 py-1.5 flex items-center gap-2 shadow-[2px_2px_0px_#0F0F0F] z-20">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.25, s - 0.05))}
              className="p-1 hover:bg-black/10"
              title="Zoom arrière"
            >
              <ZoomOut size={14} />
            </button>
            <span className="font-roboto-condensed font-bold text-xs w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1, s + 0.05))}
              className="p-1 hover:bg-black/10"
              title="Zoom avant"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={() => setScale(0.55)}
              className="p-1 hover:bg-black/10 ml-1 text-xs font-bold"
              title="Taille optimale"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          {/* Scaled Preview Wrapper */}
          <div
            style={{
              width: `${1080 * scale}px`,
              height: `${1080 * scale}px`
            }}
            className="relative shadow-[12px_12px_0px_#0F0F0F] flex-shrink-0"
          >
            <CarouselSlideRenderer
              innerRef={previewRef}
              slide={activeSlide}
              mediaName={project.defaultFooterMedia}
              pageIndex={activeIndex}
              totalPages={project.slides.length}
              scale={scale}
            />
          </div>
        </main>

        {/* Right: Slide Content & Layout Editor */}
        <aside className="w-96 bg-white neo-border border-t-0 border-b-0 border-r-0 p-6 overflow-y-auto flex-shrink-0 custom-scrollbar">
          <div className="flex items-center justify-between border-b-4 border-black pb-2 mb-6">
            <h2 className="font-syne font-black text-xl uppercase">
              Éditer Slide #{activeIndex + 1}
            </h2>
            <span className="font-roboto-condensed font-bold text-xs bg-[#FFFAE5] px-2 py-0.5 border border-black uppercase">
              {activeSlide.layout}
            </span>
          </div>

          <CarouselSlideEditor
            slide={activeSlide}
            onChange={handleUpdateSlide}
          />
        </aside>
      </div>

      {/* Export progress modal overlay */}
      {isExporting && exportProgress && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-[#FFFAE5] p-8 border-[5px] border-[#0F0F0F] shadow-[10px_10px_0px_#0F0F0F] max-w-sm w-full text-center space-y-4">
            <Sparkles className="mx-auto text-[#D20A33] animate-spin" size={36} />
            <h3 className="font-syne font-black text-xl uppercase">
              Génération du ZIP en cours...
            </h3>
            <p className="font-roboto text-sm font-bold">
              Rendu HD 1080×1080 : slide {exportProgress.current} sur {exportProgress.total}
            </p>
            <div className="w-full bg-white border-[2px] border-black h-4 overflow-hidden">
              <div
                className="bg-[#A3FF00] h-full transition-all duration-150"
                style={{
                  width: `${(exportProgress.current / exportProgress.total) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
