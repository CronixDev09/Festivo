import { Expense, TaskItem, Guest } from '../types';

/**
 * Format numbers in the Indian number formatting system (e.g. ₹1,000, ₹25,000, ₹1,50,000, ₹10,00,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  const str = absAmount.toString();
  let result = '';

  if (str.length <= 3) {
    result = str;
  } else {
    // Last 3 digits
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    // Group preceding digits into groups of two
    const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedOthers},${lastThree}`;
  }

  return `${isNegative ? '-' : ''}₹${result}`;
}

export function calculateBudgetStats(totalBudget: number, expenses: Expense[]) {
  const actualExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBudget = totalBudget - actualExpenses;
  const utilization = totalBudget > 0 ? (actualExpenses / totalBudget) * 100 : 0;
  const isOverBudget = actualExpenses > totalBudget && totalBudget > 0;

  // Total paid so far
  const totalPaid = expenses.reduce((sum, item) => {
    if (item.paymentStatus === 'paid') return sum + (Number(item.amount) || 0);
    if (item.paymentStatus === 'partially_paid') return sum + (Number(item.paidAmount) || 0);
    return sum;
  }, 0);

  const pendingPayments = actualExpenses - totalPaid;

  return {
    totalBudget,
    actualExpenses,
    remainingBudget,
    utilization: Math.min(100, Math.round(utilization)),
    rawUtilization: Math.round(utilization),
    isOverBudget,
    totalPaid,
    pendingPayments,
  };
}

export function calculateTaskStats(tasks: TaskItem[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  ).length;

  return {
    total,
    completed,
    inProgress,
    pending,
    progressPercent,
    overdue,
  };
}

export function calculateGuestStats(guests: Guest[]) {
  const totalGuests = guests.length;
  const totalInvited = guests.reduce((sum, g) => sum + (Number(g.attendeesCount) || 1), 0);
  
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending');
  const confirmedAttendees = attendingGuests.reduce((sum, g) => sum + (Number(g.attendeesCount) || 1), 0);

  const awaitingGuests = guests.filter((g) => g.rsvpStatus === 'awaiting');
  const pendingResponses = awaitingGuests.reduce((sum, g) => sum + (Number(g.attendeesCount) || 1), 0);

  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');
  const declinedCount = declinedGuests.reduce((sum, g) => sum + (Number(g.attendeesCount) || 1), 0);

  return {
    totalEntries: totalGuests,
    totalInvited,
    confirmedAttendees,
    pendingResponses,
    declinedCount,
  };
}

export function calculateDaysRemaining(eventDate: string): { days: number; isPast: boolean; label: string } {
  if (!eventDate) return { days: 0, isPast: false, label: 'Date not set' };
  
  const target = new Date(eventDate);
  const now = new Date();
  
  // Set both to midnight for accurate whole day calculation
  target.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return { days: 0, isPast: false, label: 'Today!' };
  } else if (diffDays === 1) {
    return { days: 1, isPast: false, label: 'Tomorrow' };
  } else if (diffDays > 1) {
    return { days: diffDays, isPast: false, label: `${diffDays} days to go` };
  } else {
    return { days: Math.abs(diffDays), isPast: true, label: `${Math.abs(diffDays)} days ago` };
  }
}
