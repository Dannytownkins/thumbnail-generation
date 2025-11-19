import React from 'react';
import { VehicleType } from '../types';

interface VehicleSelectorProps {
  selectedVehicle: VehicleType | null;
  onSelectVehicle: (vehicle: VehicleType | null) => void;
  selectedMods: string[];
  onSelectMods: (mods: string[]) => void;
}

const VEHICLE_INFO = {
  [VehicleType.RYKER]: {
    name: 'Can-Am Ryker',
    description: 'Sporty three-wheeler',
    emoji: '🏍️',
    gradient: 'from-orange-500 to-red-600',
  },
  [VehicleType.SPYDER_F3]: {
    name: 'Spyder F3',
    description: 'Performance roadster',
    emoji: '🏁',
    gradient: 'from-blue-500 to-cyan-600',
  },
  [VehicleType.SPYDER_RT]: {
    name: 'Spyder RT',
    description: 'Luxury touring',
    emoji: '✨',
    gradient: 'from-purple-500 to-pink-600',
  },
  [VehicleType.SLINGSHOT]: {
    name: 'Slingshot',
    description: 'Open-air roadster',
    emoji: '⚡',
    gradient: 'from-yellow-500 to-orange-600',
  },
};

const AVAILABLE_MODS = [
  { id: 'underglow', name: 'Underglow Lighting', emoji: '💡' },
  { id: 'halo_lights', name: 'Halo Headlights', emoji: '🔦' },
  { id: 'custom_wheels', name: 'Aftermarket Wheels', emoji: '🛞' },
  { id: 'sport_exhaust', name: 'Performance Exhaust', emoji: '💨' },
  { id: 'windshield', name: 'Touring Windshield', emoji: '🛡️' },
  { id: 'custom_seats', name: 'Custom Stitch Seats', emoji: '💺' },
  { id: 'audio_system', name: 'Premium Audio System', emoji: '🔊' },
  { id: 'wrap_decal', name: 'Custom Wrap/Graphics', emoji: '🎨' },
];

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onSelectVehicle,
  selectedMods,
  onSelectMods,
}) => {
  const toggleMod = (modId: string) => {
    if (selectedMods.includes(modId)) {
      onSelectMods(selectedMods.filter((id) => id !== modId));
    } else {
      onSelectMods([...selectedMods, modId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">1. Select Your Ride</h3>
          {selectedVehicle && (
            <button
              onClick={() => onSelectVehicle(null)}
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(VEHICLE_INFO).map(([key, info]) => {
            const vehicleType = key as VehicleType;
            const isSelected = selectedVehicle === vehicleType;

            return (
              <button
                key={key}
                onClick={() => onSelectVehicle(vehicleType)}
                className={`
                  relative p-4 rounded-xl transition-all duration-300 group
                  ${isSelected
                    ? 'bg-gradient-to-br ' + info.gradient + ' shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-orange-500/50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl filter drop-shadow-lg">{info.emoji}</span>
                  <div className="text-center">
                    <div className={`font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {info.name}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                      {info.description}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mods Selector */}
      <div className="space-y-3 pt-4 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🛠️</span> Installed Mods
          <span className="text-xs font-normal text-slate-400 ml-2">(Select all that apply)</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_MODS.map((mod) => {
            const isSelected = selectedMods.includes(mod.name); // Store the name directly for the prompt
            
            return (
              <button
                key={mod.id}
                onClick={() => toggleMod(mod.name)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 hover:border-slate-600'
                  }
                `}
              >
                <span>{mod.emoji}</span>
                <span>{mod.name}</span>
                {isSelected && (
                  <span className="ml-auto text-indigo-200">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedVehicle && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg mt-4">
          <p className="text-sm text-orange-200">
            <span className="font-semibold">Current Config:</span> {VEHICLE_INFO[selectedVehicle].name}
            {selectedMods.length > 0 ? ` + ${selectedMods.length} mods` : ' (Stock)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;
