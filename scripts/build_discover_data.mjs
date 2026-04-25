import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import XLSX from "xlsx";

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function abs(p) {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

function readWorkbook(xlsxPath) {
  const fullPath = abs(xlsxPath);
  if (!fs.existsSync(fullPath)) die(`Missing workbook: ${fullPath}`);
  return XLSX.readFile(fullPath, { cellDates: true, cellNF: true });
}

function sheetToRows(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) die(`Missing sheet: ${sheetName}`);
  return XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
}

function slugify(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "unknown";
}

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function shortHash(str) {
  return fnv1a32(str).toString(16).padStart(8, "0");
}

function parsePercentToRate(v) {
  if (v === null || v === undefined || v === "") return null;
  const num = Number(String(v).replace("%", "").trim());
  if (!Number.isFinite(num)) return null;
  return num / 100;
}

function writeJson(filePath, obj) {
  const fullPath = abs(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(obj, null, 2) + "\n", "utf8");
  return fullPath;
}

function invariant(cond, msg) {
  if (!cond) die(`VALIDATION_FAILED: ${msg}`);
}

function buildData(wb, workbookPath) {
  const rowsMatrix = sheetToRows(wb, "Full Mapping Matrix");
  const rowsAreas = sheetToRows(wb, "Service Areas");
  const rowsCaps = sheetToRows(wb, "AI Capability Benchmarks");
  const rowsFnSvc = sheetToRows(wb, "Functions & Services");
  const rowsHeadcount = sheetToRows(wb, "Headcount");

  // Functions and services (context selection)
  const fnMap = new Map(); // id -> {id,label,icon,color}
  const servicesByFunction = {}; // fnId -> [{id,label}]
  const serviceIdByLabel = new Map();

  for (const r of rowsFnSvc) {
    const fnLabel = r["Function"];
    const svcLabel = r["Service Line"];
    invariant(fnLabel && svcLabel, `Functions & Services row missing fields: ${JSON.stringify(r)}`);
    const fnId = slugify(fnLabel);
    const svcId = slugify(svcLabel);

    if (!fnMap.has(fnId)) {
      fnMap.set(fnId, {
        id: fnId,
        label: String(fnLabel).trim(),
        icon: r["Icon"] ?? null,
        color: r["Color"] ?? null,
      });
    }

    servicesByFunction[fnId] ||= [];
    if (!servicesByFunction[fnId].some((s) => s.id === svcId)) {
      servicesByFunction[fnId].push({ id: svcId, label: String(svcLabel).trim() });
    }

    serviceIdByLabel.set(`${fnId}::${String(svcLabel).trim()}`, svcId);
    serviceIdByLabel.set(String(svcLabel).trim(), svcId); // fallback lookup
    serviceIdByLabel.set(svcId, svcId);
    serviceIdByLabel.set(`${fnId}::${svcId}`, svcId);
  }

  const functions = Array.from(fnMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  for (const fnId of Object.keys(servicesByFunction)) {
    servicesByFunction[fnId].sort((a, b) => a.label.localeCompare(b.label));
  }

  // Service areas
  const serviceAreas = [];
  const serviceAreaMeta = {};
  for (const r of rowsAreas) {
    const label = r["Service Area"];
    invariant(label, `Service Areas row missing 'Service Area': ${JSON.stringify(r)}`);
    const id = slugify(label);
    serviceAreas.push({ id, label: String(label).trim() });
    serviceAreaMeta[id] = {
      icon: r["Icon"] ?? null,
      description: r["Description"] ?? null,
    };
  }

  // Capability benchmarks
  const capabilityBenchmarks = {};
  const capabilityPatternMeta = {};
  for (const r of rowsCaps) {
    const capLabel = r["AI Capability"];
    invariant(capLabel, `AI Capability Benchmarks row missing 'AI Capability': ${JSON.stringify(r)}`);
    const capId = slugify(capLabel);
    const min = parsePercentToRate(r["Saving Min %"]);
    const max = parsePercentToRate(r["Saving Max %"]);
    if (min !== null && max !== null) {
      invariant(min <= max, `Capability benchmark min > max for '${capLabel}'`);
      capabilityBenchmarks[capId] = {
        min,
        max,
        midpoint: (min + max) / 2,
        source: r["Benchmark Source"] ?? null,
        confidence: r["Confidence Level"] ?? null,
      };
    } else {
      // Workbook may include capabilities with no trusted % benchmark.
      // These should not block artifact generation; calc layer will apply fallback logic.
      console.warn(
        `WARN: No benchmark range for capability '${String(capLabel).trim()}' (min/max missing).`,
      );
    }
    capabilityPatternMeta[capId] = {
      label: String(capLabel).trim(),
      patternLabel: r["AI Pattern Label"] ?? null,
    };
  }

  // Task map by service and area.
  // Structure (Appendix B): taskMapByService[serviceId][serviceAreaId] = Task[]
  const taskMapByService = {};
  const taskIndex = new Map(); // key -> task obj to merge capabilities + evidence

  for (const r of rowsMatrix) {
    const fnLabel = r["Function"];
    const svcLabel = r["Service Line"];
    const areaLabel = r["Service Area"];
    const taskPattern = r["Task Pattern"];
    const capLabel = r["AI Capability"];
    const taskDesc = r["Task Description (EN)"];

    invariant(fnLabel && svcLabel && areaLabel && taskPattern && capLabel, `Matrix row missing required fields: ${JSON.stringify(r)}`);

    const fnId = slugify(fnLabel);
    const svcId = serviceIdByLabel.get(`${fnId}::${String(svcLabel).trim()}`) ?? slugify(svcLabel);
    const areaId = slugify(areaLabel);
    const capId = slugify(capLabel);

    // Validation rules (from spec)
    invariant(
      servicesByFunction[fnId]?.some((s) => s.id === svcId),
      `service has no parent function mapping: function='${fnLabel}' service='${svcLabel}'`,
    );
    invariant(
      serviceAreas.some((a) => a.id === areaId),
      `task has no valid service-area mapping: area='${areaLabel}'`,
    );

    taskMapByService[svcId] ||= {};
    taskMapByService[svcId][areaId] ||= [];

    const baseKey = `${fnId}::${svcId}::${areaId}::${String(taskPattern).trim()}`;
    const idSeed = `${baseKey}::${String(taskDesc ?? "").trim()}`;
    const taskId = `${slugify(taskPattern)}-${shortHash(idSeed)}`;

    const key = `${svcId}::${areaId}::${taskId}`;
    let task = taskIndex.get(key);
    if (!task) {
      task = {
        id: taskId,
        label: String(taskPattern).trim(),
        description: taskDesc ? String(taskDesc).trim() : null,
        capabilities: [],
        // Evidence is sourced from row-level benchmark meta where present; may be null.
        // Calc layer should prefer capabilityBenchmarks; this evidence is used for UI explanation.
        evidence: {
          savingMin: parsePercentToRate(r["Saving Min %"]),
          savingMax: parsePercentToRate(r["Saving Max %"]),
          source: r["Benchmark Source"] ?? null,
          confidence: r["Confidence"] ?? null,
        },
      };
      taskIndex.set(key, task);
      taskMapByService[svcId][areaId].push(task);
    }

    if (!task.capabilities.includes(capId)) task.capabilities.push(capId);
  }

  // Headcount mapping (function totals + per service line).
  // The sheet is hierarchical; we parse indentation in "Function / Service Line".
  const headcountByFunctionService = {};
  let currentFnId = null;
  for (const r of rowsHeadcount) {
    const labelRaw = r["__EMPTY"];
    const headcountRaw = r["__EMPTY_1"];
    if (!labelRaw) continue;

    const label = String(labelRaw);
    const trimmed = label.trim();
    if (!trimmed) continue;

    // Skip header row in this sheet
    if (trimmed === "Function / Service Line") continue;

    const indent = label.length - label.trimStart().length;
    const headcount = Number(String(headcountRaw ?? "").replace(/,/g, "").trim());
    const hasHeadcount = Number.isFinite(headcount);

    if (indent === 0) {
      // Function row (e.g., AUDIT)
      currentFnId = slugify(trimmed);
      headcountByFunctionService[currentFnId] ||= {};
      continue;
    }

    if (indent > 0 && currentFnId && hasHeadcount) {
      // Service line row (indented under current function)
      const svcId =
        serviceIdByLabel.get(`${currentFnId}::${trimmed}`) ??
        serviceIdByLabel.get(trimmed) ??
        slugify(trimmed);
      headcountByFunctionService[currentFnId][svcId] = headcount;
    }
  }

  // Final validations: duplicate IDs within each service+area.
  for (const [svcId, areas] of Object.entries(taskMapByService)) {
    for (const [areaId, tasks] of Object.entries(areas)) {
      const seen = new Set();
      for (const t of tasks) {
        invariant(!seen.has(t.id), `duplicate primary IDs are generated: ${svcId}/${areaId}/${t.id}`);
        seen.add(t.id);
      }
    }
  }

  // Goals + example copy are not present in the workbook.
  // Source: gate1-v3 (1).html (prototype reference) → PAINS[*].examples by function label.
  // We map those examples onto stable, slugified function IDs.
  const goals = [
    { id: "move-faster", label: "Move faster" },
    { id: "raise-accuracy", label: "Raise accuracy" },
    { id: "scale-capacity", label: "Scale capacity" },
    { id: "elevate-experience", label: "Elevate experience" },
  ];

  const goalIdByPainKey = {
    faster: "move-faster",
    accurate: "raise-accuracy",
    capacity: "scale-capacity",
    experience: "elevate-experience",
  };

  // Function examples from prototype. Keys are function labels (e.g., "AUDIT") and will be slugified.
  const goalExamplesByFunction = {};
  const prototypeGoalExamples = {
    faster: {
      AUDIT: "Teams spend days reading client evidence that could be screened in hours",
      "KPMG LAW":
        "Contract review cycles take 2–3× longer than needed due to manual clause reading",
      TAX: "Tax research queries take 30+ min when the answer exists in known circulars",
      "DEAL ADVISORY":
        "DD document review ties up analyst teams for days before any insight emerges",
      CONSULTING: "Post-meeting write-ups consume hours that could go to client value",
      "SHARED SERVICES": "Admin tasks like formatting and filing repeat daily across the team",
    },
    accurate: {
      AUDIT: "Manual sampling misses anomalies that systematic AI review surfaces consistently",
      "KPMG LAW":
        "Risk clauses are occasionally overlooked in high-volume reviews under time pressure",
      TAX: "HS code misclassification leads to penalties that better lookup tools would prevent",
      "DEAL ADVISORY":
        "Red flags in large data rooms are sometimes missed when teams are fatigued",
      CONSULTING: "Inconsistencies across large deliverables are hard to catch manually",
      "SHARED SERVICES": "Errors in data entry and formatting create downstream rework",
    },
    capacity: {
      AUDIT: "Senior auditors spend time on document reading that AI-assisted juniors could handle",
      "KPMG LAW": "Legal research occupies qualified lawyers who should be advising, not searching",
      TAX: "Compliance formatting consumes hours advisors could spend on strategy",
      "DEAL ADVISORY":
        "Junior analysts spend most of engagements on document intake rather than analysis",
      CONSULTING:
        "Consultants draft deliverables from scratch when AI could accelerate the baseline",
      "SHARED SERVICES":
        "High-volume repetitive tasks limit capacity for strategic support",
    },
    experience: {
      AUDIT: "Clients wait longer than expected due to manual processing bottlenecks",
      "KPMG LAW": "Response time to standard legal queries is longer than clients now expect",
      TAX: "Advisory turnaround could be significantly faster with AI-assisted drafting",
      "DEAL ADVISORY":
        "Deal teams struggle to maintain consistent quality across large engagements",
      CONSULTING:
        "Deliverable quality varies across team members — AI can standardise the baseline",
      "SHARED SERVICES": "Internal stakeholders wait too long for standard requests and reports",
    },
  };

  for (const [painKey, examplesByFnLabel] of Object.entries(prototypeGoalExamples)) {
    const goalId = goalIdByPainKey[painKey];
    if (!goalId) continue;
    for (const [fnLabel, example] of Object.entries(examplesByFnLabel)) {
      const fnId = slugify(fnLabel);
      goalExamplesByFunction[fnId] ||= {};
      goalExamplesByFunction[fnId][goalId] = String(example).trim();
    }
  }

  return {
    meta: {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      sourceWorkbook: path.basename(workbookPath),
    },
    functions,
    servicesByFunction,
    goals,
    goalExamplesByFunction,
    serviceAreas,
    serviceAreaMeta,
    taskMapByService,
    capabilityBenchmarks,
    capabilityPatternMeta,
    headcountByFunctionService,
  };
}

function main() {
  const workbookPath = process.argv[2] ?? "Gate1_Mapping_Matrix (1).xlsx";
  const wb = readWorkbook(workbookPath);

  const out = buildData(wb, workbookPath);
  const outPath = writeJson("assets/data/discover-gate1-data.json", out);

  console.log("Generated:", outPath);
  console.log("Functions:", out.functions.length);
  console.log(
    "Services:",
    Object.values(out.servicesByFunction).reduce((n, arr) => n + arr.length, 0),
  );
  console.log("Service areas:", out.serviceAreas.length);
  console.log("Capabilities:", Object.keys(out.capabilityBenchmarks).length);
}

main();

