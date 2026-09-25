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
      <div className="command-bar-main">
        {/* Brand Identity */}
        <div className="command-bar-brand">
          <div className="brand-icon-box">
            <CheckSquare size={19} />
          </div>
          <div className="brand-titles">
            <h1>Task Management System</h1>
            <div className="brand-subtitle">
              Kanban Workflow & Audit Trail
            </div>
          </div>
        </div>

        {/* User Session Info (Mobile Top Row) */}
        {user && (
          <div className="user-hud-badge mobile-user-badge">
            <div className="user-status-dot" />
            <span className="user-email-text" title={user.email}>
              {user.email.split('@')[0]}
            </span>
            <button
              type="button"
              className="note-action-btn"
              title="Sign Out of Account"
              onClick={onLogout}
              style={{ marginLeft: '0.2rem' }}
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="command-actions">
        <button
          type="button"
          className="btn-tactical btn-tactical-secondary action-btn-audit"
          onClick={onOpenAuditTrail}
          title="View System Audit Trail & Change History"
        >
          <Activity size={14} color="#e59500" />
          <span>Audit Trail</span>
        </button>

        <button
          type="button"
          className="btn-tactical btn-tactical-primary action-btn-new"
          onClick={onOpenNewTask}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Task</span>
        </button>

        {/* Authenticated User Session Info (Desktop Row) */}
        {user && (
          <div className="user-hud-badge desktop-user-badge">
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
