import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  IndianRupee,
  ListTodo,
  Calendar,
  Utensils,
  Palette,
  Clock,
  ShieldAlert,
  Lightbulb,
  RefreshCw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { EventData, AIEventPlan } from '../../../types';
import { formatINR } from '../../../lib/calculations';
import { createDefaultPlanForEvent, applyPlanToEvent } from '../../../lib/plan-generator';

interface AIPlannerTabProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
  onOpenTab: (tab: string) => void;
}

export function AIPlannerTab({ event, onUpdateEvent, onOpenTab }: AIPlannerTabProps) {
  const [statusNotification, setStatusNotification] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [isFullPlanGenerating, setIsFullPlanGenerating] = useState(false);

  const plan = event.aiPlan;

  const handleRegenerateFullPlan = async () => {
    setIsFullPlanGenerating(true);
    setStatusNotification(null);
    try {
      let freshPlan: AIEventPlan | null = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch('/api/ai/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          freshPlan = await response.json();
        }
      } catch (e) {
        console.warn('API slow or failed, using expert planner fallback', e);
      }

      if (!freshPlan || !freshPlan.budgetBreakdown) {
        const fallback = createDefaultPlanForEvent(event);
        onUpdateEvent(applyPlanToEvent(event, fallback));
      } else {
        onUpdateEvent(applyPlanToEvent(event, freshPlan));
      }
      setStatusNotification({ type: 'success', text: 'Celebration blueprint generated successfully!' });
      setTimeout(() => setStatusNotification(null), 4000);
    } catch (err: any) {
      const fallback = createDefaultPlanForEvent(event);
      onUpdateEvent(applyPlanToEvent(event, fallback));
      setStatusNotification({ type: 'success', text: 'Celebration blueprint generated successfully!' });
      setTimeout(() => setStatusNotification(null), 4000);
    } finally {
      setIsFullPlanGenerating(false);
    }
  };

  const handleRegenerateSection = async (sectionKey: string) => {
    setRegeneratingSection(sectionKey);
    try {
      const response = await fetch('/api/ai/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionKey,
          eventData: event,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to regenerate ${sectionKey}`);
      }

      const freshData = await response.json();
      if (plan) {
        const updatedPlan = { ...plan, [sectionKey]: freshData };
        onUpdateEvent({
          ...event,
          aiPlan: updatedPlan,
        });
      }
    } catch (err: any) {
      setStatusNotification({ type: 'error', text: err.message || `Error regenerating ${sectionKey}` });
      setTimeout(() => setStatusNotification(null), 4000);
    } finally {
      setRegeneratingSection(null);
    }
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center shadow-xs">
        <Bot className="w-16 h-16 text-[#6C4AB6] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#252336] font-['Outfit']">
          No AI Plan Generated Yet
        </h3>
        <p className="text-xs sm:text-sm text-[#777482] max-w-md mx-auto mt-2">
          Let Google Gemini analyze your ₹{event.totalBudget.toLocaleString()} budget and guest requirements to synthesize a comprehensive celebration strategy.
        </p>
        <button
          onClick={handleRegenerateFullPlan}
          disabled={isFullPlanGenerating}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#FF7F6A] text-white font-bold text-xs shadow-md mx-auto cursor-pointer"
        >
          {isFullPlanGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gemini Synthesizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Complete AI Plan
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {statusNotification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            statusNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{statusNotification.text}</span>
        </div>
      )}

      {/* Top Banner with Full Regeneration Option */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-rose-50 rounded-2xl border border-purple-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6C4AB6]" />
            <h3 className="font-bold text-lg text-[#252336] font-['Outfit']">
              Festivo AI Strategic Blueprint
            </h3>
          </div>
          <p className="text-xs text-[#777482] mt-1">
            Generated by Gemini 3.8 Flash • Tailored for {event.guestCount} guests in {event.city} • Last updated: {new Date(plan.generatedAt).toLocaleTimeString()}
          </p>
        </div>

        <button
          onClick={handleRegenerateFullPlan}
          disabled={isFullPlanGenerating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-purple-200 text-[#6C4AB6] text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          {isFullPlanGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Regenerate Entire Plan
        </button>
      </div>

      {/* A. Event Summary Card */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-100 text-[#6C4AB6] text-xs font-bold flex items-center justify-center">
              A
            </span>
            <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
              Executive Concept & Theme
            </h4>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Concept Vision
            </span>
            <h5 className="font-bold text-sm text-[#252336] font-['Outfit']">
              {plan.summary.concept}
            </h5>
            <p className="text-slate-600 mt-2 leading-relaxed">
              {plan.summary.description}
            </p>
          </div>

          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Core Strategic Priorities
            </span>
            <ul className="space-y-1.5 mt-2">
              {(plan.summary.mainPriorities || []).map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#248A5A] shrink-0 mt-0.5" />
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* B. Budget Breakdown Card */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-[#248A5A] text-xs font-bold flex items-center justify-center">
              B
            </span>
            <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
              AI Budget Allocation Model
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRegenerateSection('budgetBreakdown')}
              disabled={regeneratingSection === 'budgetBreakdown'}
              className="text-xs text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {regeneratingSection === 'budgetBreakdown' && <Loader2 className="w-3 h-3 animate-spin" />}
              Regenerate Section
            </button>
            <button
              onClick={() => onOpenTab('budget')}
              className="text-xs font-semibold text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage Expenses <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(plan.budgetBreakdown || []).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-xs text-[#252336]">{item.category}</span>
                  {item.percentage && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-[#6C4AB6] text-[10px] font-bold">
                      {item.percentage}%
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-[#248A5A] mt-1 font-['Outfit']">
                  {formatINR(item.allocatedAmount)}
                </div>
                <p className="text-[11px] text-[#777482] mt-1 leading-snug">
                  {item.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* C & D: Preparation Tasks & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* C. Preparation Tasks */}
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                  C
                </span>
                <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
                  Action Tasks Checklist
                </h4>
              </div>
              <button
                onClick={() => onOpenTab('tasks')}
                className="text-xs font-semibold text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Task Board <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {(plan.tasks || []).slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-[#FFFDF9] border border-slate-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{t.title}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                    <span className="text-[10px] text-purple-700 mt-1 inline-block">
                      Due: {t.dueDate} • {t.category}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* D. Planning Stages Timeline */}
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                D
              </span>
              <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
                Milestone Phases Timeline
              </h4>
            </div>
            <button
              onClick={() => handleRegenerateSection('timeline')}
              disabled={regeneratingSection === 'timeline'}
              className="text-xs text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {regeneratingSection === 'timeline' && <Loader2 className="w-3 h-3 animate-spin" />}
              Regenerate
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {(plan.timeline || []).map((tl) => (
              <div key={tl.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold text-[#6C4AB6]">
                  <span>{tl.stage}</span>
                  <span className="text-[11px] text-slate-500">{tl.deadline}</span>
                </div>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  {tl.requiredActivity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* E. Vendor Checklist & Questions */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-100 text-[#6C4AB6] text-xs font-bold flex items-center justify-center">
              E
            </span>
            <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
              Vendor Category Vetting & Interview Questions
            </h4>
          </div>
          <button
            onClick={() => onOpenTab('vendors')}
            className="text-xs font-semibold text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Vendor Directory <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(plan.vendorChecklist || []).map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-[#FFFDF9] border border-slate-200 text-xs flex flex-col justify-between">
              <div>
                <span className="font-bold text-sm text-[#252336] font-['Outfit'] block">
                  {item.category}
                </span>
                <p className="text-slate-600 mt-1 italic">{item.purpose}</p>

                <div className="mt-3">
                  <span className="font-semibold text-purple-700 text-[11px] block mb-1">
                    Suggested Questions to Ask:
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {(item.suggestedQuestions || []).map((q, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <HelpCircle className="w-3 h-3 text-[#6C4AB6] shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* F. Food Suggestions */}
      {plan.foodSuggestions && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-rose-100 text-[#FF7F6A] text-xs font-bold flex items-center justify-center">
                F
              </span>
              <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
                Catering Delicacies & Culinary Strategy
              </h4>
            </div>
            <button
              onClick={() => handleRegenerateSection('foodSuggestions')}
              disabled={regeneratingSection === 'foodSuggestions'}
              className="text-xs text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {regeneratingSection === 'foodSuggestions' && <Loader2 className="w-3 h-3 animate-spin" />}
              Regenerate Menu
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(plan.foodSuggestions.menuIdeas || []).map((menuSection, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 text-xs">
                <span className="font-bold text-xs text-[#FF7F6A] uppercase tracking-wider block mb-2">
                  {menuSection.category}
                </span>
                <ul className="space-y-1 text-slate-800">
                  {(menuSection.items || []).map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF7F6A]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="font-bold text-[#6C4AB6] block mb-1">Dietary & Regional Protocols:</span>
              <p className="text-slate-700">{plan.foodSuggestions.dietaryNotes}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-bold text-[#248A5A] block mb-1">Catering Cost-Saving Opportunity:</span>
              <p className="text-slate-700">{plan.foodSuggestions.budgetAlternatives}</p>
            </div>
          </div>
        </div>
      )}

      {/* G. Decoration Ideas & Moodboard Link */}
      {plan.decorationIdeas && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-purple-100 text-[#6C4AB6] text-xs font-bold flex items-center justify-center">
                G
              </span>
              <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
                Decoration Concepts & Stage Architecture
              </h4>
            </div>
            <button
              onClick={() => onOpenTab('moodboard')}
              className="text-xs font-semibold text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Moodboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
              <span className="font-bold text-[#6C4AB6] uppercase tracking-wider block mb-1">
                Theme & Concepts
              </span>
              <p className="font-semibold text-slate-900 mb-2">{plan.decorationIdeas.theme}</p>
              <ul className="space-y-1 text-slate-700">
                {(plan.decorationIdeas.concepts || []).map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#6C4AB6]">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="font-bold text-amber-700 uppercase tracking-wider block mb-1">
                Lighting Atmosphere
              </span>
              <p className="text-slate-700 leading-relaxed">{plan.decorationIdeas.lighting}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
              <span className="font-bold text-rose-700 uppercase tracking-wider block mb-1">
                Venue & Mandap Styling
              </span>
              <p className="text-slate-700 leading-relaxed">{plan.decorationIdeas.venueStyling}</p>
            </div>
          </div>
        </div>
      )}

      {/* H. Event-Day Schedule Preview */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              H
            </span>
            <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
              Chronological Event-Day Itinerary
            </h4>
          </div>
          <button
            onClick={() => onOpenTab('schedule')}
            className="text-xs font-semibold text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Full Schedule Board <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {(plan.daySchedule || []).slice(0, 6).map((item) => (
            <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs">
              <div className="px-2 py-1 rounded bg-purple-100 text-[#6C4AB6] font-mono font-bold text-[11px] shrink-0">
                {item.startTime}
              </div>
              <div>
                <span className="font-bold text-slate-900">{item.activity}</span>
                <p className="text-slate-600 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* I. Personalized Recommendations */}
      {plan.recommendations && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                I
              </span>
              <h4 className="font-bold text-base text-[#252336] font-['Outfit']">
                Expert Planning Guardrails & Cost-Saving Tips
              </h4>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Cost Saving */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-1.5 font-bold text-[#248A5A] mb-2 uppercase tracking-wider text-[11px]">
                <TrendingDown className="w-4 h-4" />
                Cost-Saving Opportunities
              </div>
              <ul className="space-y-1.5 text-slate-700">
                {(plan.recommendations.costSaving || []).map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#248A5A] font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
              <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-2 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4" />
                Planning Risks & Bottlenecks
              </div>
              <ul className="space-y-1.5 text-slate-700">
                {(plan.recommendations.risks || []).map((risk, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Reminders */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-2 uppercase tracking-wider text-[11px]">
                <Lightbulb className="w-4 h-4" />
                Critical Coordinations
              </div>
              <ul className="space-y-1.5 text-slate-700">
                {(plan.recommendations.importantReminders || []).map((reminder, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>{reminder}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
