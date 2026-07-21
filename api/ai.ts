import { GoogleGenAI, Type } from '@google/genai';

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(value: unknown): void;
  setHeader(name: string, value: string): void;
}

interface FinancialData {
  settings: {
    current_balance: number;
    weekly_spending_estimate: number;
    safety_threshold: number;
    currency: string;
    is_couple_mode: boolean;
  };
  incomes: Array<{ name: string; amount: number; day_of_month: number }>;
  fixedExpenses: Array<{ name: string; amount: number; day_of_month: number }>;
  events: Array<{ description: string; amount: number; date: string }>;
  forecast: Array<{ week_number: number; projected_balance: number }>;
  simulation: {
    isActive: boolean;
    weeklySpendingDelta: number;
    oneOffExpenses: unknown[];
  };
  goals: Array<{
    name: string;
    target_amount: number;
    target_date: string;
    is_completed: boolean;
  }>;
}

const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY;

const readBody = (body: unknown): Record<string, unknown> => {
  if (typeof body === 'string') {
    return JSON.parse(body) as Record<string, unknown>;
  }
  if (body && typeof body === 'object') {
    return body as Record<string, unknown>;
  }
  return {};
};

const getBearerToken = (authorization: string | string[] | undefined) => {
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  return value?.startsWith('Bearer ') ? value.slice(7) : null;
};

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const normalizeFinancialData = (value: unknown): FinancialData | null => {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const rawSettings = raw.settings && typeof raw.settings === 'object'
    ? raw.settings as Record<string, unknown>
    : null;
  if (!rawSettings) return null;

  const normalizeList = <T>(candidate: unknown, mapper: (item: Record<string, unknown>) => T) =>
    Array.isArray(candidate)
      ? candidate
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
          .map(mapper)
      : [];

  const rawSimulation = raw.simulation && typeof raw.simulation === 'object'
    ? raw.simulation as Record<string, unknown>
    : {};

  return {
    settings: {
      current_balance: asNumber(rawSettings.current_balance),
      weekly_spending_estimate: asNumber(rawSettings.weekly_spending_estimate),
      safety_threshold: asNumber(rawSettings.safety_threshold, 1000),
      currency: asString(rawSettings.currency, 'CHF'),
      is_couple_mode: Boolean(rawSettings.is_couple_mode),
    },
    incomes: normalizeList(raw.incomes, (item) => ({
      name: asString(item.name, 'Income'),
      amount: asNumber(item.amount),
      day_of_month: asNumber(item.day_of_month, 1),
    })),
    fixedExpenses: normalizeList(raw.fixedExpenses, (item) => ({
      name: asString(item.name, 'Expense'),
      amount: asNumber(item.amount),
      day_of_month: asNumber(item.day_of_month, 1),
    })),
    events: normalizeList(raw.events, (item) => ({
      description: asString(item.description, 'Event'),
      amount: asNumber(item.amount),
      date: asString(item.date),
    })),
    forecast: normalizeList(raw.forecast, (item) => ({
      week_number: asNumber(item.week_number),
      projected_balance: asNumber(item.projected_balance),
    })),
    simulation: {
      isActive: Boolean(rawSimulation.isActive),
      weeklySpendingDelta: asNumber(rawSimulation.weeklySpendingDelta),
      oneOffExpenses: Array.isArray(rawSimulation.oneOffExpenses)
        ? rawSimulation.oneOffExpenses
        : [],
    },
    goals: normalizeList(raw.goals, (item) => ({
      name: asString(item.name, 'Goal'),
      target_amount: asNumber(item.target_amount),
      target_date: asString(item.target_date),
      is_completed: Boolean(item.is_completed),
    })),
  };
};

