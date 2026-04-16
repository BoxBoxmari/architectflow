/**
 * Centralized simulator calculation logic.
 * Single source of truth used by Value Simulator, Scenario Comparison, and Report Builder.
 *
 * Constants:
 *   HOURLY_COST              — $15/hr blended internal rate (USD)
 *   WORKING_DAYS_PER_MONTH   — 21 working days per month
 *   WORKING_HOURS_PER_DAY    — 8 working hours per day
 *   FIRM_WIDE_EMPLOYEE_CAP   — 1800 max employees
 */

export const SIM_CONSTANTS = {
  HOURLY_COST: 15,
  WORKING_DAYS_PER_MONTH: 21,
  WORKING_HOURS_PER_DAY: 8,
  FIRM_WIDE_EMPLOYEE_CAP: 1800,
} as const;

/** Default input values (source: ai_roi_simulator_desktop_v5.html) */
export const SIM_DEFAULTS: SimInputs = {
  targetUseCaseCount: 15,
  activationRate: 53,
  targetUserCount: 450,
  adoptionRate: 50,
  tasksPerUserPerUseCasePerMonth: 6,
  avgTimeSavedMinutes: 15,
};

/** Input slider ranges (source: ai_roi_simulator_desktop_v5.html) */
export const SIM_RANGES = {
  targetUseCaseCount:              { min: 1,  max: 120, step: 1  },
  activationRate:                  { min: 5,  max: 100, step: 1  },
  targetUserCount:                 { min: 10, max: 1800, step: 10 },
  adoptionRate:                    { min: 5,  max: 100, step: 1  },
  tasksPerUserPerUseCasePerMonth:  { min: 1,  max: 100, step: 1  },
  avgTimeSavedMinutes:             { min: 1,  max: 60,  step: 1  },
} as const;

export interface SimInputs {
  targetUseCaseCount: number;
  activationRate: number;       // 5–100 (percentage)
  targetUserCount: number;
  adoptionRate: number;         // 5–100 (percentage)
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
  /** 0–100 percentage */
  penetration: number;
}

/**
 * Pure calculation function — no side effects.
 * Formula source: ai_roi_simulator_desktop_v5.html
 */
export function calcOutputs(inputs: SimInputs): SimOutputs {
  const { HOURLY_COST, WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = SIM_CONSTANTS;

  // active_use_cases: if activation_rate >= 100 use target count directly, else round(target * rate/100) min 1
  const activeUseCases =
    inputs.activationRate >= 100
      ? inputs.targetUseCaseCount
      : Math.max(Math.round(inputs.targetUseCaseCount * inputs.activationRate / 100), inputs.activationRate > 0 ? 1 : 0);

  const activeUsers = Math.round(inputs.targetUserCount * inputs.adoptionRate / 100);
  const tasksPerMonth = activeUsers * activeUseCases * inputs.tasksPerUserPerUseCasePerMonth;
  const minutesPerMonth = tasksPerMonth * inputs.avgTimeSavedMinutes;
  const hoursPerMonth = minutesPerMonth / 60;
  const monthlyCostSavings = hoursPerMonth * HOURLY_COST;
  const annualizedReturn = monthlyCostSavings * 12;
  const ftesFreed = hoursPerMonth / (WORKING_DAYS_PER_MONTH * WORKING_HOURS_PER_DAY);
  const timePerUserPerMonth = activeUseCases * inputs.tasksPerUserPerUseCasePerMonth * inputs.avgTimeSavedMinutes;
  const valuePerUserPerMonth = monthlyCostSavings / Math.max(activeUsers, 1);
  const dailyInteractions = Math.round(activeUsers * activeUseCases * inputs.tasksPerUserPerUseCasePerMonth / WORKING_DAYS_PER_MONTH);
  // penetration as 0–100 percentage
  const penetration = (activeUsers / Math.max(inputs.targetUserCount, 1)) * 100;

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

/**
 * Compute the three canonical scenario variants from a base set of inputs.
 * Source: ai_roi_simulator_desktop_v5.html scenario logic.
 */
export function calcScenarioVariants(inputs: SimInputs) {
  const { FIRM_WIDE_EMPLOYEE_CAP } = SIM_CONSTANTS;

  // Current State — use inputs as-is
  const currentState = calcOutputs(inputs);

  // 2X Scale-Up — double active users and use cases, capped
  const scale2xActiveUsers = Math.min(currentState.activeUsers * 2, FIRM_WIDE_EMPLOYEE_CAP);
  const scale2xActiveUseCases = Math.min(currentState.activeUseCases * 2, 120);
  const scale2xAnnualized =
    scale2xActiveUsers *
    scale2xActiveUseCases *
    inputs.tasksPerUserPerUseCasePerMonth *
    inputs.avgTimeSavedMinutes /
    60 *
    SIM_CONSTANTS.HOURLY_COST *
    12;

  // Full Adoption — use target counts directly (100% activation and adoption)
  const fullAnnualized =
    inputs.targetUserCount *
    inputs.targetUseCaseCount *
    inputs.tasksPerUserPerUseCasePerMonth *
    inputs.avgTimeSavedMinutes /
    60 *
    SIM_CONSTANTS.HOURLY_COST *
    12;

  return {
    currentState: {
      label: 'CURRENT STATE',
      activeUsers: currentState.activeUsers,
      activeUseCases: currentState.activeUseCases,
      annualizedReturn: currentState.annualizedReturn,
      outputs: currentState,
    },
    scale2x: {
      label: '2X SCALE-UP',
      activeUsers: scale2xActiveUsers,
      activeUseCases: scale2xActiveUseCases,
      annualizedReturn: scale2xAnnualized,
      outputs: calcOutputs({
        ...inputs,
        targetUserCount: scale2xActiveUsers,
        adoptionRate: 100,
        targetUseCaseCount: scale2xActiveUseCases,
        activationRate: 100,
      }),
    },
    fullAdoption: {
      label: 'FULL ADOPTION',
      activeUsers: inputs.targetUserCount,
      activeUseCases: inputs.targetUseCaseCount,
      annualizedReturn: fullAnnualized,
      outputs: calcOutputs({
        ...inputs,
        adoptionRate: 100,
        activationRate: 100,
      }),
    },
  };
}
