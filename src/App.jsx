import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DataService } from './lib/supabase';
import { COLUMN_CONFIG, COLUMN_COLORS } from './lib/constants';
import BackgroundCanvas from './components/BackgroundCanvas';
import LoginGate from './components/LoginGate';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import Column from './components/Column';
import NewNoteModal from './components/NewNoteModal';
import AuditLogDrawer from './components/AuditLogDrawer';

export default function App() {
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Filters & Mobile State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [activeMobileColumn, setActiveMobileColumn] = useState('urgent');

  // Modals & Drawers
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [targetColumnForNew, setTargetColumnForNew] = useState('todo');
  const [editingTask, setEditingTask] = useState(null);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Dragging State
  const [draggedTask, setDraggedTask] = useState(null);

  // Load Tasks and Audit Logs
  const loadWorkspaceData = useCallback(async () => {
    try {
      const [loadedTasks, loadedLogs] = await Promise.all([
        DataService.fetchTasks(),
        DataService.fetchAuditLogs()
      ]);
      setTasks(loadedTasks);
      setAuditLogs(loadedLogs);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  }, []);

  // Persistent Session Initialization
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const session = await DataService.getSession();
        if (isMounted) {
          if (session?.user) {
            setUser(session.user);
            await loadWorkspaceData();
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen to real-time auth changes (auto-refresh, login, logout)
    const { data: authListener } = DataService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadWorkspaceData();
      } else {
        setUser(null);
        setTasks([]);
        setAuditLogs([]);
      }
      setSessionLoading(false);
    });

    return () => {
      isMounted = false;
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [loadWorkspaceData]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setTargetColumnForNew('todo');
        setEditingTask(null);
        setIsNewTaskOpen(true);
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setIsAuditDrawerOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsNewTaskOpen(false);
        setEditingTask(null);
        setIsAuditDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Confetti celebration trigger
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#e59500', '#22c55e', '#38bdf8', '#f59e0b']
      });
    } catch {
      // safe fallback
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task.id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedTask(null);
  };

  const handleDropTask = async (targetColumnId, targetTaskId = null, placement = 'bottom') => {
    if (!draggedTask) return;

    const previousTasks = [...tasks];
    const updatedTaskId = draggedTask.id;
    const uniformColor = COLUMN_COLORS[targetColumnId] || 'gunmetal';
    const nowIso = new Date().toISOString();

    // Reorder tasks in target column
    const otherTasksInTargetCol = tasks.filter(
      t => t.status === targetColumnId && t.id !== updatedTaskId
    );

    let targetIndex = otherTasksInTargetCol.length; // default bottom
    if (targetTaskId) {
      const idx = otherTasksInTargetCol.findIndex(t => t.id === targetTaskId);
      if (idx !== -1) {
        targetIndex = placement === 'above' ? idx : idx + 1;
      }
    } else if (placement === 'top' || placement === 'above') {
      targetIndex = 0;
    }

    const updatedTask = {
      ...draggedTask,
      status: targetColumnId,
      color: uniformColor,
      updated_at: nowIso
    };

    const newTargetColTasks = [
      ...otherTasksInTargetCol.slice(0, targetIndex),
      updatedTask,
      ...otherTasksInTargetCol.slice(targetIndex)
    ];

    // Assign sequential positions
    const positionedTargetTasks = newTargetColTasks.map((t, idx) => ({
      ...t,
      position: idx
    }));

    // Merge back into full task list preserving order
    const otherTasksInOtherCols = tasks.filter(
      t => t.status !== targetColumnId && t.id !== updatedTaskId
    );
    const updatedTasksList = [...otherTasksInOtherCols, ...positionedTargetTasks];

    // 0ms Optimistic UI update
    setTasks(updatedTasksList);

    if (targetColumnId === 'completed') {
      triggerCelebration();
    }

    setDraggedTask(null);

    try {
      const assignedPos = positionedTargetTasks.find(t => t.id === updatedTaskId)?.position || 0;
      await DataService.updateTask(
        updatedTaskId,
        { status: targetColumnId, color: uniformColor, position: assignedPos, updated_at: nowIso },
        draggedTask
      );
      const updatedLogs = await DataService.fetchAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to update task status:', err);
      setTasks(previousTasks);
    }
  };

  // 1-Tap Move Handler with Top/Bottom placement
  const handleMoveColumn = async (taskId, newStatus, placement = 'below') => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const previousTasks = [...tasks];
    const uniformColor = COLUMN_COLORS[newStatus] || 'gunmetal';
    const nowIso = new Date().toISOString();

    const otherTasksInTarget = tasks.filter(
      t => t.status === newStatus && t.id !== taskId
    );

    const updatedTask = {
      ...target,
      status: newStatus,
      color: uniformColor,
      updated_at: nowIso
    };

    const newColTasks = placement === 'above'
      ? [updatedTask, ...otherTasksInTarget]
      : [...otherTasksInTarget, updatedTask];

    const positionedTasks = newColTasks.map((t, idx) => ({ ...t, position: idx }));
    const otherColsTasks = tasks.filter(t => t.status !== newStatus && t.id !== taskId);
    const nextTasks = [...otherColsTasks, ...positionedTasks];

    setTasks(nextTasks);

    if (newStatus === 'completed') {
      triggerCelebration();
    }

    try {
      const assignedPos = positionedTasks.find(t => t.id === taskId)?.position || 0;
      await DataService.updateTask(
        taskId,
        { status: newStatus, color: uniformColor, position: assignedPos, updated_at: nowIso },
        target
      );
      const updatedLogs = await DataService.fetchAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to move task:', err);
      setTasks(previousTasks);
    }
  };

  // Create or Update Task
  const handleSaveTask = async (taskPayload) => {
    setIsNewTaskOpen(false);
    setEditingTask(null);

    const uniformColor = COLUMN_COLORS[taskPayload.status] || 'gunmetal';
    const nowIso = new Date().toISOString();
    const placement = taskPayload.placement || 'bottom';

    if (taskPayload.id) {
      // Update Task
      const prevTask = tasks.find(t => t.id === taskPayload.id);
      const previousTasks = [...tasks];

      const isStatusChanged = prevTask && prevTask.status !== taskPayload.status;
      let targetPosition = prevTask ? (prevTask.position || 0) : 0;

      if (isStatusChanged) {
        const colTasks = tasks.filter(t => t.status === taskPayload.status && t.id !== taskPayload.id);
        targetPosition = placement === 'top' ? 0 : colTasks.length;
      }

      const payloadWithColor = {
        ...taskPayload,
        color: uniformColor,
        position: targetPosition,
        updated_at: nowIso
      };

      setTasks(prev =>
        prev.map(t =>
          t.id === taskPayload.id ? { ...t, ...payloadWithColor } : t
        )
      );

      try {
        await DataService.updateTask(taskPayload.id, payloadWithColor, prevTask);
        const updatedLogs = await DataService.fetchAuditLogs();
        setAuditLogs(updatedLogs);
      } catch (err) {
        console.error('Failed to update task:', err);
        setTasks(previousTasks);
      }
    } else {
      // Create New Task
      const colTasks = tasks.filter(t => t.status === taskPayload.status);
      const targetPosition = placement === 'top' ? 0 : colTasks.length;

      const payloadWithColor = {
        ...taskPayload,
        color: uniformColor,
        position: targetPosition,
        updated_at: nowIso
      };

      try {
        const created = await DataService.createTask(payloadWithColor);
        const nextTasks = placement === 'top'
          ? [created, ...tasks]
          : [...tasks, created];
        setTasks(nextTasks);
        const updatedLogs = await DataService.fetchAuditLogs();
        setAuditLogs(updatedLogs);
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId, title) => {
    if (!window.confirm(`Are you sure you want to delete this task?\n\n"${title}"`)) {
      return;
    }

    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await DataService.deleteTask(taskId);
      const updatedLogs = await DataService.fetchAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(previousTasks);
    }
  };

  // Quick Add Trigger from Column Header
  const handleQuickAdd = (columnId) => {
    setTargetColumnForNew(columnId);
    setEditingTask(null);
    setIsNewTaskOpen(true);
  };

  // Edit Trigger
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsNewTaskOpen(true);
  };

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const res = await DataService.signIn(email, password);
    if (res?.user) {
      setUser(res.user);
      await loadWorkspaceData();
    }
  };

  const handleSignUp = async (email, password) => {
    const res = await DataService.signUp(email, password);
    if (res?.user && res?.session) {
      setUser(res.user);
      await loadWorkspaceData();
    } else if (res?.user) {
      try {
        const loginRes = await DataService.signIn(email, password);
        if (loginRes?.user) {
          setUser(loginRes.user);
          await loadWorkspaceData();
        }
      } catch (err) {
        console.warn('Auto-login post-signup note:', err);
      }
    }
    return res;
  };

  const handleLogout = async () => {
    await DataService.signOut();
    setUser(null);
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchId = task.id?.toString().toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchId) return false;
    }

    if (selectedPriority !== 'all') {
      if (selectedPriority === 'urgent') {
        if (task.priority !== 'urgent' && task.status !== 'urgent') return false;
      } else {
        if (task.priority !== selectedPriority) return false;
      }
    }

    return true;
  });

  // 1. Initial Session Loading Screen
  if (sessionLoading) {
    return (
      <div className="app-loading-screen">
        <BackgroundCanvas />
        <div className="loading-spinner" />
        <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.85rem', color: '#94a3b8', zIndex: 10 }}>
          Verifying Session...
        </div>
      </div>
    );
  }

  // 2. Full-Page Login Gate (Dashboard Locked Until Authenticated)
  if (!user) {
    return (
      <div className="app-root">
        <BackgroundCanvas />
        <LoginGate onLogin={handleLogin} onSignUp={handleSignUp} />
      </div>
    );
  }

  // 3. Authenticated Kanban Dashboard
  return (
    <div className="app-root">
      <BackgroundCanvas />

      <main className="main-content">
        {/* Top Command Bar */}
        <Navbar
          user={user}
          onOpenNewTask={() => handleQuickAdd('todo')}
          onOpenAuditTrail={() => setIsAuditDrawerOpen(true)}
          onLogout={handleLogout}
        />

        {/* Search, Metrics & Filter Controls */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          activeMobileColumn={activeMobileColumn}
          setActiveMobileColumn={setActiveMobileColumn}
          tasks={tasks}
        />

        {/* 5-Column Kanban Matrix */}
        <div className="kanban-board-container">
          {COLUMN_CONFIG.map(column => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            const isMobileActive = activeMobileColumn === column.id;

            return (
              <Column
                key={column.id}
                column={column}
                tasks={columnTasks}
                isMobileActive={isMobileActive}
                onQuickAdd={handleQuickAdd}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onMoveColumn={handleMoveColumn}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDropTask={handleDropTask}
                draggedTask={draggedTask}
              />
            );
          })}
        </div>
      </main>

      {/* Task Creation & Inspection Modal */}
      <NewNoteModal
        isOpen={isNewTaskOpen}
        initialData={editingTask}
        defaultStatus={targetColumnForNew}
        onClose={() => {
          setIsNewTaskOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* System Audit Trail Drawer */}
      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        logs={auditLogs}
        onClose={() => setIsAuditDrawerOpen(false)}
        onRefresh={async () => {
          const freshLogs = await DataService.fetchAuditLogs();
          setAuditLogs(freshLogs);
        }}
      />
    </div>
  );
}
