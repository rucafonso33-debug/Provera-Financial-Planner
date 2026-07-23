import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

source = source.replace(
  "import { enUS, ptBR } from 'date-fns/locale';",
  "import { enUS, pt } from 'date-fns/locale';"
);
source = source.replace(
  "return new Intl.NumberFormat(settings.language === 'pt' ? 'pt-BR' : 'en-US', {",
  "return new Intl.NumberFormat(settings.language === 'pt' ? 'pt-PT' : 'en-US', {"
);
source = source.replace(
  "return settings.language === 'pt' ? ptBR : enUS;",
  "return settings.language === 'pt' ? pt : enUS;"
);

const marker = "  const [incomes, setIncomes] = useState<Income[]>([]);";
const languageEffect = `  useEffect(() => {\n    document.documentElement.lang = settings.language === 'pt' ? 'pt-PT' : 'en';\n  }, [settings.language]);\n\n${marker}`;

if (!source.includes("document.documentElement.lang = settings.language")) {
  if (!source.includes(marker)) throw new Error('Unable to locate language effect marker.');
  source = source.replace(marker, languageEffect);
}

fs.writeFileSync(path, source);
console.log('European Portuguese locale and document language applied.');
