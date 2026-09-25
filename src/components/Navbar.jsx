import React from 'react';
import { Plus, Activity, LogOut, CheckSquare } from 'lucide-react';

export default function Navbar({
  user,
  onOpenNewTask,
  onOpenAuditTrail,
  onLogout
}) {
  return (
    <header className="command-bar">
      {/* Brand Identity (Clean Legacy Enterprise Style) */}
      <div className="command-bar-brand">
        <div className="brand-icon-box">
          <CheckSquare size={20} />
        </div>
        <div className="brand-titles">
          <h1>Task Management System</h1>
          <div className="brand-subtitle">
            Kanban Workflow & Audit Trail
          </div>
        </div>
      </div>

      {/* Command Actions */}
      <div className="command-actions">
        {/* Audit Trail Drawer Trigger */}
        <button
          type="button"
          className="btn-tactical btn-tactical-secondary"
          onClick={onOpenAuditTrail}
          title="View System Audit Trail & Change History"
        >
          <Activity size={14} color="#e59500" />
          <span>Audit Trail</span>
        </button>

        {/* Create New Task Primary Action */}
        <button
          type="button"
          className="btn-tactical btn-tactical-primary"
          onClick={onOpenNewTask}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Task</span>
        </button>

        {/* Authenticated User Session Info & Sign Out */}
        {user && (
          <div className="user-hud-badge">
            <div className="user-status-dot" />
            <span className="user-email-text" title={user.email}>
              {user.email}
            </span>
            <button
              type="button"
              className="note-action-btn"
              title="Sign Out of Account"
              onClick={onLogout}
              style={{ marginLeft: '0.35rem' }}
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
