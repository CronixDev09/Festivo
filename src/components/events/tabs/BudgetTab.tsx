import React, { useState } from 'react';
import {
  IndianRupee,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { EventData, Expense, PaymentStatus } from '../../../types';
import { formatINR, calculateBudgetStats } from '../../../lib/calculations';
import { PaymentStatusBadge } from '../../common';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface BudgetTabProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
}

const COMMON_EXPENSE_CATEGORIES = [
  'Venue & Staging',
  'Catering & Feasts',
  'Decor & Floral Styling',
  'Photography & Video',
  'Entertainment & Sound',
  'Bridal & Groom Attire',
  'Jewelry & Gifts',
  'Invitations & Stationary',
  'Transport & Logistics',
  'Emergency & Contingency',
  'Other Expenses',
];

export function BudgetTab({ event, onUpdateEvent }: BudgetTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Venue & Staging');
  const [amount, setAmount] = useState<number>(0);
  const [vendorName, setVendorName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Total budget quick edit
  const [isEditingTotalBudget, setIsEditingTotalBudget] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState(event.totalBudget);

  const budgetStats = calculateBudgetStats(event.totalBudget, event.expenses || []);

  const handleOpenAddModal = () => {
    setEditingExpenseId(null);
    setTitle('');
    setCategory('Venue & Staging');
    setAmount(0);
    setVendorName('');
    setPaymentStatus('unpaid');
    setPaidAmount(0);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount);
    setVendorName(exp.vendorName || '');
    setPaymentStatus(exp.paymentStatus);
    setPaidAmount(exp.paidAmount || 0);
    setDate(exp.date);
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    const currentExpenses = [...(event.expenses || [])];

    if (editingExpenseId) {
      const idx = currentExpenses.findIndex((exp) => exp.id === editingExpenseId);
      if (idx >= 0) {
        currentExpenses[idx] = {
          id: editingExpenseId,
          title: title.trim(),
          category,
          amount: Number(amount),
          vendorName: vendorName.trim(),
          paymentStatus,
          paidAmount: paymentStatus === 'paid' ? Number(amount) : Number(paidAmount),
          date,
          notes: notes.trim(),
        };
      }
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        title: title.trim(),
        category,
        amount: Number(amount),
        vendorName: vendorName.trim(),
        paymentStatus,
        paidAmount: paymentStatus === 'paid' ? Number(amount) : Number(paidAmount),
        date,
        notes: notes.trim(),
      };
      currentExpenses.unshift(newExp);
    }

    onUpdateEvent({
      ...event,
      expenses: currentExpenses,
    });
    setIsModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateEvent({
      ...event,
      expenses: (event.expenses || []).filter((e) => e.id !== id),
    });
    setExpenseToDeleteId(null);
  };

  const handleSaveTotalBudget = () => {
    if (newTotalBudget > 0) {
      onUpdateEvent({
        ...event,
        totalBudget: Number(newTotalBudget),
      });
      setIsEditingTotalBudget(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning banner if over budget */}
      {budgetStats.isOverBudget && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Budget Alert: Overallocated by {formatINR(budgetStats.actualExpenses - budgetStats.totalBudget)}</span>
              <p className="text-rose-700 mt-0.5">Your actual committed expenses have exceeded the target budget limit. Consider renegotiating vendor contracts or asking Festivo AI for cost-cutting alternatives.</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#777482]">
            <span>Target Budget</span>
            <button
              onClick={() => {
                setNewTotalBudget(event.totalBudget);
                setIsEditingTotalBudget(!isEditingTotalBudget);
              }}
              className="text-[#6C4AB6] hover:underline font-medium text-[11px] cursor-pointer"
            >
              {isEditingTotalBudget ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingTotalBudget ? (
            <div className="mt-2 flex gap-1.5">
              <input
                type="number"
                value={newTotalBudget}
                onChange={(e) => setNewTotalBudget(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded-lg focus:outline-none focus:border-[#6C4AB6]"
              />
              <button
                onClick={handleSaveTotalBudget}
                className="px-2.5 py-1 rounded-lg bg-[#6C4AB6] text-white text-xs font-semibold cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="text-2xl font-bold text-[#6C4AB6] mt-1 font-['Outfit']">
              {formatINR(event.totalBudget)}
            </div>
          )}
          <span className="text-[11px] text-[#777482] mt-1 block">
            {event.budgetFlexibility} flexibility
          </span>
        </div>

        {/* Committed Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482] block">Committed Expenses</span>
          <div className="text-2xl font-bold text-[#248A5A] mt-1 font-['Outfit']">
            {formatINR(budgetStats.actualExpenses)}
          </div>
          <span className="text-[11px] text-[#248A5A] font-medium mt-1 block">
            {budgetStats.rawUtilization}% of total budget
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482] block">Remaining Budget</span>
          <div
            className={`text-2xl font-bold mt-1 font-['Outfit'] ${
              budgetStats.remainingBudget < 0 ? 'text-rose-600' : 'text-blue-700'
            }`}
          >
            {formatINR(budgetStats.remainingBudget)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {budgetStats.remainingBudget >= 0 ? 'Available for booking' : 'Deficit to balance'}
          </span>
        </div>

        {/* Paid Cashflow */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs">
          <span className="text-xs text-[#777482] block">Paid vs. Pending</span>
          <div className="text-2xl font-bold text-[#252336] mt-1 font-['Outfit']">
            {formatINR(budgetStats.totalPaid)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            {formatINR(budgetStats.pendingPayments)} pending payment
          </span>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2">
        <div className="flex justify-between text-xs font-semibold text-[#777482]">
          <span>Budget Utilization Status</span>
          <span>
            {formatINR(budgetStats.actualExpenses)} / {formatINR(event.totalBudget)} ({budgetStats.rawUtilization}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              budgetStats.isOverBudget
                ? 'bg-rose-500'
                : budgetStats.rawUtilization > 85
                ? 'bg-amber-500'
                : 'bg-[#6C4AB6]'
            }`}
            style={{ width: `${Math.min(100, budgetStats.rawUtilization)}%` }}
          />
        </div>
      </div>

      {/* Expense Management Header & Table */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
              Expense Log & Payment Milestones
            </h3>
            <p className="text-xs text-[#777482]">
              Track vendor invoices, advance tokens, and pending dues in Indian Rupees.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Expenses List */}
        {(event.expenses || []).length === 0 ? (
          <div className="p-10 text-center">
            <IndianRupee className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No expenses recorded yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 text-xs font-semibold text-[#6C4AB6] hover:underline cursor-pointer"
            >
              + Record First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Title & Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(event.expenses || []).map((exp) => (
                  <tr key={exp.id} className="hover:bg-purple-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{exp.title}</div>
                      {exp.vendorName && (
                        <div className="text-[11px] text-slate-500">Vendor: {exp.vendorName}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#252336] font-['Outfit']">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <PaymentStatusBadge status={exp.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {formatINR(exp.paidAmount || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.date}</td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-1.5 text-slate-400 hover:text-[#6C4AB6] rounded-md hover:bg-slate-100 transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpenseToDeleteId(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                        title="Delete"
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

      {/* Expense Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
                {editingExpenseId ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stage floral mandap advance, Sitar player booking"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    {COMMON_EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6] font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Royal Caterers, Tanvi Films"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Fully Paid</option>
                  </select>
                </div>

                {paymentStatus === 'partially_paid' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Amount Paid So Far (₹)</label>
                    <input
                      type="number"
                      min="0"
                      max={amount}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 50% balance due 3 days before wedding"
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
                  {editingExpenseId ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Expense Deletion */}
      <ConfirmDialog
        isOpen={Boolean(expenseToDeleteId)}
        title="Delete Expense Record?"
        message="Are you sure you want to delete this expense record? The allocated amount and remaining balance will be automatically recalculated."
        confirmText="Delete Expense"
        onConfirm={() => {
          if (expenseToDeleteId) {
            handleDeleteExpense(expenseToDeleteId);
          }
        }}
        onCancel={() => setExpenseToDeleteId(null)}
      />
    </div>
  );
}
