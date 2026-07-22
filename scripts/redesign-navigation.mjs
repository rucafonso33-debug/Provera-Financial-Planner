import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) throw new Error(`Unable to apply ${label}: marker not found.`);
  source = source.replace(oldText, newText);
}

replaceOnce(
  '<header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-40">',
  '<header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 px-5 py-3 backdrop-blur-xl">',
  'premium header',
);

replaceOnce(
  '<div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">',
  '<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-300">',
  'brand icon',
);

replaceOnce(
  '<main className="max-w-md mx-auto px-6 py-6 space-y-6">',
  '<main className="mx-auto max-w-md space-y-6 px-4 py-5 sm:px-6">',
  'mobile content spacing',
);

const oldNav = `      {/* Bottom Navigation */}
      <nav id="setup-tabs" className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 pb-8 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('forecast')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'forecast' ? "text-zinc-900" : "text-zinc-400"
            )}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold uppercase">{t.forecast}</span>
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'events' ? "text-zinc-900" : "text-zinc-400"
            )}
          >
            <Calendar size={24} />
            <span className="text-[10px] font-bold uppercase">{t.events}</span>
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'goals' ? "text-zinc-900" : "text-zinc-400"
            )}
          >
            <Target size={24} />
            <span className="text-[10px] font-bold uppercase">{t.goals}</span>
          </button>
          <button 
            onClick={() => setActiveTab('setup')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'setup' ? "text-zinc-900" : "text-zinc-400"
            )}
          >
            <SettingsIcon size={24} />
            <span className="text-[10px] font-bold uppercase">{t.settings}</span>
          </button>
        </div>
      </nav>`;

const newNav = `      {/* Bottom Navigation */}
      <nav id="setup-tabs" className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(var(--safe-bottom)+12px)]">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[24px] border border-white/80 bg-white/90 p-2 shadow-2xl shadow-zinc-300/70 backdrop-blur-xl">
          {[
            { id: 'forecast', label: t.forecast, icon: LayoutDashboard },
            { id: 'events', label: t.events, icon: Calendar },
            { id: 'goals', label: t.goals, icon: Target },
            { id: 'setup', label: t.settings, icon: SettingsIcon }
          ].map(item => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-all",
                  selected ? "bg-zinc-950 text-white shadow-lg" : "text-zinc-400 active:bg-zinc-100"
                )}
                aria-current={selected ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={selected ? 2.5 : 2} />
                <span className="max-w-full truncate text-[9px] font-black uppercase tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>`;

replaceOnce(oldNav, newNav, 'floating bottom navigation');

source = source.replaceAll('className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity"', 'className="flex flex-col gap-2 opacity-100 transition-opacity"');
source = source.replaceAll('className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"', 'className="flex items-center gap-2 opacity-100 transition-opacity"');

replaceOnce(
  'className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90 z-40 animate-bounce-slow"',
  'className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200 transition-all active:scale-90"',
  'calmer AI action button',
);

fs.writeFileSync(path, source);
console.log('Navigation and mobile hierarchy redesigned.');
