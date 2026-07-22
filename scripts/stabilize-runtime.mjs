import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

const oldSettingsError = "    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${userId}/settings/current`));";
const newSettingsError = `    }, (err) => {
      handleFirestoreError(err, OperationType.GET, \`users/\${userId}/settings/current\`);
      setAuthError(settings.language === 'pt' ? 'Não foi possível carregar os teus dados.' : 'Unable to load your data.');
      setLoading(false);
    });`;

if (!source.includes(newSettingsError)) {
  if (!source.includes(oldSettingsError)) {
    throw new Error('Unable to locate Firestore settings listener error callback.');
  }
  source = source.replace(oldSettingsError, newSettingsError);
}

// The browser resolver is now configured in firebase.ts, so popup auth is safe
// and avoids mobile redirect sessions returning without a persisted user.
source = source.replace(
  "import { GoogleAuthProvider, signInWithCredential, signInWithRedirect } from 'firebase/auth';",
  "import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';"
);
source = source.replace(
  "        await signInWithRedirect(auth, new GoogleAuthProvider());",
  "        await signInWithPopup(auth, new GoogleAuthProvider());"
);

fs.writeFileSync(path, source);
console.log('Runtime loading and browser authentication recovery applied.');