const verifyFirebaseToken = async (token: string) => {
  if (!firebaseApiKey) {
    throw new Error('FIREBASE_WEB_API_KEY is not configured.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    },
  );

  if (!response.ok) return false;
  const payload = (await response.json()) as { users?: unknown[] };
  return Boolean(payload.users?.length);
};

const buildAnalysisPrompt = (data: FinancialData) => `
Act as Provera, a professional personal financial coach. Analyse the user's
cash flow and provide concise, practical recommendations in English.

CURRENT POSITION
- Balance: ${data.settings.current_balance} ${data.settings.currency}
- Weekly spending estimate: ${data.settings.weekly_spending_estimate} ${data.settings.currency}
- Safety threshold: ${data.settings.safety_threshold} ${data.settings.currency}
- Couple mode: ${data.settings.is_couple_mode ? 'active' : 'inactive'}

GOALS
${data.goals.length ? data.goals.map((goal) => `- ${goal.name}: ${goal.target_amount} ${data.settings.currency} by ${goal.target_date} (${goal.is_completed ? 'complete' : 'in progress'})`).join('\n') : '- No goals configured'}

MONTHLY INCOME
${data.incomes.map((income) => `- ${income.name}: ${income.amount} ${data.settings.currency}, day ${income.day_of_month}`).join('\n') || '- None configured'}

FIXED EXPENSES
${data.fixedExpenses.map((expense) => `- ${expense.name}: ${expense.amount} ${data.settings.currency}, day ${expense.day_of_month}`).join('\n') || '- None configured'}

UPCOMING EVENTS
${data.events.map((event) => `- ${event.description}: ${event.amount} ${data.settings.currency} on ${event.date}`).join('\n') || '- None configured'}

12-WEEK PROJECTION
${data.forecast.map((week) => `- Week ${week.week_number}: ${week.projected_balance} ${data.settings.currency}`).join('\n') || '- No forecast available'}

SIMULATION
${data.simulation.isActive ? `Weekly spending delta ${data.simulation.weeklySpendingDelta}; ${data.simulation.oneOffExpenses.length} one-off simulated expenses.` : 'No active simulation.'}

Classify health as Good, Moderate or Risk. Identify risky weeks, assess goal
feasibility and suggest specific, realistic actions. Do not present the result
as regulated financial advice and do not invent missing facts.
`;

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    healthSummary: { type: Type.STRING },
    healthStatus: { type: Type.STRING, enum: ['Good', 'Moderate', 'Risk'] },
    insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['risk', 'suggestion', 'impact', 'positive'],
          },
          message: { type: Type.STRING },
          action: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                enum: ['update_spending', 'update_threshold', 'add_event'],
              },
              value: { type: Type.NUMBER },
              label: { type: Type.STRING },
            },
            required: ['type', 'value', 'label'],
          },
        },
        required: ['type', 'message'],
      },
    },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['healthSummary', 'healthStatus', 'insights', 'suggestions'],
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token || !(await verifyFirebaseToken(token))) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI service is not configured.' });
    }

    const body = readBody(req.body);
    const mode = body.mode;
    const data = normalizeFinancialData(body.data);
    if (!data) {
      return res.status(400).json({ error: 'Invalid financial context.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    if (mode === 'analysis') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: buildAnalysisPrompt(data),
        config: {
          responseMimeType: 'application/json',
          responseSchema: analysisSchema,
        },
      });

      const parsed = JSON.parse(response.text || '{}') as Record<string, unknown>;
      return res.status(200).json({
        healthSummary: asString(parsed.healthSummary, 'The analysis could not be completed.'),
        healthStatus:
          parsed.healthStatus === 'Good' || parsed.healthStatus === 'Moderate' || parsed.healthStatus === 'Risk'
            ? parsed.healthStatus
            : 'Moderate',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      });
    }

    if (mode === 'question') {
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      if (!question || question.length > 1_000) {
        return res.status(400).json({ error: 'Enter a shorter financial question.' });
      }

      const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `${buildAnalysisPrompt(data)}\nAnswer the user's questions concisely. Explain uncertainty and keep suggestions above the configured safety threshold where possible.`,
        },
        history: history
          .filter((item): item is { role: 'user' | 'model'; text: string } =>
            Boolean(
              item &&
                typeof item === 'object' &&
                ((item as { role?: string }).role === 'user' ||
                  (item as { role?: string }).role === 'model') &&
                typeof (item as { text?: unknown }).text === 'string',
            ),
          )
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.text.slice(0, 2_000) }],
          })),
      });

      const response = await chat.sendMessage({ message: question });
      const answer = response.text?.trim();
      return res.status(200).json({
        answer: answer || 'I could not process that question.',
      });
    }

    return res.status(400).json({ error: 'Unsupported AI request.' });
  } catch (error) {
    console.error('AI API error', error);
    const message = error instanceof Error ? error.message : 'The AI coach is temporarily unavailable.';
    return res.status(500).json({ error: message });
  }
}
