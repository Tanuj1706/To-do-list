import React, { useState } from 'react';
import { Plus, Flame, Clock, Zap, Search, CheckCircle2 } from 'lucide-react';
import StickyNote from './StickyNote';

const COLUMN_ICONS = {
  urgent: <Flame size={15} color="#f87171" />,
  todo: <Clock size={15} color="#94a3b8" />,
  in_progress: <Zap size={15} color="#38bdf8" />,
  review: <Search size={15} color="#a78bfa" />,
  completed: <CheckCircle2 size={15} color="#4ade80" />
};

export default function Column({
  column,
  tasks,
  isMobileActive,
  onQuickAdd,
  onEditTask,
  onDeleteTask,
  onMoveColumn,
  onDragStart,
  onDragEnd,
  onDropTask,
  draggedTask
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverBottom, setIsDragOverBottom] = useState(false);
  const isUrgentCol = column.id === 'urgent';

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setIsDragOverBottom(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragOverBottom(false);
    onDropTask(column.id, null, 'bottom');
  };

  const handleCardDrop = (status, targetTaskId, placement) => {
    setIsDragOver(false);
    setIsDragOverBottom(false);
    onDropTask(column.id, targetTaskId, placement);
  };

  return (
    <div
      className={`kanban-column ${isUrgentCol ? 'kanban-column-urgent' : ''} ${
        isMobileActive ? 'mobile-active-column' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="column-header">
        <div className="column-title-group">
          {COLUMN_ICONS[column.id]}
          <span className={`column-title ${isUrgentCol ? 'column-title-urgent' : ''}`}>
            {column.title}
          </span>
          <span className={`column-badge ${isUrgentCol ? 'column-badge-urgent' : ''}`}>
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          className="column-quick-add"
          title={`Add new task to ${column.title}`}
          onClick={() => onQuickAdd(column.id)}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Cards Drop List */}
      <div
        className={`column-card-list ${isUrgentCol ? 'column-card-list-urgent' : ''} ${
          isDragOver ? 'drag-over' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className="empty-column-placeholder">
            <span>No active tasks in this section</span>
            <span style={{ fontSize: '0.68rem', marginTop: '0.35rem', opacity: 0.7 }}>
              Click + or drag tasks here
            </span>
          </div>
        ) : (
          <>
            {tasks.map((task, index) => (
              <StickyNote
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onMoveColumn={onMoveColumn}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDropOnCard={handleCardDrop}
                draggedTask={draggedTask}
              />
            ))}

            {/* Bottom Drop Indicator Area when dragging */}
            {draggedTask && draggedTask.status !== column.id && (
              <div
                className={`column-bottom-dropzone ${isDragOverBottom ? 'drag-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDragOverBottom) setIsDragOverBottom(true);
                }}
                onDragLeave={() => setIsDragOverBottom(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverBottom(false);
                  setIsDragOver(false);
                  onDropTask(column.id, null, 'bottom');
                }}
              >
                + Drop below all cards
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

