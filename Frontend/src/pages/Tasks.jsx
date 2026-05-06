import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Clock, AlertCircle, Plus, Calendar, List } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    project: '', 
    assignedTo: '', 
    dueDate: '' 
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') {
      fetchProjects();
      fetchUsers();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/my');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', project: '', assignedTo: '', dueDate: '' });
      fetchTasks();
    } catch (err) {
      alert('Failed to create task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  if (loading) return <div>Loading Tasks...</div>;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Tasks</h1>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={20} /> Create Task
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#94a3b8' }}>
              <th style={{ padding: '1rem' }}>Task</th>
              <th style={{ padding: '1rem' }}>Project</th>
              <th style={{ padding: '1rem' }}>Assigned To</th>
              <th style={{ padding: '1rem' }}>Due Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600' }}>{task.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{task.description}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="btn-outline btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', cursor: 'default' }}>
                    {task.project?.name || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>{task.assignedTo?.name || 'Unassigned'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Calendar size={14} />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    color: getStatusColor(task.status),
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(task.status) }}></div>
                    {task.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={user?.role !== 'Admin' && task.assignedTo?._id !== user?.id}
                    style={{ 
                      background: '#0f172a', 
                      color: (user?.role !== 'Admin' && task.assignedTo?._id !== user?.id) ? 'var(--text-dim)' : '#f8fafc', 
                      border: '1px solid var(--glass-border)',
                      borderRadius: '0.4rem',
                      padding: '0.25rem',
                      cursor: (user?.role !== 'Admin' && task.assignedTo?._id !== user?.id) ? 'not-allowed' : 'pointer',
                      opacity: (user?.role !== 'Admin' && task.assignedTo?._id !== user?.id) ? 0.6 : 1
                    }}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h2>New Task</h2>
            <form onSubmit={handleCreate} style={{ marginTop: '1.5rem' }}>
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
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Project</label>
                  <select 
                    className="input-field"
                    value={newTask.project}
                    onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Assign To</label>
                  <select 
                    className="input-field"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    required
                  >
                    <option value="">Select User</option>
                    {newTask.project && projects.find(p => p._id === newTask.project)?.members?.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                    {!newTask.project && <option disabled>Select Project First</option>}
                  </select>
                </div>
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
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Task</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
