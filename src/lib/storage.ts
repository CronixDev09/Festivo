import { EventData } from '../types';

const STORAGE_KEY = 'festivo_ai_store_v1';
const CURRENT_SCHEMA_VERSION = 1;

export interface StorageData {
  schemaVersion: number;
  events: EventData[];
  preferences: {
    currency: string;
    theme: 'light';
    userName?: string;
  };
}

export function getStoredData(): StorageData {
  if (typeof window === 'undefined') {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      events: [],
      preferences: { currency: 'INR', theme: 'light' },
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: StorageData = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        events: [],
        preferences: { currency: 'INR', theme: 'light' },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw) as StorageData;
    if (!parsed.events || !Array.isArray(parsed.events)) {
      parsed.events = [];
    }

    // Filter out any demo Udaipur wedding event as requested by the user
    const cleanedEvents = parsed.events.filter(
      (e) => e.id !== 'evt-diwali-royal-wedding-2026'
    );

    if (cleanedEvents.length !== parsed.events.length) {
      parsed.events = cleanedEvents;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      events: [],
      preferences: { currency: 'INR', theme: 'light' },
    };
  }
}

export function saveStoredData(data: StorageData): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

export function getAllEvents(): EventData[] {
  return getStoredData().events;
}

export function getEventById(id: string): EventData | undefined {
  const events = getAllEvents();
  return events.find((e) => e.id === id);
}

export function saveEvent(event: EventData): boolean {
  const data = getStoredData();
  const index = data.events.findIndex((e) => e.id === event.id);
  event.updatedAt = new Date().toISOString();
  
  if (index >= 0) {
    data.events[index] = event;
  } else {
    data.events.unshift(event);
  }
  
  return saveStoredData(data);
}

export function deleteEvent(id: string): boolean {
  const data = getStoredData();
  data.events = data.events.filter((e) => e.id !== id);
  return saveStoredData(data);
}

export function resetAllData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const fresh: StorageData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      events: [],
      preferences: { currency: 'INR', theme: 'light' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return true;
  } catch (err) {
    console.error('Failed to reset data:', err);
    return false;
  }
}

export function getStorageUsage(): { usedBytes: number; usedKB: string; quotaApprox: string } {
  if (typeof window === 'undefined') return { usedBytes: 0, usedKB: '0 KB', quotaApprox: '5 MB' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    return {
      usedBytes: bytes,
      usedKB: `${(bytes / 1024).toFixed(1)} KB`,
      quotaApprox: '5 MB',
    };
  } catch {
    return { usedBytes: 0, usedKB: '0 KB', quotaApprox: '5 MB' };
  }
}
