import React, { useState, useEffect } from 'react';
import { PromptComponent, VehicleType } from '../types';
import {
  ACTION_PRESETS,
  SETTING_PRESETS,
  STYLE_PRESETS,
  LIGHTING_PRESETS,
  buildPrompt,
  enhancePrompt,
} from '../utils/promptBuilder';

interface SmartPromptBuilderProps {
  vehicle: VehicleType | null;
  onPromptChange: (prompt: string) => void;
  initialPrompt?: string;
}

const SmartPromptBuilder: React.FC<SmartPromptBuilderProps> = ({
  vehicle,
  onPromptChange,
  initialPrompt = '',
}) => {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [simplePrompt, setSimplePrompt] = useState(initialPrompt);
  const [components, setComponents] = useState<PromptComponent>({
    vehicle: vehicle || undefined,
    action: '',
    setting: '',
    style: '',
    lighting: '',
    additional: '',
  });

  useEffect(() => {
    setComponents(prev => ({ ...prev, vehicle: vehicle || undefined }));
  }, [vehicle]);

  useEffect(() => {
    if (mode === 'simple') {
      const enhanced = enhancePrompt(simplePrompt, vehicle || undefined);
      onPromptChange(enhanced);
    } else {
      const built = buildPrompt(components);
      onPromptChange(built);
    }
  }, [mode, simplePrompt, components, vehicle]);

  const handleComponentChange = (key: keyof PromptComponent, value: string) => {
    setComponents(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-white">Prompt Builder</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('simple')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'simple'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'advanced'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {mode === 'simple' ? (
        <div className="space-y-3">
          <div>
            <textarea
              value={simplePrompt}
              onChange={(e) => setSimplePrompt(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe your thumbnail... (e.g., 'sunset drift on mountain road')"
            />
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-xs text-cyan-200">
              ✨ <span className="font-semibold">AI Enhancement Active:</span> Your prompt will be automatically enhanced with professional photography keywords
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <PromptField
            label="Action"
            value={components.action || ''}
            onChange={(val) => handleComponentChange('action', val)}
            presets={ACTION_PRESETS}
            placeholder="What's the vehicle doing?"
          />
          <PromptField
            label="Setting"
            value={components.setting || ''}
            onChange={(val) => handleComponentChange('setting', val)}
            presets={SETTING_PRESETS}
            placeholder="Where is this happening?"
          />
          <PromptField
            label="Lighting"
            value={components.lighting || ''}
            onChange={(val) => handleComponentChange('lighting', val)}
            presets={LIGHTING_PRESETS}
            placeholder="Time of day / lighting"
          />
          <PromptField
            label="Style"
            value={components.style || ''}
            onChange={(val) => handleComponentChange('style', val)}
            presets={STYLE_PRESETS}
            placeholder="Visual style"
          />
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Additional Details</label>
            <input
              type="text"
              value={components.additional || ''}
              onChange={(e) => handleComponentChange('additional', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Any extra details..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface PromptFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets: string[];
  placeholder: string;
}

const PromptField: React.FC<PromptFieldProps> = ({
  label,
  value,
  onChange,
  presets,
  placeholder,
}) => {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowPresets(true)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder={placeholder}
        />
        {showPresets && (
          <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onChange(preset);
                  setShowPresets(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-orange-500 hover:text-white transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
      {showPresets && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowPresets(false)}
        />
      )}
    </div>
  );
};

export default SmartPromptBuilder;
