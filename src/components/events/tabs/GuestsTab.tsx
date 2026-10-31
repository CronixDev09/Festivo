import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Search,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { EventData, Guest, GuestGroup, InvitationStatus, RsvpStatus } from '../../../types';
import { calculateGuestStats } from '../../../lib/calculations';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface GuestsTabProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
}

export function GuestsTab({ event, onUpdateEvent }: GuestsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [rsvpFilter, setRsvpFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [guestToDeleteId, setGuestToDeleteId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState<GuestGroup>('family');
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus>('sent');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('awaiting');
  const [attendeesCount, setAttendeesCount] = useState<number>(1);
  const [dietaryPreferences, setDietaryPreferences] = useState('Vegetarian');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const guests = event.guests || [];
  const stats = calculateGuestStats(guests);

  const handleOpenAddModal = () => {
    setEditingGuestId(null);
    setName('');
    setPhone('');
    setEmail('');
    setGroup('family');
    setInvitationStatus('sent');
    setRsvpStatus('awaiting');
    setAttendeesCount(1);
    setDietaryPreferences('Vegetarian');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setName(guest.name);
    setPhone(guest.phone);
    setEmail(guest.email);
    setGroup(guest.group);
    setInvitationStatus(guest.invitationStatus);
    setRsvpStatus(guest.rsvpStatus);
    setAttendeesCount(guest.attendeesCount || 1);
    setDietaryPreferences(guest.dietaryPreferences || 'Vegetarian');
    setNotes(guest.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updated = [...guests];

    if (editingGuestId) {
      updated = updated.map((g) =>
        g.id === editingGuestId
          ? {
              ...g,
              name: name.trim(),
              phone: phone.trim(),
              email: email.trim(),
              group,
              invitationStatus,
              rsvpStatus,
              attendeesCount: Number(attendeesCount) || 1,
              dietaryPreferences: dietaryPreferences.trim(),
              notes: notes.trim(),
            }
          : g
      );
    } else {
      const newGuest: Guest = {
        id: `gst-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        group,
        invitationStatus,
        rsvpStatus,
        attendeesCount: Number(attendeesCount) || 1,
        dietaryPreferences: dietaryPreferences.trim(),
        notes: notes.trim(),
      };
      updated.unshift(newGuest);
    }

    onUpdateEvent({ ...event, guests: updated });
    setIsModalOpen(false);
  };

  const handleDeleteGuest = (id: string) => {
    const updated = guests.filter((g) => g.id !== id);
    onUpdateEvent({ ...event, guests: updated });
    setGuestToDeleteId(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (guests.length === 0) {
      setStatusMessage('Guest list is empty. Add guests first to export.');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'Group', 'Invited', 'RSVP', 'Headcount', 'Dietary', 'Notes'];
    const rows = guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${(g.phone || '').replace(/"/g, '""')}"`,
      `"${(g.email || '').replace(/"/g, '""')}"`,
      `"${g.group}"`,
      `"${g.invitationStatus}"`,
      `"${g.rsvpStatus}"`,
      g.attendeesCount,
      `"${(g.dietaryPreferences || '').replace(/"/g, '""')}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Guests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (eventReader) => {
      try {
        const text = eventReader.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length <= 1) {
          setStatusMessage('CSV file appears empty or missing data rows.');
          setTimeout(() => setStatusMessage(null), 3000);
          return;
        }

        const newGuests: Guest[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
          if (parts[0]) {
            newGuests.push({
              id: `gst-imp-${Date.now()}-${i}`,
              name: parts[0],
              phone: parts[1] || '',
              email: parts[2] || '',
              group: (['family', 'friends', 'colleagues', 'vip', 'other'].includes(parts[3]?.toLowerCase())
                ? parts[3].toLowerCase()
                : 'family') as GuestGroup,
              invitationStatus: parts[4] === 'sent' ? 'sent' : 'not_sent',
              rsvpStatus: (['attending', 'declined', 'awaiting'].includes(parts[5]?.toLowerCase())
                ? parts[5].toLowerCase()
                : 'awaiting') as RsvpStatus,
              attendeesCount: parseInt(parts[6], 10) || 1,
              dietaryPreferences: parts[7] || 'Vegetarian',
              notes: parts[8] || '',
            });
          }
        }

        if (newGuests.length > 0) {
          onUpdateEvent({
            ...event,
            guests: [...newGuests, ...guests],
          });
          setStatusMessage(`Successfully imported ${newGuests.length} guests!`);
          setTimeout(() => setStatusMessage(null), 3500);
        }
      } catch (err) {
        setStatusMessage('Failed to parse CSV file. Ensure standard comma-separated format.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.dietaryPreferences.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = groupFilter === 'all' || g.group === groupFilter;
    const matchesRsvp = rsvpFilter === 'all' || g.rsvpStatus === rsvpFilter;
    return matchesSearch && matchesGroup && matchesRsvp;
  });

  return (
    <div className="space-y-6">
      {/* RSVP Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Total Invited</span>
          <div className="text-2xl font-bold text-[#252336] mt-1 font-['Outfit']">
            {stats.totalInvited}
          </div>
          <span className="text-[11px] text-purple-700 font-medium">
            Across {stats.totalEntries} invitation cards
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Confirmed Attendees</span>
          <div className="text-2xl font-bold text-[#248A5A] mt-1 font-['Outfit']">
            {stats.confirmedAttendees}
          </div>
          <span className="text-[11px] text-[#248A5A] font-medium">RSVP Confirmed</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Pending Responses</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-['Outfit']">
            {stats.pendingResponses}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting response</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Declined Invitations</span>
          <div className="text-2xl font-bold text-slate-500 mt-1 font-['Outfit']">
            {stats.declinedCount}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Not attending</span>
        </div>
      </div>

      {/* Search, Filter & CSV Actions */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search guest name, phone, email, diet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6] text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6C4AB6]"
          >
            <option value="all">All Groups</option>
            <option value="family">Family</option>
            <option value="friends">Friends</option>
            <option value="colleagues">Colleagues</option>
            <option value="vip">VIP / Dignitaries</option>
            <option value="other">Other</option>
          </select>

          <select
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6C4AB6]"
          >
            <option value="all">All RSVP Statuses</option>
            <option value="attending">Attending</option>
            <option value="awaiting">Awaiting</option>
            <option value="declined">Declined</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="p-2 text-slate-600 hover:text-[#6C4AB6] hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Export Guest List CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            className="p-2 text-slate-600 hover:text-[#6C4AB6] hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Import Guest List CSV"
          >
            <Upload className="w-4 h-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-[#252336] font-['Outfit']">No Guests In List</h4>
            <p className="text-xs text-slate-500 mt-1">
              Add individual attendees or import a spreadsheet CSV of contacts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">RSVP Status</th>
                  <th className="py-3 px-4">Attendees</th>
                  <th className="py-3 px-4">Dietary Preference</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-purple-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{guest.name}</div>
                      {guest.notes && <div className="text-[11px] text-slate-400 italic">{guest.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{guest.phone || '—'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{guest.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#6C4AB6] text-[11px] font-semibold uppercase">
                        {guest.group}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {guest.rsvpStatus === 'attending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#248A5A] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Attending
                        </span>
                      )}
                      {guest.rsvpStatus === 'awaiting' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Awaiting
                        </span>
                      )}
                      {guest.rsvpStatus === 'declined' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3 h-3" /> Declined
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#252336]">{guest.attendeesCount}</td>
                    <td className="py-3.5 px-4 text-slate-700">{guest.dietaryPreferences}</td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(guest)}
                        className="p-1.5 text-slate-400 hover:text-[#6C4AB6] rounded-md hover:bg-slate-100 transition cursor-pointer"
                        title="Edit Guest"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGuestToDeleteId(guest.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                        title="Delete Guest"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
                {editingGuestId ? 'Edit Guest' : 'Add Guest to List'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram & Sunita Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guest Group</label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value as GuestGroup)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                    <option value="colleagues">Colleagues</option>
                    <option value="vip">VIP / Dignitaries</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98123 45678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sharma@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RSVP Status</label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    <option value="awaiting">Awaiting</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Attendees</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dietary Preference</label>
                  <input
                    type="text"
                    value={dietaryPreferences}
                    onChange={(e) => setDietaryPreferences(e.target.value)}
                    placeholder="e.g. Pure Veg, Jain, Vegan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Seating Requests</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Needs ground floor room, attending from Mumbai with 2 kids"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
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
                  {editingGuestId ? 'Save Changes' : 'Save Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Status Notification Toast */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#252336] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Confirmation Dialog for Guest Deletion */}
      <ConfirmDialog
        isOpen={Boolean(guestToDeleteId)}
        title="Remove Guest?"
        message="Are you sure you want to remove this guest from the invitation and headcount list?"
        confirmText="Remove Guest"
        onConfirm={() => {
          if (guestToDeleteId) {
            handleDeleteGuest(guestToDeleteId);
          }
        }}
        onCancel={() => setGuestToDeleteId(null)}
      />
    </div>
  );
}
