import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');

function expectAll(label, snippets) {
  for (const snippet of snippets) {
    assert.ok(app.includes(snippet), `${label}: missing ${snippet}`);
  }
}

test('onboarding completion and Firestore persistence contracts remain wired', () => {
  expectAll('onboarding/persistence', [
    'onboarding_completed',
    "doc(db, 'users', userId, 'settings', 'current')",
    'onSnapshot(settingsRef',
    "collection(db, 'users', user.uid, 'incomes')",
    "collection(db, 'users', user.uid, 'fixedExpenses')",
  ]);
});

test('duplicate prevention remains enforced for financial item saves', () => {
  expectAll('duplicate prevention', [
    'itemSaveLockRef.current',
    'if (!user || itemSaveLockRef.current) return;',
    'setIsSavingItem(true)',
    'disabled={isSavingItem}',
  ]);
});

test('editing and deleting remain available with confirmation and feedback', () => {
  expectAll('edit/delete', [
    "handleEdit('income'",
    "handleEdit('expense'",
    "handleEdit('event'",
    "handleEdit('goal'",
    "window.confirm('Delete this item? This action cannot be undone.')",
    "setActionMessage({ type: 'success'",
  ]);
});

test('language switching and bilingual product copy remain present', () => {
  expectAll('language', [
    'settings.language',
    "settings.language === 'pt'",
    'SUPPORTED_LANGUAGES',
  ]);
});

test('AI analysis and AI chat entry points remain connected', () => {
  expectAll('AI', [
    'handleRunAIAnalysis',
    'setIsAIPanelOpen(true)',
    'aiAnalysis',
    'chatMessages',
  ]);
});
