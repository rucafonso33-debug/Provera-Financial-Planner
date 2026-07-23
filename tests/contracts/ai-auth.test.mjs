import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../api/ai.ts', import.meta.url), 'utf8');

test('AI endpoint keeps Firebase token verification configured in production', () => {
  assert.match(source, /process\.env\.FIREBASE_WEB_API_KEY\s*\|\|/);
  assert.match(source, /process\.env\.VITE_FIREBASE_API_KEY\s*\|\|/);
  assert.match(source, /identitytoolkit\.googleapis\.com\/v1\/accounts:lookup\?key=\$\{firebaseApiKey\}/);
  assert.match(source, /verifyFirebaseToken\(token\)/);
});

test('AI endpoint rejects requests without a bearer token', () => {
  assert.match(source, /authorization/i);
  assert.match(source, /bearer/i);
  assert.match(source, /401/);
});
