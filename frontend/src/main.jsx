import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const refresh = async () => {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Cannot load tasks');
    setTasks(await response.json());
  };
  useEffect(() => { refresh().catch(err => setError(err.message)); }, []);
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title})
      });
      if (!response.ok) throw new Error('Cannot save task');
      setTitle(''); setError(''); await refresh();
    } catch (err) { setError(err.message); }
  };
  const toggleTask = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({completed: !task.completed})
      });
      if (!response.ok) throw new Error('Cannot update task');
      setError(''); await refresh();
    } catch (err) { setError(err.message); }
  };
  return <main><h1>Tech365 Task Manager</h1><p>React + Node.js + PostgreSQL on Kubernetes</p>
    <form onSubmit={addTask}><input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task" maxLength="200" /><button>Add task</button></form>
    {error && <p role="alert" className="error">{error}</p>}
    <ul>{tasks.map(task => <li key={task.id}><label><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} /><span className={task.completed ? 'done' : ''}>{task.title}</span></label></li>)}</ul>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
