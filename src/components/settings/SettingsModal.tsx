import React, { useRef, useState } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  Trash2,
  HardDrive,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import {
  getStoredData,
  saveStoredData,
  resetAllData,
  getStorageUsage,
} from '../../lib/storage';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export function SettingsModal({ isOpen, onClose, onDataChanged }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const storageInfo = getStorageUsage();

  const handleExportJSON = () => {
    const data = getStoredData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Festivo_AI_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage('Backup exported successfully.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.events || !Array.isArray(parsed.events)) {
          setStatusMessage('Invalid backup format. Missing events array.');
          setTimeout(() => setStatusMessage(null), 3500);
          return;
        }

        saveStoredData(parsed);
        onDataChanged();
        setStatusMessage('Backup imported and restored successfully!');
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 1200);
      } catch (err) {
        setStatusMessage('Failed to parse backup JSON file.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteReset = () => {
    resetAllData();
    onDataChanged();
    setShowResetConfirm(false);
    setStatusMessage('All celebration data cleared.');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 text-xs relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#6C4AB6]" />
            <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
              Settings & Data Management
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-[#6C4AB6] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#248A5A]" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-6 pt-4">
          {/* App Info */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6C4AB6] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#252336] font-['Outfit']">
                Festivo AI v2.0
              </span>
              <p className="text-[11px] text-[#777482] mt-0.5">
                Your Celebration, Planned Smarter. Fast AI generation powered by Google Gemini. All data is saved privately on your device.
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              System Preferences
            </h4>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">Primary Currency</span>
                <p className="text-[11px] text-slate-500">Indian Rupee (INR ₹) with Lakhs & Crores formatting</p>
              </div>
              <span className="font-bold text-[#6C4AB6] font-mono">₹ INR</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">Local Storage Meter</span>
                <p className="text-[11px] text-slate-500">
                  {storageInfo.usedKB} used of approx. {storageInfo.quotaApprox} browser quota
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Healthy
              </span>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Backup & Transfer (JSON)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="p-3 rounded-xl border border-purple-200 hover:bg-purple-50/50 text-[#6C4AB6] font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Backup (JSON)
              </button>

              <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center gap-2 transition cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                Import Backup (JSON)
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Destructive Actions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-rose-700 uppercase tracking-wider text-[11px]">
              Clear Application Data
            </h4>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Wipe all saved events and start from a fresh empty dashboard.
              </p>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#6C4AB6] text-white font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>

        <ConfirmDialog
          isOpen={showResetConfirm}
          title="Clear All Celebration Data?"
          message="Are you sure you want to delete all saved events? This will wipe your local celebrations."
          confirmText="Yes, Clear All Data"
          onConfirm={handleExecuteReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      </div>
    </div>
  );
}
