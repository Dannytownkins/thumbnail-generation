import React, { useState, useEffect } from 'react';
import { Template, ImageModel, VehicleType, GenerationSettings } from '../types';
import {
  getTemplates,
  saveTemplate,
  deleteTemplate,
  toggleTemplateFavorite,
} from '../utils/storage';

interface TemplateLibraryProps {
  onLoadTemplate: (template: Template) => void;
  currentPrompt: string;
  currentModel: ImageModel;
  currentSettings: GenerationSettings;
  currentVehicle: VehicleType | null;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onLoadTemplate,
  currentPrompt,
  currentModel,
  currentSettings,
  currentVehicle,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [filterVehicle, setFilterVehicle] = useState<VehicleType | 'all'>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setTemplates(getTemplates());
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;

    const template: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      prompt: currentPrompt,
      vehicle: currentVehicle || undefined,
      model: currentModel,
      settings: currentSettings,
      isFavorite: false,
      createdAt: Date.now(),
    };

    saveTemplate(template);
    loadTemplates();
    setNewTemplateName('');
    setSaveDialogOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Delete this template?')) {
      deleteTemplate(id);
      loadTemplates();
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleTemplateFavorite(id);
    loadTemplates();
  };

  const filteredTemplates = templates.filter((t) => {
    if (filterVehicle === 'all') return true;
    return t.vehicle === filterVehicle;
  });

  const favoriteTemplates = filteredTemplates.filter((t) => t.isFavorite);
  const regularTemplates = filteredTemplates.filter((t) => !t.isFavorite);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSaveDialogOpen(true)}
          disabled={!currentPrompt.trim()}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
        >
          💾 Save Current as Template
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all"
        >
          📚 {isOpen ? 'Hide' : 'Show'} Library ({templates.length})
        </button>
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Save Template</h3>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Template name..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setSaveDialogOpen(false);
                  setNewTemplateName('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Filter:</label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value as VehicleType | 'all')}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Vehicles</option>
              {Object.values(VehicleType).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No templates saved yet</p>
              <p className="text-xs mt-1">Save your first template to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {favoriteTemplates.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-orange-400 mb-2">⭐ Favorites</h4>
                  {favoriteTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onLoad={onLoadTemplate}
                      onDelete={handleDeleteTemplate}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
              {regularTemplates.length > 0 && (
                <div>
                  {favoriteTemplates.length > 0 && (
                    <h4 className="text-xs font-semibold text-slate-400 mb-2">All Templates</h4>
                  )}
                  {regularTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onLoad={onLoadTemplate}
                      onDelete={handleDeleteTemplate}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: Template;
  onLoad: (template: Template) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLoad,
  onDelete,
  onToggleFavorite,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-2 hover:border-orange-500/50 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onToggleFavorite(template.id)}
              className="text-lg leading-none hover:scale-125 transition-transform"
            >
              {template.isFavorite ? '⭐' : '☆'}
            </button>
            <h4 className="font-semibold text-white truncate">{template.name}</h4>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{template.prompt}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {template.vehicle && (
              <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                {template.vehicle}
              </span>
            )}
            <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
              {template.model.includes('imagen') ? 'Imagen' : 'Gemini Flash'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onLoad(template)}
            className="px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded hover:bg-cyan-600 transition-all"
          >
            Load
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded hover:bg-red-500 hover:text-white transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
