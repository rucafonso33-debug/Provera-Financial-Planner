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

fs.writeFileSync(path, source);
console.log('Runtime loading recovery applied.');
