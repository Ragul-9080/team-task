import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Briefcase, Users, Trash2, PlusCircle } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [newProject, setNewProject] = useState({ name: '', description: '', members: [] });
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.filter(u => u._id !== user.id)); 
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '', members: [] });
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to create project: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, project: selectedProject._id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' });
      alert('Task assigned successfully!');
    } catch (err) {
      alert('Failed to assign task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        fetchProjects();
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const toggleMember = (userId) => {
    setNewProject(prev => {
      const members = prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members };
    });
  };

  const openTaskModal = (project) => {
    setSelectedProject(project);
    setShowTaskModal(true);
  };

  if (loading) return <div>Loading Projects...</div>;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects</h1>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={20} /> Create Project
          </button>
        )}
      </div>

      <div className="grid grid-3">
        {projects.map((project) => (
          <div key={project._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6366f1' }}>
                <Briefcase size={24} />
                <h3 style={{ color: 'var(--text-main)' }}>{project.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {user?.role === 'Admin' && (
                  <>
                    <button 
                      onClick={() => openTaskModal(project)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem', color: '#10b981', borderColor: 'transparent' }}
                      title="Add Task"
                    >
                      <PlusCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project._id)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem', color: '#ef4444', borderColor: 'transparent' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', flexGrow: 1 }}>{project.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} />
                <span>{project.members?.length || 0} Members</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h2>New Project</h2>
            <form onSubmit={handleCreate} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Project Name</label>
                <input 
                  className="input-field" 
                  value={newProject.name} 
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={newProject.description} 
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Assign Members</label>
                <div className="checkbox-list">
                  {users.map(u => (
                    <label key={u._id} className="checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={newProject.members.includes(u._id)}
                        onChange={() => toggleMember(u._id)}
                      />
                      <span>{u.name} ({u.role})</span>
                    </label>
                  ))}
                  {users.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No other users found.</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Project</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h2>Assign Task to {selectedProject?.name}</h2>
            <form onSubmit={handleAddTask} style={{ marginTop: '1.5rem' }}>
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  className="input-field" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Assign To Member</label>
                <select 
                  className="input-field"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  required
                >
                  <option value="">Select Member</option>
                  {selectedProject?.members?.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input 
                  type="date"
                  className="input-field"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Assign Task</button>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
