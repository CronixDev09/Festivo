import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { EventWorkspace } from './components/events/EventWorkspace';
import { EventWizard } from './components/wizard/EventWizard';
import { SettingsModal } from './components/settings/SettingsModal';
import { EventData } from './types';
import {
  getAllEvents,
  saveEvent,
  deleteEvent as deleteStoredEvent,
} from './lib/storage';

export default function App() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'workspace' | 'events'>('landing');
  const [workspaceTab, setWorkspaceTab] = useState<string>('overview');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const loaded = getAllEvents();
    setEvents(loaded);
    if (loaded.length > 0) {
      setSelectedEventId(loaded[0].id);
    }
    setIsHydrated(true);
  }, []);

  const refreshEvents = () => {
    const loaded = getAllEvents();
    setEvents(loaded);
    if (loaded.length > 0 && (!selectedEventId || !loaded.some((e) => e.id === selectedEventId))) {
      setSelectedEventId(loaded[0].id);
    }
  };

  const handleUpdateEvent = (updated: EventData) => {
    saveEvent(updated);
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleDeleteEvent = (id: string) => {
    deleteStoredEvent(id);
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    if (selectedEventId === id) {
      if (updated.length > 0) {
        setSelectedEventId(updated[0].id);
        setCurrentView('dashboard');
      } else {
        setSelectedEventId(null);
        setCurrentView('dashboard');
      }
    }
  };

  const handleEventCreated = (newEvent: EventData) => {
    saveEvent(newEvent);
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
    setIsWizardOpen(false);
    setWorkspaceTab('overview');
    setCurrentView('workspace');
  };

  const handleOpenWorkspace = (eventId: string, tab: string = 'overview') => {
    setSelectedEventId(eventId);
    setWorkspaceTab(tab);
    setCurrentView('workspace');
  };

  const handleExploreDemo = () => {
    setIsWizardOpen(true);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#6C4AB6] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col text-[#252336]">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view, evtId) => {
          if (view === 'workspace' && evtId) {
            handleOpenWorkspace(evtId);
          } else if (view === 'events') {
            setCurrentView('dashboard');
          } else {
            setCurrentView(view as any);
          }
        }}
        events={events}
        selectedEventId={selectedEventId}
        onSelectEvent={(id) => setSelectedEventId(id)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {isWizardOpen ? (
          <EventWizard
            onCancel={() => setIsWizardOpen(false)}
            onEventCreated={handleEventCreated}
          />
        ) : currentView === 'landing' ? (
          <LandingPage
            onStartPlanning={() => setIsWizardOpen(true)}
            onExploreDemo={handleExploreDemo}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'workspace' && selectedEvent ? (
          <EventWorkspace
            key={selectedEvent.id}
            event={selectedEvent}
            onUpdateEvent={handleUpdateEvent}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onDeleteEvent={handleDeleteEvent}
            initialTab={workspaceTab}
          />
        ) : (
          <DashboardView
            events={events}
            onOpenWizard={() => setIsWizardOpen(true)}
            onOpenEvent={handleOpenWorkspace}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataChanged={refreshEvents}
      />
    </div>
  );
}
