import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google GenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Ultra-fast responsive models
const MODELS_TO_TRY = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

async function generateContentWithRetry(ai: GoogleGenAI, params: any) {
  let lastError = null;
  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`[Festivo AI] Calling model: ${model}...`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      if (response && response.text) {
        console.log(`[Festivo AI] Success with ${model}`);
        return response;
      }
    } catch (err: any) {
      console.warn(`[Festivo AI] Model ${model} encountered issue:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All model attempts failed');
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health / Config check endpoint
  app.get('/api/ai/status', (req: Request, res: Response) => {
    const isConfigured = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() !== '' &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );
    res.json({ configured: isConfigured, model: 'gemini-3.1-flash-lite' });
  });

  // POST /api/ai/generate-plan
  app.post('/api/ai/generate-plan', async (req: Request, res: Response): Promise<void> => {
    try {
      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY_MISSING',
          message: 'Gemini API key is not configured in the environment. Non-AI manual planning remains fully accessible.',
        });
        return;
      }

      const eventInput = req.body;
      if (!eventInput || !eventInput.name || !eventInput.category) {
        res.status(400).json({ error: 'INVALID_INPUT', message: 'Event name and category are required.' });
        return;
      }

      const systemPrompt = `You are Festivo AI, India's leading luxury and smart celebration planner.
Your goal is to generate a comprehensive, highly customized, and realistic celebration plan tailored to Indian traditions, budget dynamics, and event type.
Currency: Indian Rupee (INR).
Format: Strict structured JSON adhering to the provided response schema.
Make sure budget numbers are realistic and sum close to the provided totalBudget.
Respect dietary restrictions (e.g., pure veg, Jain, regional delicacies), venue constraints, and cultural rituals.`;

      const userPrompt = `Generate a complete event plan for:
Event Name: ${eventInput.name}
Category: ${eventInput.category}
Date: ${eventInput.date || 'Upcoming'}
City: ${eventInput.city || 'India'}
Venue Details: ${eventInput.venueDetails || 'TBD'}
Venue Type: ${eventInput.venueType || 'both'}
Guest Count: ${eventInput.guestCount || 100} guests
Duration: ${eventInput.durationHours || 6} hours
Total Budget: INR ₹${eventInput.totalBudget || 500000}
Budget Flexibility: ${eventInput.budgetFlexibility || 'moderate'}
Priority Categories: ${JSON.stringify(eventInput.priorityCategories || [])}
Emergency Reserve: ${eventInput.emergencyReservePercent || 10}%
Theme: ${eventInput.theme || 'Traditional & Vibrant'}
Preferred Colors: ${JSON.stringify(eventInput.preferredColors || ['#FF9933', '#800020'])}
Food Preference: ${eventInput.foodPreference || 'mixed'}
Regional Cuisine / Traditions: ${eventInput.regionalPreference || 'North & South Indian fusion'}
Cultural Rituals: ${eventInput.culturalRituals || 'Standard ceremonies'}
Atmosphere: ${eventInput.atmosphere || 'Joyful & warm'}
Special Notes: ${eventInput.additionalNotes || 'None'}`;

      const response = await generateContentWithRetry(ai, {
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  description: { type: Type.STRING },
                  mainPriorities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['concept', 'theme', 'description', 'mainPriorities'],
              },
              budgetBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    allocatedAmount: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                    percentage: { type: Type.NUMBER },
                  },
                  required: ['category', 'allocatedAmount', 'explanation'],
                },
              },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING, description: 'low, medium, high, or urgent' },
                    dueDate: { type: Type.STRING, description: 'YYYY-MM-DD format' },
                    category: { type: Type.STRING },
                  },
                  required: ['title', 'description', 'priority', 'dueDate', 'category'],
                },
              },
              timeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.STRING },
                    deadline: { type: Type.STRING },
                    requiredActivity: { type: Type.STRING },
                  },
                  required: ['stage', 'deadline', 'requiredActivity'],
                },
              },
              vendorChecklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                    suggestedQuestions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['category', 'purpose', 'suggestedQuestions'],
                },
              },
              foodSuggestions: {
                type: Type.OBJECT,
                properties: {
                  menuIdeas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['category', 'items'],
                    },
                  },
                  dietaryNotes: { type: Type.STRING },
                  budgetAlternatives: { type: Type.STRING },
                },
                required: ['menuIdeas', 'dietaryNotes', 'budgetAlternatives'],
              },
              decorationIdeas: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  colors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  concepts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  lighting: { type: Type.STRING },
                  venueStyling: { type: Type.STRING },
                },
                required: ['theme', 'colors', 'concepts', 'lighting', 'venueStyling'],
              },
              daySchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ['startTime', 'endTime', 'activity', 'description'],
                },
              },
              recommendations: {
                type: Type.OBJECT,
                properties: {
                  costSaving: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  risks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  importantReminders: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['costSaving', 'risks', 'importantReminders'],
              },
            },
            required: [
              'summary',
              'budgetBreakdown',
              'tasks',
              'timeline',
              'vendorChecklist',
              'foodSuggestions',
              'decorationIdeas',
              'daySchedule',
              'recommendations',
            ],
          },
        },
      });

      const rawText = response.text || '{}';
      const parsedPlan = JSON.parse(rawText);

      // Enhance with client IDs and safe defaults
      const timestamp = new Date().toISOString();
      const planWithIds = {
        ...parsedPlan,
        generatedAt: timestamp,
        budgetBreakdown: (parsedPlan.budgetBreakdown || []).map((b: any, idx: number) => ({
          ...b,
          id: `bb-ai-${Date.now()}-${idx}`,
          allocatedAmount: Number(b.allocatedAmount) || 0,
        })),
        tasks: (parsedPlan.tasks || []).map((t: any, idx: number) => ({
          ...t,
          id: `tsk-ai-${Date.now()}-${idx}`,
          priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority?.toLowerCase())
            ? t.priority.toLowerCase()
            : 'medium',
          status: 'pending',
        })),
        timeline: (parsedPlan.timeline || []).map((tl: any, idx: number) => ({
          ...tl,
          id: `tl-ai-${Date.now()}-${idx}`,
        })),
        vendorChecklist: (parsedPlan.vendorChecklist || []).map((v: any, idx: number) => ({
          ...v,
          id: `vc-ai-${Date.now()}-${idx}`,
        })),
        daySchedule: (parsedPlan.daySchedule || []).map((s: any, idx: number) => ({
          ...s,
          id: `sch-ai-${Date.now()}-${idx}`,
        })),
      };

      res.json(planWithIds);
    } catch (err: any) {
      console.error('Error in /api/ai/generate-plan:', err);
      res.status(500).json({
        error: 'AI_GENERATION_FAILED',
        message: err.message || 'Failed to generate event plan using Gemini. Please check API key status and retry.',
      });
    }
  });

  // POST /api/ai/generate-moodboard
  app.post('/api/ai/generate-moodboard', async (req: Request, res: Response): Promise<void> => {
    try {
      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY_MISSING',
          message: 'Gemini API key is not configured in the environment.',
        });
        return;
      }

      const { eventName, category, theme, colors, city, culturalRituals } = req.body;

      const systemPrompt = `You are a luxury event art director and aesthetician in India specializing in color theory, mandap and stage architecture, lighting design, and traditional styling.
Output strict JSON matching the schema with hex color codes and concrete decorative ideas. Do NOT generate fake images or raw markdown.`;

      const userPrompt = `Create an inspiring aesthetic moodboard for:
Event: ${eventName}
Category: ${category}
Theme: ${theme || 'Celebratory Indian Elegance'}
Colors: ${JSON.stringify(colors || ['#6C4AB6', '#FF7F6A', '#FFD700'])}
Location: ${city || 'India'}
Rituals: ${culturalRituals || 'Celebration'}`;

      const response = await generateContentWithRetry(ai, {
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themeTitle: { type: Type.STRING },
              themeDescription: { type: Type.STRING },
              primaryColor: { type: Type.STRING, description: 'Hex color code e.g. #6C4AB6' },
              secondaryColor: { type: Type.STRING, description: 'Hex color code e.g. #FF7F6A' },
              accentColor: { type: Type.STRING, description: 'Hex color code e.g. #FFD700' },
              decorationConcepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              lightingIdeas: { type: Type.STRING },
              venueStyling: { type: Type.STRING },
              tableStyling: { type: Type.STRING },
              affordableAlternatives: { type: Type.STRING },
            },
            required: [
              'themeTitle',
              'themeDescription',
              'primaryColor',
              'secondaryColor',
              'accentColor',
              'decorationConcepts',
              'lightingIdeas',
              'venueStyling',
              'tableStyling',
              'affordableAlternatives',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const moodboard = {
        ...parsed,
        id: `mb-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      res.json(moodboard);
    } catch (err: any) {
      console.error('Error in /api/ai/generate-moodboard:', err);
      res.status(500).json({
        error: 'MOODBOARD_GENERATION_FAILED',
        message: err.message || 'Failed to generate moodboard.',
      });
    }
  });

  // POST /api/ai/chat
  app.post('/api/ai/chat', async (req: Request, res: Response): Promise<void> => {
    try {
      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY_MISSING',
          message: 'Gemini API key is not configured in the environment. Chat is unavailable.',
        });
        return;
      }

      const { message, eventContext, conversationHistory } = req.body;
      if (!message) {
        res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'Message is required.' });
        return;
      }

      const systemPrompt = `You are the Festivo AI Copilot, an expert Indian event planner and concierge.
You are assisting a user who is planning their event:
Event Name: "${eventContext?.name || 'My Event'}"
Category: "${eventContext?.category || 'General'}"
Date: "${eventContext?.date || 'Upcoming'}"
Total Budget: ₹${eventContext?.totalBudget || 0}
City: "${eventContext?.city || 'India'}"
Guest Count: ${eventContext?.guestCount || 0}
Food Preference: "${eventContext?.foodPreference || 'mixed'}"

When the user asks you to modify, adjust, add, or optimize their event:
1. Provide a clear, conversational response explaining your recommendation.
2. If the user's request involves modifying specific event fields, provide a structured 'proposedChange' object.
3. If no modification is requested, set proposedChange to null.
4. Currency is always Indian Rupee (INR).
5. Never execute code or modify unrestricted state. The user must review and approve this proposed change in the UI.`;

      const chatPrompt = `Current Event Summary:
${JSON.stringify({
  name: eventContext?.name,
  category: eventContext?.category,
  date: eventContext?.date,
  totalBudget: eventContext?.totalBudget,
  city: eventContext?.city,
  guestCount: eventContext?.guestCount,
  foodPreference: eventContext?.foodPreference,
  theme: eventContext?.theme,
  taskCount: eventContext?.tasks?.length || 0,
  expenseCount: eventContext?.expenses?.length || 0,
})}

User Message:
"${message}"

Return a structured JSON with:
- message: Your conversational reply to the user.
- proposedChange (null or object with summary, type, explanation, diff, applyPayload).`;

      const response = await generateContentWithRetry(ai, {
        contents: chatPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING },
              hasProposedChange: { type: Type.BOOLEAN },
              proposedChange: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: 'budget, task, schedule, vendor, preference, or plan',
                  },
                  explanation: { type: Type.STRING },
                  diff: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        field: { type: Type.STRING },
                        oldValue: { type: Type.STRING },
                        newValue: { type: Type.STRING },
                      },
                      required: ['field', 'oldValue', 'newValue'],
                    },
                  },
                  applyPayload: {
                    type: Type.OBJECT,
                    description: 'Key-value pairs to merge into the event (e.g. totalBudget, theme, etc.)',
                    properties: {
                      totalBudget: { type: Type.NUMBER },
                      theme: { type: Type.STRING },
                      foodPreference: { type: Type.STRING },
                      additionalNotes: { type: Type.STRING },
                      newTask: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          priority: { type: Type.STRING },
                          dueDate: { type: Type.STRING },
                          category: { type: Type.STRING },
                        },
                      },
                      newScheduleItem: {
                        type: Type.OBJECT,
                        properties: {
                          startTime: { type: Type.STRING },
                          endTime: { type: Type.STRING },
                          activity: { type: Type.STRING },
                          description: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
                required: ['summary', 'type', 'explanation', 'diff', 'applyPayload'],
              },
            },
            required: ['message', 'hasProposedChange'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      let finalProposedChange = null;

      if (parsed.hasProposedChange && parsed.proposedChange) {
        finalProposedChange = {
          ...parsed.proposedChange,
          id: `prop-${Date.now()}`,
        };
      }

      res.json({
        message: parsed.message,
        proposedChange: finalProposedChange,
      });
    } catch (err: any) {
      console.error('Error in /api/ai/chat:', err);
      res.status(500).json({
        error: 'CHAT_FAILED',
        message: err.message || 'Failed to process chat message with Festivo AI.',
      });
    }
  });

  // POST /api/ai/regenerate-section
  app.post('/api/ai/regenerate-section', async (req: Request, res: Response): Promise<void> => {
    try {
      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({ error: 'GEMINI_API_KEY_MISSING', message: 'Gemini API key is not configured.' });
        return;
      }

      const { section, eventData } = req.body;
      if (!section || !eventData) {
        res.status(400).json({ error: 'INVALID_INPUT', message: 'Section and event data are required.' });
        return;
      }

      const prompt = `Regenerate the "${section}" section for event:
Name: ${eventData.name}
Category: ${eventData.category}
Budget: ₹${eventData.totalBudget}
Guests: ${eventData.guestCount}
Food: ${eventData.foodPreference}
Theme: ${eventData.theme}
Location: ${eventData.city}

Return valid JSON with the fresh content for "${section}".`;

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          systemInstruction: 'You are Festivo AI. Return strict JSON matching the requested section.',
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/ai/regenerate-section:', err);
      res.status(500).json({ error: 'REGENERATE_FAILED', message: err.message });
    }
  });

  // Vite middleware in dev, static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Festivo AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
