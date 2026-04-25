/**
 * discover-gate1-calc.js — Pure calculations for Gate 1.
 */

(() => {
  "use strict";

  function round(n, dp = 2) {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    const m = 10 ** dp;
    return Math.round(x * m) / m;
  }

  function fmtNumber(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "—";
    return x.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function fmtDecimal(n, dp = 2) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "—";
    return x.toLocaleString(undefined, {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    });
  }

  function fmtCurrency(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    return x.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  function workloadHours(people, freq, avgMin) {
    const p = Number(people) || 0;
    const f = Number(freq) || 0;
    const m = Number(avgMin) || 0;
    return (p * f * (m / 60)) || 0;
  }

  function average(nums) {
    const xs = (nums || []).filter((n) => Number.isFinite(n));
    if (xs.length === 0) return null;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  }

  function savingRateForCapabilities(capIds, data) {
    const mids = [];
    const used = [];
    for (const id of capIds) {
      const b = data.capabilityBenchmarks?.[id];
      if (b && Number.isFinite(b.midpoint)) {
        mids.push(Number(b.midpoint));
        used.push(id);
      }
    }
    const avg = average(mids);
    if (avg === null) {
      return { rate: 0.35, usedCapabilities: [], isFallback: true };
    }
    return { rate: avg, usedCapabilities: used, isFallback: false };
  }

  function compute(state, data) {
    const svcId = state.serviceId;
    const serviceAreas = data.serviceAreas || [];
    const selectedGoals = Array.isArray(state.selectedGoals)
      ? state.selectedGoals.filter(Boolean)
      : [];
    const goalLabelById = Object.fromEntries(
      (data.goals ?? []).map((g) => [g.id, g.label]),
    );
    const selectedGoalLabels = selectedGoals
      .map((id) => goalLabelById[id] ?? id)
      .filter(Boolean);

    const areaResults = [];
    let totalMonthlyHoursSaved = 0;
    let totalAnnualValue = 0;

    for (const area of serviceAreas) {
      const areaId = area.id;
      const cfg = state.areas?.[areaId];
      const taskIds = cfg?.taskIds ?? [];
      if (!svcId || taskIds.length === 0) continue;

      const tasks = (data.taskMapByService?.[svcId]?.[areaId] ?? []).filter((t) =>
        taskIds.includes(t.id),
      );
      const capabilities = Array.from(
        new Set(tasks.flatMap((t) => t.capabilities || [])),
      );

      const wl = workloadHours(cfg.people, cfg.freq, cfg.avgMin);
      const { rate, usedCapabilities, isFallback } = savingRateForCapabilities(
        capabilities,
        data,
      );
      const monthlyHoursSaved = wl * rate;

      const hourlyRate = state.hourlyRate ?? 0;
      const annualValue =
        hourlyRate > 0 ? monthlyHoursSaved * hourlyRate * 12 : 0;

      totalMonthlyHoursSaved += monthlyHoursSaved;
      totalAnnualValue += annualValue;

      areaResults.push({
        areaId,
        areaLabel: area.label,
        tasks,
        cfg: { ...cfg, taskIds: [...taskIds] },
        workloadHours: wl,
        savingRate: rate,
        isFallback,
        usedCapabilities,
        capabilities,
        monthlyHoursSaved,
        annualValue,
      });
    }

    const monthlyCapacityHours = state.monthlyCapacityHours ?? 0;
    const monthlyFTE =
      monthlyCapacityHours > 0 ? totalMonthlyHoursSaved / monthlyCapacityHours : 0;

    return {
      context: {
        functionId: state.functionId || "",
        serviceId: state.serviceId || "",
        selectedGoals,
        selectedGoalLabels,
      },
      areas: areaResults,
      totals: {
        monthlyHoursSaved: totalMonthlyHoursSaved,
        annualValue: totalAnnualValue,
        monthlyFTE,
      },
    };
  }

  window.DiscoverGate1Calc = {
    round,
    fmtNumber,
    fmtDecimal,
    fmtCurrency,
    workloadHours,
    compute,
  };
})();

