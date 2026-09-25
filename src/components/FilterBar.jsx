import React from 'react';
import { Search, X } from 'lucide-react';
import { COLUMN_CONFIG } from '../lib/constants';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedPriority,
  setSelectedPriority,
  activeMobileColumn,
  setActiveMobileColumn,
  tasks
}) {
  const totalTasks = tasks.length;
  const urgentCount = tasks.filter(t => t.status === 'urgent' || t.priority === 'urgent').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <>
      <div className="filter-deck">
        {/* Search Input Box */}
        <div className="search-box-wrapper">
          <Search size={14} className="search-icon-fixed" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="note-action-btn"
              style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => setSearchQuery('')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Priority Filter Chips */}
        <div className="priority-filter-chips">
          <button
            type="button"
            className={`filter-chip ${selectedPriority === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedPriority('all')}
          >
            All Tasks
          </button>
          <button
            type="button"
            className={`filter-chip ${selectedPriority === 'urgent' ? 'active-urgent' : ''}`}
            onClick={() => setSelectedPriority(selectedPriority === 'urgent' ? 'all' : 'urgent')}
          >
            🚨 High Priority ({urgentCount})
          </button>
          <button
            type="button"
            className={`filter-chip ${selectedPriority === 'high' ? 'active' : ''}`}
            onClick={() => setSelectedPriority(selectedPriority === 'high' ? 'all' : 'high')}
          >
            High
          </button>
          <button
            type="button"
            className={`filter-chip ${selectedPriority === 'medium' ? 'active' : ''}`}
            onClick={() => setSelectedPriority(selectedPriority === 'medium' ? 'all' : 'medium')}
          >
            Normal
          </button>
        </div>

        {/* Live Metrics Meter */}
        <div className="stats-meter">
          <div className="metric-pill">
            <span className="metric-label">Total:</span>
            <strong>{totalTasks}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label" style={{ color: '#f87171' }}>Urgent:</span>
            <strong style={{ color: '#f87171' }}>{urgentCount}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label" style={{ color: '#4ade80' }}>Done:</span>
            <strong style={{ color: '#4ade80' }}>{completedCount} ({completionRate}%)</strong>
          </div>
        </div>
      </div>

      {/* Mobile Column Switcher (Visible on Screens < 768px) */}
      <div className="mobile-column-tabs-wrapper">
        <div className="mobile-column-tabs">
          {COLUMN_CONFIG.map(col => {
            const count = tasks.filter(t => t.status === col.id).length;
            const isUrgent = col.id === 'urgent';
            const isActive = activeMobileColumn === col.id;

            return (
              <button
                key={col.id}
                type="button"
                className={`mobile-tab-btn ${isActive ? (isUrgent ? 'active-urgent' : 'active') : ''}`}
                onClick={() => setActiveMobileColumn(col.id)}
              >
                <span>{col.title}</span>
                <span className="column-badge">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
