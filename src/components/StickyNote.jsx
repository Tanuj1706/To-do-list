import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Edit3, Clock, AlertTriangle, Flame, ShieldAlert, ArrowUpDown, Check, X } from 'lucide-react';
import { COLUMN_CONFIG, COLUMN_COLORS } from '../lib/constants';

export default function StickyNote({
  task,
  index,
  onEdit,
  onDelete,
  onMoveColumn,
  onDragStart,
  onDragEnd,
  onDropOnCard,
  draggedTask
}) {
  // Alternate tilt for organic realistic note look
  const tiltClass = index % 2 === 0 ? 'tilt-left' : 'tilt-right';

  // Section-Uniform Color Signature
  const uniformColor = COLUMN_COLORS[task.status] || task.color || 'gunmetal';
  const colorClass = `note-color-${uniformColor}`;

  // Drop Position State for Drag & Drop Insertion (above vs below)
  const [dropPosition, setDropPosition] = useState(null); // 'above' | 'below' | null

  // Shift Popover State (for direct click-to-shift with above/below choice)
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [shiftTargetCol, setShiftTargetCol] = useState(
    COLUMN_CONFIG.find(c => c.id !== task.status)?.id || 'todo'
  );
  const [shiftPosition, setShiftPosition] = useState('below'); // 'above' | 'below'
  const popoverRef = useRef(null);

  // Close shift popover on click outside
  useEffect(() => {
    if (!isShiftOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsShiftOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShiftOpen]);

  // Priority Stamp Config (Clean Legacy Enterprise Style)
  const renderPriorityStamp = () => {
    switch (task.priority) {
      case 'urgent':
        return (
          <span className="priority-stamp stamp-urgent">
            <Flame size={11} /> High Priority
          </span>
        );
      case 'high':
        return (
          <span className="priority-stamp stamp-high">
            <AlertTriangle size={11} /> High
          </span>
        );
      case 'medium':
        return (
          <span className="priority-stamp stamp-medium">
            <ShieldAlert size={11} /> Normal
          </span>
        );
      default:
        return (
          <span className="priority-stamp stamp-low">
            Low
          </span>
        );
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const formatDueDate = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Smart relative & exact timestamp formatting for latest updated time
  const formatUpdatedTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      if (diffMs < 60000) return 'Just now';
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  // Drag Over Handler to calculate whether dropping above or below this card
  const handleDragOver = (e) => {
    if (!draggedTask || draggedTask.id === task.id) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const isTopHalf = (e.clientY - rect.top) < (rect.height / 2);
    const newPos = isTopHalf ? 'above' : 'below';
    if (dropPosition !== newPos) {
      setDropPosition(newPos);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e) => {
    if (!draggedTask || draggedTask.id === task.id) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = dropPosition || 'below';
    setDropPosition(null);
    if (onDropOnCard) {
      onDropOnCard(task.status, task.id, pos);
    }
  };

  const handleConfirmShift = () => {
    if (onMoveColumn) {
      onMoveColumn(task.id, shiftTargetCol, shiftPosition);
    }
    setIsShiftOpen(false);
  };

  return (
    <div
      className={`tactical-sticky-note ${tiltClass} ${colorClass} ${
        dropPosition === 'above' ? 'drop-above' : dropPosition === 'below' ? 'drop-below' : ''
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={(e) => {
        setDropPosition(null);
        onDragEnd(e);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Black Tape strip */}
      <div className="sticky-duct-tape" />

      {/* Card Header: Priority Stamp & Quick Actions */}
      <div className="note-header">
        {renderPriorityStamp()}
        <div className="note-actions">
          {/* Shift Column & Placement Button */}
          <button
            type="button"
            className="note-action-btn"
            title="Shift column & placement position"
            onClick={(e) => {
              e.stopPropagation();
              setIsShiftOpen(!isShiftOpen);
            }}
          >
            <ArrowUpDown size={13} />
          </button>

          <button
            type="button"
            className="note-action-btn"
            title="Edit Task"
            onClick={() => onEdit(task)}
          >
            <Edit3 size={13} />
          </button>
          <button
            type="button"
            className="note-action-btn note-action-delete"
            title="Delete Task"
            onClick={() => onDelete(task.id, task.title)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Shift Column Popover Modal */}
      {isShiftOpen && (
        <div
          ref={popoverRef}
          className="note-shift-popover"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span className="shift-popover-title">Shift Task Column</span>
            <button
              type="button"
              className="note-action-btn"
              onClick={() => setIsShiftOpen(false)}
            >
              <X size={12} />
            </button>
          </div>

          <div className="shift-col-list">
            {COLUMN_CONFIG.map(col => (
              <button
                key={col.id}
                type="button"
                className={`shift-col-btn ${shiftTargetCol === col.id ? 'active' : ''}`}
                onClick={() => setShiftTargetCol(col.id)}
              >
                <span>{col.title}</span>
                {shiftTargetCol === col.id && <Check size={12} />}
              </button>
            ))}
          </div>

          <div className="shift-popover-title" style={{ marginTop: '0.5rem' }}>
            Placement in Column
          </div>
          <div className="shift-position-toggle">
            <button
              type="button"
              className={`shift-pos-btn ${shiftPosition === 'above' ? 'active' : ''}`}
              onClick={() => setShiftPosition('above')}
            >
              ⬆ Above (Top)
            </button>
            <button
              type="button"
              className={`shift-pos-btn ${shiftPosition === 'below' ? 'active' : ''}`}
              onClick={() => setShiftPosition('below')}
            >
              ⬇ Below (Bottom)
            </button>
          </div>

          <button
            type="button"
            className="shift-confirm-btn"
            onClick={handleConfirmShift}
          >
            Apply Shift
          </button>
        </div>
      )}

      {/* Card Title */}
      <div className="note-title">{task.title}</div>

      {/* Card Description */}
      {task.description && (
        <div className="note-desc">{task.description}</div>
      )}

      {/* Card Footer: Due Date & Task ID */}
      <div className="note-footer">
        {task.due_date ? (
          <span className={`note-due-date ${isOverdue ? 'is-overdue' : ''}`}>
            <Clock size={11} /> {formatDueDate(task.due_date)}
            {isOverdue && ' (Overdue)'}
          </span>
        ) : (
          <span>No deadline</span>
        )}
        <span>Task #{task.id ? task.id.toString().slice(-4).toUpperCase() : ''}</span>
      </div>

      {/* Card Timestamp Bar: Latest Updated Timestamp */}
      <div
        className="note-timestamp-bar"
        title={`Updated: ${new Date(task.updated_at || task.created_at).toLocaleString()}`}
      >
        <Clock size={10} />
        <span>Updated: {formatUpdatedTime(task.updated_at || task.created_at)}</span>
      </div>

      {/* Mobile Touch Quick-Move Strip */}
      <div className="mobile-move-strip">
        {COLUMN_CONFIG.filter(c => c.id !== task.status).map(col => (
          <div key={col.id} style={{ display: 'flex', gap: '2px' }}>
            <button
              type="button"
              className="mobile-move-btn"
              title={`Shift ${col.title} to Top`}
              onClick={() => onMoveColumn(task.id, col.id, 'above')}
            >
              ↑ {col.title}
            </button>
            <button
              type="button"
              className="mobile-move-btn"
              title={`Shift ${col.title} to Bottom`}
              onClick={() => onMoveColumn(task.id, col.id, 'below')}
            >
              ↓
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

