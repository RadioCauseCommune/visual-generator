import React from 'react';
import { AiModelType, AiModel } from '../types';
import { AI_MODELS } from '../services/aiModels';

interface ModelSelectorProps {
  selectedModel: AiModelType;
  onModelChange: (model: AiModelType) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
}) => {
  const groupedModels = {
    rapides: AI_MODELS.filter(m => m.speed === 'fast'),
    qualite: AI_MODELS.filter(m => m.quality === 'outstanding'),
    standard: AI_MODELS.filter(m => m.speed === 'medium' && m.quality !== 'outstanding'),
  };

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-black uppercase mb-1 block">
          Modèle IA
        </label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value as AiModelType)}
          disabled={disabled}
          className="w-full neo-border-fine p-2 text-xs bg-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {AI_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} {model.isFree ? '🆓' : '💰'}
            </option>
          ))}
        </select>
      </div>

      {selectedModelData && (
        <div className="p-3 bg-[#FFFAE5] neo-border-fine space-y-2">
          <p className="text-[9px] font-black uppercase text-gray-600">
            {selectedModelData.description}
          </p>

          <div className="flex gap-2 text-[8px] font-bold uppercase">
            <span
              className={`px-2 py-1 rounded ${
                selectedModelData.speed === 'fast'
                  ? 'bg-[#A3FF00]'
                  : selectedModelData.speed === 'medium'
                  ? 'bg-yellow-400'
                  : 'bg-red-500 text-white'
              }`}
            >
              ⚡ {selectedModelData.speed}
            </span>
            <span
              className={`px-2 py-1 rounded ${
                selectedModelData.quality === 'outstanding'
                  ? 'bg-[#D20A33] text-white'
                  : selectedModelData.quality === 'excellent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-400'
              }`}
            >
              ⭐ {selectedModelData.quality}
            </span>
            {selectedModelData.isFree && (
              <span className="px-2 py-1 rounded bg-green-500 text-white">
                🆓 Gratuit
              </span>
            )}
          </div>

          <div className="text-[8px] font-bold text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Steps max:</span>
              <span>{selectedModelData.maxSteps}</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution max:</span>
              <span>{selectedModelData.maxWidth}x{selectedModelData.maxHeight}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
