export type EventCategory =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'college_fest'
  | 'corporate'
  | 'community'
  | 'other';

export type VenueType = 'indoor' | 'outdoor' | 'both';
export type BudgetFlexibility = 'strict' | 'moderate' | 'flexible';
export type FoodPreference = 'veg' | 'non-veg' | 'mixed' | 'jain' | 'vegan';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid';
export type BookingStatus = 'researching' | 'contacted' | 'shortlisted' | 'booked' | 'cancelled';
export type GuestGroup = 'family' | 'friends' | 'colleagues' | 'vip' | 'other';
export type RsvpStatus = 'awaiting' | 'attending' | 'declined';
export type InvitationStatus = 'not_sent' | 'sent';

export interface BudgetItem {
  id: string;
  category: string;
  allocatedAmount: number;
  explanation: string;
  percentage?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  category: string;
  status: TaskStatus;
}

export interface TimelineStage {
  id: string;
  stage: string;
  deadline: string;
  requiredActivity: string;
}

export interface VendorChecklistItem {
  id: string;
  category: string;
  purpose: string;
  suggestedQuestions: string[];
}

export interface FoodSuggestions {
  menuIdeas: Array<{ category: string; items: string[] }>;
  dietaryNotes: string;
  budgetAlternatives: string;
}

export interface DecorationIdeas {
  theme: string;
  colors: string[];
  concepts: string[];
  lighting: string;
  venueStyling: string;
}

export interface ScheduleItem {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  description: string;
  notes?: string;
}

export interface Recommendations {
  costSaving: string[];
  risks: string[];
  importantReminders: string[];
}

export interface AIEventPlan {
  summary: {
    concept: string;
    theme: string;
    description: string;
    mainPriorities: string[];
  };
  budgetBreakdown: BudgetItem[];
  tasks: TaskItem[];
  timeline: TimelineStage[];
  vendorChecklist: VendorChecklistItem[];
  foodSuggestions: FoodSuggestions;
  decorationIdeas: DecorationIdeas;
  daySchedule: ScheduleItem[];
  recommendations: Recommendations;
  generatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  vendorName?: string;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  date: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  quotedPrice: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  group: GuestGroup;
  invitationStatus: InvitationStatus;
  rsvpStatus: RsvpStatus;
  attendeesCount: number;
  dietaryPreferences: string;
  notes?: string;
}

export interface Moodboard {
  id: string;
  themeTitle: string;
  themeDescription: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  decorationConcepts: string[];
  lightingIdeas: string;
  venueStyling: string;
  tableStyling: string;
  affordableAlternatives: string;
  createdAt: string;
}

export interface EventData {
  id: string;
  name: string;
  category: EventCategory;
  date: string;
  city: string;
  venueDetails: string;
  guestCount: number;
  durationHours: number;
  venueType: VenueType;
  
  // Budget
  totalBudget: number;
  budgetFlexibility: BudgetFlexibility;
  priorityCategories: string[];
  emergencyReservePercent: number;
  
  // Preferences
  theme: string;
  preferredColors: string[];
  foodPreference: FoodPreference;
  regionalPreference: string;
  culturalRituals: string;
  atmosphere: string;
  additionalNotes: string;
  
  // Plan & management entities
  aiPlan?: AIEventPlan;
  expenses: Expense[];
  tasks: TaskItem[];
  vendors: Vendor[];
  guests: Guest[];
  moodboards: Moodboard[];
  schedule: ScheduleItem[];

  createdAt: string;
  updatedAt: string;
}

export interface ProposedChange {
  id: string;
  summary: string;
  type: 'budget' | 'task' | 'schedule' | 'vendor' | 'preference' | 'plan';
  explanation: string;
  diff: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  applyPayload: Partial<EventData> & {
    newTask?: {
      title?: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      category?: string;
    };
    newScheduleItem?: {
      startTime?: string;
      endTime?: string;
      activity?: string;
      description?: string;
    };
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  proposedChange?: ProposedChange;
  changeStatus?: 'pending' | 'accepted' | 'rejected';
}
