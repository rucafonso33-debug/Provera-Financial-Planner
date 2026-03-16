import React from 'react';
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppSettings, ForecastWeek } from '../types';
import { RecoveryPlan } from './RecoveryPlan';
import { cn } from '../lib/utils';

interface FinancialHealthProps {
  settings: AppSettings;
  forecast: ForecastWeek[];
  effectiveBalance: number;
  forecastWeeks: number;
  formatCurrency: (value: number) => string;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onOpenSettings: (type: 'balance' | 'spending' | 'threshold') => void;
  smartAlerts: { type: 'warning' | 'info' | 'success' | 'danger'; message: string; icon: any }[];
  t: any;
}

export function FinancialHealth({ 
  settings, 
  forecast, 
  effectiveBalance, 
  forecastWeeks, 
  formatCurrency, 
  onUpdateSettings,
  onOpenSettings,
  smartAlerts,
  t 
}: FinancialHealthProps) {
  const isBelowThreshold = forecast.some(w => w.is_below_threshold);

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <div className="bg-zinc-900 rounded-[40px] p-8 text-white shadow-2xl shadow-zinc-200 overflow-hidden relative group">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{t.currentBalance}</p>
            <button 
              onClick={() => onOpenSettings('threshold')}
              className="bg-white/10 px-2 py-1 rounded-lg flex items-center gap-1.5 hover:bg-white/20 transition-colors"
            >
              <Target size={12} className="text-zinc-400" />
              <span className="text-[10px] font-bold uppercase text-zinc-300">
                {settings.language === 'pt' ? 'Limite de Segurança' : 'Safety Limit'}: {formatCurrency(settings.safety_threshold)}
              </span>
            </button>
          </div>
          <h2 
            onClick={() => onOpenSettings('balance')}
            className="text-4xl font-bold mt-2 tracking-tight cursor-pointer hover:text-zinc-300 transition-colors"
          >
            {formatCurrency(effectiveBalance)}
          </h2>
          
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div 
              onClick={() => onOpenSettings('spending')}
              className="bg-white/5 rounded-2xl p-3 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{t.weeklySpending}</p>
              <p className="text-sm font-bold">{formatCurrency(settings.weekly_spending_estimate)}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Status {forecastWeeks} {t.weeks.substring(0, 3)}.</p>
              <div className="flex items-center gap-1.5">
                {isBelowThreshold ? (
                  <>
                    <AlertTriangle size={14} className="text-rose-500" />
                    <span className="text-sm font-bold text-rose-500">{t.risk}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-500">{t.safe}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Smart Alerts */}
      <div className="space-y-2">
        {smartAlerts.map((alert, idx) => (
          <div 
            key={idx} 
            className={cn(
              "rounded-2xl p-4 flex items-center gap-3 border animate-in slide-in-from-left duration-300",
              alert.type === 'danger' && "bg-rose-50 border-rose-100 text-rose-900",
              alert.type === 'warning' && "bg-amber-50 border-amber-100 text-amber-900",
              alert.type === 'success' && "bg-emerald-50 border-emerald-100 text-emerald-900",
              alert.type === 'info' && "bg-blue-50 border-blue-100 text-blue-900"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
              alert.type === 'danger' && "bg-rose-100 text-rose-600",
              alert.type === 'warning' && "bg-amber-100 text-amber-600",
              alert.type === 'success' && "bg-emerald-100 text-emerald-600",
              alert.type === 'info' && "bg-blue-100 text-blue-600"
            )}>
              <alert.icon size={18} />
            </div>
            <p className="text-xs font-bold leading-tight">{alert.message}</p>
          </div>
        ))}
      </div>

      {/* Recovery Plan */}
      <RecoveryPlan 
        settings={settings}
        forecast={forecast}
        onApplyFix={onUpdateSettings}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
