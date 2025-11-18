import React, { useState, useEffect } from 'react';
import { saveSectionState, getSectionState } from '../utils/storage';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: string;
  defaultExpanded?: boolean;
  alwaysExpanded?: boolean;
  children: React.ReactNode;
  badge?: string | number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  defaultExpanded = false,
  alwaysExpanded = false,
  children,
  badge,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Load saved state on mount
  useEffect(() => {
    if (!alwaysExpanded) {
      const savedState = getSectionState(id, defaultExpanded);
      setIsExpanded(savedState);
    }
  }, [id, defaultExpanded, alwaysExpanded]);

  const toggleExpanded = () => {
    if (alwaysExpanded) return;

    const newState = !isExpanded;
    setIsExpanded(newState);
    saveSectionState(id, newState);
  };

  if (alwaysExpanded) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl">
        <div className="p-5">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {badge !== undefined && (
            <span className="ml-2 px-2 py-0.5 bg-canam-orange text-white text-xs rounded-full font-bold">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
