import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock3, Flame, Target, TrendingUp } from 'lucide-react';
import type { Task } from '../types';
import { getTasks } from '../services/taskService';

export default function AnalyticsPage(){
 const [tasks,setTasks]=useState<Task[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{getTasks({limit:100,sortBy:'createdAt',order:'desc'}).then(r=>setTasks(r.tasks)).catch(()=>setTasks([])).finally(()=>setLoading(false))},[]);
 const done=tasks.filter(t=>t.status==='completed').length; const active=tasks.length-done; const rate=tasks.length?Math.round(done/tasks.length*100):0;
 const priorities=useMemo(()=>['urgent','high','medium','low'].map(p=>({p,n:tasks.filter(t=>t.priority===p).length})),[tasks]);
 const days=useMemo(()=>{const out=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const label=d.toLocaleDateString([], {weekday:'short'});const count=tasks.filter(t=>t.completedAt&&new Date(t.completedAt).toDateString()===d.toDateString()).length;out.push({label,count});}return out},[tasks]);
 const max=Math.max(1,...days.map(d=>d.count));
 return <section className="page"><div className="topbar"><div><p className="eyebrow">INSIGHTS</p><h1>Your momentum</h1><p className="page-sub">See where your focus is going and how consistently you finish.</p></div></div>
   <div className="analytics-hero"><div><p className="eyebrow">COMPLETION RATE</p><strong>{rate}%</strong><span>{done} completed · {active} active</span></div><div className="big-spark"><Activity size={28}/><div className="spark-bars">{days.map((d,i)=><i key={i} style={{height:`${Math.max(10,d.count/max*100)}%`}} title={`${d.label}: ${d.count}`}/>)}</div></div></div>
   <div className="analytics-grid"><div className="panel"><div className="panel-head"><div><p className="eyebrow">WEEKLY COMPLETION</p><h3>Finished tasks</h3></div><TrendingUp className="stat-icon"/></div><div className="week-chart">{days.map(d=><div key={d.label} className="chart-day"><div className="chart-track"><i style={{height:`${Math.max(4,d.count/max*100)}%`}}/></div><span>{d.label}</span><strong>{d.count}</strong></div>)}</div></div>
     <div className="panel"><div className="panel-head"><div><p className="eyebrow">WORKSPACE HEALTH</p><h3>At a glance</h3></div></div><div className="metric-list"><div><Target/><span>Tracked tasks</span><strong>{loading?'—':tasks.length}</strong></div><div><CheckCircle2/><span>Completed</span><strong>{loading?'—':done}</strong></div><div><Clock3/><span>Active</span><strong>{loading?'—':active}</strong></div><div><Flame/><span>High priority</span><strong>{loading?'—':tasks.filter(t=>t.priority==='high'||t.priority==='urgent').length}</strong></div></div></div></div>
   <div className="panel"><div className="panel-head"><div><p className="eyebrow">PRIORITY MIX</p><h3>Energy by priority</h3></div></div><div className="bar-list">{priorities.map(x=><div className="bar-row" key={x.p}><div><span>{x.p}</span><strong>{x.n}</strong></div><div className="bar-track"><i style={{width:`${tasks.length?Math.max(4,x.n/tasks.length*100):4}%`}}/></div></div>)}</div></div>
 </section>;
}
