import { EventData, AIEventPlan } from '../types';

export function createDefaultPlanForEvent(event: EventData): AIEventPlan {
  const budget = Number(event.totalBudget) || 100000;
  const isWedding = event.category === 'wedding';
  const isBirthday = event.category === 'birthday';
  const isCollege = event.category === 'college_fest';
  const isCorporate = event.category === 'corporate';

  // Budget allocations
  const venueAlloc = Math.round(budget * (isWedding ? 0.35 : isCorporate ? 0.4 : 0.25));
  const cateringAlloc = Math.round(budget * (isWedding ? 0.3 : 0.35));
  const decorAlloc = Math.round(budget * 0.15);
  const photoAlloc = Math.round(budget * 0.1);
  const miscAlloc = Math.max(0, budget - venueAlloc - cateringAlloc - decorAlloc - photoAlloc);

  const budgetBreakdown = [
    {
      id: `bb-1`,
      category: 'Venue & Staging',
      allocatedAmount: venueAlloc,
      explanation: 'Hall/Lawn booking, stage setup, and primary event space',
      percentage: Math.round((venueAlloc / budget) * 100),
    },
    {
      id: `bb-2`,
      category: 'Catering & Beverages',
      allocatedAmount: cateringAlloc,
      explanation: `Buffet dining, refreshments & live counters for ${event.guestCount} guests`,
      percentage: Math.round((cateringAlloc / budget) * 100),
    },
    {
      id: `bb-3`,
      category: 'Decor & Theme Styling',
      allocatedAmount: decorAlloc,
      explanation: 'Entrance arch, ambient lighting, floral elements & backdrop',
      percentage: Math.round((decorAlloc / budget) * 100),
    },
    {
      id: `bb-4`,
      category: 'Photography & Videography',
      allocatedAmount: photoAlloc,
      explanation: 'Professional event coverage, portraits & highlight video',
      percentage: Math.round((photoAlloc / budget) * 100),
    },
    {
      id: `bb-5`,
      category: 'Contingency & Hospitality',
      allocatedAmount: miscAlloc,
      explanation: 'Reserve buffer for last-minute supplies, travel & sound permits',
      percentage: Math.round((miscAlloc / budget) * 100),
    },
  ];

  // Tasks
  const tasks = [
    {
      id: `tsk-1`,
      title: 'Finalize venue contract and advance payment',
      description: `Confirm dates, timing and equipment at ${event.venueDetails || event.city}.`,
      priority: 'urgent' as const,
      dueDate: event.date,
      category: 'Venue',
      status: 'pending' as const,
    },
    {
      id: `tsk-2`,
      title: 'Approve customized catering menu',
      description: `Finalize regional food preferences (${event.foodPreference}) with head caterer.`,
      priority: 'high' as const,
      dueDate: event.date,
      category: 'Catering',
      status: 'pending' as const,
    },
    {
      id: `tsk-3`,
      title: 'Book professional photographer and videographer',
      description: 'Review portfolio, confirm shot list and delivery timeline.',
      priority: 'high' as const,
      dueDate: event.date,
      category: 'Media',
      status: 'pending' as const,
    },
    {
      id: `tsk-4`,
      title: 'Dispatch digital invitations and track RSVPs',
      description: `Share event details with ${event.guestCount} expected attendees.`,
      priority: 'medium' as const,
      dueDate: event.date,
      category: 'Guests',
      status: 'pending' as const,
    },
    {
      id: `tsk-5`,
      title: 'Review floral and lighting mockups with decorator',
      description: `Align color palette (${(event.preferredColors || []).join(', ')}) with theme concept.`,
      priority: 'medium' as const,
      dueDate: event.date,
      category: 'Decor',
      status: 'pending' as const,
    },
  ];

  // Timeline
  const timeline = [
    {
      id: `tl-1`,
      stage: 'Initial Booking Phase',
      deadline: '4-6 Weeks Prior',
      requiredActivity: 'Secure primary venue, photographer, and caterer contracts.',
    },
    {
      id: `tl-2`,
      stage: 'Invitations & Coordination',
      deadline: '2-3 Weeks Prior',
      requiredActivity: 'Send formal invitations, collect RSVPs, and conduct food tasting.',
    },
    {
      id: `tl-3`,
      stage: 'Final Week Walkthrough',
      deadline: '3 Days Prior',
      requiredActivity: 'Inspect audio-visual setup, finalize guest headcount, and coordinate schedule.',
    },
    {
      id: `tl-4`,
      stage: 'Celebration Day',
      deadline: 'Event Day',
      requiredActivity: 'Execute hourly run-of-show, guest welcoming, and primary ceremony.',
    },
  ];

  // Vendor Checklist
  const vendorChecklist = [
    {
      id: `vc-1`,
      category: 'Venue Coordinator',
      purpose: 'Manage hall access, parking logistics, and sound permissions',
      suggestedQuestions: [
        'What is the sound amplification curfew for this venue?',
        'Is emergency generator backup included in the rental price?',
      ],
    },
    {
      id: `vc-2`,
      category: 'Catering Team',
      purpose: 'Deliver fresh multi-course meals and live culinary counters',
      suggestedQuestions: [
        'Can separate pure vegetarian/Jain prep areas be maintained?',
        'What is the staff-to-guest ratio for buffet service?',
      ],
    },
    {
      id: `vc-3`,
      category: 'Decorator & Lighting',
      purpose: 'Construct thematic entrance, stage backdrop, and atmospheric lighting',
      suggestedQuestions: [
        'How many hours prior to the event will setup commence?',
        'Are artificial florals or real seasonal flowers used for the entrance arch?',
      ],
    },
  ];

  // Food suggestions
  const foodSuggestions = {
    menuIdeas: [
      {
        category: 'Welcome Drinks & Starters',
        items: ['Fresh Mint Chaas & Thandai', 'Crispy Paneer Tikka Skewers', 'Corn Cheese Balls', 'Chaat Counter'],
      },
      {
        category: 'Main Course Specialties',
        items: ['Shahi Paneer Butter Masala', 'Dal Makhani Slow-Cooked', 'Jeera Rice with Fried Onions', 'Garlic Naan & Laccha Paratha'],
      },
      {
        category: 'Desserts & Sweet Endings',
        items: ['Warm Gulab Jamun with Rabdi', 'Kesar Pista Kulfi', 'Fresh Fruit Tartlets'],
      },
    ],
    dietaryNotes: `Carefully separated buffet zones accommodating ${event.foodPreference} preference.`,
    budgetAlternatives: 'Opt for local seasonal sweets and live chaat station to save ~15% on catering expenses.',
  };

  // Decoration ideas
  const decorationIdeas = {
    theme: event.theme || 'Celebratory Indian Elegance',
    colors: event.preferredColors?.length ? event.preferredColors : ['#6C4AB6', '#FF7F6A', '#FFD700'],
    concepts: [
      'Grand entrance arch with themed drapes and floral garlands',
      'Atmospheric backdrop with fairy light canopies and warm lanterns',
      'Table centerpieces with subtle candlelight and regional brass accents',
    ],
    lighting: 'Warm 2700K amber fairy curtain lights and accent uplighting on stage pillars.',
    venueStyling: 'Color-coordinated fabrics with matching cushion baithaks and stage seating.',
  };

  // Day Schedule
  const daySchedule = [
    {
      id: `sch-1`,
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      activity: 'Guest Welcoming & Refreshments',
      description: 'Traditional welcome with rose petals, tilak, and seasonal welcome drinks.',
    },
    {
      id: `sch-2`,
      startTime: '12:00 PM',
      endTime: '02:00 PM',
      activity: 'Main Celebration Ceremony & Performances',
      description: 'Core ceremony rituals, felicitation, dance performances, and speeches.',
    },
    {
      id: `sch-3`,
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      activity: 'Grand Festive Feast & Banquet',
      description: 'Multi-course lunch/dinner service with live chef stations and dessert counters.',
    },
    {
      id: `sch-4`,
      startTime: '03:30 PM',
      endTime: '05:00 PM',
      activity: 'Photographs, Mingling & Farewell',
      description: 'Group photo sessions at the backdrop arch and guest favors distribution.',
    },
  ];

  const recommendations = {
    costSaving: [
      'Bundle sound and lighting under one AV contractor to negotiate an 8-12% package discount.',
      'Order local seasonal flowers in bulk from the wholesale mandi rather than via retail florists.',
    ],
    risks: [
      'Confirm outdoor weather contingencies and backup indoor banquets in case of rain or wind.',
      'Check local sound permit cut-off hours (commonly 10:00 PM) to avoid disruptions.',
    ],
    importantReminders: [
      'Keep printed contact sheets of all key vendors with your lead coordinator.',
      'Designate a family point of contact for senior guest transport and check-ins.',
    ],
  };

  return {
    summary: {
      concept: event.theme || 'Grand Celebration',
      theme: event.theme || 'Traditional & Vibrant',
      description: `A personalized celebration strategy for ${event.name} in ${event.city}, crafted for ${event.guestCount} guests with an optimal budget allocation of ₹${event.totalBudget.toLocaleString()}.`,
      mainPriorities: event.priorityCategories?.length
        ? event.priorityCategories
        : ['Venue & Staging', 'Catering & Feasts', 'Photography & Cinematic Video'],
    },
    budgetBreakdown,
    tasks,
    timeline,
    vendorChecklist,
    foodSuggestions,
    decorationIdeas,
    daySchedule,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

export function applyPlanToEvent(event: EventData, plan: AIEventPlan): EventData {
  const updated: EventData = {
    ...event,
    aiPlan: plan,
    tasks: plan.tasks && Array.isArray(plan.tasks) ? plan.tasks : event.tasks,
    schedule: plan.daySchedule && Array.isArray(plan.daySchedule) ? plan.daySchedule : event.schedule,
  };

  if (plan.decorationIdeas && (!updated.moodboards || updated.moodboards.length === 0)) {
    updated.moodboards = [
      {
        id: `mb-${Date.now()}`,
        themeTitle: plan.decorationIdeas.theme || event.theme || 'Celebration Theme',
        themeDescription: plan.summary?.description || 'Curated aesthetic celebration theme.',
        primaryColor: event.preferredColors?.[0] || '#6C4AB6',
        secondaryColor: event.preferredColors?.[1] || '#FF7F6A',
        accentColor: event.preferredColors?.[2] || '#FFD700',
        decorationConcepts: plan.decorationIdeas.concepts || [],
        lightingIdeas: plan.decorationIdeas.lighting || '',
        venueStyling: plan.decorationIdeas.venueStyling || '',
        tableStyling: 'Themed centerpieces with ambient candlelight and personalized guest placecards.',
        affordableAlternatives: plan.foodSuggestions?.budgetAlternatives || 'Source fresh regional florals locally.',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  if (plan.vendorChecklist && Array.isArray(plan.vendorChecklist) && (!updated.vendors || updated.vendors.length === 0)) {
    updated.vendors = plan.vendorChecklist.map((vc, idx) => ({
      id: `vnd-${Date.now()}-${idx}`,
      name: `Recommended ${vc.category}`,
      category: vc.category,
      contactPerson: 'Lead Coordinator',
      phone: '',
      email: '',
      quotedPrice: 0,
      bookingStatus: 'researching',
      paymentStatus: 'unpaid',
      notes: vc.purpose,
    }));
  }

  return updated;
}

