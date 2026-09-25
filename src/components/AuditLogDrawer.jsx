import React, { useState } from 'react';
import { X, RefreshCw, Shield, ArrowRight, Trash2, PlusCircle, LogIn, LogOut } from 'lucide-react';

export default function AuditLogDrawer({
  isOpen,
  logs,
  onClose,
  onRefresh
}) {
  const [filterAction, setFilterAction] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    if (filterAction === 'MOVES') return log.action === 'TASK_MOVED';
    if (filterAction === 'TASKS') return log.action.startsWith('TASK_');
    if (filterAction === 'AUTH') return log.action.startsWith('AUTH_');
    return true;
  });

  const formatTimestamp = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const renderActionLabel = (action) => {
    switch (action) {
      case 'TASK_MOVED':
        return 'Status Changed';
      case 'TASK_CREATED':
        return 'Task Created';
      case 'TASK_UPDATED':
        return 'Task Updated';
      case 'TASK_DELETED':
        return 'Task Deleted';
      case 'AUTH_LOGIN':
        return 'User Signed In';
      case 'AUTH_SIGNUP':
        return 'New Account Registered';
      case 'AUTH_LOGOUT':
        return 'User Signed Out';
      default:
        return action.replace('_', ' ');
    }
  };

  const renderActionIcon = (action) => {
    switch (action) {
      case 'TASK_MOVED':
        return <ArrowRight size={13} color="#e59500" />;
      case 'TASK_CREATED':
        return <PlusCircle size={13} color="#38bdf8" />;
      case 'TASK_DELETED':
        return <Trash2 size={13} color="#ef4444" />;
      case 'AUTH_LOGIN':
      case 'AUTH_SIGNUP':
        return <LogIn size={13} color="#22c55e" />;
      case 'AUTH_LOGOUT':
        return <LogOut size={13} color="#94a3b8" />;
      default:
        return <Shield size={13} color="#cbd5e1" />;
    }
  };

  return (
    <div className="audit-drawer-backdrop" onClick={onClose}>
      <div className="audit-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="audit-drawer-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.05rem', fontWeight: 800 }}>
              System Audit Trail
            </h2>
            <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.72rem', color: '#94a3b8' }}>
              Database Transaction & Activity History ({logs.length} records)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="note-action-btn"
              title="Refresh Audit Trail"
              onClick={handleRefresh}
            >
              <RefreshCw size={15} className={isRefreshing ? 'spin-animation' : ''} />
            </button>
            <button type="button" className="note-action-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'MOVES', label: 'Status Moves' },
            { id: 'TASKS', label: 'Tasks' },
            { id: 'AUTH', label: 'Authentication' }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              className={`filter-chip ${filterAction === type.id ? 'active' : ''}`}
              onClick={() => setFilterAction(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Log Feed */}
        <div className="audit-feed">
          {filteredLogs.length === 0 ? (
            <div className="empty-column-placeholder" style={{ padding: '3rem 1rem' }}>
              <span>No audit records found</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isUrgentAction = log.action === 'TASK_DELETED' || (log.details && (log.details.to_status === 'urgent' || log.details.priority === 'urgent'));

              return (
                <div
                  key={log.id}
                  className={`audit-item ${isUrgentAction ? 'audit-item-urgent' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {renderActionIcon(log.action)}
                      <span className="audit-item-action">
                        {renderActionLabel(log.action)}
                      </span>
                    </div>
                    <span className="audit-item-time">{formatTimestamp(log.created_at)}</span>
                  </div>

                  <div className="audit-item-author">
                    User: {log.user_email || 'System'}
                  </div>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="audit-item-detail">
                      {log.details.title && (
                        <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.2rem' }}>
                          "{log.details.title}"
                        </div>
                      )}
                      {log.details.from_status && log.details.to_status && (
                        <div>
                          Status: {log.details.from_status.toUpperCase()} → <strong style={{ color: '#e59500' }}>{log.details.to_status.toUpperCase()}</strong>
                        </div>
                      )}
                      {log.details.priority && (
                        <div>Priority: {log.details.priority.toUpperCase()}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
