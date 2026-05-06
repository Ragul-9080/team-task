import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { List, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: <List size={20} />, color: 'var(--primary)' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: <CheckCircle size={20} />, color: '#10b981' },
    { label: 'Pending', value: stats?.pendingTasks || 0, icon: <Clock size={20} />, color: '#3b82f6' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: <AlertCircle size={20} />, color: '#f43f5e' },
  ];

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {user?.name}</h1>
        <p style={{ color: 'var(--text-dim)' }}>Overview of your team's current productivity.</p>
      </header>

      <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {statCards.map((card, index) => (
          <div key={index} className="glass-card" style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.5rem'
          }}>
            <div style={{ 
              background: '#1e293b', 
              color: card.color,
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--glass-border)'
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '2rem' }}>
        <div className="glass-card">
          <h3>Project Overview</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
             Activity feed coming soon...
          </div>
        </div>
        
        <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/projects" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Manage Projects
            </Link>
            <Link to="/tasks" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              View My Tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
