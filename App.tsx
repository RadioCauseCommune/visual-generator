import React, { useState, useEffect, useRef, useCallback } from 'react';
import './fonts';
import { AssetType, LayerRole, Layer } from './types';
import { sanitizeText } from './utils/sanitization';
import { useToasts, ToastContainer } from './components/Toast';
import { useLayers } from './hooks/useLayers';
import { useAiImage } from './hooks/useAiImage';
import { useProject } from './hooks/useProject';
import { usePersistence } from './hooks/usePersistence';
import { useHistory, ProjectState } from './hooks/useHistory';

// Components
import Header from './components/UI/Header';
import Sidebar from './components/Editor/Sidebar';
import CanvasArea from './components/Editor/CanvasArea';
import Inspector from './components/Editor/Inspector';
import FontPreloader from './components/UI/FontPreloader';
import ProjectGallery from './components/UI/ProjectGallery';
import BatchExportModal from './components/UI/BatchExportModal';
import AuthModal from './components/UI/AuthModal';
import { storageService, SavedProject } from './services/storage';
import { authService } from './services/auth';
import { cloudStorageService } from './services/cloudStorage';
import InpaintingModal from './components/Editor/InpaintingModal';
import RssImporter from './components/Editor/RssImporter';
import { RssEpisode } from './services/rssService';
import GreetingsGenerator from './components/Greetings/GreetingsGenerator';
import { ViewMode } from './components/UI/Header';

