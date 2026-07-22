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
    "onSnapshot(doc(db, 'users', userId, 'settings', 'current')",
    "collection(db, 'users', userId, 'incomes')",
    "collection(db, 'users', userId, 'fixedExpenses')",
    "setDoc(doc(db, 'users', userId, 'settings', 'current')",
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
    "const handleEdit = (type: 'income' | 'expense' | 'event' | 'goal'",
    'setModalType(type)',
    'setEditingItem(item)',
    "window.confirm('Delete this item? This action cannot be undone.')",
    "deleteDoc(doc(db, 'users', user.uid, collectionName, id))",
    'setActionMessage({ type: \'success\'',
  ]);
});

test('language switching and bilingual product copy remain present', () => {
  expectAll('language', [
    'TRANSLATIONS',
    'settings.language as Language',
    "settings.language === 'pt'",
    "language: 'en'",
  ]);
});

test('AI analysis and AI chat entry points remain connected', () => {
  expectAll('AI', [
    'handleRunAIAnalysis',
    'generateFinancialAnalysis',
    'handleAskAI',
    'askFinancialQuestion',
    'chatHistory',
    'setIsAIPanelOpen(true)',
  ]);
});
