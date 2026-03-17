import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { AppSettings, ForecastWeek, FinancialGoal } from '../types';

interface ForecastGraphProps {
  forecast: ForecastWeek[];
  settings: AppSettings;
  goals: FinancialGoal[];
  formatCurrency: (value: number) => string;
  highlightedWeek: number | null;
  simulation: any;
}

export function ForecastGraph({ forecast, settings, goals, formatCurrency, highlightedWeek, simulation }: ForecastGraphProps) {
  const locale = settings.language === 'pt' ? ptBR : enUS;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ForecastWeek;
      const isBelowThreshold = data.projected_balance < settings.safety_threshold;
      const isSimulated = payload.length > 1;
      
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 space-y-3 min-w-[200px]">
          <div className="border-b border-zinc-50 pb-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {format(parseISO(data.start_date), 'MMM dd', { locale })} - {format(parseISO(data.end_date), 'MMM dd', { locale })}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Projected Balance</p>
              <p className={`text-lg font-black ${isBelowThreshold ? 'text-rose-600' : 'text-zinc-900'}`}>
                {formatCurrency(data.projected_balance)}
              </p>
            </div>

            {simulation.isActive && (
              <div className="space-y-0.5 pt-1 border-t border-zinc-50">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Simulated Balance</p>
                <p className="text-lg font-black text-amber-600">
                  {formatCurrency(data.simulated_balance)}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {data.incomes.length > 0 && (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                <div className="w-1 h-1 rounded-full bg-emerald-600" />
                {data.incomes.length} {settings.language === 'pt' ? 'Entradas' : 'Incomes'}
              </div>
            )}
            {data.events.length > 0 && (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                <div className="w-1 h-1 rounded-full bg-amber-600" />
                {data.events.length} {settings.language === 'pt' ? 'Eventos' : 'Events'}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="forecast-chart" className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
          
          <XAxis 
            dataKey="start_date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 9, fill: '#a1a1aa', fontWeight: 700}} 
            tickFormatter={(val) => format(parseISO(val), 'dd/MM')}
            minTickGap={30}
            dy={10}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{fontSize: 9, fill: '#a1a1aa', fontWeight: 700}}
            tickFormatter={(val) => {
              if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
              if (val <= -1000) return `${(val / 1000).toFixed(0)}k`;
              return val;
            }}
            width={35}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={settings.safety_threshold} 
            stroke="#f43f5e" 
            strokeDasharray="5 5" 
            strokeWidth={1}
            label={{ 
              position: 'insideBottomRight', 
              value: settings.language === 'pt' ? 'LIMITE' : 'LIMIT', 
              fill: '#f43f5e', 
              fontSize: 8, 
              fontWeight: 900,
              className: 'tracking-widest'
            }} 
          />
          
          {goals.filter(g => !g.is_completed).map((goal, idx) => (
            <ReferenceLine
              key={idx}
              x={goal.target_date}
              stroke="#8b5cf6"
              strokeDasharray="3 3"
              label={{
                value: goal.name.toUpperCase(),
                position: 'insideTopLeft',
                fill: '#8b5cf6',
                fontSize: 8,
                fontWeight: 900,
                className: 'tracking-widest'
              }}
            />
          ))}

          <Area 
            type="monotone" 
            dataKey="projected_balance" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorBalance)" 
            animationDuration={1000}
          />
          
          {simulation.isActive && (
            <Area 
              type="monotone" 
              dataKey="simulated_balance" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              strokeDasharray="5 5" 
              fillOpacity={1} 
              fill="url(#colorSim)" 
              animationDuration={1000}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
