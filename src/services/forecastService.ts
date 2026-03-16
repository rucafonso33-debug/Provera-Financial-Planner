import { 
  addWeeks, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  getDate, 
  parseISO,
  startOfDay
} from 'date-fns';
import { AppSettings, Income, FixedExpense, FutureEvent, ForecastWeek, Movement, SimulationState } from '../types';

export function calculateForecast(
  settings: AppSettings,
  incomes: Income[],
  fixedExpenses: FixedExpense[],
  events: FutureEvent[],
  simulation: SimulationState,
  forecastWeeks: number,
  effectiveBalance: number
): ForecastWeek[] {
  const result: ForecastWeek[] = [];
  let runningBalance = effectiveBalance;
  let runningSimBalance = effectiveBalance;
  const today = new Date();
  
  // Starting point
  result.push({
    week_number: 0,
    start_date: today.toISOString(),
    end_date: today.toISOString(),
    start_balance: effectiveBalance,
    projected_balance: effectiveBalance,
    simulated_balance: effectiveBalance,
    is_below_threshold: effectiveBalance < settings.safety_threshold,
    is_sim_below_threshold: effectiveBalance < settings.safety_threshold,
    events: [],
    incomes: [],
    movements: []
  });

  for (let i = 0; i < forecastWeeks; i++) {
    const weekStart = addWeeks(startOfWeek(today), i);
    const weekEnd = endOfWeek(weekStart);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const weekIncomes: string[] = [];
    const weekEvents: string[] = [];
    const movements: Movement[] = [];
    const startBalance = runningBalance;
    
    let weekIncomeTotal = 0;
    let weekExpenseTotal = 0;
    
    let weekSimIncomeTotal = 0;
    let weekSimExpenseTotal = 0;

    // Weekly spending estimate
    weekExpenseTotal += settings.weekly_spending_estimate;
    weekSimExpenseTotal += settings.weekly_spending_estimate + simulation.weeklySpendingDelta;
    
    movements.push({
      name: 'Estimated weekly spending',
      amount: simulation.isActive 
        ? settings.weekly_spending_estimate + simulation.weeklySpendingDelta
        : settings.weekly_spending_estimate,
      type: 'spending'
    });

    // Check incomes and fixed expenses for each day of the week
    weekDays.forEach(day => {
      if (day < startOfDay(today)) return; // Skip days before today
      
      const dayNum = getDate(day);
      
      incomes.forEach(inc => {
        if (inc.day_of_month === dayNum) {
          weekIncomeTotal += inc.amount;
          weekSimIncomeTotal += inc.amount;
          weekIncomes.push(`${inc.name} (${inc.amount})`);
          movements.push({
            name: inc.name,
            amount: inc.amount,
            type: 'income'
          });
        }
      });
      
      fixedExpenses.forEach(exp => {
        if (exp.day_of_month === dayNum) {
          weekExpenseTotal += exp.amount;
          weekSimExpenseTotal += exp.amount;
          weekEvents.push(`${exp.name} (-${exp.amount})`);
          movements.push({
            name: exp.name,
            amount: exp.amount,
            type: 'expense'
          });
        }
      });
    });

    // Check one-off events
    events.forEach(evt => {
      const evtDate = parseISO(evt.date);
      if (isWithinInterval(evtDate, { start: weekStart, end: weekEnd })) {
        if (evt.type === 'income') {
          weekIncomeTotal += evt.amount;
          weekSimIncomeTotal += evt.amount;
          weekIncomes.push(`${evt.description} (${evt.amount})`);
        } else {
          weekExpenseTotal += evt.amount;
          weekSimExpenseTotal += evt.amount;
          weekEvents.push(`${evt.description} (-${evt.amount})`);
        }
        movements.push({
          name: evt.description,
          amount: evt.amount,
          type: evt.type === 'income' ? 'income' : 'event'
        });
      }
    });

    // Simulation: One-off expenses
    simulation.oneOffExpenses.forEach(evt => {
      const evtDate = parseISO(evt.date);
      if (isWithinInterval(evtDate, { start: weekStart, end: weekEnd })) {
        weekSimExpenseTotal += evt.amount;
        if (simulation.isActive) {
          movements.push({
            name: `(Sim) ${evt.description}`,
            amount: evt.amount,
            type: 'event'
          });
        }
      }
    });

    // Simulation: Income changes
    simulation.incomeChanges.forEach(inc => {
      const incDate = parseISO(inc.date);
      if (isWithinInterval(incDate, { start: weekStart, end: weekEnd })) {
        weekSimIncomeTotal += inc.amount;
        if (simulation.isActive) {
          movements.push({
            name: `(Sim) ${inc.description}`,
            amount: inc.amount,
            type: 'income'
          });
        }
      }
    });

    runningBalance = runningBalance + weekIncomeTotal - weekExpenseTotal;
    runningSimBalance = runningSimBalance + weekSimIncomeTotal - weekSimExpenseTotal;

    result.push({
      week_number: i + 1,
      start_date: weekStart.toISOString(),
      end_date: weekEnd.toISOString(),
      start_balance: startBalance,
      projected_balance: runningBalance,
      simulated_balance: runningSimBalance,
      is_below_threshold: runningBalance < settings.safety_threshold,
      is_sim_below_threshold: runningSimBalance < settings.safety_threshold,
      events: weekEvents,
      incomes: weekIncomes,
      movements: movements
    });
  }
  return result;
}

function isWithinInterval(date: Date, interval: { start: Date; end: Date }): boolean {
  return date >= interval.start && date <= interval.end;
}
