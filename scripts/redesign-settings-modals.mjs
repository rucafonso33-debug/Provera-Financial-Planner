import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

function replaceExact(oldText, newText, label, required = true) {
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) {
    if (required) throw new Error(`Unable to apply ${label}: marker not found.`);
    console.warn(`Skipping optional ${label}: marker not found.`);
    return;
  }
  source = source.replace(oldText, newText);
}

replaceExact(
  `<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Global Settings */}`,
  `<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="overflow-hidden rounded-[30px] bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Control centre</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">{t.settings}</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-indigo-100">Manage your plan, recurring money and personal preferences in one place.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Monthly income</p>
                  <p className="mt-1 text-xl font-black">{formatCurrency(monthlySummary.totalIncome)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Fixed costs</p>
                  <p className="mt-1 text-xl font-black">{formatCurrency(monthlySummary.totalFixed)}</p>
                </div>
              </div>
            </section>

            {/* Global Settings */}`,
  'settings hero',
);

replaceExact(
  `className="bg-white rounded-3xl p-6 border border-zinc-200 space-y-6 shadow-sm"`,
  `className="provera-card space-y-6 p-5 sm:p-6"`,
  'settings card',
  false,
);

replaceExact(
  `className="w-full bg-zinc-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"`,
  `className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"`,
  'settings inputs',
  false,
);

replaceExact(
  `className="w-full bg-zinc-50 border-none rounded-2xl pl-14 pr-4 py-3 text-lg font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"`,
  `className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-14 pr-4 text-lg font-bold outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"`,
  'balance input',
  false,
);

replaceExact(
  `<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/40 backdrop-blur-sm">`,
  `<div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">`,
  'modal backdrop',
  false,
);

replaceExact(
  `className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col"`,
  `className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[30px] bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-[30px]"`,
  'simulation modal shell',
  false,
);

replaceExact(
  `<form key={editingItem?.id || 'new'} onSubmit={handleAddItem} className="p-8 space-y-6">`,
  `<form key={editingItem?.id || 'new'} onSubmit={handleAddItem} className="space-y-5 overflow-y-auto p-5 pb-[calc(var(--safe-bottom)+24px)] sm:p-7">`,
  'item modal form',
  false,
);

replaceExact(
  `className="w-full bg-zinc-50 border-none rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-inner"`,
  `className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 font-bold outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"`,
  'modal inputs',
  false,
);

replaceExact(
  `"w-full py-5 rounded-[20px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"`,
  `"flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"`,
  'modal submit button',
  false,
);

fs.writeFileSync(path, source);
console.log('Settings and modals redesigned.');
