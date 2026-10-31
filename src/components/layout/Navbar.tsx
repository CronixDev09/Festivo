import React, { useState } from 'react';
import { Sparkles, Calendar, Plus, Settings, Menu, X, ChevronDown, Check } from 'lucide-react';
import { EventData } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, eventId?: string) => void;
  events: EventData[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onOpenSettings: () => void;
  onOpenWizard: () => void;
}

export function Navbar({
  currentView,
  onNavigate,
  events,
  selectedEventId,
  onSelectEvent,
  onOpenSettings,
  onOpenWizard,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C4AB6] to-[#FF7F6A] flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-105 transition duration-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#252336] flex items-center gap-1 font-['Outfit']">
                Festivo <span className="text-[#6C4AB6]">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#777482] block -mt-1">
                Smart Celebrations
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                currentView === 'landing'
                  ? 'text-[#6C4AB6] bg-purple-50'
                  : 'text-[#777482] hover:text-[#252336] hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'text-[#6C4AB6] bg-purple-50'
                  : 'text-[#777482] hover:text-[#252336] hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            {events.length > 0 && (
              <button
                onClick={() => onNavigate('events')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  currentView === 'events'
                    ? 'text-[#6C4AB6] bg-purple-50'
                    : 'text-[#777482] hover:text-[#252336] hover:bg-slate-50'
                }`}
              >
                My Events ({events.length})
              </button>
            )}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Active Event Dropdown */}
          {events.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 text-xs font-medium text-[#252336] transition cursor-pointer max-w-[200px]"
              >
                <Calendar className="w-3.5 h-3.5 text-[#6C4AB6] shrink-0" />
                <span className="truncate">
                  {selectedEvent ? selectedEvent.name : 'Select Event'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#777482] shrink-0 ml-auto" />
              </button>

              {eventDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setEventDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Active Event
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {events.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => {
                          onSelectEvent(evt.id);
                          onNavigate('workspace', evt.id);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition cursor-pointer ${
                          evt.id === selectedEventId ? 'text-[#6C4AB6] font-semibold bg-purple-50/60' : 'text-[#252336]'
                        }`}
                      >
                        <span className="truncate">{evt.name}</span>
                        {evt.id === selectedEventId && <Check className="w-3.5 h-3.5 text-[#6C4AB6]" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-1 mt-1 px-1">
                    <button
                      onClick={onOpenWizard}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#6C4AB6] font-medium hover:bg-purple-50 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-[#252336] hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Settings & Data Management"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary CTA: Plan My Event */}
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#5A3C9E] hover:from-[#5A3C9E] hover:to-[#4C3187] text-white text-sm font-semibold shadow-sm shadow-purple-300 hover:shadow-md transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Plan My Event
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C4AB6] text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Plan
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
          >
            Dashboard
          </button>
          {events.length > 0 && (
            <button
              onClick={() => {
                onNavigate('events');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
            >
              My Events ({events.length})
            </button>
          )}
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2"
            >
              <Settings className="w-4 h-4" />
              Settings & Data
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
