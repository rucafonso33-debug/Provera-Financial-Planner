import { Capacitor } from '@capacitor/core';
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

const API_BASE_URL = Capacitor.isNativePlatform()
  ? 'https://provera-flexclass-projects.vercel.app'
  : '';

const callAI = async <T>(payload: Record<string, unknown>): Promise<T> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sign in before using the Provera AI coach.');
  }

  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('The AI service returned an invalid response.');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'The AI coach is temporarily unavailable.');
  }

  return result as T;
};

const normalizeAnalysis = (value: unknown): AIAnalysis => {
  const result = value && typeof value === 'object' ? value as Partial<AIAnalysis> : {};

  return {
    healthSummary:
      typeof result.healthSummary === 'string'
        ? result.healthSummary
        : 'The analysis could not be completed with the available data.',
    healthStatus:
      result.healthStatus === 'Good' ||
      result.healthStatus === 'Moderate' ||
      result.healthStatus === 'Risk'
        ? result.healthStatus
        : 'Moderate',
    insights: Array.isArray(result.insights) ? result.insights : [],
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
  };
};

export const generateFinancialAnalysis = async (
  data: FinancialContext,
): Promise<AIAnalysis> => {
  const result = await callAI<unknown>({ mode: 'analysis', data });
  return normalizeAnalysis(result);
};

export const askFinancialQuestion = async (
  question: string,
  data: FinancialContext,
  history: ChatMessage[],
): Promise<string> => {
  const result = await callAI<{ answer?: unknown }>({
    mode: 'question',
    question,
    data,
    history,
  });

  if (typeof result.answer !== 'string' || !result.answer.trim()) {
    throw new Error('The AI coach returned an empty answer.');
  }

  return result.answer;
};
