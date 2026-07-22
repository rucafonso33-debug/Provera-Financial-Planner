import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

function optional(oldText, newText, label) {
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) {
    console.warn(`Skipping optional ${label}: marker not found.`);
    return;
  }
  source = source.split(oldText).join(newText);
}

optional('>Current balance<', `>{settings.language === 'pt' ? 'Saldo atual' : 'Current balance'}<`, 'current balance translation');
optional('>End of month<', `>{settings.language === 'pt' ? 'Fim do mês' : 'End of month'}<`, 'month-end translation');
optional('>Next risk<', `>{settings.language === 'pt' ? 'Próximo risco' : 'Next risk'}<`, 'next risk translation');
optional('>No risk<', `>{settings.language === 'pt' ? 'Sem risco' : 'No risk'}<`, 'no risk translation');
optional('>Financial health<', `>{settings.language === 'pt' ? 'Saúde financeira' : 'Financial health'}<`, 'health translation');
optional('>Insights<', `>{settings.language === 'pt' ? 'Análise' : 'Insights'}<`, 'insights translation');
optional('>Plan ahead<', `>{settings.language === 'pt' ? 'Planeia com antecedência' : 'Plan ahead'}<`, 'events eyebrow translation');
optional('>Future events<', `>{settings.language === 'pt' ? 'Eventos futuros' : 'Future events'}<`, 'events title translation');
optional('>Planned events<', `>{settings.language === 'pt' ? 'Eventos planeados' : 'Planned events'}<`, 'events count translation');
optional('>Build your future<', `>{settings.language === 'pt' ? 'Constrói o teu futuro' : 'Build your future'}<`, 'goals eyebrow translation');
optional('>Active goals<', `>{settings.language === 'pt' ? 'Objetivos ativos' : 'Active goals'}<`, 'active goals translation');
optional('>Control centre<', `>{settings.language === 'pt' ? 'Centro de controlo' : 'Control centre'}<`, 'settings eyebrow translation');
optional('>Monthly income<', `>{settings.language === 'pt' ? 'Rendimento mensal' : 'Monthly income'}<`, 'income translation');
optional('>Fixed costs<', `>{settings.language === 'pt' ? 'Custos fixos' : 'Fixed costs'}<`, 'fixed costs translation');
optional('>Saving…<', `>{settings.language === 'pt' ? 'A guardar…' : 'Saving…'}<`, 'saving translation');
optional("'Changes saved.'", "settings.language === 'pt' ? 'Alterações guardadas.' : 'Changes saved.'", 'saved message translation');
optional("'Item added.'", "settings.language === 'pt' ? 'Item adicionado.' : 'Item added.'", 'added message translation');
optional("'Item deleted.'", "settings.language === 'pt' ? 'Item eliminado.' : 'Item deleted.'", 'deleted message translation');

fs.writeFileSync(path, source);
console.log('Final product polish applied.');