const App: React.FC = () => {
  const { toasts, removeToast, error: showError, success } = useToasts();

  const [assetType, setAssetType] = useState<AssetType>(AssetType.INSTA_POST_SQUARE);
  const [meta, setMeta] = useState({
    title: 'TITRE DE L\'ÉMISSION',
    subtitle: 'Le sous-titre qui claque',
    guest_name: '',
    date: '',
    extra1: '',
    extra2: '',
    isTransparent: false
  });

  // Hooks
  const {
    layers, setLayers,
    selectedLayerId, setSelectedLayerId, selectedLayer,
    activeGuides, setActiveGuides,
    applyDefaultTemplate, syncLayersWithMeta, addOptionalLayer,
    updateLayer, moveLayer, applyTemplate, adaptLayersToFormat,
    removeLayer, duplicateLayer
  } = useLayers(assetType, meta);

  const {
    prompt, setPrompt, isGenerating,
    selectedAiStyle, setSelectedAiStyle,
    selectedModel, setSelectedModel,
    showAiAdvanced, setShowAiAdvanced,
    aiParams, setAiParams,
    handleAiGenerate: runAiGenerate
  } = useAiImage(assetType, layers.length);

  const {
    handleExportImage, handleExportSvg, handleExportProject, handleImportProject,
    handleFileUpload, handleBatchExport: runBatchExport
  } = useProject(
    assetType, layers, meta,
    setAssetType, setLayers, setMeta, setSelectedLayerId, showError
  );

  const [viewMode, setViewMode] = useState<ViewMode>('studio');

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    authService.onAuthStateChange((user) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    if (confirm('Voulez-vous vous déconnecter ?')) {
      await authService.signOut();
    }
  };

  usePersistence(assetType, layers, meta, setAssetType, (l) => setLayers(l), (m) => setMeta(m));

  // --- HISTORY LOGIC ---
  const { undo, redo, recordChange, setPresentQuietly, canUndo, canRedo } = useHistory({ layers, meta, assetType });
  const isUndoRedoing = useRef(false);

  const handleOpenInpainting = (layer: Layer) => {
    setInpaintingLayer(layer);
    setIsInpaintingOpen(true);
  };

  const handleInpaintingComplete = (newContent: string) => {
    if (!inpaintingLayer) return;
    setLayers(prev => prev.map(l => l.id === inpaintingLayer.id ? { ...l, content: newContent } : l));
    setIsInpaintingOpen(false);
    setInpaintingLayer(null);
    success("Image retouchée avec succès !");
  };

  // Keyboard shortcuts for History
  useEffect(() => {
    const handleHistoryKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleHistoryKeys);
    return () => window.removeEventListener('keydown', handleHistoryKeys);
  }, [canUndo, canRedo]);

  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      isUndoRedoing.current = true;
      setLayers(prevState.layers);
      setMeta(prevState.meta);
      setAssetType(prevState.assetType);
      setTimeout(() => { isUndoRedoing.current = false; }, 100);
    }
  }, [undo, setLayers, setMeta, setAssetType]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      isUndoRedoing.current = true;
      setLayers(nextState.layers);
      setMeta(nextState.meta);
      setAssetType(nextState.assetType);
      setTimeout(() => { isUndoRedoing.current = false; }, 100);
    }
  }, [redo, setLayers, setMeta, setAssetType]);

  // Record changes with debounce
  useEffect(() => {
    if (isUndoRedoing.current) return;

    const timer = setTimeout(() => {
      recordChange({ layers, meta, assetType });
    }, 800);

    return () => clearTimeout(timer);
  }, [layers, meta, assetType, recordChange]);

  // Sync logic
  const prevAssetType = useRef(assetType);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);
  const [isInpaintingOpen, setIsInpaintingOpen] = useState(false);
  const [inpaintingLayer, setInpaintingLayer] = useState<Layer | null>(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [isBatching, setIsBatching] = useState(false);

  const handleStartBatch = async (selectedTypes: AssetType[]) => {
    setIsBatching(true);
    setBatchProgress({ current: 0, total: selectedTypes.length });

    try {
      await runBatchExport(selectedTypes, (current) => {
        setBatchProgress(prev => ({ ...prev, current }));
      });
      alert('Exportation groupée terminée !');
    } catch (err) {
      showError("Erreur lors de l'exportation groupée.");
    } finally {
      setIsBatching(false);
      setIsBatchExportOpen(false);
    }
  };

  const handleQuickSave = async () => {
    const name = window.prompt('Nom du projet :', meta.title) || 'Sans titre';

    if (user) {
      try {
        await cloudStorageService.saveProject({
          name,
          asset_type: assetType,
          layers,
          meta,
          thumbnail: '' // Dashboard/Cloud placeholder
        });
        alert('Projet sauvegardé dans le Cloud ! ☁️');
      } catch (err) {
        showError("Erreur lors de la sauvegarde Cloud.");
      }
    } else {
      storageService.saveProject({
        version: '1.2.0',
        assetType,
        layers,
        meta,
        name
      });
      alert('Projet sauvegardé localement ! 💾');
    }
  };

  const handleLoadFromGallery = (project: any) => {
    isUndoRedoing.current = true;

    const pMeta = project.meta;
    const pAssetType = project.assetType || project.asset_type;
    const pLayers = project.layers;

    setAssetType(pAssetType);
    setLayers(pLayers);
    setMeta({
      title: pMeta.title || '',
      subtitle: pMeta.subtitle || '',
      guest_name: pMeta.guest_name || '',
      date: pMeta.date || '',
      extra1: pMeta.extra1 || '',
      extra2: pMeta.extra2 || '',
      isTransparent: !!pMeta.isTransparent,
    });
    setIsGalleryOpen(false);
    setTimeout(() => { isUndoRedoing.current = false; }, 100);
  };

  // --- DEEP LINKING ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('p');
    if (projectId) {
      loadPublicProject(projectId);
    }
  }, []);

  const loadPublicProject = async (id: string) => {
    try {
      const project = await cloudStorageService.getProject(id);
      if (project) {
        handleLoadFromGallery(project);
        success('Projet partagé chargé !');
      }
    } catch (err) {
      console.error("Erreur chargement projet public:", err);
      showError("Impossible de charger le projet partagé. Il est peut-être privé ou supprimé.");
    }
  };

  useEffect(() => {
    const sanitizedMeta = {
      title: sanitizeText(meta.title),
      subtitle: sanitizeText(meta.subtitle),
      guest_name: sanitizeText(meta.guest_name || ''),
      date: sanitizeText(meta.date || ''),
      extra1: sanitizeText(meta.extra1 || ''),
      extra2: sanitizeText(meta.extra2 || ''),
      isTransparent: !!meta.isTransparent
    };

    if (JSON.stringify(sanitizedMeta) !== JSON.stringify(meta)) {
      setMeta(sanitizedMeta);
      return;
    }

    if (prevAssetType.current !== assetType) {
      if (layers.length > 0) {
        // Adapt existing layers to new format instead of resetting
        adaptLayersToFormat(prevAssetType.current, assetType);
      } else {
        applyDefaultTemplate();
      }
      prevAssetType.current = assetType;
    } else if (layers.length === 0) {
      applyDefaultTemplate();
    } else {
      syncLayersWithMeta();
    }
  }, [meta, assetType, applyDefaultTemplate, syncLayersWithMeta, layers.length]);

  const handleAiGenerate = () => {
    runAiGenerate((newLayer) => {
      setLayers(prev => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
    }, showError);
  };

  const handleRssImport = (episode: RssEpisode) => {
    setMeta(prev => ({
      ...prev,
      title: episode.title,
      // On peut essayer d'extraire des infos supp du titre ou de la description si besoin
      subtitle: `Épisode #${episode.number}`,
      date: new Date(episode.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }));

    // Optionnel: si on veut aussi mettre l'image du flux en fond
    if (episode.imageUrl && confirm('Voulez-vous utiliser l\'image de couverture de l\'épisode comme fond ?')) {
      const proxiedUrl = `/api/proxy?url=${encodeURIComponent(episode.imageUrl)}`;
      const img = new Image();
      img.onload = () => {
        setLayers(prev => prev.map(l => l.role === 'background' ? {
          ...l,
          content: proxiedUrl,
          imageNaturalWidth: img.naturalWidth,
          imageNaturalHeight: img.naturalHeight
        } : l));
      };
      img.src = proxiedUrl;
    }

    success(`Données de l'épisode #${episode.number} importées !`);
  };

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header
          onImportProject={handleImportProject}
          onExportProject={handleExportProject}
          onExportImage={handleExportImage}
          onExportSvg={handleExportSvg}
          onBatchExport={() => setIsBatchExportOpen(true)}
          onQuickSave={handleQuickSave}
          onOpenGallery={() => setIsGalleryOpen(true)}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          user={user}
          onLogin={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <div className="flex flex-1 overflow-hidden">
          {viewMode === 'studio' ? (
            <>
              <Sidebar
                assetType={assetType}
                setAssetType={setAssetType}
                meta={meta}
                setMeta={setMeta}
                layers={layers}
                addOptionalLayer={addOptionalLayer}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                setLayers={setLayers}
                prompt={prompt}
                setPrompt={setPrompt}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                isGenerating={isGenerating}
                selectedAiStyle={selectedAiStyle}
                setSelectedAiStyle={setSelectedAiStyle}
                showAiAdvanced={showAiAdvanced}
                setShowAiAdvanced={setShowAiAdvanced}
                aiParams={aiParams}
                setAiParams={setAiParams}
                handleAiGenerate={handleAiGenerate}
                handleFileUpload={handleFileUpload}
                applyTemplate={applyTemplate}
                onRssImport={handleRssImport}
              />

              <CanvasArea
                assetType={assetType}
                layers={layers}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                updateLayer={updateLayer}
                activeGuides={activeGuides}
                setActiveGuides={setActiveGuides}
                isTransparent={meta.isTransparent}
                onDelete={removeLayer}
                onDuplicate={duplicateLayer}
              />

              <Inspector
                selectedLayer={selectedLayer}
                assetType={assetType}
                updateLayer={updateLayer}
                setLayers={setLayers}
                setSelectedLayerId={setSelectedLayerId}
                moveLayer={moveLayer}
                layers={layers}
                onOpenInpainting={handleOpenInpainting}
              />
            </>
          ) : (
            <GreetingsGenerator />
          )}
        </div>

        <FontPreloader />
        <ProjectGallery
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onLoadProject={handleLoadFromGallery}
          user={user}
        />
        <BatchExportModal
          isOpen={isBatchExportOpen}
          onClose={() => setIsBatchExportOpen(false)}
          onStartBatch={handleStartBatch}
          isProcessing={isBatching}
          progress={batchProgress.current}
          total={batchProgress.total}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => { }}
        />
      </div>

      {isInpaintingOpen && inpaintingLayer && (
        <InpaintingModal
          isOpen={isInpaintingOpen}
          onClose={() => setIsInpaintingOpen(false)}
          layer={inpaintingLayer}
          onComplete={handleInpaintingComplete}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default App;
