/**
 * Centralized simulator calculation logic.
 * Single source of truth used by Value Simulator, Scenario Comparison, and Report Builder.
 *
 * Assumptions:
 *   HOURLY_COST            — £15/hr blended internal rate for professional staff
 *   WORKING_DAYS_PER_MONTH — 21 working days per month
 *   WORKING_HOURS_PER_DAY  — 8 working hours per day
 */

export const SIM_CONSTANTS = {
  HOURLY_COST: 15,
  WORKING_DAYS_PER_MONTH: 21,
  WORKING_HOURS_PER_DAY: 8,
} as const;

export interface SimInputs {
  targetUseCaseCount: number;
  activationRate: number;       // 0–100 (percentage)
  targetUserCount: number;
  adoptionRate: number;         // 0–100 (percentage)
  tasksPerUserPerUseCasePerMonth: number;
  avgTimeSavedMinutes: number;
}

export interface SimOutputs {
  activeUseCases: number;
  activeUsers: number;
  tasksPerMonth: number;
  hoursPerMonth: number;
  monthlyCostSavings: number;
  annualizedReturn: number;
  ftesFreed: number;
  timePerUserPerMonth: number;
  valuePerUserPerMonth: number;
  dailyInteractions: number;
  penetration: number;
}

export function calcOutputs(inputs: SimInputs): SimOutputs {
  const { HOURLY_COST, WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = SIM_CONSTANTS;

  const activeUseCases = Math.round(inputs.targetUseCaseCount * inputs.activationRate / 100);
  const activeUsers = Math.round(inputs.targetUserCount * inputs.adoptionRate / 100);
  const tasksPerMonth = activeUsers * activeUseCases * inputs.tasksPerUserPerUseCasePerMonth;
  const minutesPerMonth = tasksPerMonth * inputs.avgTimeSavedMinutes;
  const hoursPerMonth = minutesPerMonth / 60;
  const monthlyCostSavings = hoursPerMonth * HOURLY_COST;
  const annualizedReturn = monthlyCostSavings * 12;
  const ftesFreed = hoursPerMonth / (WORKING_DAYS_PER_MONTH * WORKING_HOURS_PER_DAY);
  const timePerUserPerMonth = activeUseCases * inputs.tasksPerUserPerUseCasePerMonth * inputs.avgTimeSavedMinutes;
  const valuePerUserPerMonth = monthlyCostSavings / Math.max(activeUsers, 1);
  const dailyInteractions = tasksPerMonth / WORKING_DAYS_PER_MONTH;
  const penetration = activeUsers / Math.max(inputs.targetUserCount, 1);

  return {
    activeUseCases,
    activeUsers,
    tasksPerMonth,
    hoursPerMonth,
    monthlyCostSavings,
    annualizedReturn,
    ftesFreed,
    timePerUserPerMonth,
    valuePerUserPerMonth,
    dailyInteractions,
    penetration,
  };
}
