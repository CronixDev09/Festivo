import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  IndianRupee,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Palette,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { EventData } from '../../../types';
import {
  formatINR,
  calculateBudgetStats,
  calculateTaskStats,
  calculateDaysRemaining,
} from '../../../lib/calculations';
import { CategoryLabels, PriorityBadge } from '../../common';

interface OverviewTabProps {
  event: EventData;
  onNavigateTab: (tab: string) => void;
  onOpenChat: () => void;
}

export function OverviewTab({ event, onNavigateTab, onOpenChat }: OverviewTabProps) {
  const budgetStats = calculateBudgetStats(event.totalBudget, event.expenses || []);
  const taskStats = calculateTaskStats(event.tasks || []);
  const daysInfo = calculateDaysRemaining(event.date);

  const pendingUrgentTasks = (event.tasks || [])
    .filter((t) => t.status !== 'completed')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Event Card */}
      <div className="bg-gradient-to-r from-purple-900 via-[#6C4AB6] to-[#5A3C9E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rose-400/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider">
              {CategoryLabels[event.category]}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-400/20 backdrop-blur-xs text-emerald-200 text-xs font-semibold">
              {daysInfo.label}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit']">
            {event.name}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-purple-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-300" />
              {event.date || 'TBD'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-purple-300" />
              {event.city} {event.venueDetails ? `• ${event.venueDetails}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-300" />
              {event.guestCount} Guests
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-300" />
              {event.durationHours} Hours Duration
            </span>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-purple-100/90 leading-relaxed italic">
            "{event.theme || 'Traditional and vibrant celebration'}"
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('ai-plan')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#6C4AB6] font-bold text-xs shadow-md hover:bg-slate-50 transition cursor-pointer"
            >
              View Full AI Plan
            </button>
            <button
              onClick={onOpenChat}
              className="px-4 py-2.5 rounded-xl bg-purple-700/80 hover:bg-purple-700 text-white font-medium text-xs border border-purple-400/40 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF7F6A]" />
              Ask AI Copilot
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('budget')}
          className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <span className="text-xs text-[#777482]">Planned Budget</span>
          <div className="text-2xl font-bold text-[#6C4AB6] mt-1 font-['Outfit']">
            {formatINR(event.totalBudget)}
          </div>
          <span className="text-[11px] text-[#248A5A] font-medium block mt-1">
            {formatINR(budgetStats.remainingBudget)} remaining
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <span className="text-xs text-[#777482]">Task Completion</span>
          <div className="text-2xl font-bold text-[#252336] mt-1 font-['Outfit']">
            {taskStats.progressPercent}%
          </div>
          <span className="text-[11px] text-purple-700 font-medium block mt-1">
            {taskStats.completed} of {taskStats.total} completed
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('vendors')}
          className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <span className="text-xs text-[#777482]">Vendors Booked</span>
          <div className="text-2xl font-bold text-[#FF7F6A] mt-1 font-['Outfit']">
            {(event.vendors || []).filter((v) => v.bookingStatus === 'booked').length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            {(event.vendors || []).length} total in organizer
          </span>
        </div>

        <div
          onClick={() => onNavigateTab('guests')}
          className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition cursor-pointer"
        >
          <span className="text-xs text-[#777482]">Confirmed Guests</span>
          <div className="text-2xl font-bold text-[#248A5A] mt-1 font-['Outfit']">
            {(event.guests || [])
              .filter((g) => g.rsvpStatus === 'attending')
              .reduce((sum, g) => sum + (Number(g.attendeesCount) || 1), 0)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Target: {event.guestCount} guests
          </span>
        </div>
      </div>

      {/* Two Column Detail: Next Tasks + Quick Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Urgent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#6C4AB6]" />
              <h3 className="font-bold text-sm text-[#252336] font-['Outfit']">
                Next Priority Action Items
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-semibold text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingUrgentTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              All tasks are completed! Use the task tab to add new milestones.
            </p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {pendingUrgentTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{t.title}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                    <span className="text-[10px] text-purple-700 mt-1 inline-block">
                      Due: {t.dueDate || 'Flexible'} • {t.category}
                    </span>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch Hub */}
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#252336] font-['Outfit'] pb-2 border-b border-slate-100">
            Quick Navigation Hub
          </h3>

          <button
            onClick={() => onNavigateTab('budget')}
            className="w-full text-left p-2.5 rounded-xl bg-[#FFFDF9] hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <IndianRupee className="w-4 h-4 text-[#248A5A]" />
              <span className="font-medium text-slate-800">Budget & Invoices</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('guests')}
            className="w-full text-left p-2.5 rounded-xl bg-[#FFFDF9] hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#FF7F6A]" />
              <span className="font-medium text-slate-800">Guest List & RSVPs</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('moodboard')}
            className="w-full text-left p-2.5 rounded-xl bg-[#FFFDF9] hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-[#6C4AB6]" />
              <span className="font-medium text-slate-800">Color Swatches & Decor</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('schedule')}
            className="w-full text-left p-2.5 rounded-xl bg-[#FFFDF9] hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-slate-800">Hourly Event Schedule</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
