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

const firebaseApiKey =
  process.env.FIREBASE_WEB_API_KEY || 'AIzaSyAbecmnRhoqaegoFC_pKvkljIWEQwg3K6B8';

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

const verifyFirebaseToken = async (token: string) => {
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
${data.forecast.map((week) => `- Week ${week.week_number}: ${week.projected_balance} ${data.settings.currency}`).join('\n')}

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
    const data = body.data as FinancialData | undefined;
    if (!data?.settings || !Array.isArray(data.forecast)) {
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

      return res.status(200).json(JSON.parse(response.text || '{}'));
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
      return res.status(200).json({
        answer: response.text || 'I could not process that question.',
      });
    }

    return res.status(400).json({ error: 'Unsupported AI request.' });
  } catch (error) {
    console.error('AI API error', error);
    return res.status(500).json({ error: 'The AI coach is temporarily unavailable.' });
  }
}
