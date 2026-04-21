/**
 * Simulator Core — Constants, defaults, ranges, and calculation logic.
 * Ported 1:1 from src/lib/simulator/calcOutputs.ts
 */

const SimulatorCore = (() => {
  'use strict';

  const CONSTANTS = {
    HOURLY_COST: 15,
    WORKING_DAYS_PER_MONTH: 21,
    WORKING_HOURS_PER_DAY: 8,
    FIRM_WIDE_EMPLOYEE_CAP: 1800,
  };

  const DEFAULTS = {
    targetUseCaseCount: 15,
    activationRate: 53,
    targetUserCount: 450,
    adoptionRate: 50,
    tasksPerUserPerUseCasePerMonth: 6,
    avgTimeSavedMinutes: 15,
    hourlyRate: 15,
  };

  const RANGES = {
    targetUseCaseCount:             { min: 1,  max: 120,  step: 1  },
    activationRate:                 { min: 5,  max: 100,  step: 1  },
    targetUserCount:                { min: 10, max: 1800, step: 10 },
    adoptionRate:                   { min: 5,  max: 100,  step: 1  },
    tasksPerUserPerUseCasePerMonth: { min: 1,  max: 100,  step: 1  },
    avgTimeSavedMinutes:            { min: 1,  max: 60,   step: 1  },
    hourlyRate:                     { min: 5,  max: 150,  step: 1  },
  };

  /**
   * Pure calculation function — no side effects.
   * @param {Object} inputs
   * @returns {Object} outputs
   */
  function calcOutputs(inputs) {
    const { WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = CONSTANTS;
    const HOURLY_COST = inputs.hourlyRate ?? CONSTANTS.HOURLY_COST;

    const activeUseCases =
      inputs.activationRate >= 100
        ? inputs.targetUseCaseCount
        : Math.max(
            Math.round(inputs.targetUseCaseCount * inputs.activationRate / 100),
            inputs.activationRate > 0 ? 1 : 0
          );

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
   * @param {Object} inputs
   * @returns {Object} { currentState, scale2x, fullAdoption }
   */
  function calcScenarioVariants(inputs) {
    const { FIRM_WIDE_EMPLOYEE_CAP } = CONSTANTS;
    const currentState = calcOutputs(inputs);

    // 2X Scale-Up
    const scale2xActiveUsers = Math.min(currentState.activeUsers * 2, FIRM_WIDE_EMPLOYEE_CAP);
    const scale2xActiveUseCases = Math.min(currentState.activeUseCases * 2, 120);
    const scale2xAnnualized =
      scale2xActiveUsers *
      scale2xActiveUseCases *
      inputs.tasksPerUserPerUseCasePerMonth *
      inputs.avgTimeSavedMinutes /
      60 *
      (inputs.hourlyRate ?? CONSTANTS.HOURLY_COST) *
      12;

    // Full Adoption
    const fullAnnualized =
      inputs.targetUserCount *
      inputs.targetUseCaseCount *
      inputs.tasksPerUserPerUseCasePerMonth *
      inputs.avgTimeSavedMinutes /
      60 *
      (inputs.hourlyRate ?? CONSTANTS.HOURLY_COST) *
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

  return {
    CONSTANTS,
    DEFAULTS,
    RANGES,
    calcOutputs,
    calcScenarioVariants,
  };
})();
