import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './context/AuthContext';

function Public({children}:{children:ReactNode}){const {isAuthenticated,loading}=useAuth();if(loading)return <div className="boot"><div className="loader-ring"/><span>Loading TaskFlow…</span></div>;return isAuthenticated?<Navigate to="/dashboard" replace/>:<>{children}</>}
export default function App(){return <Routes><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/login" element={<Public><AuthPage mode="login"/></Public>}/><Route path="/register" element={<Public><AuthPage mode="register"/></Public>}/><Route element={<ProtectedRoute><AppLayout/></ProtectedRoute>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/tasks" element={<TasksPage/>}/><Route path="/analytics" element={<AnalyticsPage/>}/><Route path="/settings" element={<SettingsPage/>}/></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>}
