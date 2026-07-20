import { auth } from '../firebase';
import type {
  AIAnalysis,
  AppSettings,
  ChatMessage,
  FinancialGoal,
  FixedExpense,
  ForecastWeek,
  FutureEvent,
  Income,
  SimulationState,
} from '../types';

interface FinancialContext {
  settings: AppSettings;
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  events: FutureEvent[];
  forecast: ForecastWeek[];
  simulation: SimulationState;
  goals: FinancialGoal[];
}

const callAI = async <T>(payload: Record<string, unknown>): Promise<T> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sign in before using the Provera AI coach.');
  }

  const idToken = await user.getIdToken();
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'The AI coach is temporarily unavailable.');
  }

  return result as T;
};

export const generateFinancialAnalysis = async (
  data: FinancialContext,
): Promise<AIAnalysis> => callAI<AIAnalysis>({ mode: 'analysis', data });

export const askFinancialQuestion = async (
  question: string,
  data: FinancialContext,
  history: ChatMessage[],
): Promise<string> => {
  const result = await callAI<{ answer: string }>({
    mode: 'question',
    question,
    data,
    history,
  });

  return result.answer;
};
