import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Clock,
  IndianRupee,
  Layers,
  Palette,
  Utensils,
  HeartHandshake,
  Bot,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EventData,
  EventCategory,
  VenueType,
  BudgetFlexibility,
  FoodPreference,
} from '../../types';
import { formatINR } from '../../lib/calculations';
import { createDefaultPlanForEvent, applyPlanToEvent } from '../../lib/plan-generator';
import { CategoryIcons, CategoryLabels } from '../common';

interface EventWizardProps {
  onCancel: () => void;
  onEventCreated: (event: EventData) => void;
}

const CATEGORY_LIST: EventCategory[] = [
  'wedding',
  'birthday',
  'anniversary',
  'college_fest',
  'corporate',
  'community',
  'other',
];

const BUDGET_PRESETS = [
  { label: '₹50,000', value: 50000 },
  { label: '₹2,00,000', value: 200000 },
  { label: '₹5,00,000', value: 500000 },
  { label: '₹15,00,000', value: 1500000 },
  { label: '₹35,00,000', value: 3500000 },
];

const COMMON_PRIORITIES = [
  'Venue & Staging',
  'Catering & Drinks',
  'Photography & Drone Video',
  'Floral & Theme Decor',
  'Entertainment & DJ / Band',
  'Bridal / Party Attire',
  'Guest Hospitality & Logistics',
];

const COLOR_PRESETS = [
  { name: 'Royal Rajputana', colors: ['#6C4AB6', '#FF7F6A', '#FFD700'] },
  { name: 'Marigold Festive', colors: ['#FF9933', '#800020', '#FFF8DC'] },
  { name: 'Emerald & Gold', colors: ['#065F46', '#D97706', '#F3F4F6'] },
  { name: 'Pastel Blush', colors: ['#F472B6', '#E0E7FF', '#FDF2F8'] },
  { name: 'Ocean Twilight', colors: ['#1E3A8A', '#0284C7', '#E0F2FE'] },
];

