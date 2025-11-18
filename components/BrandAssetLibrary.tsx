import React, { useState, useEffect } from 'react';
import { BrandAsset } from '../types';

const STORAGE_KEY = 'slingmods_brand_assets';

const getBrandAssets = (): BrandAsset[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveBrandAssets = (assets: BrandAsset[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
};

interface BrandAssetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset?: (asset: BrandAsset) => void;
}

const BrandAssetLibrary: React.FC<BrandAssetLibraryProps> = ({ isOpen, onClose, onSelectAsset }) => {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [filterType, setFilterType] = useState<BrandAsset['type'] | 'all'>('all');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    setAssets(getBrandAssets());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: BrandAsset['type']) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAsset: BrandAsset = {
          id: Date.now().toString() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: reader.result as string,
          type,
          createdAt: Date.now(),
        };

        const updatedAssets = [...getBrandAssets(), newAsset];
        saveBrandAssets(updatedAssets);
        loadAssets();
        setUploading(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Delete this asset?')) {
      const updated = assets.filter((a) => a.id !== id);
      saveBrandAssets(updated);
      loadAssets();
    }
  };

  const handleRenameAsset = (id: string, newName: string) => {
    const updated = assets.map((a) => (a.id === id ? { ...a, name: newName } : a));
    saveBrandAssets(updated);
    loadAssets();
  };

  const filteredAssets = assets.filter((a) => filterType === 'all' || a.type === filterType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white">🎨 Brand Asset Library</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>
          <p className="text-slate-400">
            Upload and manage your logos, watermarks, and other brand assets
          </p>
        </div>

        {/* Upload Section */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="grid grid-cols-4 gap-3">
            <UploadButton
              label="Logo"
              icon="🏷️"
              type="logo"
              onUpload={handleFileUpload}
              uploading={uploading}
            />
            <UploadButton
              label="Watermark"
              icon="💧"
              type="watermark"
              onUpload={handleFileUpload}
              uploading={uploading}
            />
            <UploadButton
              label="Sticker"
              icon="✨"
              type="sticker"
              onUpload={handleFileUpload}
              uploading={uploading}
            />
            <UploadButton
              label="Other"
              icon="📎"
              type="other"
              onUpload={handleFileUpload}
              uploading={uploading}
            />
          </div>
        </div>

        {/* Filter */}
        <div className="px-6 py-3 border-b border-slate-700 flex items-center gap-2">
          <label className="text-sm font-medium text-slate-400">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as BrandAsset['type'] | 'all')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-canam-orange"
          >
            <option value="all">All Assets ({assets.length})</option>
            <option value="logo">Logos ({assets.filter((a) => a.type === 'logo').length})</option>
            <option value="watermark">
              Watermarks ({assets.filter((a) => a.type === 'watermark').length})
            </option>
            <option value="sticker">
              Stickers ({assets.filter((a) => a.type === 'sticker').length})
            </option>
            <option value="other">Other ({assets.filter((a) => a.type === 'other').length})</option>
          </select>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAssets.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-center">
              <div>
                <svg
                  className="mx-auto h-24 w-24 mb-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="font-medium text-lg">No assets yet</p>
                <p className="text-sm mt-1">Upload your first brand asset to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onDelete={handleDeleteAsset}
                  onRename={handleRenameAsset}
                  onSelect={onSelectAsset}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface UploadButtonProps {
  label: string;
  icon: string;
  type: BrandAsset['type'];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: BrandAsset['type']) => void;
  uploading: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ label, icon, type, onUpload, uploading }) => {
  const inputId = `upload-${type}`;

  return (
    <div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onUpload(e, type)}
        className="hidden"
        disabled={uploading}
      />
      <label
        htmlFor={inputId}
        className="block cursor-pointer bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-all border-2 border-dashed border-slate-600 hover:border-canam-orange"
      >
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-400 mt-1">Click to upload</div>
      </label>
    </div>
  );
};

interface AssetCardProps {
  asset: BrandAsset;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onSelect?: (asset: BrandAsset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onDelete, onRename, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(asset.name);

  const handleRename = () => {
    if (newName.trim() && newName !== asset.name) {
      onRename(asset.id, newName.trim());
    }
    setIsEditing(false);
  };

  const typeIcons = {
    logo: '🏷️',
    watermark: '💧',
    sticker: '✨',
    other: '📎',
  };

  return (
    <div className="group relative bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-canam-orange transition-all">
      <div className="aspect-square bg-slate-900 p-4 flex items-center justify-center">
        <img src={asset.imageUrl} alt={asset.name} className="max-w-full max-h-full object-contain" />
      </div>

      <div className="p-3 bg-slate-800">
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
          />
        ) : (
          <div className="flex items-start gap-2">
            <span className="text-lg">{typeIcons[asset.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate" title={asset.name}>
                {asset.name}
              </p>
              <p className="text-xs text-slate-500 capitalize">{asset.type}</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {onSelect && (
          <button
            onClick={() => onSelect(asset)}
            className="p-1.5 bg-electric-blue text-white rounded hover:bg-cyan-600 transition-all"
            title="Use this asset"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition-all"
          title="Rename"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(asset.id)}
          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BrandAssetLibrary;
