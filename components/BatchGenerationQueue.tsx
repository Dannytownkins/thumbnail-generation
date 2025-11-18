import React, { useState, useCallback } from 'react';
import { BatchJob, ImageModel, VehicleType, GenerationSettings } from '../types';
import { generateThumbnail } from '../services/geminiService';

interface BatchGenerationQueueProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSettings: GenerationSettings;
}

const BatchGenerationQueue: React.FC<BatchGenerationQueueProps> = ({
  isOpen,
  onClose,
  defaultSettings,
}) => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [newVehicle, setNewVehicle] = useState<VehicleType | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addJob = () => {
    if (!newPrompt.trim()) return;

    const job: BatchJob = {
      id: Date.now().toString(),
      prompt: newPrompt,
      vehicle: newVehicle ? (newVehicle as VehicleType) : undefined,
      model: defaultSettings.model,
      settings: defaultSettings,
      status: 'pending',
      createdAt: Date.now(),
    };

    setJobs([...jobs, job]);
    setNewPrompt('');
    setNewVehicle('');
  };

  const removeJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const clearCompleted = () => {
    setJobs(jobs.filter((j) => j.status !== 'completed'));
  };

  const processQueue = async () => {
    setIsProcessing(true);

    for (const job of jobs) {
      if (job.status !== 'pending') continue;

      // Update status to processing
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: 'processing' as const } : j))
      );

      try {
        const resultUrls = await generateThumbnail(job.prompt, job.model, {
          aspectRatio: job.settings.aspectRatio,
          numberOfImages: job.settings.numberOfImages,
        });

        const images = resultUrls.map((url, index) => ({
          id: `${Date.now()}-${index}`,
          url,
          model: job.model,
          prompt: job.prompt,
          vehicle: job.vehicle,
          timestamp: Date.now(),
          settings: job.settings,
        }));

        // Update job as completed
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  status: 'completed' as const,
                  result: images,
                  completedAt: Date.now(),
                }
              : j
          )
        );
      } catch (error) {
        // Update job as failed
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  status: 'failed' as const,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  completedAt: Date.now(),
                }
              : j
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const pendingCount = jobs.filter((j) => j.status === 'pending').length;
  const processingCount = jobs.filter((j) => j.status === 'processing').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-white">⚡ Batch Generation Queue</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Close
            </button>
          </div>
          <p className="text-slate-400">Queue up multiple thumbnail generations and process them all at once</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{processingCount}</div>
              <div className="text-xs text-slate-400">Processing</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{completedCount}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{failedCount}</div>
              <div className="text-xs text-slate-400">Failed</div>
            </div>
          </div>
        </div>

        {/* Add Job Form */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex gap-3">
            <select
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value as VehicleType | '')}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-canam-orange"
            >
              <option value="">All Vehicles</option>
              {Object.values(VehicleType).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addJob()}
              placeholder="Enter prompt and press Enter or click Add..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-canam-orange"
            />
            <button
              onClick={addJob}
              disabled={!newPrompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-canam-orange to-red-600 text-white font-bold rounded-lg hover:from-canam-orange hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Add to Queue
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto p-6">
          {jobs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg font-medium">No jobs in queue</p>
                <p className="text-sm mt-1">Add prompts above to start batch generation</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} onRemove={removeJob} />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={clearCompleted}
            disabled={completedCount === 0}
            className="px-4 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Clear Completed
          </button>
          <button
            onClick={processQueue}
            disabled={pendingCount === 0 || isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-electric-blue to-cyan-600 text-white font-bold text-lg rounded-lg hover:from-electric-blue hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isProcessing ? '⏳ Processing...' : `🚀 Process ${pendingCount} Job${pendingCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

interface JobCardProps {
  job: BatchJob;
  index: number;
  onRemove: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, index, onRemove }) => {
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-300 border-green-500/30',
    failed: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const statusIcons = {
    pending: '⏸️',
    processing: '⚙️',
    completed: '✅',
    failed: '❌',
  };

  return (
    <div className={`bg-slate-800 border rounded-lg p-4 ${statusColors[job.status]}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-sm font-bold text-slate-400">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-white line-clamp-2">{job.prompt}</p>
              {job.vehicle && (
                <p className="text-xs text-slate-400 mt-1">{job.vehicle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{statusIcons[job.status]}</span>
              <span className="text-xs font-medium capitalize">{job.status}</span>
            </div>
          </div>

          {job.status === 'completed' && job.result && (
            <div className="flex gap-2 mt-3">
              {job.result.slice(0, 4).map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Generated"
                  className="w-20 h-20 object-cover rounded border border-slate-700"
                />
              ))}
            </div>
          )}

          {job.status === 'failed' && job.error && (
            <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300">
              Error: {job.error}
            </div>
          )}
        </div>

        {job.status === 'pending' && (
          <button
            onClick={() => onRemove(job.id)}
            className="flex-shrink-0 px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500 hover:text-white transition-all"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default BatchGenerationQueue;
