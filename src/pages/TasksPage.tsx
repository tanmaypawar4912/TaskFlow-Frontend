import { useEffect, useMemo, useState } from 'react';
import { Archive, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Copy, Edit3, Filter, MoreHorizontal, Plus, RotateCcw, Search, Tag, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { Task, TaskFilters, TaskForm } from '../types';
import { completeTask, createTask, deleteTask, duplicateTask, getTasks, restoreTask, updateTask } from '../services/taskService';
import TaskModal from '../components/TaskModal';
import Toast from '../components/Toast';

const emptyFilters: TaskFilters = { search:'', status:'', priority:'', category:'', sortBy:'createdAt', order:'desc', page:1, limit:10 };
const prettyDate=(d?:string)=>d?new Date(d).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';

export default function TasksPage(){
 const [params,setParams]=useSearchParams(); const [tasks,setTasks]=useState<Task[]>([]); const [pagination,setPagination]=useState({page:1,limit:10,total:0,totalPages:1,hasNextPage:false,hasPreviousPage:false}); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [toast,setToast]=useState(''); const [editing,setEditing]=useState<Task|null>(null); const [modal,setModal]=useState(false); const [filters,setFilters]=useState<TaskFilters>(emptyFilters); const [menu,setMenu]=useState<string|null>(null); const [showFilters,setShowFilters]=useState(false);
 const load=async(f:TaskFilters=filters)=>{setLoading(true);setError('');try{const r=await getTasks(f);setTasks(r.tasks);setPagination(r.pagination);}catch(e){setError(e instanceof Error?e.message:'Unable to load tasks.');}finally{setLoading(false)}};
 useEffect(()=>{const search=params.get('search')||''; const next={...filters,search,page:Number(params.get('page')||1)};setFilters(next);void load(next); /* eslint-disable-next-line react-hooks/exhaustive-deps */},[params]);
 useEffect(()=>{if(params.get('new')==='1'){setEditing(null);setModal(true);params.delete('new');setParams(params,{replace:true});}},[params,setParams]);
 const setFilter=(key:keyof TaskFilters,val:string)=>{const next={...filters,[key]:val,page:1};setFilters(next);if(key==='search')setParams({search:val});else void load(next)};
 const apply=()=>{const next={...filters,page:1};setFilters(next);setShowFilters(false);void load(next)};
 const action=async(fn:()=>Promise<unknown>,message:string)=>{try{await fn();setToast(message);setMenu(null);await load(filters);}catch(e){setToast(e instanceof Error?e.message:'Action failed.')}};
 const save=async(data:TaskForm)=>{if(editing)await updateTask(editing._id,data);else await createTask(data);setToast(editing?'Task updated':'Task created');await load(filters)};
 const categories=useMemo(()=>Array.from(new Set(tasks.map(t=>t.category).filter(Boolean))) as string[],[tasks]);
 return <section className="page">
  <div className="topbar"><div><p className="eyebrow">WORKSPACE</p><h1>My tasks</h1><p className="page-sub">Keep the important work close. Everything else can wait.</p></div><button className="btn primary" onClick={()=>{setEditing(null);setModal(true)}}><Plus size={18}/> New task</button></div>
  <div className="task-toolbar"><div className="search-large"><Search size={18}/><input value={filters.search||''} onChange={e=>setFilter('search',e.target.value)} placeholder="Search title, description…"/><kbd>/</kbd></div><div className="toolbar-actions"><button className={`btn ghost ${showFilters?'active':''}`} onClick={()=>setShowFilters(v=>!v)}><Filter size={17}/> Filters</button></div></div>
  {showFilters&&<div className="filter-panel">
    <label>Status<select value={filters.status||''} onChange={e=>setFilter('status',e.target.value)}><option value="">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>
    <label>Priority<select value={filters.priority||''} onChange={e=>setFilter('priority',e.target.value)}><option value="">All priorities</option>{['urgent','high','medium','low'].map(v=><option key={v} value={v}>{v}</option>)}</select></label>
    <label>Category<select value={filters.category||''} onChange={e=>setFilter('category',e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
    <label>Sort<select value={filters.sortBy||'createdAt'} onChange={e=>setFilters(v=>({...v,sortBy:e.target.value}))}><option value="createdAt">Newest</option><option value="updatedAt">Recently updated</option><option value="dueDate">Due date</option><option value="priority">Priority</option><option value="title">Alphabetical</option></select></label>
    <button className="btn primary filter-apply" onClick={apply}>Apply filters</button><button className="icon-btn filter-close" onClick={()=>setShowFilters(false)}><X/></button>
  </div>}
  {error&&<div className="error-banner"><span>{error}</span><button onClick={()=>void load(filters)}>Retry</button></div>}
  <div className="task-panel panel"><div className="panel-head"><div><p className="eyebrow">{pagination.total} TOTAL</p><h3>Everything on your radar</h3></div><span className="panel-meta">Page {pagination.page} of {Math.max(1,pagination.totalPages)}</span></div>
   {loading?<div className="skeleton-list">{Array.from({length:5}).map((_,i)=><div className="task-skeleton" key={i}><i/><div><b/><span/></div></div>)}</div>:tasks.length===0?<div className="empty"><Archive size={30}/><strong>{filters.search?'No matching tasks':'No tasks yet'}</strong><span>{filters.search?'Try a different search or clear your filters.':'Create your first task and build your rhythm.'}</span>{!filters.search&&<button className="btn primary" onClick={()=>{setEditing(null);setModal(true)}}><Plus size={17}/> Create task</button>}</div>:<div className="full-task-list">{tasks.map(t=><article className={`full-task ${t.status==='completed'?'is-complete':''}`} key={t._id}>
      <button className={`check-button ${t.status==='completed'?'checked':''}`} onClick={()=>t.status==='completed'?void action(()=>restoreTask(t._id),'Task restored'):void action(()=>completeTask(t._id),'Task completed')} aria-label={t.status==='completed'?'Restore task':'Complete task'}>{t.status==='completed'&&<Check size={15}/>}</button>
      <div className="full-task-body"><div className="task-title-line"><h3>{t.title}</h3><span className={`priority ${t.priority}`}>{t.priority}</span></div>{t.description&&<p>{t.description}</p>}<div className="task-meta"><span><Tag size={13}/>{t.category||'No category'}</span>{t.dueDate&&<span><CalendarDays size={13}/>{prettyDate(t.dueDate)}</span>}{t.tags?.slice(0,3).map(tag=><span key={tag}>#{tag}</span>)}</div></div>
      <div className="task-actions"><button className="icon-btn" onClick={()=>{setEditing(t);setModal(true)}} aria-label="Edit task"><Edit3 size={17}/></button><div className="relative"><button className="icon-btn" onClick={()=>setMenu(menu===t._id?null:t._id)} aria-label="Task menu"><MoreHorizontal size={18}/></button>{menu===t._id&&<div className="action-menu"><button onClick={()=>void action(()=>duplicateTask(t._id),'Task duplicated')}><Copy/> Duplicate</button><button onClick={()=>void action(()=>t.status==='completed'?restoreTask(t._id):completeTask(t._id),t.status==='completed'?'Task restored':'Task completed')}>{t.status==='completed'?<RotateCcw/>:<CheckCircle2/>}{t.status==='completed'?'Restore':'Complete'}</button><button className="danger" onClick={()=>{if(window.confirm('Delete this task permanently?'))void action(()=>deleteTask(t._id),'Task deleted')}}><Trash2/> Delete</button></div>}</div></div>
    </article>)}</div>}
   <div className="pagination"><span>{pagination.total} tasks</span><div><button disabled={!pagination.hasPreviousPage} onClick={()=>{const p=Math.max(1,(pagination.page||1)-1);const next={...filters,page:p};setFilters(next);void load(next)}}><ChevronLeft/></button><button disabled={!pagination.hasNextPage} onClick={()=>{const p=(pagination.page||1)+1;const next={...filters,page:p};setFilters(next);void load(next)}}><ChevronRight/></button></div></div>
  </div>
  <TaskModal open={modal} task={editing} onClose={()=>{setModal(false);setEditing(null)}} onSubmit={save}/>{toast&&<Toast message={toast} onClose={()=>setToast('')}/>} 
 </section>;
}
