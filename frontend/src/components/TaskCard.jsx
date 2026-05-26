const STATUS_STYLES = {
  TODO:        { badge: 'bg-gray-100 text-gray-700',   label: 'To Do' },
  IN_PROGRESS: { badge: 'bg-blue-100 text-blue-700',   label: 'In Progress' },
  DONE:        { badge: 'bg-green-100 text-green-700', label: 'Done' },
};

const PRIORITY_STYLES = {
  LOW:    { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  MEDIUM: { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  HIGH:   { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const status = STATUS_STYLES[task.status];
  const priority = PRIORITY_STYLES[task.priority];

  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 leading-snug line-clamp-2">{task.title}</h3>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status selector */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`badge cursor-pointer border-0 outline-none ${status.badge}`}
        >
          {Object.entries(STATUS_STYLES).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Priority */}
        <span className={`badge ${priority.badge} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {task.priority}
        </span>

        {/* Due date */}
        {task.dueDate && (
          <span className={`badge ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            {isOverdue ? '⚠️ ' : '📅 '}
            {new Date(task.dueDate).toLocaleDateString('th-TH')}
          </span>
        )}
      </div>
    </div>
  );
}
