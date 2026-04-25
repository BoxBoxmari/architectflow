/**
 * discover-gate1-state.js — Discover Gate 1 state, guards, persistence.
 * Pure-ish: state transitions are centralized here; render layer must not mutate state directly.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "architectflow.discover.gate1.v2";
  const SCHEMA_VERSION = 1;

  function emptyState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      step: 0,
      functionId: "",
      serviceId: "",
      selectedGoals: [],
      hourlyRate: null, // number, optional
      monthlyCapacityHours: null, // number, optional
      areas: {}, // areaId -> { taskIds: [], people, freq, avgMin }
      ui: {
        openAreas: {}, // areaId -> boolean
        inputDraft: {
          hourlyRate: "",
          monthlyCapacityHours: "",
        },
      },
    };
  }

  function clamp(n, min, max) {
    const x = Number(n);
    if (!Number.isFinite(x)) return min;
    return Math.max(min, Math.min(max, x));
  }

  function validate(s) {
    if (!s || typeof s !== "object") return false;
    if (s.schemaVersion !== SCHEMA_VERSION) return false;
    if (typeof s.step !== "number") return false;
    if (typeof s.functionId !== "string") return false;
    if (typeof s.serviceId !== "string") return false;
    if (!Array.isArray(s.selectedGoals)) return false;
    if (!s.areas || typeof s.areas !== "object") return false;
    if (!s.ui || typeof s.ui !== "object") return false;
    if (!s.ui.openAreas || typeof s.ui.openAreas !== "object") return false;
    return true;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      if (!validate(parsed)) return emptyState();
      return parsed;
    } catch {
      return emptyState();
    }
  }

  function save(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore quota / storage denied
    }
  }

  function hardReset() {
    const s = emptyState();
    save(s);
    return s;
  }

  function canGoNext(s, data) {
    if (s.step === 0) return Boolean(s.functionId && s.serviceId);
    if (s.step === 1) return s.selectedGoals.length >= 1 && s.selectedGoals.length <= 2;
    if (s.step === 2) {
      const anyTask = Object.values(s.areas).some((a) => (a.taskIds?.length ?? 0) > 0);
      return Boolean(anyTask);
    }
    return true;
  }

  function setFunctionService(s, functionId, serviceId) {
    const next = { ...s };
    next.functionId = String(functionId || "");
    next.serviceId = String(serviceId || "");
    // Context change resets downstream selections to avoid cross-context leakage.
    next.selectedGoals = [];
    next.areas = {};
    next.ui = { openAreas: {} };
    next.step = 0;
    return next;
  }

  function toggleGoal(s, goalId) {
    const next = { ...s };
    const id = String(goalId);
    const idx = next.selectedGoals.indexOf(id);
    if (idx >= 0) {
      next.selectedGoals = next.selectedGoals.filter((g) => g !== id);
      return next;
    }
    if (next.selectedGoals.length >= 2) return next; // max-2 guard
    next.selectedGoals = [...next.selectedGoals, id];
    return next;
  }

  function ensureArea(s, areaId) {
    const id = String(areaId);
    const existing = s.areas[id];
    if (existing) return existing;
    return { taskIds: [], people: 10, freq: 8, avgMin: 30 };
  }

  function toggleTask(s, areaId, taskId) {
    const next = { ...s, areas: { ...s.areas } };
    const a = { ...ensureArea(s, areaId) };
    const tid = String(taskId);
    const has = a.taskIds.includes(tid);
    a.taskIds = has ? a.taskIds.filter((x) => x !== tid) : [...a.taskIds, tid];
    next.areas[String(areaId)] = a;
    return next;
  }

  function updateAreaConfig(s, areaId, patch) {
    const next = { ...s, areas: { ...s.areas } };
    const a = { ...ensureArea(s, areaId) };
    if ("people" in patch) a.people = clamp(patch.people, 0, 2000);
    if ("freq" in patch) a.freq = clamp(patch.freq, 0, 500);
    if ("avgMin" in patch) a.avgMin = clamp(patch.avgMin, 0, 600);
    next.areas[String(areaId)] = a;
    return next;
  }

  function setInputs(s, patch) {
    const next = { ...s, ui: { ...(s.ui || {}), openAreas: { ...(s.ui?.openAreas || {}) } } };
    next.ui.inputDraft = { ...(s.ui?.inputDraft || {}) };

    const normStr = (v) => {
      if (v === null || v === undefined) return "";
      return String(v).trim();
    };

    const parseDecimal = (raw) => {
      const t0 = String(raw ?? "").trim();
      if (!t0) return { draft: "", num: null, isDraft: false, isEmpty: true };
      let t = t0.replace(",", ".");
      if (t.startsWith(".")) t = "0" + t;
      const isDraft = t.endsWith(".");
      const num = Number.parseFloat(t);
      return {
        draft: isDraft ? t : "",
        num: Number.isFinite(num) ? num : null,
        isDraft,
        isEmpty: false,
      };
    };

    const setField = (key, rawValue, { min, max }) => {
      const { draft, num, isDraft, isEmpty } = parseDecimal(rawValue);
      next.ui.inputDraft[key] = draft;
      if (isEmpty) return null;
      if (isDraft) return num; // allow transient states like "4." without clamping
      if (num === null) return null;
      return clamp(num, min, max);
    };
    if ("hourlyRate" in patch) {
      next.hourlyRate = setField("hourlyRate", normStr(patch.hourlyRate), { min: 0, max: 1000000 });
    }
    if ("monthlyCapacityHours" in patch) {
      next.monthlyCapacityHours = setField("monthlyCapacityHours", normStr(patch.monthlyCapacityHours), {
        min: 1,
        max: 1000,
      });
    }
    return next;
  }

  function goStep(s, step) {
    const next = { ...s };
    next.step = clamp(step, 0, 3);
    return next;
  }

  function setAreaOpen(s, areaId, isOpen) {
    const next = { ...s, ui: { ...(s.ui || {}), openAreas: { ...(s.ui?.openAreas || {}) } } };
    next.ui.openAreas[String(areaId)] = Boolean(isOpen);
    return next;
  }

  window.DiscoverGate1State = {
    STORAGE_KEY,
    emptyState,
    load,
    save,
    hardReset,
    validate,
    canGoNext,
    setFunctionService,
    toggleGoal,
    toggleTask,
    updateAreaConfig,
    setInputs,
    goStep,
    setAreaOpen,
  };
})();

