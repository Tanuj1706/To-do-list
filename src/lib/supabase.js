import { createClient } from '@supabase/supabase-js';
import { COLUMN_COLORS } from './constants';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Automatically use local proxy to bypass Indian ISP (ACT Fibernet) DNS poisoning
const effectiveUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/supabase-proxy`
  : rawSupabaseUrl;

export const supabase = createClient(effectiveUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// Cache active user in localStorage for 0ms initial load
const USER_CACHE_KEY = 'task_management_user_cache';

export const DataService = {
  // Get active session (checking cache first, then Supabase client)
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data?.session?.user) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.session.user));
        return data.session;
      }
    } catch (e) {
      console.warn('Session verification warning:', e);
    }

    // Fallback to cached user while network revalidates
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) return { user: JSON.parse(cached) };
    } catch {
      // ignore
    }
    return null;
  },

  // Auth State Listener
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(session.user));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(USER_CACHE_KEY);
      }
      callback(event, session);
    });
  },

  // Sign In with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    if (error) throw error;
    if (data?.user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
      await this.logAuthEvent('AUTH_LOGIN', data.user);
    }
    return data;
  },

  // Sign Up new account
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password
    });
    if (error) throw error;
    if (data?.user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
      await this.logAuthEvent('AUTH_SIGNUP', data.user);
    }
    return data;
  },

  // Sign Out
  async signOut() {
    const user = await this.getCurrentUser();
    if (user) {
      await this.logAuthEvent('AUTH_LOGOUT', user);
    }
    localStorage.removeItem(USER_CACHE_KEY);
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
      return data.user;
    }
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Log Auth events into audit_logs table
  async logAuthEvent(action, user) {
    if (!user) return;
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action,
        entity_type: 'auth',
        entity_id: user.id,
        details: { timestamp: new Date().toISOString() }
      });
    } catch (e) {
      console.warn('Audit log write error:', e);
    }
  },

  // Fetch all tasks for current authenticated user
  async fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(t => ({
      ...t,
      color: COLUMN_COLORS[t.status] || t.color || 'gunmetal'
    }));
  },

  // Create Task
  async createTask(taskData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    const status = taskData.status || 'todo';
    const uniformColor = COLUMN_COLORS[status] || 'gunmetal';

    const newTask = {
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : '',
      status: status,
      priority: taskData.priority || (status === 'urgent' ? 'urgent' : 'medium'),
      color: uniformColor,
      position: taskData.position || 0,
      due_date: taskData.due_date || null,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update Task
  async updateTask(id, updates, oldTask = null) {
    const nextStatus = updates.status || (oldTask ? oldTask.status : 'todo');
    const uniformColor = COLUMN_COLORS[nextStatus] || 'gunmetal';

    const updatePayload = {
      ...updates,
      color: uniformColor,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete Task
  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Fetch Permanent Audit Logs
  async fetchAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }
};
