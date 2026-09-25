-- ========================================================
-- KRONOS // INDUSTRIAL KANBAN DASHBOARD & AUDIT LOG SCHEMA
-- ========================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Tasks Table
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  status text not null check (status in ('urgent', 'todo', 'in_progress', 'review', 'completed')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  color text default 'gunmetal' check (color in ('gunmetal', 'kraft', 'olive', 'hazard', 'crimson', 'steel')),
  position integer default 0,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Create Audit Logs Table (Permanent Database Audit Trail)
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  action text not null, -- 'AUTH_LOGIN', 'AUTH_SIGNUP', 'AUTH_LOGOUT', 'TASK_CREATED', 'TASK_MOVED', 'TASK_UPDATED', 'TASK_DELETED'
  entity_type text not null default 'task',
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.tasks enable row level security;
alter table public.audit_logs enable row level security;

-- 5. Row Level Security Policies for Tasks
drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks for select using (auth.uid() = user_id);

drop policy if exists "Users can create their own tasks" on public.tasks;
create policy "Users can create their own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks for delete using (auth.uid() = user_id);

-- 6. Row Level Security Policies for Audit Logs
drop policy if exists "Users can view audit logs" on public.audit_logs;
create policy "Users can view audit logs"
  on public.audit_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert audit logs" on public.audit_logs;
create policy "Users can insert audit logs"
  on public.audit_logs for insert with check (auth.uid() = user_id);

-- 7. PostgreSQL Trigger Function for Automatic Task Auditing (Tamper-Proof)
create or replace function public.log_task_audit()
returns trigger as $$
declare
  curr_email text;
begin
  select auth.jwt() ->> 'email' into curr_email;
  if curr_email is null or curr_email = '' then
    curr_email := 'system_user';
  end if;

  if (tg_op = 'INSERT') then
    insert into public.audit_logs (user_id, user_email, action, entity_type, entity_id, details)
    values (
      new.user_id, 
      curr_email, 
      'TASK_CREATED', 
      'task', 
      new.id::text, 
      jsonb_build_object(
        'title', new.title, 
        'status', new.status, 
        'priority', new.priority, 
        'color', new.color
      )
    );
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_logs (user_id, user_email, action, entity_type, entity_id, details)
    values (
      new.user_id, 
      curr_email, 
      case when old.status is distinct from new.status then 'TASK_MOVED' else 'TASK_UPDATED' end, 
      'task', 
      new.id::text, 
      jsonb_build_object(
        'title', new.title,
        'from_status', old.status, 
        'to_status', new.status, 
        'from_priority', old.priority,
        'to_priority', new.priority,
        'color', new.color
      )
    );
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.audit_logs (user_id, user_email, action, entity_type, entity_id, details)
    values (
      old.user_id, 
      curr_email, 
      'TASK_DELETED', 
      'task', 
      old.id::text, 
      jsonb_build_object('title', old.title, 'status', old.status, 'priority', old.priority)
    );
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if exists and recreate
drop trigger if exists tasks_audit_trigger on public.tasks;
create trigger tasks_audit_trigger
after insert or update or delete on public.tasks
for each row execute function public.log_task_audit();
