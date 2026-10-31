import React from 'react';
import {
  Sparkles,
  Heart,
  Cake,
  Calendar,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  AlertCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Share2,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check,
  Search,
  Filter,
  MessageSquare,
  Palette,
  DollarSign,
  ListTodo,
  UserCheck,
  Building2,
  CalendarDays,
  RefreshCw,
  Sliders,
  Send,
  Eye,
  Menu,
} from 'lucide-react';
import { EventCategory, TaskPriority, PaymentStatus, BookingStatus } from '../../types';

export const CategoryIcons: Record<EventCategory, React.ComponentType<{ className?: string }>> = {
  wedding: Heart,
  birthday: Cake,
  anniversary: Calendar,
  college_fest: GraduationCap,
  corporate: Briefcase,
  community: Users,
  other: Compass,
};

export const CategoryLabels: Record<EventCategory, string> = {
  wedding: 'Wedding & Engagement',
  birthday: 'Birthday Celebration',
  anniversary: 'Anniversary',
  college_fest: 'College Fest & Party',
  corporate: 'Corporate Event',
  community: 'Community & Cultural',
  other: 'Custom Event',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    urgent: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[priority] || styles.medium}`}
    >
      {priority.toUpperCase()}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
    paid: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Paid' },
    partially_paid: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Partially Paid' },
    unpaid: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Unpaid' },
  };

  const current = styles[status] || styles.unpaid;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
    booked: { bg: 'bg-purple-50 border-purple-200', text: 'text-[#6C4AB6]', label: 'Booked' },
    shortlisted: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Shortlisted' },
    contacted: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Contacted' },
    researching: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', label: 'Researching' },
    cancelled: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Cancelled' },
  };

  const current = styles[status] || styles.researching;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
}
