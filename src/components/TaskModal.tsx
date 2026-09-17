import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, CalendarDays, Tag, X } from 'lucide-react';
import type { Task, TaskForm, TaskPriority, TaskStatus } from '../types';

const empty: TaskForm = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', category: '', tags: '' };

export default function TaskModal({ open, onClose, onSubmit, task }: { open: boolean; onClose: () => void; onSubmit: (data: TaskForm) => Promise<void>; task?: Task | null }) {
  const [form, setForm] = useState<TaskForm>(empty); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    setError('');
    if (task) setForm({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0,16) : '', category: task.category || '', tags: task.tags?.join(', ') || '' });
    else setForm(empty);
  }, [task, open]);
  if (!open) return null;
  const set = <K extends keyof TaskForm>(key: K, value: TaskForm[K]) => setForm(v => ({ ...v, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!form.title.trim()) { setError('Give your task a clear title.'); return; }
    setBusy(true); setError(''); try { await onSubmit({ ...form, title: form.title.trim(), description: form.description.trim(), category: form.category.trim(), tags: form.tags.trim() }); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save task.'); } finally { setBusy(false); }
  };
  return <div className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={e => { if (e.currentTarget === e.target && !busy) onClose(); }}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div><p className="eyebrow">{task ? 'EDIT TASK' : 'NEW TASK'}</p><h2>{task ? 'Refine the details' : 'Make it actionable.'}</h2></div><button type="button" className="icon-btn" onClick={onClose} disabled={busy} aria-label="Close"><X/></button></div>
      <label>Title<input autoFocus value={form.title} onChange={e => set('title', e.target.value)} maxLength={200} placeholder="e.g. Ship landing page"/></label>
      <label>Description<textarea value={form.description} onChange={e => set('description', e.target.value)} maxLength={2000} rows={4} placeholder="Add context or the definition of done…"/></label>
      <div className="grid-2">
        <label>Priority<select value={form.priority} onChange={e => set('priority', e.target.value as TaskPriority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
        <label>Status<select value={form.status} onChange={e => set('status', e.target.value as TaskStatus)}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>
      </div>
      <div className="grid-2">
        <label><span className="label-icon"><CalendarDays size={15}/> Due date</span><input type="datetime-local" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}/></label>
        <label><span className="label-icon"><Tag size={15}/> Category</span><input value={form.category} onChange={e => set('category', e.target.value)} maxLength={50} placeholder="Work, Personal…"/></label>
      </div>
      <label>Tags <span className="helper">comma separated</span><input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="design, launch, frontend"/></label>
      {error && <div className="form-error"><AlertCircle size={16}/><span>{error}</span></div>}
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
    </form>
  </div>;
}
