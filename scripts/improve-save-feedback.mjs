import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) throw new Error(`Unable to apply ${label}: marker not found.`);
  source = source.replace(oldText, newText);
}

replaceOnce(
  `  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);\n  const itemSaveLockRef = useRef(false);`,
  `  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);\n  const itemSaveLockRef = useRef(false);\n\n  useEffect(() => {\n    if (!actionMessage) return;\n    const timer = window.setTimeout(() => setActionMessage(null), actionMessage.type === 'success' ? 3000 : 6000);\n    return () => window.clearTimeout(timer);\n  }, [actionMessage]);`,
  'automatic feedback dismissal',
);

const feedback = `.then(() => setActionMessage({ type: 'success', text: settings.language === 'pt' ? 'Definições guardadas.' : 'Settings saved.' }))\n                        .catch(() => setActionMessage({ type: 'error', text: settings.language === 'pt' ? 'Não foi possível guardar as definições.' : 'Could not save settings.' }))`;

const fields = [
  ['user_name: e.currentTarget.value })}', `user_name: e.currentTarget.value })${feedback}`],
  ['partner_name: e.currentTarget.value })}', `partner_name: e.currentTarget.value })${feedback}`],
  ['current_balance: Number(e.currentTarget.value) })}', `current_balance: Number(e.currentTarget.value) })${feedback}`],
  ['weekly_spending_estimate: Number(e.currentTarget.value) })}', `weekly_spending_estimate: Number(e.currentTarget.value) })${feedback}`],
  ['safety_threshold: Number(e.currentTarget.value) })}', `safety_threshold: Number(e.currentTarget.value) })${feedback}`],
];

for (const [oldText, newText] of fields) {
  if (source.includes(oldText)) source = source.replace(oldText, newText);
}

fs.writeFileSync(path, source);
console.log('Save feedback and automatic notification dismissal applied.');
