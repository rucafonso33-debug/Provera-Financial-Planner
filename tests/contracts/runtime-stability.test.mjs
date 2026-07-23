import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');

function includesAll(label, snippets) {
  test(label, () => {
    for (const snippet of snippets) {
      assert.ok(app.includes(snippet), `Missing contract: ${snippet}`);
    }
  });
}

includesAll('onboarding persists and confirms completion', [
  "onboarding_completed: true",
  "Setup was not confirmed by Firestore",
  "setup-income-${index}",
  "setup-expense-${index}",
]);

includesAll('settings edits save on blur instead of every keystroke', [
  "onBlur={(e) => handleSaveSettings({ ...settings, user_name:",
  "onBlur={(e) => handleSaveSettings({ ...settings, current_balance:",
  "Settings save timed out",
]);

includesAll('item writes are bounded and duplicate-safe', [
  "itemSaveLockRef.current",
  "isSavingItem",
  "Save timed out",
]);

includesAll('editing and deleting remain wired', [
  "const handleEdit =",
  "const handleDelete = async",
  "await deleteDoc(",
  "editingItem.id",
]);

includesAll('language is limited to supported values', [
  "settings.language === 'pt' ? 'pt' : 'en'",
  '<option value="en">EN</option>',
  '<option value="pt">PT</option>',
]);

includesAll('AI analysis and chat actions remain connected', [
  "generateFinancialAnalysis({",
  "askFinancialQuestion(finalQuestion",
  "setAIAnalysis(analysis)",
  "setChatHistory(prev => [...prev, modelMessage])",
]);
