import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  ListTodo,
  Palette,
  Building2,
  Clock,
  MessageSquare,
  Download,
  Trash2,
  Check,
  Edit2,
  X,
} from 'lucide-react';
import { EventData, ProposedChange } from '../../types';
import { formatINR, calculateBudgetStats, calculateDaysRemaining } from '../../lib/calculations';
import { CategoryLabels } from '../common';
import { OverviewTab } from './tabs/OverviewTab';
import { AIPlannerTab } from './tabs/AIPlannerTab';
import { BudgetTab } from './tabs/BudgetTab';
import { TasksTab } from './tabs/TasksTab';
import { VendorsTab } from './tabs/VendorsTab';
import { GuestsTab } from './tabs/GuestsTab';
import { MoodboardTab } from './tabs/MoodboardTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { AIChatDrawer } from '../chat/AIChatDrawer';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface EventWorkspaceProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
  onBackToDashboard: () => void;
  onDeleteEvent: (id: string) => void;
  initialTab?: string;
}

export function EventWorkspace({
  event,
  onUpdateEvent,
  onBackToDashboard,
  onDeleteEvent,
  initialTab = 'overview',
}: EventWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit basic info form
  const [editName, setEditName] = useState(event.name);
  const [editDate, setEditDate] = useState(event.date);
  const [editCity, setEditCity] = useState(event.city);
  const [editGuestCount, setEditGuestCount] = useState(event.guestCount);
  const [editTheme, setEditTheme] = useState(event.theme);

  const budgetStats = calculateBudgetStats(event.totalBudget, event.expenses || []);
  const daysInfo = calculateDaysRemaining(event.date);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'ai-plan', label: 'AI Planner', icon: Sparkles },
    { id: 'budget', label: 'Budget & Expenses', icon: IndianRupee },
    { id: 'tasks', label: 'Tasks & Timeline', icon: ListTodo },
    { id: 'vendors', label: 'Vendors Organizer', icon: Building2 },
    { id: 'guests', label: 'Guest List', icon: Users },
    { id: 'moodboard', label: 'Moodboard', icon: Palette },
    { id: 'schedule', label: 'Day Schedule', icon: Clock },
  ];

  const handleApplyProposedChange = (change: ProposedChange) => {
    let updated: EventData = { ...event };

    // Apply payload fields safely
    if (change.applyPayload) {
      if (typeof change.applyPayload.totalBudget === 'number') {
        updated.totalBudget = change.applyPayload.totalBudget;
      }
      if (typeof change.applyPayload.theme === 'string') {
        updated.theme = change.applyPayload.theme;
      }
      if (typeof change.applyPayload.foodPreference === 'string') {
        updated.foodPreference = change.applyPayload.foodPreference as any;
      }
      if (typeof change.applyPayload.additionalNotes === 'string') {
        updated.additionalNotes = change.applyPayload.additionalNotes;
      }

      // Handle new task if proposed
      if (change.applyPayload.newTask) {
        const nt: any = change.applyPayload.newTask;
        const newTask = {
          id: `tsk-ai-${Date.now()}`,
          title: nt.title || 'AI Recommended Task',
          description: nt.description || '',
          priority: (nt.priority?.toLowerCase() || 'medium') as any,
          dueDate: nt.dueDate || event.date,
          category: nt.category || 'General',
          status: 'pending' as const,
        };
        updated.tasks = [newTask, ...(updated.tasks || [])];
      }

      // Handle new schedule item if proposed
      if (change.applyPayload.newScheduleItem) {
        const ns: any = change.applyPayload.newScheduleItem;
        const newSched = {
          id: `sch-ai-${Date.now()}`,
          startTime: ns.startTime || '10:00 AM',
          endTime: ns.endTime || '11:00 AM',
          activity: ns.activity || 'Celebration Milestone',
          description: ns.description || '',
        };
        updated.schedule = [...(updated.schedule || []), newSched];
      }
    }

    onUpdateEvent(updated);
  };

  const handleSaveBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEvent({
      ...event,
      name: editName.trim(),
      date: editDate,
      city: editCity.trim(),
      guestCount: Number(editGuestCount),
      theme: editTheme.trim(),
    });
    setIsEditModalOpen(false);
  };

  const handleExportSingleEvent = () => {
    const jsonString = JSON.stringify(event, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name.replace(/\s+/g, '_')}_Plan.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-[#6C4AB6]">
                {CategoryLabels[event.category]}
              </span>
              <span className="text-xs text-slate-500">• {daysInfo.label}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#252336] font-['Outfit'] mt-0.5 flex items-center gap-2">
              {event.name}
              <button
                onClick={() => {
                  setEditName(event.name);
                  setEditDate(event.date);
                  setEditCity(event.city);
                  setEditGuestCount(event.guestCount);
                  setEditTheme(event.theme);
                  setIsEditModalOpen(true);
                }}
                className="text-slate-400 hover:text-[#6C4AB6] p-1 cursor-pointer"
                title="Edit Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportSingleEvent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Download Event JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 hover:bg-rose-50 transition cursor-pointer"
            title="Delete Celebration"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#FF7F6A] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-200 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI Copilot
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-purple-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-[#6C4AB6] text-[#6C4AB6] bg-purple-50/50'
                  : 'border-transparent text-[#777482] hover:text-[#252336] hover:bg-slate-50'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            event={event}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}
        {activeTab === 'ai-plan' && (
          <AIPlannerTab
            event={event}
            onUpdateEvent={onUpdateEvent}
            onOpenTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetTab event={event} onUpdateEvent={onUpdateEvent} />
        )}
        {activeTab === 'tasks' && (
          <TasksTab event={event} onUpdateEvent={onUpdateEvent} />
        )}
        {activeTab === 'vendors' && (
          <VendorsTab event={event} onUpdateEvent={onUpdateEvent} />
        )}
        {activeTab === 'guests' && (
          <GuestsTab event={event} onUpdateEvent={onUpdateEvent} />
        )}
        {activeTab === 'moodboard' && (
          <MoodboardTab event={event} onUpdateEvent={onUpdateEvent} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab event={event} onUpdateEvent={onUpdateEvent} />
        )}
      </div>

      {/* Contextual AI Copilot Drawer */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        event={event}
        onApplyProposedChange={handleApplyProposedChange}
      />

      {/* Edit Basic Info Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
                Edit Event Information
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBasicInfo} className="space-y-4 pt-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guest Count</label>
                <input
                  type="number"
                  min="1"
                  value={editGuestCount}
                  onChange={(e) => setEditGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Theme</label>
                <input
                  type="text"
                  value={editTheme}
                  onChange={(e) => setEditTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Celebration Deletion */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Celebration?"
        message={`Are you sure you want to permanently delete "${event.name}"? All associated budgets, tasks, vendors, and schedules will be removed.`}
        confirmText="Delete Celebration"
        onConfirm={() => {
          onDeleteEvent(event.id);
          setIsDeleteDialogOpen(false);
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
