import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, Briefcase } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ 
      background: '#0f172a', 
      padding: '1rem 2rem', 
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ 
        color: '#fff', 
        fontSize: '1.25rem', 
        fontWeight: '800', 
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        letterSpacing: '-0.02em'
      }}>
        <div style={{ 
          background: 'var(--primary)', 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckSquare size={20} color="#020617" strokeWidth={3} />
        </div>
        TeamTask
      </Link>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', gap: '0.25rem', marginRight: '1rem' }}>
              <Link to="/" className="btn-outline btn" style={{ border: 'none', fontSize: '0.9rem' }}>Dashboard</Link>
              {user.role === 'Admin' && <Link to="/projects" className="btn-outline btn" style={{ border: 'none', fontSize: '0.9rem' }}>Projects</Link>}
              <Link to="/tasks" className="btn-outline btn" style={{ border: 'none', fontSize: '0.9rem' }}>Tasks</Link>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{user.role}</div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--text-dim)' }}>
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline">Sign In</Link>
            <Link to="/signup" className="btn btn-primary">Join Team</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
