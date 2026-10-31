import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  IndianRupee,
  X,
  ExternalLink,
} from 'lucide-react';
import { EventData, Vendor, BookingStatus, PaymentStatus } from '../../../types';
import { formatINR } from '../../../lib/calculations';
import { BookingStatusBadge, PaymentStatusBadge } from '../../common';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface VendorsTabProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
}

const VENDOR_CATEGORIES = [
  'Venue',
  'Catering',
  'Photography',
  'Decoration',
  'Entertainment',
  'Florist',
  'Transportation',
  'Makeup & Styling',
  'Invitations',
  'Other',
];

export function VendorsTab({ event, onUpdateEvent }: VendorsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorToDeleteId, setVendorToDeleteId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Venue');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<number>(0);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('researching');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [notes, setNotes] = useState('');

  const vendors = event.vendors || [];

  const handleOpenAddModal = () => {
    setEditingVendorId(null);
    setName('');
    setCategory('Venue');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setQuotedPrice(0);
    setBookingStatus('researching');
    setPaymentStatus('unpaid');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vendor: Vendor) => {
    setEditingVendorId(vendor.id);
    setName(vendor.name);
    setCategory(vendor.category);
    setContactPerson(vendor.contactPerson);
    setPhone(vendor.phone);
    setEmail(vendor.email);
    setQuotedPrice(vendor.quotedPrice);
    setBookingStatus(vendor.bookingStatus);
    setPaymentStatus(vendor.paymentStatus);
    setNotes(vendor.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updated = [...vendors];

    if (editingVendorId) {
      updated = updated.map((v) =>
        v.id === editingVendorId
          ? {
              ...v,
              name: name.trim(),
              category,
              contactPerson: contactPerson.trim(),
              phone: phone.trim(),
              email: email.trim(),
              quotedPrice: Number(quotedPrice),
              bookingStatus,
              paymentStatus,
              notes: notes.trim(),
            }
          : v
      );
    } else {
      const newVendor: Vendor = {
        id: `vnd-${Date.now()}`,
        name: name.trim(),
        category,
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        quotedPrice: Number(quotedPrice),
        bookingStatus,
        paymentStatus,
        notes: notes.trim(),
      };
      updated.unshift(newVendor);
    }

    onUpdateEvent({ ...event, vendors: updated });
    setIsModalOpen(false);
  };

  const handleDeleteVendor = (id: string) => {
    const updated = vendors.filter((v) => v.id !== id);
    onUpdateEvent({ ...event, vendors: updated });
    setVendorToDeleteId(null);
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || v.bookingStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const bookedCount = vendors.filter((v) => v.bookingStatus === 'booked').length;
  const totalQuoted = vendors.reduce((sum, v) => sum + (Number(v.quotedPrice) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Vendor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Total Vendors Tracked</span>
          <div className="text-2xl font-bold text-[#252336] mt-1 font-['Outfit']">{vendors.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Booked & Confirmed</span>
          <div className="text-2xl font-bold text-[#248A5A] mt-1 font-['Outfit']">{bookedCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482]">Total Quotations Sum</span>
          <div className="text-2xl font-bold text-[#6C4AB6] mt-1 font-['Outfit']">{formatINR(totalQuoted)}</div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor name, category, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6] text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6C4AB6]"
          >
            <option value="all">All Categories</option>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6C4AB6]"
          >
            <option value="all">All Booking Statuses</option>
            <option value="researching">Researching</option>
            <option value="contacted">Contacted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center shadow-xs">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-sm text-[#252336] font-['Outfit']">No Vendors Recorded</h4>
          <p className="text-xs text-slate-500 mt-1">
            Track caterers, venues, photographers, and decorators along with quotations and booking contracts.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-[#6C4AB6] text-white text-xs font-semibold"
          >
            + Add First Vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-5 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#6C4AB6] text-[11px] font-semibold">
                    {vendor.category}
                  </span>
                  <BookingStatusBadge status={vendor.bookingStatus} />
                </div>

                <h4 className="font-bold text-base text-[#252336] mt-2 font-['Outfit'] truncate">
                  {vendor.name}
                </h4>

                {vendor.contactPerson && (
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    Contact: {vendor.contactPerson}
                  </p>
                )}

                <div className="mt-3 space-y-1 text-xs text-[#777482]">
                  {vendor.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                {vendor.notes && (
                  <p className="mt-2.5 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 italic">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Quote & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Quoted Price</span>
                  <span className="text-sm font-bold text-[#6C4AB6] font-['Outfit']">
                    {formatINR(vendor.quotedPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(vendor)}
                    className="p-1.5 text-slate-400 hover:text-[#6C4AB6] rounded-md hover:bg-slate-100 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setVendorToDeleteId(vendor.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
                {editingVendorId ? 'Edit Vendor Record' : 'Add New Vendor'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Palace Banquet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    {VENDOR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Singh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@palace.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quoted Price (INR ₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Booking Status</label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Terms / Deliverables</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Includes drone coverage and high-res photo albums delivery within 30 days"
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
                  {editingVendorId ? 'Save Changes' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Vendor Deletion */}
      <ConfirmDialog
        isOpen={Boolean(vendorToDeleteId)}
        title="Delete Vendor?"
        message="Are you sure you want to remove this vendor record from your organizer?"
        confirmText="Delete Vendor"
        onConfirm={() => {
          if (vendorToDeleteId) {
            handleDeleteVendor(vendorToDeleteId);
          }
        }}
        onCancel={() => setVendorToDeleteId(null)}
      />
    </div>
  );
}
