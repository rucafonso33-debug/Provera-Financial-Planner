import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

function replaceRegex(pattern, replacement, label) {
  if (source.includes(replacement.trim())) return;
  if (!pattern.test(source)) throw new Error(`Unable to apply ${label}: marker not found.`);
  source = source.replace(pattern, replacement);
}

replaceRegex(
  /\n\s*\{\/\* Financial Health Indicator \*\/\}[\s\S]*?\n\s*\{\/\* Goals Progress Card \*\/\}/,
  '\n\n            {/* Goals Progress Card */}',
  'remove duplicate financial health card',
);

replaceRegex(
  /\n\s*\{\/\* Currency Converter \/ Remittance Card \*\/\}[\s\S]*?\n\s*\{\/\* AI Advisor Entry Card \*\/\}/,
  '\n\n            {/* AI Advisor Entry Card */}',
  'remove duplicate remittance card',
);

replaceRegex(
  /\n\s*\{\/\* Currency Converter Tool \*\/\}[\s\S]*?\n\s*\{\/\* Chart \*\/\}/,
  '\n\n            {/* Chart */}',
  'move currency converter out of dashboard',
);

replaceRegex(
  /\s*\{\/\* AI Advisor Entry Card \*\/\}[\s\S]*?\n\s*\{\/\* Monthly Summary Card \*\/\}/,
  `            {/* AI Advisor Entry Card */}
            <button
              onClick={() => { setIsAIPanelOpen(true); if (!aiAnalysis) handleRunAIAnalysis(); }}
              className="group flex w-full items-center justify-between rounded-[28px] border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-left text-white shadow-xl shadow-indigo-100 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Brain size={25} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-200">Provera AI</p>
                  <p className="mt-1 text-base font-black">Explain my financial position</p>
                  <p className="mt-1 text-xs text-indigo-100">Insights based on your real forecast.</p>
                </div>
              </div>
              <ArrowRight size={20} className="shrink-0 transition-transform group-active:translate-x-1" />
            </button>

            {/* Monthly Summary Card */}`,
  'compact AI card',
);

replaceRegex(
  /\s*\{\/\* Monthly Summary Card \*\/\}[\s\S]*?\n\s*\{\/\* Chart \*\/\}/,
  `            {/* Monthly Summary Card */}
            <section className="provera-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">This month</p>
                  <h2 className="mt-1 text-xl font-black">Cash-flow summary</h2>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase text-zinc-500">{format(new Date(), 'MMMM')}</span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-[9px] font-black uppercase text-emerald-600">Income</p>
                  <p className="mt-1 truncate text-sm font-black text-emerald-700">{formatCurrency(monthlySummary.totalIncome)}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-3">
                  <p className="text-[9px] font-black uppercase text-rose-600">Fixed</p>
                  <p className="mt-1 truncate text-sm font-black text-rose-700">{formatCurrency(monthlySummary.totalFixed)}</p>
                </div>
                <div className="rounded-2xl bg-zinc-100 p-3">
                  <p className="text-[9px] font-black uppercase text-zinc-500">Variable</p>
                  <p className="mt-1 truncate text-sm font-black text-zinc-800">{formatCurrency(monthlySummary.monthlyVariable)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Projected month-end</p>
                  <p className={cn("mt-1 text-2xl font-black", monthlySummary.projectedRemaining < 0 ? "text-rose-600" : "text-zinc-950")}>
                    {formatCurrency(monthlySummary.projectedRemaining)}
                  </p>
                </div>
                <button onClick={() => setIsSimPanelOpen(true)} className="rounded-2xl bg-zinc-950 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-white">
                  Simulate
                </button>
              </div>
            </section>

            {/* Chart */}`,
  'compact monthly summary',
);

fs.writeFileSync(path, source);
console.log('Dashboard secondary content simplified.');
