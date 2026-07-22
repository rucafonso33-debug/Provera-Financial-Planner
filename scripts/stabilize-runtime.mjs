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

source = source.replace(
  "import { GoogleAuthProvider, signInWithCredential, signInWithRedirect } from 'firebase/auth';",
  "import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';"
);
source = source.replace(
  "        await signInWithRedirect(auth, new GoogleAuthProvider());",
  "        await signInWithPopup(auth, new GoogleAuthProvider());"
);

const oldSaveSettings = `  const handleSaveSettings = async (newSettings: AppSettings) => {
    if (!user) return;
    try {
      const settingsToSave = {
        ...newSettings,
        balance_last_updated: newSettings.current_balance !== settings.current_balance 
          ? new Date().toISOString() 
          : newSettings.balance_last_updated || settings.balance_last_updated
      };
      await setDoc(doc(db, 'users', user.uid, 'settings', 'current'), settingsToSave);
      setSettings(settingsToSave);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, \`users/\${user.uid}/settings/current\`);
    }
  };`;

const newSaveSettings = `  const handleSaveSettings = async (newSettings: AppSettings) => {
    if (!user) throw new Error('No authenticated user');

    const settingsToSave = {
      ...newSettings,
      language: newSettings.language === 'pt' ? 'pt' : 'en',
      balance_last_updated: newSettings.current_balance !== settings.current_balance
        ? new Date().toISOString()
        : newSettings.balance_last_updated || settings.balance_last_updated
    } as AppSettings;

    setSettings(settingsToSave);
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'current');

    try {
      await Promise.race([
        setDoc(settingsRef, settingsToSave),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error('Settings save timed out')), 12000))
      ]);
      const saved = await getDoc(settingsRef);
      if (!saved.exists()) throw new Error('Settings were not confirmed by Firestore');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, \`users/\${user.uid}/settings/current\`);
      throw error;
    }
  };`;

if (source.includes(oldSaveSettings)) source = source.replace(oldSaveSettings, newSaveSettings);

const oldLanguageMenu = `            <div className="relative group">
              <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                <Globe size={20} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-zinc-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-64 overflow-y-auto">
                {[
                  { code: 'en', name: 'English' },
                  { code: 'pt', name: 'Português' },
                  { code: 'es', name: 'Español' },
                  { code: 'fr', name: 'Français' },
                  { code: 'de', name: 'Deutsch' },
                  { code: 'it', name: 'Italiano' },
                  { code: 'zh', name: '中文' },
                  { code: 'ja', name: '日本語' },
                  { code: 'hi', name: 'हिन्दी' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleSaveSettings({ ...settings, language: lang.code as Language })}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors",
                      settings.language === lang.code ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50"
                    )}
                  >
                    {lang.name}
                    {settings.language === lang.code && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>`;

const newLanguageMenu = `            <label className="relative flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-500 shadow-sm">
              <Globe size={17} />
              <span className="sr-only">Language</span>
              <select
                aria-label="Language"
                value={settings.language === 'pt' ? 'pt' : 'en'}
                onChange={(e) => handleSaveSettings({ ...settings, language: e.target.value as Language })}
                className="appearance-none bg-transparent pr-1 text-[11px] font-black uppercase tracking-wider text-zinc-700 outline-none"
              >
                <option value="en">EN</option>
                <option value="pt">PT</option>
              </select>
            </label>`;

if (source.includes(oldLanguageMenu)) source = source.replace(oldLanguageMenu, newLanguageMenu);

const onboardingAnchor = `<div className="max-w-md w-full space-y-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-2">`;
const onboardingWithLanguage = `<div className="max-w-md w-full space-y-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-end">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white">
              <Globe size={15} />
              <select aria-label="Language" value={settings.language === 'pt' ? 'pt' : 'en'} onChange={(e) => setSettings(s => ({ ...s, language: e.target.value as Language }))} className="bg-transparent outline-none">
                <option className="text-zinc-900" value="en">EN</option>
                <option className="text-zinc-900" value="pt">PT</option>
              </select>
            </label>
          </div>
          <div className="text-center space-y-2">`;
if (source.includes(onboardingAnchor)) source = source.replace(onboardingAnchor, onboardingWithLanguage);

source = source.replace(
  `                                handleCurrencyChange(curr.code);
                                setIsCurrencySelectorOpen(false);`,
  `                                setSettings(s => ({
                                  ...s,
                                  currency: curr.code,
                                  remittance_currency: s.remittance_currency === curr.code ? (curr.code === 'CHF' ? 'EUR' : 'CHF') : s.remittance_currency
                                }));
                                setIsCurrencySelectorOpen(false);`
);

