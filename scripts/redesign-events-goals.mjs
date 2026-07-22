import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

function replaceAllExact(oldText, newText, label) {
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) throw new Error(`Unable to apply ${label}: marker not found.`);
  source = source.split(oldText).join(newText);
}

replaceAllExact(
  `<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Future Events</h3>
              </div>
              <button 
                onClick={() => { setModalType('event'); setEditingItem(null); setIsModalOpen(true); }}
                className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 shadow-sm hover:bg-zinc-800 transition-colors"
              >
                <Plus size={14} /> New Event
              </button>
            </div>`,
  `<div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="overflow-hidden rounded-[30px] bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-xl shadow-amber-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">Plan ahead</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight">Future events</h2>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-amber-50">See upcoming one-off costs before they affect your balance.</p>
                </div>
                <button
                  onClick={() => { setModalType('event'); setEditingItem(null); setIsModalOpen(true); }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-lg active:scale-95"
                  aria-label="Add event"
                >
                  <Plus size={22} />
                </button>
              </div>
              <div className="mt-5 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-100">Planned events</p>
                <p className="mt-1 text-2xl font-black">{events.length}</p>
              </div>
            </section>`,
  'events hero',
);

replaceAllExact(
  `className="bg-white rounded-2xl p-4 border border-zinc-200 flex items-center justify-between shadow-sm group hover:border-amber-200 transition-all"`,
  `className="group flex items-center justify-between rounded-[24px] border border-zinc-100 bg-white p-4 shadow-sm transition-all active:scale-[0.99]"`,
  'event cards',
);

replaceAllExact(
  `className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"`,
  `className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"`,
  'event icon',
);

replaceAllExact(
  `className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"`,
  `className="flex items-center gap-1 opacity-100 transition-opacity"`,
  'visible item actions',
);

replaceAllExact(
  `<div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900">{t.goals}</h2>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{t.planFuture}</p>
              </div>
              <button 
                onClick={() => { setModalType('goal'); setEditingItem(null); setIsModalOpen(true); }}
                className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Plus size={24} />
              </button>
            </div>`,
  `<div className="space-y-5 animate-in slide-in-from-right duration-500">
            <section className="overflow-hidden rounded-[30px] bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Build your future</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight">{t.goals}</h2>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">Turn future plans into a weekly amount you can act on today.</p>
                </div>
                <button
                  onClick={() => { setModalType('goal'); setEditingItem(null); setIsModalOpen(true); }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-950 shadow-lg active:scale-95"
                  aria-label="Add goal"
                >
                  <Plus size={22} />
                </button>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Active goals</p>
                <p className="mt-1 text-2xl font-black">{goals.filter(goal => !goal.is_completed).length}</p>
              </div>
            </section>`,
  'goals hero',
);

replaceAllExact(
  `className="bg-white rounded-[32px] p-6 border border-zinc-100 shadow-sm relative overflow-hidden group"`,
  `className="group relative overflow-hidden rounded-[28px] border border-zinc-100 bg-white p-5 shadow-sm transition-all active:scale-[0.99]"`,
  'goal cards',
);

replaceAllExact(
  `className="text-center py-20 bg-white rounded-[40px] border border-zinc-100 shadow-sm"`,
  `className="rounded-[30px] border border-dashed border-zinc-200 bg-white px-6 py-16 text-center shadow-sm"`,
  'goal empty state',
);

replaceAllExact(
  `className="text-center py-16 bg-white rounded-3xl border border-zinc-100 shadow-sm"`,
  `className="rounded-[30px] border border-dashed border-zinc-200 bg-white px-6 py-16 text-center shadow-sm"`,
  'event empty state',
);

fs.writeFileSync(path, source);
console.log('Events and goals redesigned.');
