import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, color, icon }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          tasksAPI.getStats(),
          tasksAPI.getAll({ limit: 5 }),
        ]);
        setStats(statsRes.data.stats);
        setRecentTasks(tasksRes.data.tasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your tasks today.</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Tasks"  value={stats?.total ?? 0}       color="text-gray-900" icon="📋" />
            <StatCard label="To Do"        value={stats?.TODO ?? 0}        color="text-gray-600" icon="⏳" />
            <StatCard label="In Progress"  value={stats?.IN_PROGRESS ?? 0} color="text-blue-600" icon="🔄" />
            <StatCard label="Completed"    value={stats?.DONE ?? 0}        color="text-green-600" icon="✅" />
          </div>
        )}

        {/* Progress bar */}
        {stats && stats.total > 0 && (
          <div className="card p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-green-600">
                {Math.round((stats.DONE / stats.total) * 100)}% complete
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700"
                style={{ width: `${(stats.DONE / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">📝</p>
              <p>No tasks yet</p>
              <Link to="/tasks" className="btn-primary mt-3 inline-flex text-sm">
                Create your first task
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <span className="text-lg">
                    {task.status === 'DONE' ? '✅' : task.status === 'IN_PROGRESS' ? '🔄' : '⏳'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                  </div>
                  <span className={`badge text-xs ${
                    task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
