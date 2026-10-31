import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Plus,
  IndianRupee,
  ListTodo,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  MapPin,
  Trash2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { EventData } from '../../types';
import {
  formatINR,
  calculateBudgetStats,
  calculateTaskStats,
  calculateDaysRemaining,
} from '../../lib/calculations';
import { CategoryIcons, CategoryLabels, PriorityBadge } from '../common';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface DashboardViewProps {
  events: EventData[];
  onOpenWizard: () => void;
  onOpenEvent: (eventId: string, tab?: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function DashboardView({
  events,
  onOpenWizard,
  onOpenEvent,
  onDeleteEvent,
}: DashboardViewProps) {
  const [eventToDelete, setEventToDelete] = useState<EventData | null>(null);

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate actual aggregate stats across all events
  const totalEvents = events.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => !e.date || e.date >= todayStr);

  const totalPlannedBudget = events.reduce((sum, e) => sum + (Number(e.totalBudget) || 0), 0);

  const totalActualExpenses = events.reduce((sum, e) => {
    return sum + (e.expenses || []).reduce((expSum, exp) => expSum + (Number(exp.amount) || 0), 0);
  }, 0);

  const allTasks = events.flatMap((e) => e.tasks || []);
  const pendingTasksCount = allTasks.filter((t) => t.status !== 'completed').length;
  const completedTasksCount = allTasks.filter((t) => t.status === 'completed').length;

  const allGuests = events.flatMap((e) => e.guests || []);
  const totalGuestsAttending = allGuests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + (Number(g.attendeesCount) || 1), 0);

  // Urgent / high priority tasks across events
  const highPriorityTasks = allTasks
    .filter((t) => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high'))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252336] font-['Outfit']">
              Namaste, Planner! 🙏
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#777482] mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#6C4AB6]" />
            {todayFormatted} • Welcome to your Celebration Command Center
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#5A3C9E] hover:from-[#5A3C9E] hover:to-[#4C3187] text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-300 hover:shadow-lg transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      {/* Aggregate Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6C4AB6] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#777482] font-medium block">Total Celebrations</span>
            <span className="text-2xl font-extrabold text-[#252336] font-['Outfit']">
              {totalEvents}
            </span>
            <span className="text-[11px] text-purple-700 font-medium block mt-0.5">
              {upcomingEvents.length} upcoming
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#248A5A] flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#777482] font-medium block">Total Planned Budget</span>
            <span className="text-2xl font-extrabold text-[#252336] font-['Outfit']">
              {formatINR(totalPlannedBudget)}
            </span>
            <span className="text-[11px] text-[#248A5A] font-medium block mt-0.5">
              {formatINR(totalActualExpenses)} committed
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#777482] font-medium block">Pending Tasks</span>
            <span className="text-2xl font-extrabold text-[#252336] font-['Outfit']">
              {pendingTasksCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
              {completedTasksCount} completed
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#FF7F6A] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#777482] font-medium block">Confirmed Attendees</span>
            <span className="text-2xl font-extrabold text-[#252336] font-['Outfit']">
              {totalGuestsAttending}
            </span>
            <span className="text-[11px] text-rose-700 font-medium block mt-0.5">
              Across active guestlists
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      {events.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-purple-200">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6C4AB6] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#252336] font-['Outfit']">
            No Celebrations Created Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#777482] max-w-md mx-auto mt-2">
            Let Festivo AI plan your dream Indian wedding, birthday bash, college fest, or corporate summit in minutes.
          </p>
          <button
            onClick={onOpenWizard}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white font-semibold text-xs shadow-md transition cursor-pointer"
          >
            Plan First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Events Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#252336] font-['Outfit']">
                Active Celebrations ({events.length})
              </h2>
              <span className="text-xs text-[#777482]">Click to open full management workspace</span>
            </div>

            <div className="space-y-4">
              {events.map((evt) => {
                const IconComp = CategoryIcons[evt.category] || Sparkles;
                const budgetStats = calculateBudgetStats(evt.totalBudget, evt.expenses || []);
                const taskStats = calculateTaskStats(evt.tasks || []);
                const daysInfo = calculateDaysRemaining(evt.date);

                return (
                  <div
                    key={evt.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 relative group"
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6C4AB6] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-[#6C4AB6] border border-purple-100">
                              {CategoryLabels[evt.category]}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                daysInfo.isPast
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}
                            >
                              {daysInfo.label}
                            </span>
                          </div>

                          <h3
                            onClick={() => onOpenEvent(evt.id)}
                            className="text-lg font-bold text-[#252336] mt-1.5 hover:text-[#6C4AB6] transition cursor-pointer font-['Outfit']"
                          >
                            {evt.name}
                          </h3>

                          <p className="text-xs text-[#777482] mt-0.5 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {evt.date || 'TBD'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {evt.city || 'India'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {evt.guestCount} guests
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Delete Event Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventToDelete(evt);
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Celebration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Middle Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block">Total Budget</span>
                        <span className="font-bold text-[#252336]">{formatINR(evt.totalBudget)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Committed</span>
                        <span className="font-bold text-[#248A5A]">{formatINR(budgetStats.actualExpenses)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Tasks Completed</span>
                        <span className="font-bold text-[#6C4AB6]">
                          {taskStats.completed}/{taskStats.total} ({taskStats.progressPercent}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Vendors Booked</span>
                        <span className="font-bold text-[#FF7F6A]">
                          {(evt.vendors || []).filter((v) => v.bookingStatus === 'booked').length} Booked
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#6C4AB6] to-[#FF7F6A] h-full transition-all"
                        style={{ width: `${taskStats.progressPercent}%` }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpenEvent(evt.id, 'budget')}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-[#6C4AB6] transition cursor-pointer"
                        >
                          Budget ({formatINR(budgetStats.remainingBudget)} left)
                        </button>
                        <button
                          onClick={() => onOpenEvent(evt.id, 'tasks')}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-[#6C4AB6] transition cursor-pointer"
                        >
                          Tasks ({taskStats.pending} pending)
                        </button>
                      </div>

                      <button
                        onClick={() => onOpenEvent(evt.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        Open Workspace
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: High-Priority Tasks & Copilot Quick Access */}
          <div className="space-y-6">
            {/* Urgent & High Priority Tasks */}
            <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#6C4AB6]" />
                  <h3 className="font-bold text-sm text-[#252336] font-['Outfit']">
                    Action Items Requiring Attention
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {highPriorityTasks.length} pending
                </span>
              </div>

              {highPriorityTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No urgent tasks pending! You're in complete control.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {highPriorityTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#FFFDF9] border border-slate-100 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-xs text-[#252336]">{t.title}</div>
                        <div className="text-[11px] text-[#777482] mt-0.5">
                          Due: {t.dueDate || 'Flexible'} • {t.category}
                        </div>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Planning Tips */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-rose-50 border border-purple-100">
              <div className="flex items-center gap-2 mb-2 text-[#6C4AB6]">
                <Sparkles className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Festivo AI Smart Advice
                </h4>
              </div>
              <p className="text-xs text-[#252336] leading-relaxed">
                "Keep 10% emergency contingency for unforeseen weather changes or last-minute guest additions. Book caterers at least 45 days in advance during peak auspicious marriage dates (muhurats)."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Celebration Deletion */}
      <ConfirmDialog
        isOpen={Boolean(eventToDelete)}
        title="Delete Celebration?"
        message={`Are you sure you want to permanently delete "${eventToDelete?.name}"? All associated budgets, tasks, vendors, and schedules will be removed.`}
        confirmText="Delete Celebration"
        onConfirm={() => {
          if (eventToDelete) {
            onDeleteEvent(eventToDelete.id);
            setEventToDelete(null);
          }
        }}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
}
