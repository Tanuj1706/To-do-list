import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { COLUMN_CONFIG, COLUMN_COLORS, COLOR_METADATA } from '../lib/constants';

export default function NewNoteModal({
  isOpen,
  initialData,
  defaultStatus = 'todo',
  onClose,
  onSave
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [positionChoice, setPositionChoice] = useState('bottom');

  // Active section uniform color
  const assignedColorKey = COLUMN_COLORS[status] || 'gunmetal';
  const assignedColorMeta = COLOR_METADATA[assignedColorKey] || COLOR_METADATA.gunmetal;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'todo');
      setPriority(initialData.priority || 'medium');
      setPositionChoice('bottom');
      if (initialData.due_date) {
        try {
          const d = new Date(initialData.due_date);
          const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setDueDate(localISO);
        } catch {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      const initialStatus = defaultStatus || 'todo';
      setStatus(initialStatus);
      setPriority(initialStatus === 'urgent' ? 'urgent' : 'medium');
      setDueDate('');
      setPositionChoice('bottom');
    }
  }, [initialData, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData ? initialData.id : undefined,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      color: assignedColorKey,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      placement: positionChoice
    });
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'urgent') {
      setPriority('urgent');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-hud-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>{initialData ? 'Edit Task' : 'Create New Task'}</h2>
            <p>{initialData ? 'Update task attributes and details' : 'Fill in the information below to add a task'}</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Update database backup configuration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Add any relevant notes, instructions, or checklist items..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status & Priority Row */}
            <div className="form-grid-dual">
              <div className="form-group">
                <label className="form-label">Status / Column</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {COLUMN_CONFIG.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="urgent">🚨 High Priority</option>
                  <option value="high">⚠️ High</option>
                  <option value="medium">⚡ Normal</option>
                  <option value="low">🛡️ Low</option>
                </select>
              </div>
            </div>

            {/* Position in Column (Above vs Below existing cards) */}
            <div className="form-group">
              <label className="form-label">Position in Column</label>
              <div className="shift-position-toggle" style={{ margin: 0 }}>
                <button
                  type="button"
                  className={`shift-pos-btn ${positionChoice === 'top' ? 'active' : ''}`}
                  onClick={() => setPositionChoice('top')}
                  style={{ padding: '0.45rem', borderRadius: '4px' }}
                >
                  ⬆ Above Existing Cards (Top)
                </button>
                <button
                  type="button"
                  className={`shift-pos-btn ${positionChoice === 'bottom' ? 'active' : ''}`}
                  onClick={() => setPositionChoice('bottom')}
                  style={{ padding: '0.45rem', borderRadius: '4px' }}
                >
                  ⬇ Below Existing Cards (Bottom)
                </button>
              </div>
            </div>

            {/* Section-Uniform Color Banner */}
            <div className="form-group">
              <label className="form-label">Category Color (Assigned to Section)</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: assignedColorMeta.hex,
                  border: `1px solid ${assignedColorMeta.border}`,
                  borderRadius: '6px',
                  color: assignedColorMeta.text,
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    backgroundColor: assignedColorMeta.border,
                    boxShadow: '0 0 6px rgba(0,0,0,0.5)'
                  }}
                />
                <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.82rem', fontWeight: 600 }}>
                  {assignedColorMeta.name} (Assigned to this column)
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label">Due Date (Optional)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-tactical btn-tactical-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactical btn-tactical-primary"
            >
              <Check size={14} />
              <span>{initialData ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
