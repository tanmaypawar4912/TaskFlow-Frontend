import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, ChevronLeft, ChevronRight, Command, LayoutDashboard, LogOut, Menu, Moon, Plus, Search, Settings, SquareCheckBig, Sun, X } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toast from '../components/Toast';

export default function AppLayout() {
  const { user, logout } = useAuth(); const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false); const [quickSearch, setQuickSearch] = useState(false); const [toast, setToast] = useState('');
  const navigate = useNavigate(); const location = useLocation();

  const nav = useMemo(() => [
    ['/dashboard','Overview',LayoutDashboard], ['/tasks','My Tasks',SquareCheckBig], ['/analytics','Analytics',BarChart3], ['/settings','Settings',Settings]
  ] as const, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = ['INPUT','TEXTAREA','SELECT'].includes(target.tagName) || target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setQuickSearch(true); return; }
      if (!typing && e.key.toLowerCase() === 'n') { navigate('/tasks?new=1'); }
      if (!typing && e.key === '/') { e.preventDefault(); setQuickSearch(true); }
      if (e.key === 'Escape') setQuickSearch(false);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => { setMobileOpen(false); setQuickSearch(false); }, [location.pathname]);

  const signOut = async () => { await logout(); navigate('/login', { replace: true }); };
  const firstName = user?.name?.split(' ')[0] || 'there';

  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="side-top"><Logo compact={collapsed}/>{mobileOpen && <button className="icon-btn mobile-only" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X/></button>}</div>
      <button className="create-side" onClick={() => navigate('/tasks?new=1')}><Plus size={18}/><span>New task</span></button>
      <nav aria-label="Main navigation">{nav.map(([to,label,Icon]) => <NavLink key={to} to={to} className={({isActive})=>isActive?'active':''}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
      <div className="side-note"><span className="kicker">FOCUS MODE</span><strong>Plan less. Finish more.</strong><small>Keep your next move visible and your workspace calm.</small></div>
      <div className="side-bottom">
        <NavLink to="/settings" className="mini-profile"><div className="avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div><div className="profile-text"><strong>{user?.name || 'TaskFlow user'}</strong><span>{user?.email || ''}</span></div></NavLink>
        <button className="side-action" onClick={signOut}><LogOut size={17}/><span>Sign out</span></button>
        <button className="collapse-btn" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Expand sidebar':'Collapse sidebar'}>{collapsed?<ChevronRight size={18}/>:<><ChevronLeft size={18}/><span>Collapse</span></>}</button>
      </div>
    </aside>
    {mobileOpen && <button className="mobile-shade" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>} 
    <main className="main">
      <header className="desktop-header">
        <div className="header-context"><span className="header-dot"/><span>{location.pathname === '/dashboard' ? `Welcome back, ${firstName}` : 'TaskFlow workspace'}</span></div>
        <div className="header-actions">
          <button className="search-trigger" onClick={()=>setQuickSearch(true)}><Search size={17}/><span>Search tasks</span><kbd>⌘ K</kbd></button>
          <button className="icon-btn" title="Notifications" onClick={()=>setToast('You’re all caught up.') }><Bell size={19}/></button>
          <button className="icon-btn" onClick={()=>setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" title="Toggle theme">{resolvedTheme === 'dark'?<Sun size={19}/>:<Moon size={19}/>}</button>
          <button className="avatar user-avatar" onClick={()=>navigate('/settings')} title="Open profile">{user?.name?.[0]?.toUpperCase() || '?'}</button>
        </div>
      </header>
      <header className="mobile-header">
        <button className="icon-btn" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><Menu/></button><Logo/>
        <div className="mobile-head-actions"><button className="icon-btn" onClick={()=>setQuickSearch(true)} aria-label="Search"><Search/></button><button className="icon-btn" onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')} aria-label="Toggle theme">{resolvedTheme==='dark'?<Sun/>:<Moon/>}</button></div>
      </header>
      <Outlet />
    </main>
    {quickSearch && <div className="command-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)setQuickSearch(false)}}>
      <div className="command-dialog"><div className="command-head"><div><p className="eyebrow">COMMAND CENTER</p><h2>What do you need?</h2></div><button className="icon-btn" onClick={()=>setQuickSearch(false)}><X/></button></div>
        <div className="command-input"><Command size={18}/><input autoFocus placeholder="Search or jump to…" onKeyDown={e=>{if(e.key==='Escape')setQuickSearch(false);}}/><kbd>ESC</kbd></div>
        <div className="command-grid">
          {[['New task',()=>navigate('/tasks?new=1')],['My tasks',()=>navigate('/tasks')],['Overview',()=>navigate('/dashboard')],['Analytics',()=>navigate('/analytics')],['Settings',()=>navigate('/settings')],['Toggle theme',()=>setTheme(resolvedTheme==='dark'?'light':'dark')]].map(([label,fn])=><button key={label as string} onClick={()=>{(fn as ()=>void)();setQuickSearch(false)}}>{label as string}<ChevronRight size={16}/></button>)}
        </div>
      </div>
    </div>}
    {toast && <Toast message={toast} onClose={()=>setToast('')}/>} 
  </div>;
}
