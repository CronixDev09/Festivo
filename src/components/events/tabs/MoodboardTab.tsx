import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Lightbulb,
  Building,
  Utensils,
  X,
  Loader2,
} from 'lucide-react';
import { EventData, Moodboard } from '../../../types';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface MoodboardTabProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
}

export function MoodboardTab({ event, onUpdateEvent }: MoodboardTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Edit / Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMoodboardId, setEditingMoodboardId] = useState<string | null>(null);
  const [moodboardToDeleteId, setMoodboardToDeleteId] = useState<string | null>(null);

  // Form state
  const [themeTitle, setThemeTitle] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6C4AB6');
  const [secondaryColor, setSecondaryColor] = useState('#FF7F6A');
  const [accentColor, setAccentColor] = useState('#FFD700');
  const [conceptsText, setConceptsText] = useState('');
  const [lightingIdeas, setLightingIdeas] = useState('');
  const [venueStyling, setVenueStyling] = useState('');
  const [tableStyling, setTableStyling] = useState('');
  const [affordableAlternatives, setAffordableAlternatives] = useState('');

  const moodboards = event.moodboards || [];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-moodboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: event.name,
          category: event.category,
          theme: event.theme,
          colors: event.preferredColors,
          city: event.city,
          culturalRituals: event.culturalRituals,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Moodboard generation failed');
      }

      const newBoard: Moodboard = await response.json();
      onUpdateEvent({
        ...event,
        moodboards: [newBoard, ...moodboards],
      });
    } catch (err: any) {
      console.warn('Moodboard generation fallback:', err);
      const fallbackBoard: Moodboard = {
        id: `mb-${Date.now()}`,
        themeTitle: event.theme || 'Royal Indian Celebration',
        themeDescription: `Curated aesthetic featuring ${event.preferredColors?.join(', ') || 'festive palettes'} customized for ${event.city}.`,
        primaryColor: event.preferredColors?.[0] || '#6C4AB6',
        secondaryColor: event.preferredColors?.[1] || '#FF7F6A',
        accentColor: event.preferredColors?.[2] || '#FFD700',
        decorationConcepts: [
          'Floral entrance arch with fresh marigolds & tuberoses',
          'Brass Urlis with floating rose petals & fragrant candles',
          'Silk drapery canopy with soft fairy lighting',
          'Photo-worthy backdrop with festive motifs',
        ],
        lightingIdeas: 'Warm 2700K ambient fairy lights with brass filigree hanging lanterns.',
        venueStyling: 'Low royal baithak seating with brocade bolsters and embroidered runners.',
        tableStyling: 'Brass charger plates, scented tealights, and handwritten personalized menu cards.',
        affordableAlternatives: 'Source locally cultivated seasonal marigolds and jasmine instead of imported blooms.',
        createdAt: new Date().toISOString(),
      };
      onUpdateEvent({
        ...event,
        moodboards: [fallbackBoard, ...moodboards],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMoodboardId(null);
    setThemeTitle(event.theme || 'Festive Indian Aesthetic');
    setThemeDescription('Curated color palette and decorative architecture for this celebration.');
    setPrimaryColor('#6C4AB6');
    setSecondaryColor('#FF7F6A');
    setAccentColor('#FFD700');
    setConceptsText('Marigold floral arches\nBrass Urlis with floating tealights\nSilk canopy draping');
    setLightingIdeas('Warm 2700K fairy lights with hanging brass filigree lanterns');
    setVenueStyling('Low baithak seating with royal brocade bolsters and floor rugs');
    setTableStyling('Brass charger plates with miniature clay diya centerpieces');
    setAffordableAlternatives('Substitute imported carnations with fresh yellow and orange marigold strings.');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mb: Moodboard) => {
    setEditingMoodboardId(mb.id);
    setThemeTitle(mb.themeTitle);
    setThemeDescription(mb.themeDescription);
    setPrimaryColor(mb.primaryColor);
    setSecondaryColor(mb.secondaryColor);
    setAccentColor(mb.accentColor);
    setConceptsText((mb.decorationConcepts || []).join('\n'));
    setLightingIdeas(mb.lightingIdeas || '');
    setVenueStyling(mb.venueStyling || '');
    setTableStyling(mb.tableStyling || '');
    setAffordableAlternatives(mb.affordableAlternatives || '');
    setIsModalOpen(true);
  };

  const handleSaveMoodboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeTitle.trim()) return;

    const concepts = conceptsText
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    let updated = [...moodboards];

    if (editingMoodboardId) {
      updated = updated.map((m) =>
        m.id === editingMoodboardId
          ? {
              ...m,
              themeTitle: themeTitle.trim(),
              themeDescription: themeDescription.trim(),
              primaryColor,
              secondaryColor,
              accentColor,
              decorationConcepts: concepts,
              lightingIdeas: lightingIdeas.trim(),
              venueStyling: venueStyling.trim(),
              tableStyling: tableStyling.trim(),
              affordableAlternatives: affordableAlternatives.trim(),
            }
          : m
      );
    } else {
      const newMb: Moodboard = {
        id: `mb-${Date.now()}`,
        themeTitle: themeTitle.trim(),
        themeDescription: themeDescription.trim(),
        primaryColor,
        secondaryColor,
        accentColor,
        decorationConcepts: concepts,
        lightingIdeas: lightingIdeas.trim(),
        venueStyling: venueStyling.trim(),
        tableStyling: tableStyling.trim(),
        affordableAlternatives: affordableAlternatives.trim(),
        createdAt: new Date().toISOString(),
      };
      updated.unshift(newMb);
    }

    onUpdateEvent({ ...event, moodboards: updated });
    setIsModalOpen(false);
  };

  const handleDeleteMoodboard = (id: string) => {
    onUpdateEvent({
      ...event,
      moodboards: moodboards.filter((m) => m.id !== id),
    });
    setMoodboardToDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#6C4AB6]" />
            <h3 className="font-bold text-lg text-[#252336] font-['Outfit']">
              Aesthetic Moodboards & Color Design
            </h3>
          </div>
          <p className="text-xs text-[#777482] mt-1">
            Harmonized color palettes, lighting recipes, and decor architecture tailored to Indian traditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#FF7F6A] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gemini Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Moodboard
              </>
            )}
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Manually
          </button>
        </div>
      </div>

      {/* Moodboard Cards */}
      {moodboards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center shadow-xs">
          <Palette className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-base text-[#252336] font-['Outfit']">No Moodboard Generated</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Click "Generate AI Moodboard" above to let Gemini craft custom color swatches, lighting architecture, and floral concepts for this celebration.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {moodboards.map((board) => (
            <div
              key={board.id}
              className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden"
            >
              {/* Header with Color Swatches */}
              <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h4 className="text-xl font-bold text-[#252336] font-['Outfit']">
                    {board.themeTitle}
                  </h4>
                  <p className="text-xs text-[#777482] mt-1 max-w-xl leading-relaxed">
                    {board.themeDescription}
                  </p>
                </div>

                {/* Swatches */}
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Primary', hex: board.primaryColor },
                    { label: 'Secondary', hex: board.secondaryColor },
                    { label: 'Accent', hex: board.accentColor },
                  ].map((colorObj) => (
                    <div
                      key={colorObj.label}
                      className="flex flex-col items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100"
                    >
                      <div
                        className="w-12 h-10 rounded-lg shadow-xs border border-black/10 flex items-center justify-center text-white cursor-pointer group"
                        style={{ backgroundColor: colorObj.hex }}
                        onClick={() => handleCopyColor(colorObj.hex)}
                        title={`Click to copy ${colorObj.hex}`}
                      >
                        {copiedHex === colorObj.hex ? (
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-md" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-600">
                        {colorObj.hex}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">
                        {colorObj.label}
                      </span>
                    </div>
                  ))}

                  <div className="ml-2 flex flex-col gap-1">
                    <button
                      onClick={() => handleOpenEditModal(board)}
                      className="p-2 text-slate-400 hover:text-[#6C4AB6] rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMoodboardToDeleteId(board.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Aesthetic Pillars Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Concepts */}
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#6C4AB6] mb-2 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Decor Concepts
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    {(board.decorationConcepts || []).map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-[#6C4AB6] font-bold">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lighting */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-2 uppercase tracking-wider text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Lighting Architecture
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {board.lightingIdeas || 'Warm ambient fairy lights and oil diyas.'}
                  </p>
                </div>

                {/* Venue & Stage Styling */}
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-2 uppercase tracking-wider text-[11px]">
                    <Building className="w-3.5 h-3.5" />
                    Venue & Mandap Styling
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {board.venueStyling || 'Silk draped canopies with fresh jasmine floral hangings.'}
                  </p>
                  {board.tableStyling && (
                    <p className="text-slate-600 mt-2 pt-2 border-t border-rose-200/50">
                      <span className="font-semibold text-rose-800">Table Settings:</span> {board.tableStyling}
                    </p>
                  )}
                </div>

                {/* Affordable Alternatives */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#248A5A] mb-2 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Smart Cost-Saving
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {board.affordableAlternatives || 'Source native seasonal blooms from flower markets to save 30%.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moodboard Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#252336] font-['Outfit']">
                {editingMoodboardId ? 'Edit Moodboard' : 'Create New Moodboard'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMoodboard} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Theme Title *</label>
                <input
                  type="text"
                  required
                  value={themeTitle}
                  onChange={(e) => setThemeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Theme Description</label>
                <textarea
                  rows={2}
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              {/* Color hexes */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded border uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded border uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded border uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decor Concepts (One per line)</label>
                <textarea
                  rows={3}
                  value={conceptsText}
                  onChange={(e) => setConceptsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lighting Ideas</label>
                <input
                  type="text"
                  value={lightingIdeas}
                  onChange={(e) => setLightingIdeas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue & Mandap Styling</label>
                <input
                  type="text"
                  value={venueStyling}
                  onChange={(e) => setVenueStyling(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cost-Saving Alternatives</label>
                <input
                  type="text"
                  value={affordableAlternatives}
                  onChange={(e) => setAffordableAlternatives(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingMoodboardId ? 'Save Changes' : 'Create Moodboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Moodboard Deletion */}
      <ConfirmDialog
        isOpen={Boolean(moodboardToDeleteId)}
        title="Delete Moodboard?"
        message="Are you sure you want to delete this moodboard and its color palette styling?"
        confirmText="Delete Moodboard"
        onConfirm={() => {
          if (moodboardToDeleteId) {
            handleDeleteMoodboard(moodboardToDeleteId);
          }
        }}
        onCancel={() => setMoodboardToDeleteId(null)}
      />
    </div>
  );
}
