import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = [
  '../../src/App.tsx',
  '../../scripts/harden-financial-actions.mjs',
  '../../scripts/final-product-polish.mjs',
];

const corpus = files
  .map((file) => fs.readFileSync(new URL(file, import.meta.url), 'utf8'))
  .join('\n');

function expectMatch(label, pattern) {
  assert.match(corpus, pattern, `${label}: missing ${pattern}`);
}

test('onboarding completion and Firestore persistence contracts remain wired', () => {
  expectMatch('onboarding completed', /onboarding_completed/);
  expectMatch('settings listener', /onSnapshot\(doc\(db,\s*['"]users['"],\s*userId,\s*['"]settings['"],\s*['"]current['"]\)/);
  expectMatch('income listener', /collection\(db,\s*['"]users['"],\s*userId,\s*['"]incomes['"]\)/);
  expectMatch('expense listener', /collection\(db,\s*['"]users['"],\s*userId,\s*['"]fixedExpenses['"]\)/);
  expectMatch('settings persistence', /setDoc\(doc\(db,\s*['"]users['"],\s*(?:userId|user\.uid),\s*['"]settings['"],\s*['"]current['"]\)/);
});

test('duplicate prevention remains enforced for financial item saves', () => {
  expectMatch('save lock', /itemSaveLockRef\.current/);
  expectMatch('duplicate guard', /if \(!user \|\| itemSaveLockRef\.current\) return/);
  expectMatch('saving state', /setIsSavingItem\(true\)/);
  expectMatch('disabled submit', /disabled=\{isSavingItem\}/);
});

test('editing and deleting remain available with confirmation and feedback', () => {
  expectMatch('edit handler', /const handleEdit = \(type: ['"]income['"] \| ['"]expense['"] \| ['"]event['"] \| ['"]goal['"]/);
  expectMatch('edit item selected', /setEditingItem\(item\)/);
  expectMatch('delete confirmation', /window\.confirm\(['"]Delete this item\? This action cannot be undone\.['"]\)/);
  expectMatch('delete operation', /deleteDoc\(doc\(db,\s*['"]users['"],\s*user\.uid,\s*collectionName,\s*id\)\)/);
  expectMatch('success feedback', /setActionMessage\(\{\s*type:\s*['"]success['"]/);
});

test('language switching and bilingual product copy remain present', () => {
  expectMatch('translation table', /TRANSLATIONS/);
  expectMatch('selected language', /settings\.language as Language/);
  expectMatch('Portuguese copy', /settings\.language === ['"]pt['"]/);
  expectMatch('default language', /language:\s*['"]en['"]/);
});

test('AI analysis and AI chat entry points remain connected', () => {
  expectMatch('analysis handler', /handleRunAIAnalysis/);
  expectMatch('analysis service', /generateFinancialAnalysis/);
  expectMatch('chat handler', /handleAskAI/);
  expectMatch('chat service', /askFinancialQuestion/);
  expectMatch('chat history', /chatHistory/);
  expectMatch('AI panel', /setIsAIPanelOpen\(true\)/);
});
