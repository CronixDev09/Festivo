import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Cake,
  Calendar,
  GraduationCap,
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Palette,
  IndianRupee,
  Layers,
  Bot,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';
import { EventCategory } from '../../types';
import { formatINR } from '../../lib/calculations';

interface LandingPageProps {
  onStartPlanning: () => void;
  onExploreDemo: () => void;
  onNavigateToDashboard: () => void;
}

const CATEGORIES: Array<{
  id: EventCategory;
  name: string;
  tagline: string;
  icon: any;
  color: string;
  accent: string;
}> = [
  {
    id: 'wedding',
    name: 'Weddings & Engagements',
    tagline: 'Mandap, Sangeet, Mehendi & Royal Feasts',
    icon: Heart,
    color: 'from-amber-500/20 to-rose-500/20 text-rose-600',
    accent: '#FF7F6A',
  },
  {
    id: 'birthday',
    name: 'Birthdays & Milestones',
    tagline: 'Themes, Custom Cakes, Games & Photobooths',
    icon: Cake,
    color: 'from-pink-500/20 to-purple-500/20 text-purple-600',
    accent: '#6C4AB6',
  },
  {
    id: 'anniversary',
    name: 'Silver & Golden Anniversaries',
    tagline: 'Intimate Banquets, Speeches & Memories',
    icon: Calendar,
    color: 'from-blue-500/20 to-indigo-500/20 text-indigo-600',
    accent: '#3B82F6',
  },
  {
    id: 'college_fest',
    name: 'College Fests & Youth Nights',
    tagline: 'Concerts, Stage Setup, Stalls & Permissions',
    icon: GraduationCap,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600',
    accent: '#10B981',
  },
  {
    id: 'corporate',
    name: 'Corporate Galas & Summits',
    tagline: 'AV Tech, Keynotes, Networking & Catering',
    icon: Briefcase,
    color: 'from-slate-500/20 to-zinc-500/20 text-slate-700',
    accent: '#475569',
  },
  {
    id: 'community',
    name: 'Religious & Cultural Gatherings',
    tagline: 'Diwali Melas, Pooja Pandals & Community Feasts',
    icon: Users,
    color: 'from-orange-500/20 to-yellow-500/20 text-amber-600',
    accent: '#F59E0B',
  },
];