const oldSetupWrites = `                        await Promise.all([
                          ...onboardingData.incomes.map(inc => setDoc(doc(incRef), inc)),
                          ...onboardingData.expenses.map(exp => setDoc(doc(expRef), exp)),
                          handleSaveSettings({ 
                            ...settings, 
                            onboarding_completed: true,
                            balance_last_updated: new Date().toISOString()
                          })
                        ]);
                        setRunTutorial(true);`;

const newSetupWrites = `                        const completedSettings = {
                          ...settings,
                          language: settings.language === 'pt' ? 'pt' : 'en',
                          onboarding_completed: true,
                          balance_last_updated: new Date().toISOString()
                        } as AppSettings;

                        await Promise.race([
                          Promise.all([
                            ...onboardingData.incomes.map((inc, index) => setDoc(doc(incRef, \`setup-income-\${index}\`), inc)),
                            ...onboardingData.expenses.map((exp, index) => setDoc(doc(expRef, \`setup-expense-\${index}\`), exp)),
                            handleSaveSettings(completedSettings)
                          ]),
                          new Promise((_, reject) => window.setTimeout(() => reject(new Error('Setup save timed out')), 15000))
                        ]);

                        const confirmed = await getDoc(doc(db, 'users', user.uid, 'settings', 'current'));
                        if (!confirmed.exists() || confirmed.data().onboarding_completed !== true) {
                          throw new Error('Setup was not confirmed by Firestore');
                        }

                        setSettings(completedSettings);
                        setRunTutorial(true);`;

if (source.includes(oldSetupWrites)) source = source.replace(oldSetupWrites, newSetupWrites);

source = source.replaceAll(
  'className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"',
  'className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"'
);
source = source.replaceAll(
  'className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity"',
  'className="flex flex-col gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"'
);

const timeoutWrite = (writeExpression) => `await Promise.race([\n          ${writeExpression},\n          new Promise((_, reject) => window.setTimeout(() => reject(new Error('Save timed out')), 12000))\n        ]);`;
source = source.replace(
  'await setDoc(doc(colRef, editingItem.id), data, { merge: true });',
  timeoutWrite('setDoc(doc(colRef, editingItem.id), data, { merge: true })')
);
source = source.replace(
  'await setDoc(doc(colRef), data);',
  timeoutWrite('setDoc(doc(colRef), data)')
);

source = source.replace(
  `onChange={(e) => handleSaveSettings({...settings, user_name: e.target.value})}`,
  `onChange={(e) => setSettings(s => ({ ...s, user_name: e.target.value }))}
                      onBlur={(e) => handleSaveSettings({ ...settings, user_name: e.currentTarget.value })}`
);
source = source.replace(
  `onChange={(e) => handleSaveSettings({...settings, partner_name: e.target.value})}`,
  `onChange={(e) => setSettings(s => ({ ...s, partner_name: e.target.value }))}
                        onBlur={(e) => handleSaveSettings({ ...settings, partner_name: e.currentTarget.value })}`
);
source = source.replace(
  `onChange={(e) => handleSaveSettings({...settings, current_balance: Number(e.target.value)})}`,
  `onChange={(e) => setSettings(s => ({ ...s, current_balance: Number(e.target.value) }))}
                      onBlur={(e) => handleSaveSettings({ ...settings, current_balance: Number(e.currentTarget.value) })}`
);
source = source.replace(
  `onChange={(e) => handleSaveSettings({...settings, weekly_spending_estimate: Number(e.target.value)})}`,
  `onChange={(e) => setSettings(s => ({ ...s, weekly_spending_estimate: Number(e.target.value) }))}
                      onBlur={(e) => handleSaveSettings({ ...settings, weekly_spending_estimate: Number(e.currentTarget.value) })}`
);
source = source.replace(
  `onChange={(e) => handleSaveSettings({...settings, safety_threshold: Number(e.target.value)})}`,
  `onChange={(e) => setSettings(s => ({ ...s, safety_threshold: Number(e.target.value) }))}
                      onBlur={(e) => handleSaveSettings({ ...settings, safety_threshold: Number(e.currentTarget.value) })}`
);

fs.writeFileSync(path, source);
console.log('Runtime, idempotent onboarding persistence, stable settings editing and bounded saves applied.');
