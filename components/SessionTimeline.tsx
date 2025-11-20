import React from 'react';
import { SessionRun } from '../types';

interface SessionTimelineProps {
  runs: SessionRun[];
  onSelect?: (run: SessionRun) => void;
}

const statusStyles: Record<SessionRun['status'], string> = {
  pending: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
  completed: 'bg-green-500/20 border-green-500/50 text-green-200',
  cached: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  failed: 'bg-red-500/20 border-red-500/50 text-red-200',
};

const statusIcon: Record<SessionRun['status'], string> = {
  pending: '⏳',
  completed: '✅',
  cached: '♻️',
  failed: '⚠️',
};

const SessionTimeline: React.FC<SessionTimelineProps> = ({ runs, onSelect }) => {
  if (runs.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-4">
        Session timeline will appear after your next generation.
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {runs.map((run) => (
        <button
          key={run.id}
          onClick={() => onSelect?.(run)}
          className={`flex-shrink-0 min-w-[180px] px-3 py-2 rounded-lg border text-left transition-all hover:border-white/40 ${statusStyles[run.status]}`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="flex items-center gap-1">
              <span>{statusIcon[run.status]}</span>
              <span className="capitalize">{run.status}</span>
            </span>
            <span className="text-slate-400">
              {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm text-white line-clamp-2">{run.prompt}</p>
        </button>
      ))}
    </div>
  );
};

export default SessionTimeline;