export function LandingPage({
  onStartPlanning,
  onExploreDemo,
  onNavigateToDashboard,
}: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'budget' | 'moodboard' | 'schedule' | 'copilot'>('budget');

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-purple-200/40 via-rose-100/30 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-[#6C4AB6] text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#6C4AB6]" />
              <span>Next-Gen Event Planning Powered by Google Gemini</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#252336] leading-[1.15] font-['Outfit']">
              Your Celebration,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4AB6] via-[#855FD9] to-[#FF7F6A]">
                Planned Smarter.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg sm:text-xl text-[#777482] leading-relaxed">
              Plan unforgettable celebrations with AI-powered ideas, smart budgets, organized timelines, and everything you need in one place. Tailored for Indian weddings, birthdays, corporate summits, and cultural gatherings.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartPlanning}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#5A3C9E] hover:from-[#5A3C9E] hover:to-[#4C3187] text-white font-semibold text-base shadow-lg shadow-purple-300/50 hover:shadow-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                Plan My Event
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#252336] border border-slate-200 font-semibold text-base shadow-xs hover:shadow-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FF7F6A]" />
                View Dashboard
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#777482]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#248A5A]" /> Real-time INR (₹) Budget Calculations
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#248A5A]" /> 100% Local Browser Persistence
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#248A5A]" /> Instant AI Copilot with Proposal Approval
              </span>
            </div>
          </div>

          {/* Interactive Live Product Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-purple-100 bg-white shadow-2xl shadow-purple-900/10 overflow-hidden">
            {/* Window bar */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-500">
                  Festivo AI Workspace — Udaipur Destination Wedding
                </span>
              </div>

              {/* Preview tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setActivePreviewTab('budget')}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                    activePreviewTab === 'budget'
                      ? 'bg-[#6C4AB6] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Budget Breakdown
                </button>
                <button
                  onClick={() => setActivePreviewTab('moodboard')}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                    activePreviewTab === 'moodboard'
                      ? 'bg-[#6C4AB6] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Aesthetic Moodboard
                </button>
                <button
                  onClick={() => setActivePreviewTab('schedule')}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                    activePreviewTab === 'schedule'
                      ? 'bg-[#6C4AB6] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day Schedule
                </button>
                <button
                  onClick={() => setActivePreviewTab('copilot')}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                    activePreviewTab === 'copilot'
                      ? 'bg-[#6C4AB6] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI Copilot
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-purple-50/20">
              {activePreviewTab === 'budget' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                      <span className="text-xs text-[#777482] font-medium">Total Planned Budget</span>
                      <div className="text-2xl font-bold text-[#6C4AB6] mt-1 font-['Outfit']">{formatINR(1500000)}</div>
                      <span className="text-[11px] text-purple-600 font-medium">40 Suites + 250 Guests</span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-xs text-[#777482] font-medium">Actual Committed</span>
                      <div className="text-2xl font-bold text-[#248A5A] mt-1 font-['Outfit']">{formatINR(580000)}</div>
                      <span className="text-[11px] text-emerald-600 font-medium">38% Utilized</span>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                      <span className="text-xs text-[#777482] font-medium">Remaining Cashflow</span>
                      <div className="text-2xl font-bold text-blue-700 mt-1 font-['Outfit']">{formatINR(920000)}</div>
                      <span className="text-[11px] text-blue-600 font-medium">On Track</span>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
                      <span className="text-xs text-[#777482] font-medium">Emergency Reserve</span>
                      <div className="text-2xl font-bold text-amber-700 mt-1 font-['Outfit']">{formatINR(150000)}</div>
                      <span className="text-[11px] text-amber-600 font-medium">10% Buffer Intact</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#777482] mb-1.5">
                      <span>Budget Allocation Progress</span>
                      <span>₹5,80,000 of ₹15,00,000 (38.7%)</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-[#6C4AB6] h-full" style={{ width: '37%' }} title="Venue (37%)" />
                      <div className="bg-[#FF7F6A] h-full" style={{ width: '28%' }} title="Catering (28%)" />
                      <div className="bg-amber-400 h-full" style={{ width: '15%' }} title="Decor (15%)" />
                      <div className="bg-emerald-500 h-full" style={{ width: '9%' }} title="Photo (9%)" />
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#777482]">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6C4AB6]" /> Venue (37%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7F6A]" /> Catering & Feasts (28%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Floral Decor (15%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Photography (9%)</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'moodboard' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-lg text-[#252336] font-['Outfit']">Royal Rajputana with Saffron & Crimson</h4>
                      <p className="text-xs text-[#777482]">Sunset Mewari palace courtyard aesthetics with marigold cascades and antique brass urlis</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#6C4AB6' }} />
                        #6C4AB6
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#FF7F6A' }} />
                        #FF7F6A
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#FFD700' }} />
                        #FFD700
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100">
                      <span className="text-xs font-bold text-[#6C4AB6] uppercase tracking-wider block mb-1">Entrance & Mandap</span>
                      <p className="text-xs text-[#252336] leading-relaxed">
                        Grand palace gateway festooned with yellow marigold garlands and brass urlis with floating water lilies. Sunset lakeside mandap in carved sandstone pillars with raw crimson silk.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">Ambient Lighting</span>
                      <p className="text-xs text-[#252336] leading-relaxed">
                        Warm 2700K fairy light canopies over the historic courtyard, hanging brass Moroccan lamps, and 200+ scented beeswax diyas placed along stone parapets.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">Cost-Saving Tip</span>
                      <p className="text-xs text-[#252336] leading-relaxed">
                        Source fresh Genda flowers directly from local mandi instead of agency middlemen; saves ~₹40,000 while ensuring maximum morning freshness!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'schedule' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#777482] pb-2 border-b border-slate-100">
                    <span className="font-semibold text-[#252336]">Event Day Chronological Itinerary</span>
                    <span>6 Scheduled Milestones</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                      <div className="px-2 py-1 rounded-md bg-purple-100 text-[#6C4AB6] font-mono text-xs font-bold shrink-0">
                        10:00 AM
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#252336]">Haldi & Phoolon Ki Holi</div>
                        <p className="text-[11px] text-[#777482] mt-0.5">Turmeric ritual with yellow petal showers and live dhol rhythms on the palace lawn.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                      <div className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-mono text-xs font-bold shrink-0">
                        04:30 PM
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#252336]">Royal Baraat Procession</div>
                        <p className="text-[11px] text-[#777482] mt-0.5">Groom arrival with vintage convertible, live brass ensemble, and dancing relatives.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                      <div className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-xs font-bold shrink-0">
                        06:15 PM
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#252336]">Varmala by Sunset</div>
                        <p className="text-[11px] text-[#777482] mt-0.5">Lakeside stage garland exchange with gentle cold pyros and classical shehnai.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                      <div className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-xs font-bold shrink-0">
                        09:30 PM
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#252336]">Grand Royal Feast & Sitar Night</div>
                        <p className="text-[11px] text-[#777482] mt-0.5">Mewari royal buffet dinner accompanied by live acoustic Sufi melodies.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'copilot' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs flex items-start gap-3">
                    <Bot className="w-5 h-5 text-[#6C4AB6] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#252336]">
                        "I noticed your catering budget is ₹4,20,000 for 250 guests. Would you like me to optimize the dessert counter to feature artisanal regional sweets, saving ₹35,000?"
                      </p>
                      <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-purple-200 flex items-center justify-between">
                        <div className="text-[11px]">
                          <span className="font-semibold text-[#6C4AB6]">Proposed AI Modification:</span>
                          <span className="text-slate-600 ml-2">Reduce Catering to ₹3,85,000 & Add Mithai Stall</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-2.5 py-1 rounded bg-[#6C4AB6] text-white text-[11px] font-semibold">
                            Approve
                          </button>
                          <button className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Categories Section */}
      <section className="py-16 bg-white border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#252336] font-['Outfit']">
              Engineered for Every Indian Celebration
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#777482]">
              Every event type comes with tailored checklists, dietary considerations, vendor questions, and cultural rituals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={onStartPlanning}
                  className="p-6 rounded-2xl border border-slate-200/80 hover:border-purple-300 bg-[#FFFDF9] hover:bg-white shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition duration-200`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#252336] group-hover:text-[#6C4AB6] transition font-['Outfit']">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#777482] leading-relaxed">
                    {cat.tagline}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#6C4AB6]">
                    Plan this celebration <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#FFFDF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C4AB6]">
              Simple & Powerful
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252336] mt-2 font-['Outfit']">
              How Festivo AI Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#777482]">
              From your initial idea to the event-day schedule in 3 smart steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-8 rounded-2xl bg-white border border-purple-100 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C4AB6] font-bold flex items-center justify-center text-lg mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-[#252336] font-['Outfit']">Define Details & Budget</h3>
              <p className="mt-2 text-sm text-[#777482] leading-relaxed">
                Enter guest count, city, venue preference, budget in INR, dietary wishes (Pure Veg, Jain, etc.), and desired atmosphere.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-purple-100 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-[#FF7F6A] font-bold flex items-center justify-center text-lg mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-[#252336] font-['Outfit']">Gemini Crafts the Strategy</h3>
              <p className="mt-2 text-sm text-[#777482] leading-relaxed">
                Gemini constructs an exhaustive budget allocation, preparation task timeline, vendor questions, color palette, and hourly itinerary.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-purple-100 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#248A5A] font-bold flex items-center justify-center text-lg mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-[#252336] font-['Outfit']">Manage & Execute Flawlessly</h3>
              <p className="mt-2 text-sm text-[#777482] leading-relaxed">
                Track actual expenses, check off tasks, negotiate vendor quotes, import guest lists, and tweak anything anytime with your AI Copilot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-white border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252336] font-['Outfit']">
              Complete Celebration Command Center
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#777482]">
              Every tool you need to eliminate wedding and celebration stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C4AB6] flex items-center justify-center mb-4">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#252336] font-['Outfit']">INR Budget & Expense Tracker</h4>
              <p className="mt-1.5 text-xs text-[#777482] leading-relaxed">
                Calculates actual vs. planned expenses, payment milestones (Paid, Partial, Unpaid), and triggers automated warnings before you overspend.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-[#FF7F6A] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#252336] font-['Outfit']">Guest RSVP & Dietary Matrix</h4>
              <p className="mt-1.5 text-xs text-[#777482] leading-relaxed">
                Track invitations, headcounts, dietary requirements (Jain, Veg, Non-Veg, Vegan), and export or import guest lists easily via CSV.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Palette className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#252336] font-['Outfit']">Text-Based Aesthetic Moodboard</h4>
              <p className="mt-1.5 text-xs text-[#777482] leading-relaxed">
                Generates color palettes with HEX codes, lighting recipes, venue styling advice, and affordable material substitutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#252336] font-['Outfit']">Event-Day Timeline</h4>
              <p className="mt-1.5 text-xs text-[#777482] leading-relaxed">
                Chronological schedule from morning puja to late-night banquet, with overlap detection and customizable buffer alerts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#248A5A] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#252336] font-['Outfit']">Safe AI Proposals</h4>
              <p className="mt-1.5 text-xs text-[#777482] leading-relaxed">
                AI never overrides your event data blindly. Every modification must be reviewed and accepted by you through a clear comparison preview.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#252336] font-['Outfit']">Instant JSON Backup & Restore</h4>
              <p className="mt-1.5 text-xs text-[#777482] leading-relaxed">
                All data lives safely in your browser. Download full JSON backups or import existing celebrations across devices with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[#6C4AB6] to-[#5A3C9E] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Ready to plan your next celebration?
          </h2>
          <p className="mt-4 text-purple-100 text-base max-w-xl mx-auto">
            Experience the peace of mind of having an intelligent, organized copilot for your wedding, birthday, or corporate gala.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartPlanning}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#6C4AB6] font-bold text-base shadow-lg transition duration-200 cursor-pointer active:scale-95"
            >
              Plan My Event Now
            </button>
            <button
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-purple-700/60 hover:bg-purple-700/80 text-white border border-purple-400/40 font-semibold text-base transition duration-200 cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#252336] text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C4AB6] to-[#FF7F6A] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-bold font-['Outfit']">Festivo AI</span>
              <p className="text-xs text-slate-400">Your Celebration, Planned Smarter.</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right">
            <span>Primary Market: India (INR ₹)</span> • <span>Powered by Google Gemini</span>
            <p className="mt-1">All event data is saved locally to your device with full privacy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
