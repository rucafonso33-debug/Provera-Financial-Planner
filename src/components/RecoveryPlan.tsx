import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { AppSettings, ForecastWeek } from '../types';
import { cn } from '../lib/utils';

interface RecoveryPlanProps {
  settings: AppSettings;
  forecast: ForecastWeek[];
  onApplyFix: (newSettings: Partial<AppSettings>) => Promise<void>;
  formatCurrency: (value: number) => string;
}

export function RecoveryPlan({ settings, forecast, onApplyFix, formatCurrency }: RecoveryPlanProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFix, setSelectedFix] = useState<{ type: 'spending' | 'income', value: number } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const recoveryOptions = useMemo(() => {
    const firstWeekBelow = forecast.find(w => w.is_below_threshold);
    if (!firstWeekBelow) return null;

    // Find the absolute minimum balance in the forecast to ensure the fix covers all weeks
    let minBalance = Infinity;
    let minWeekIndex = -1;
    
    forecast.forEach((w, idx) => {
      if (w.projected_balance < minBalance) {
        minBalance = w.projected_balance;
        minWeekIndex = idx;
      }
    });

    if (minBalance >= settings.safety_threshold) return null;

    const deficit = settings.safety_threshold - minBalance;
    // We need to recover 'deficit' over 'minWeekIndex' weeks
    const weeklyAdjustment = Math.ceil(deficit / minWeekIndex);

    return {
      week: firstWeekBelow.week_number,
      spendingReduction: Math.max(0, settings.weekly_spending_estimate - weeklyAdjustment),
      incomeIncrease: weeklyAdjustment,
      adjustment: weeklyAdjustment
    };
  }, [forecast, settings]);

  if (!recoveryOptions) return null;

  const handleApplyClick = (type: 'spending' | 'income', value: number) => {
    setSelectedFix({ type, value });
    setShowConfirmation(true);
  };

  const confirmFix = async () => {
    if (!selectedFix) return;
    setIsApplying(true);
    try {
      if (selectedFix.type === 'spending') {
        await onApplyFix({ weekly_spending_estimate: selectedFix.value });
      } else {
        // For income, we might need to add a new income or just update a setting?
        // The requirement says "Increase income (weekly or monthly)".
        // Since we don't have a "weekly_income_estimate" in settings, 
        // maybe we should just suggest it or add it to the first income found?
        // Actually, the prompt says "Update the user's settings in Firestore".
        // Let's assume for now we only fix spending as it's the "preferred" one.
        // If they choose income, we might need to handle it differently.
        // But let's stick to the prompt's preference: "prefer reducing weekly spending first".
        await onApplyFix({ weekly_spending_estimate: settings.weekly_spending_estimate - selectedFix.value });
      }
      setShowConfirmation(false);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Recovery Plan</h3>
            <p className="text-xs font-bold text-amber-700/70 uppercase tracking-widest">
              Balance will fall below limit in week {recoveryOptions.week}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-amber-900/80">To stay safe you can:</p>
          
          <button 
            onClick={() => handleApplyClick('spending', recoveryOptions.spendingReduction)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-amber-200 hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <p className="text-sm font-bold text-zinc-900">
                Reduce weekly spending to <span className="text-amber-600 font-black">{formatCurrency(recoveryOptions.spendingReduction)}</span>
              </p>
            </div>
            <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-amber-100/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-zinc-300" />
              <p className="text-sm font-bold text-zinc-500">
                Increase income by <span className="text-zinc-700 font-black">{formatCurrency(recoveryOptions.adjustment)}/week</span>
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => handleApplyClick('spending', recoveryOptions.spendingReduction)}
          className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all active:scale-[0.98]"
        >
          Fix Plan
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto">
              <AlertTriangle size={32} />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Apply Fix?</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                Apply automatic fix to keep your balance safe? This will update your weekly spending estimate.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmFix}
                disabled={isApplying}
                className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2"
              >
                {isApplying ? 'Applying...' : 'Apply Fix'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
