import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Spinner from '../components/Spinner';
import { tasksAPI } from '../services/api';

const STATUSES = ['', 'TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = { '': 'All', TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, task: null });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, ...filters };
      // ลบ key ที่ว่าง
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Reset page เมื่อ filter เปลี่ยน
  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  };

  const handleSave = async (formData) => {
    if (modal.task) {
      await tasksAPI.update(modal.task.id, formData);
      showToast('Task updated!');
    } else {
      await tasksAPI.create(formData);
      showToast('Task created!');
    }
    fetchTasks();
  };

  const handleStatusChange = async (id, status) => {
    try {
      await tasksAPI.update(id, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      showToast('Task deleted');
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            {pagination.total !== undefined && (
              <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total tasks</p>
            )}
          </div>
          <button onClick={() => setModal({ open: true, task: null })} className="btn-primary">
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3">
          {/* Search */}
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input flex-1 min-w-[180px]"
            placeholder="🔍  Search tasks..."
          />
          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {/* Priority filter */}
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="input w-auto"
          >
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          {/* Clear */}
          {(filters.search || filters.status || filters.priority) && (
            <button
              onClick={() => { setFilters({ status: '', priority: '', search: '' }); setPage(1); }}
              className="btn-secondary text-xs"
            >
              Clear ×
            </button>
          )}
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-medium">No tasks found</p>
            <p className="text-sm mt-1">Try adjusting filters or create a new task</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setModal({ open: true, task: t })}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({ open: false, task: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
