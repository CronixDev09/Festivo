import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Calendar,
  X,
  CalendarDays,
} from 'lucide-react';
import { EventData, TaskItem, TaskPriority, TaskStatus } from '../../../types';
import { calculateTaskStats } from '../../../lib/calculations';
import { PriorityBadge } from '../../common';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface TasksTabProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
}

export function TasksTab({ event, onUpdateEvent }: TasksTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState<TaskStatus>('pending');

  const tasks = event.tasks || [];
  const stats = calculateTaskStats(tasks);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAddModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(todayStr);
    setCategory('General');
    setStatus('pending');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setCategory(task.category);
    setStatus(task.status);
    setIsModalOpen(true);
  };

  const handleToggleTaskStatus = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: (t.status === 'completed' ? 'pending' : 'completed') as TaskStatus,
        };
      }
      return t;
    });
    onUpdateEvent({ ...event, tasks: updated });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let updatedTasks = [...tasks];

    if (editingTaskId) {
      updatedTasks = updatedTasks.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              title: title.trim(),
              description: description.trim(),
              priority,
              dueDate,
              category: category.trim(),
              status,
            }
          : t
      );
    } else {
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        category: category.trim() || 'General',
        status,
      };
      updatedTasks.unshift(newTask);
    }

    onUpdateEvent({ ...event, tasks: updatedTasks });
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    onUpdateEvent({ ...event, tasks: updated });
    setTaskToDeleteId(null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort by deadline
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Total Tasks</span>
          <div className="text-2xl font-bold text-[#252336] mt-1 font-['Outfit']">{stats.total}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Completed</span>
          <div className="text-2xl font-bold text-[#248A5A] mt-1 font-['Outfit']">
            {stats.completed} ({stats.progressPercent}%)
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Pending & In Progress</span>
          <div className="text-2xl font-bold text-[#6C4AB6] mt-1 font-['Outfit']">
            {stats.pending + stats.inProgress}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Overdue Tasks</span>
          <div className={`text-2xl font-bold mt-1 font-['Outfit'] ${stats.overdue > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs space-y-2">
        <div className="flex justify-between text-xs font-semibold text-[#777482]">
          <span>Milestone Completion Progress</span>
          <span>{stats.progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#6C4AB6] to-[#248A5A] h-full transition-all duration-300"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Search, Filter & Actions Bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks, categories, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6] text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6C4AB6]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6C4AB6]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#252336] shadow-xs' : 'text-slate-500'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white text-[#252336] shadow-xs' : 'text-slate-500'
              }`}
            >
              Timeline
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Task List or Timeline View */}
      {sortedTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center shadow-xs">
          <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-sm text-[#252336] font-['Outfit']">No Tasks Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Try clearing your search query or filters.' : 'Add your first task to start organizing your timeline.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {sortedTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 flex items-start justify-between gap-4 transition hover:bg-purple-50/20 ${
                  isCompleted ? 'bg-slate-50/40 opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition border cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-[#248A5A] border-[#248A5A] text-white'
                        : 'border-slate-300 hover:border-[#6C4AB6] bg-white'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-[#252336]'
                        }`}
                      >
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {task.category}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#777482] mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due: {task.dueDate || 'Flexible'}
                      </span>
                      <span>Status: {task.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="p-1.5 text-slate-400 hover:text-[#6C4AB6] rounded-md hover:bg-slate-100 transition cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTaskToDeleteId(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs relative">
          <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-purple-100" />
          <div className="space-y-6 relative">
            {sortedTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div key={task.id} className="flex items-start gap-4">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 ${
                      isCompleted
                        ? 'bg-[#248A5A] text-white ring-4 ring-emerald-50'
                        : 'bg-[#6C4AB6] text-white ring-4 ring-purple-50'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-[#252336]">{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p className="text-[11px] text-[#777482] mt-1">{task.description}</p>
                    <div className="mt-2 text-[11px] text-purple-700 font-medium">
                      Deadline: {task.dueDate || 'Flexible'} • {task.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
                {editingTaskId ? 'Edit Task' : 'Create New Preparation Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Confirm wedding cake flavor with baker"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Call pastry chef, confirm eggless red velvet & saffron pistachio design"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Venue, Catering, Decor, Logistics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Task Deletion */}
      <ConfirmDialog
        isOpen={Boolean(taskToDeleteId)}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This cannot be undone."
        confirmText="Delete Task"
        onConfirm={() => {
          if (taskToDeleteId) {
            handleDeleteTask(taskToDeleteId);
          }
        }}
        onCancel={() => setTaskToDeleteId(null)}
      />
    </div>
  );
}