export function EventWizard({ onCancel, onEventCreated }: EventWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStepText, setGenerationStepText] = useState<string>('Initializing AI Planner...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<EventCategory>('wedding');
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [city, setCity] = useState<string>('Jaipur, Rajasthan');
  const [venueDetails, setVenueDetails] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [durationHours, setDurationHours] = useState<number>(8);
  const [venueType, setVenueType] = useState<VenueType>('both');

  // Budget state
  const [totalBudget, setTotalBudget] = useState<number>(500000);
  const [budgetFlexibility, setBudgetFlexibility] = useState<BudgetFlexibility>('moderate');
  const [priorityCategories, setPriorityCategories] = useState<string[]>([
    'Venue & Staging',
    'Catering & Drinks',
    'Floral & Theme Decor',
  ]);
  const [emergencyReservePercent, setEmergencyReservePercent] = useState<number>(10);

  // Preferences
  const [theme, setTheme] = useState<string>('Grand Heritage with Festive Lights');
  const [preferredColors, setPreferredColors] = useState<string[]>(['#6C4AB6', '#FF7F6A', '#FFD700']);
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('mixed');
  const [regionalPreference, setRegionalPreference] = useState<string>('North Indian Royal & Live Chaat counters');
  const [culturalRituals, setCulturalRituals] = useState<string>('Traditional welcome, main ceremony, evening dinner');
  const [atmosphere, setAtmosphere] = useState<string>('Vibrant, elegant and culturally warm');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 2) {
      if (!name.trim()) errors.name = 'Please enter an event name.';
      if (!date) errors.date = 'Please select an event date.';
      if (!city.trim()) errors.city = 'Please specify the city.';
      if (guestCount < 1) errors.guestCount = 'Guest count must be at least 1.';
    }

    if (step === 3) {
      if (totalBudget <= 0) errors.totalBudget = 'Please enter a valid budget greater than ₹0.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
      setErrorMessage(null);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setErrorMessage(null);
  };

  const togglePriority = (p: string) => {
    setPriorityCategories((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleFinalSubmit = async (useAI: boolean = true) => {
    setIsGenerating(true);
    setErrorMessage(null);

    const baseEvent: EventData = {
      id: `evt-${Date.now()}`,
      name: name.trim() || 'My Celebration',
      category,
      date,
      city: city.trim(),
      venueDetails: venueDetails.trim(),
      guestCount: Number(guestCount) || 50,
      durationHours: Number(durationHours) || 6,
      venueType,
      totalBudget: Number(totalBudget) || 100000,
      budgetFlexibility,
      priorityCategories,
      emergencyReservePercent,
      theme: theme.trim() || 'Celebration',
      preferredColors,
      foodPreference,
      regionalPreference: regionalPreference.trim(),
      culturalRituals: culturalRituals.trim(),
      atmosphere: atmosphere.trim(),
      additionalNotes: additionalNotes.trim(),
      expenses: [],
      tasks: [],
      vendors: [],
      guests: [],
      moodboards: [],
      schedule: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!useAI) {
      // Manual creation without AI
      setIsGenerating(false);
      onEventCreated(baseEvent);
      return;
    }

    // AI Generation flow
    try {
      const stepInterval = setInterval(() => {
        const steps = [
          'Analyzing regional Indian traditions & cuisine...',
          'Balancing INR budget allocations & vendor margins...',
          'Crafting comprehensive task checklist & deadlines...',
          'Curating aesthetic color palette & lighting accents...',
          'Building chronological event-day itinerary...',
        ];
        setGenerationStepText(steps[Math.floor(Math.random() * steps.length)]);
      }, 1200);

      let generatedPlan: any = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch('/api/ai/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseEvent),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          generatedPlan = await response.json();
        }
      } catch (networkOrTimeoutErr) {
        console.warn('AI API took too long or had network issue, using smart domain planner fallback:', networkOrTimeoutErr);
      }

      clearInterval(stepInterval);

      let finalEvent: EventData;
      if (!generatedPlan || !generatedPlan.budgetBreakdown) {
        const defaultPlan = createDefaultPlanForEvent(baseEvent);
        finalEvent = applyPlanToEvent(baseEvent, defaultPlan);
      } else {
        finalEvent = applyPlanToEvent(baseEvent, generatedPlan);
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6C4AB6', '#FF7F6A', '#FFD700', '#248A5A'],
        });
      } catch {
        // ignore if not supported
      }

      setIsGenerating(false);
      onEventCreated(finalEvent);
    } catch (err: any) {
      console.warn('AI Generation could not complete:', err);
      // Even in catch block, never leave user hanging without a plan!
      const defaultPlan = createDefaultPlanForEvent(baseEvent);
      const finalEvent = applyPlanToEvent(baseEvent, defaultPlan);
      setIsGenerating(false);
      onEventCreated(finalEvent);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-purple-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6C4AB6]">
            Smart Event Wizard
          </span>
          <h2 className="text-2xl font-bold text-[#252336] font-['Outfit']">
            Create Your Celebration
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-2">
          {['Category', 'Basic Info', 'Budget', 'Preferences', 'Review'].map((label, idx) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === idx + 1
                    ? 'bg-[#6C4AB6] text-white ring-4 ring-purple-100'
                    : currentStep > idx + 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1 hidden sm:block">
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#6C4AB6] to-[#FF7F6A] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p>{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => handleFinalSubmit(false)}
            className="px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-semibold shrink-0 transition cursor-pointer"
          >
            Save Manually
          </button>
        </div>
      )}

      {/* Step Contents */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 shadow-sm">
        {/* Step 1: Category */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#252336] font-['Outfit']">
                What type of celebration are you organizing?
              </h3>
              <p className="text-xs text-[#777482]">
                We personalize budget models, rituals, and timelines specifically to your celebration category.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {CATEGORY_LIST.map((catKey) => {
                const IconComp = CategoryIcons[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#6C4AB6] bg-purple-50/50 shadow-xs ring-2 ring-purple-200'
                        : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isSelected ? 'bg-[#6C4AB6] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#252336]">
                        {CategoryLabels[catKey]}
                      </div>
                      <div className="text-[11px] text-[#777482] mt-0.5">
                        {catKey === 'wedding' && 'Multi-day ceremonies, mandap & grand feasts'}
                        {catKey === 'birthday' && 'Milestone party, cake, games & photobooth'}
                        {catKey === 'anniversary' && 'Intimate reception, speeches & dining'}
                        {catKey === 'college_fest' && 'Pro-nites, stalls, security & permissions'}
                        {catKey === 'corporate' && 'Conferences, summits & executive dinners'}
                        {catKey === 'community' && 'Diwali, Navratri, Pooja pandals & gatherings'}
                        {catKey === 'other' && 'Custom celebrations with flexible planning'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#252336] font-['Outfit']">
                Key Details of the Event
              </h3>
              <p className="text-xs text-[#777482]">
                Provide location, dates, and expected guest count.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-1">
                Event Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav & Meera Grand Wedding, Sahil's 25th Birthday"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
              />
              {fieldErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                />
                {fieldErrors.date && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  City / Location *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Jaipur, Bengaluru, Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                />
                {fieldErrors.city && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.city}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Expected Guests *
                </label>
                <input
                  type="number"
                  min="5"
                  max="5000"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Venue Type
                </label>
                <select
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value as VenueType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                >
                  <option value="indoor">Indoor Banquet / Hall</option>
                  <option value="outdoor">Outdoor Lawn / Farmhouse</option>
                  <option value="both">Both (Lawn + Ballroom)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-1">
                Specific Venue or Landmark (Optional)
              </label>
              <input
                type="text"
                value={venueDetails}
                onChange={(e) => setVenueDetails(e.target.value)}
                placeholder="e.g. Taj Lake Palace, Leela Lawns, or Home Garden"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#252336] font-['Outfit']">
                Budget Allocation & Constraints (INR ₹)
              </h3>
              <p className="text-xs text-[#777482]">
                Our AI uses standard Indian market estimates to intelligently divide your funds.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-1">
                Total Budget (INR ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm font-semibold"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setTotalBudget(preset.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      totalBudget === preset.value
                        ? 'bg-[#6C4AB6] text-white border-[#6C4AB6]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Budget Flexibility
                </label>
                <select
                  value={budgetFlexibility}
                  onChange={(e) => setBudgetFlexibility(e.target.value as BudgetFlexibility)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                >
                  <option value="strict">Strict (Do not exceed)</option>
                  <option value="moderate">Moderate (±10% allowable)</option>
                  <option value="flexible">Flexible (Quality first)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Emergency Contingency Reserve
                </label>
                <select
                  value={emergencyReservePercent}
                  onChange={(e) => setEmergencyReservePercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                >
                  <option value={0}>0% (Deploy 100% directly)</option>
                  <option value={5}>5% Buffer ({formatINR(totalBudget * 0.05)})</option>
                  <option value={10}>10% Buffer ({formatINR(totalBudget * 0.1)})</option>
                  <option value={15}>15% Buffer ({formatINR(totalBudget * 0.15)})</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-2">
                Priority Spending Categories (Select 2-4)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_PRIORITIES.map((priority) => {
                  const isChecked = priorityCategories.includes(priority);
                  return (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => togglePriority(priority)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition cursor-pointer ${
                        isChecked
                          ? 'border-[#6C4AB6] bg-purple-50 text-[#6C4AB6]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{priority}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#252336] font-['Outfit']">
                Cultural, Theme & Dietary Preferences
              </h3>
              <p className="text-xs text-[#777482]">
                Provide guidelines so the menus and decorations reflect your personal heritage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Food & Catering Preference
                </label>
                <select
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value as FoodPreference)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                >
                  <option value="veg">Pure Vegetarian</option>
                  <option value="mixed">Mixed (Vegetarian & Non-Vegetarian)</option>
                  <option value="jain">Strict Jain (No root vegetables)</option>
                  <option value="vegan">Vegan / Plant-based</option>
                  <option value="non-veg">Non-Vegetarian Focused</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252336] mb-1">
                  Regional Cuisine Style
                </label>
                <input
                  type="text"
                  value={regionalPreference}
                  onChange={(e) => setRegionalPreference(e.target.value)}
                  placeholder="e.g. Rajasthani Thali, South Indian Sadhya, Awadhi Mughlai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-1">
                Theme & Aesthetic Vision
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Royal Marigold Court, Bohemian Sunset Lawn, Cyber Neon Night"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
              />
            </div>

            {/* Color Palette Presets */}
            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-1.5">
                Suggested Color Palette
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((p) => {
                  const isSelected = JSON.stringify(preferredColors) === JSON.stringify(p.colors);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setPreferredColors(p.colors)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
                        isSelected ? 'border-[#6C4AB6] bg-purple-50 ring-1 ring-[#6C4AB6]' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-700">{p.name}</span>
                      <div className="flex gap-1">
                        {p.colors.map((c) => (
                          <span
                            key={c}
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-1">
                Cultural Ceremonies & Rituals
              </label>
              <input
                type="text"
                value={culturalRituals}
                onChange={(e) => setCulturalRituals(e.target.value)}
                placeholder="e.g. Sangeet, Haldi, Baraat, Pheras, Cake Cutting, Awards"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252336] mb-1">
                Additional Instructions or Constraints
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Need acoustic live music, eco-friendly seed paper invites, sound permit till 10 PM"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6C4AB6] focus:outline-none text-xs"
              />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#252336] font-['Outfit']">
                Review Your Celebration Details
              </h3>
              <p className="text-xs text-[#777482]">
                Verify everything before letting Gemini generate your personalized plan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">Event</span>
                <p className="font-bold text-sm text-[#252336]">{name || 'Celebration'}</p>
                <p className="text-slate-600 mt-1">{CategoryLabels[category]}</p>
                <p className="text-slate-600">{date} • {city}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-[#6C4AB6] font-semibold uppercase tracking-wider block mb-1">Budget</span>
                <p className="font-bold text-base text-[#6C4AB6] font-['Outfit']">{formatINR(totalBudget)}</p>
                <p className="text-slate-600 mt-1">{guestCount} Guests (~{formatINR(totalBudget / (guestCount || 1))}/person)</p>
                <p className="text-slate-600">{emergencyReservePercent}% Reserve ({formatINR(totalBudget * (emergencyReservePercent / 100))})</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">Preferences</span>
                <p className="font-semibold text-slate-800">{theme}</p>
                <p className="text-slate-600 mt-0.5">Food: {foodPreference.toUpperCase()}</p>
                <p className="text-slate-600">{regionalPreference}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">Priorities</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {priorityCategories.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Generation Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-rose-50 border border-purple-200 flex items-start gap-3">
              <Bot className="w-5 h-5 text-[#6C4AB6] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-xs text-[#252336]">
                  Gemini AI Strategy Engine Ready
                </h4>
                <p className="text-xs text-[#777482] mt-0.5">
                  Clicking "Generate AI Plan" will synthesize budget distributions, custom vendor questions, preparation tasks, food suggestions, and an event-day schedule.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white font-semibold text-xs shadow-md shadow-purple-200 transition cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition cursor-pointer"
              >
                Save Manually
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(true)}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#FF7F6A] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-300 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Plan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen / modal loading overlay during AI generation */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C4AB6] to-[#FF7F6A] flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-300">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-[#252336] mt-5 font-['Outfit']">
              Planning Your Celebration
            </h3>
            <p className="text-xs text-[#6C4AB6] font-semibold mt-2 animate-pulse">
              {generationStepText}
            </p>
            <p className="text-xs text-[#777482] mt-3">
              Google Gemini is balancing budgets, allocating tasks, formulating food menus, and curating an hourly itinerary.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
