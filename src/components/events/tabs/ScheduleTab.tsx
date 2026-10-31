import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
} from 'lucide-react';
import { EventData, ScheduleItem } from '../../../types';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface ScheduleTabProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
}

export function ScheduleTab({ event, onUpdateEvent }: ScheduleTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activityToDeleteId, setActivityToDeleteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form fields
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const schedule = event.schedule || [];

  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setActivity('');
    setStartTime('10:00 AM');
    setEndTime('11:30 AM');
    setDescription('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ScheduleItem) => {
    setEditingItemId(item.id);
    setActivity(item.activity);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setDescription(item.description);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    let updated = [...schedule];

    if (editingItemId) {
      updated = updated.map((s) =>
        s.id === editingItemId
          ? {
              ...s,
              activity: activity.trim(),
              startTime: startTime.trim(),
              endTime: endTime.trim(),
              description: description.trim(),
              notes: notes.trim(),
            }
          : s
      );
    } else {
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        activity: activity.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        description: description.trim(),
        notes: notes.trim(),
      };
      updated.push(newItem);
    }

    onUpdateEvent({ ...event, schedule: updated });
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateEvent({
      ...event,
      schedule: schedule.filter((s) => s.id !== id),
    });
    setActivityToDeleteId(null);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const updated = [...schedule];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    onUpdateEvent({ ...event, schedule: updated });
  };

  // Suggest schedule with AI
  const handleGenerateAISchedule = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'daySchedule',
          eventData: event,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedule with Gemini');
      }

      const parsed = await response.json();
      const items = Array.isArray(parsed) ? parsed : parsed.daySchedule || [];
      if (items.length > 0) {
        const mapped = items.map((it: any, idx: number) => ({
          id: `sch-ai-${Date.now()}-${idx}`,
          startTime: it.startTime || '10:00 AM',
          endTime: it.endTime || '11:00 AM',
          activity: it.activity || it.title || 'Ceremony Activity',
          description: it.description || '',
          notes: it.notes || '',
        }));
        onUpdateEvent({ ...event, schedule: mapped });
      }
    } catch (err: any) {
      console.warn('Schedule generation fallback:', err);
      const fallbackSchedule = [
        {
          id: `sch-fb-1`,
          startTime: '09:00 AM',
          endTime: '11:00 AM',
          activity: 'Venue Arrival & Vendor Setup Verification',
          description: 'Sound check, floral styling inspection, and catering setup.',
          notes: 'Coordinator on-site',
        },
        {
          id: `sch-fb-2`,
          startTime: '11:30 AM',
          endTime: '01:30 PM',
          activity: 'Main Rituals & Guest Welcome',
          description: 'Traditional welcome with garland offerings and refreshing beverages.',
          notes: 'Photographer ready for entrance',
        },
        {
          id: `sch-fb-3`,
          startTime: '01:30 PM',
          endTime: '03:30 PM',
          activity: 'Festive Royal Feast & Lunch',
          description: 'Multi-course regional buffet with live culinary stations.',
          notes: 'Coordinate warm refills',
        },
        {
          id: `sch-fb-4`,
          startTime: '06:00 PM',
          endTime: '10:00 PM',
          activity: 'Evening Entertainment, Speeches & Dinner',
          description: 'Musical performances, cake cutting, toasts, and open dance floor.',
          notes: 'Buffer time included before wrap up',
        },
      ];
      onUpdateEvent({ ...event, schedule: fallbackSchedule });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6C4AB6]" />
            <h3 className="font-bold text-lg text-[#252336] font-['Outfit']">
              Event-Day Master Itinerary
            </h3>
          </div>
          <p className="text-xs text-[#777482] mt-1">
            Chronological milestone schedule from initial welcoming to final celebration wrap-up.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAISchedule}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#FF7F6A] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gemini Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-Suggest Schedule
              </>
            )}
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        </div>
      </div>

      {/* Schedule Items */}
      {schedule.length === 0 ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center shadow-xs">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-base text-[#252336] font-['Outfit']">No Schedule Created Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Build your run-of-show or let Gemini automatically formulate an itinerary based on your event duration.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#6C4AB6] text-white text-xs font-semibold"
          >
            + Add First Activity
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {schedule.map((item, idx) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-purple-50/20 transition"
            >
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-[#6C4AB6] text-center min-w-[100px] shrink-0 font-mono">
                  <span className="text-xs font-bold">{item.startTime}</span>
                  <span className="text-[10px] text-slate-400">to {item.endTime}</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#252336] font-['Outfit']">
                    {item.activity}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-[#777482] mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.notes && (
                    <span className="inline-block mt-1 text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      Note: {item.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions & Reorder */}
              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleMoveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-100 transition cursor-pointer"
                  title="Move earlier"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveItem(idx, 'down')}
                  disabled={idx === schedule.length - 1}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-100 transition cursor-pointer"
                  title="Move later"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 text-slate-400 hover:text-[#6C4AB6] rounded-md hover:bg-slate-100 transition cursor-pointer ml-1"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActivityToDeleteId(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
                {editingItemId ? 'Edit Activity' : 'Add Activity to Itinerary'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Traditional Varmala & Rose Petal Shower"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 06:15 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 07:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Sequence of Events</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Stage garland exchange by lake with cold pyros and flute melodies"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coordinator Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Keep 4 rose varmalas ready with bridal party coordinators"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
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
                  {editingItemId ? 'Save Changes' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Activity Deletion */}
      <ConfirmDialog
        isOpen={Boolean(activityToDeleteId)}
        title="Delete Scheduled Activity?"
        message="Are you sure you want to remove this activity from your event-day itinerary?"
        confirmText="Delete Activity"
        onConfirm={() => {
          if (activityToDeleteId) {
            handleDeleteItem(activityToDeleteId);
          }
        }}
        onCancel={() => setActivityToDeleteId(null)}
      />
    </div>
  );
}
