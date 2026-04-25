/**
 * discover.js — Gate 1 controller (v2).
 * Depends on: app-shell.js, theme.js, toast.js, discover-gate1-*.js
 */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  let data = null;
  let state = null;

  function updateNextButton() {
    const next = $("discover-next");
    if (!next) return;
    next.disabled = !window.DiscoverGate1State.canGoNext(state, data);
    next.textContent = state.step < 3 ? "Next" : "Restart";
  }

  function rerender() {
    const computed = window.DiscoverGate1Calc.compute(state, data);

    window.DiscoverGate1Render.showStep(state.step);
    window.DiscoverGate1Render.setNavState(state);

    window.DiscoverGate1Render.renderStep1(state, data, handlers);
    window.DiscoverGate1Render.renderStep2(state, data, handlers);
    window.DiscoverGate1Render.renderStep3(state, data, computed, handlers);
    window.DiscoverGate1Render.renderStep4(state, data, computed, handlers);

    updateNextButton();
    window.DiscoverGate1State.save(state);
  }

  function buildSummaryText(computed) {
    const lines = [];
    lines.push("ArchitectFlow — Discover Gate 1 (Illustrative)");
    lines.push(`Function: ${state.functionId || "—"}`);
    lines.push(`Service: ${state.serviceId || "—"}`);
    const goalLabelById = Object.fromEntries((data?.goals ?? []).map((g) => [g.id, g.label]));
    const goalLabels = (state.selectedGoals ?? [])
      .map((id) => goalLabelById[id] ?? id)
      .filter(Boolean);
    lines.push(`Goals: ${goalLabels.length ? goalLabels.join(" + ") : "—"}`);
    lines.push("");
    lines.push(
      `Monthly hours saved: ${window.DiscoverGate1Calc.fmtCurrency(computed.totals.monthlyHoursSaved)}`,
    );
    lines.push(
      `Annual value (illustrative): ${window.DiscoverGate1Calc.fmtCurrency(computed.totals.annualValue)}`,
    );
    lines.push(
      `FTE/month (illustrative): ${
        computed.totals.monthlyFTE ? window.DiscoverGate1Calc.fmtDecimal(computed.totals.monthlyFTE) : "—"
      }`,
    );
    lines.push("");
    for (const a of computed.areas ?? []) {
      lines.push(
        `- ${a.areaLabel}: ${window.DiscoverGate1Calc.fmtCurrency(a.monthlyHoursSaved)} hrs/mo saved`,
      );
      for (const capId of a.usedCapabilities ?? []) {
        const meta = data.capabilityPatternMeta?.[capId];
        const b = data.capabilityBenchmarks?.[capId];
        const capName = meta?.label ?? capId;
        const conf = b?.confidence ?? "—";
        lines.push(`  - Capability: ${capName} (${conf})`);
      }
    }
    return lines.join("\n") + "\n";
  }

  function exportPdfFile(computed) {
    try {
      const pdfBytes = makeStyledGate1Pdf({ computed, state, data });
      if (!(pdfBytes instanceof Uint8Array) || pdfBytes.length < 16) {
        throw new Error("PDF generation returned invalid bytes.");
      }
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "architectflow-discover-gate1-export.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Avoid revoking too early (can break downloads on some browsers).
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {
      console.error("[Discover Gate1] Export PDF failed", e);
      if (window.Toast) window.Toast.error("Export PDF failed. Check console for details.");
    }
  }

  function makeStyledGate1Pdf({ computed, state, data }) {
    const W = 612;
    const H = 792;
    const M = 48; // Wider margins for elegance
    const G = 16; // grid gutter/padding baseline
    const FOOTER_CLEARANCE = 44;
    const CONTENT_FLOOR = M + FOOTER_CLEARANCE;

    const toAscii = (s) =>
      String(s ?? "")
        .replace(/&{3,}/g, " ")
        .replace(/\*{3,}/g, " ")
        .replace(/[—–]/g, "-")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\u00A0/g, " ")
        .replace(/[^\x0A\x0D\x20-\x7E]/g, "");

    const esc = (s) => {
      const t = toAscii(s);
      return t.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    };

    const fmtNum = window.DiscoverGate1Calc.fmtNumber;
    const fmtCur = window.DiscoverGate1Calc.fmtCurrency;

    const goalLabelById = Object.fromEntries((data?.goals ?? []).map((g) => [g.id, g.label]));
    const goalLabels = (state.selectedGoals ?? [])
      .map((id) => goalLabelById[id] ?? id)
      .filter(Boolean);

    const functionLabel =
      data?.functions?.find((f) => f.id === state.functionId)?.label ?? state.functionId ?? "";
    const serviceLabel =
      data?.servicesByFunction?.[state.functionId]?.find((s) => s.id === state.serviceId)
        ?.label ??
      state.serviceId ??
      "";

    const pages = [];
    let cur = [];
    let y = H - M;

    // KPMG-inspired palette
    const C = {
      ink: [0.04, 0.05, 0.07],      // Near black
      muted: [0.4, 0.4, 0.42],      // Professional gray
      line: [0.85, 0.85, 0.85],
      cardLine: [0.9, 0.9, 0.9],
      pageBg: [1, 1, 1],            // Pure white
      cardBg: [0.98, 0.98, 0.99],   // Very subtle gray/blue tint
      soft: [0.94, 0.95, 0.97],
      brand: [0, 0.2, 0.55],        // KPMG Blue #00338D
      brandLight: [0, 0.57, 0.85],  // KPMG Light Blue #0091DA
      brandSoft: [0.92, 0.94, 0.97],
    };

    const footerOps = (pageIndex, pageCount) => {
      const footY = M + 8;
      const right = `Page ${pageIndex} of ${pageCount}`;
      return [
        "BT",
        "/F1 9 Tf",
        `${C.muted[0]} ${C.muted[1]} ${C.muted[2]} rg`,
        `${W - M - 60} ${footY} Td`,
        `(${esc(right)}) Tj`,
        "ET",
      ].join("\n");
    };

    const applyFooters = (pageStreams) => {
      const total = pageStreams.length;
      return pageStreams.map((p, idx) => p + footerOps(idx + 1, total) + "\n");
    };

    const drawHeader = () => {
      rect(0, H - 8, W, 8, C.brand, null);
      const top = H - M;
      const title = "AI Value Discovery";
      //const disclaimer = "Illustrative. Not client-ready output.";

      setFill(C.brand[0], C.brand[1], C.brand[2]);
      text(M, top - 18, "F2", 24, title);

      setFill(C.muted[0], C.muted[1], C.muted[2]);
      //text(M, top - 34, "F1", 10, disclaimer);

      line(M, top - 46, W - M, top - 46, C.line, 1);
      y = top - 64;
    };

    const drawHeaderMini = () => {
      rect(0, H - 8, W, 8, C.brand, null);
      const top = H - 36;
      const title = "Discover Gate 1 — AI Focus Signal";
      
      setFill(C.brand[0], C.brand[1], C.brand[2]);
      text(M, top - 12, "F2", 12, title);

      line(M, top - 24, W - M, top - 24, C.line, 1);
      y = top - 42;
    };

    const pushPage = () => {
      pages.push(cur.join("\n") + "\n");
      cur = [];
      drawHeaderMini();
    };

    const ensureSpace = (needed) => {
      if (y - needed < CONTENT_FLOOR) pushPage();
    };

    const rgb = (r, g, b) => `${r} ${g} ${b}`;
    const setStroke = (r, g, b) => cur.push(`${rgb(r, g, b)} RG`);
    const setFill = (r, g, b) => cur.push(`${rgb(r, g, b)} rg`);
    const setLineWidth = (w) => cur.push(`${w} w`);
    const rect = (x, y0, w, h, fill, stroke) => {
      cur.push("q");
      if (fill) setFill(fill[0], fill[1], fill[2]);
      if (stroke) {
        setLineWidth(0.75);
        setStroke(stroke[0], stroke[1], stroke[2]);
      }
      cur.push(`${x} ${y0} ${w} ${h} re`);
      if (fill && stroke) cur.push("B");
      else if (fill) cur.push("f");
      else cur.push("S");
      cur.push("Q");
    };
    const line = (x1, y1, x2, y2, stroke, w = 1) => {
      cur.push("q");
      setLineWidth(w);
      setStroke(stroke[0], stroke[1], stroke[2]);
      cur.push(`${x1} ${y1} m`);
      cur.push(`${x2} ${y2} l`);
      cur.push("S");
      cur.push("Q");
    };
    const text = (x, y0, font, size, s) => {
      cur.push("BT");
      cur.push(`/${font} ${size} Tf`);
      cur.push(`${x} ${y0} Td`);
      cur.push(`(${esc(s)}) Tj`);
      cur.push("ET");
    };
    const wrapLines = (s, maxChars) => {
      const out = [];
      const raw = toAscii(s).replace(/\s+/g, " ").trim();
      if (!raw) return out;
      const words = raw.split(" ");
      let lineBuf = "";
      for (const w of words) {
        if (!lineBuf) {
          lineBuf = w;
          continue;
        }
        if ((lineBuf + " " + w).length <= maxChars) {
          lineBuf += " " + w;
          continue;
        }
        out.push(lineBuf);
        lineBuf = w;
      }
      if (lineBuf) out.push(lineBuf);
      return out;
    };
    const textBlock = (x, yTop, font, size, s, maxChars, lineGap, maxLines) => {
      const lines = wrapLines(s, maxChars);
      const cap = maxLines ?? lines.length;
      let yy = yTop;
      for (let i = 0; i < Math.min(lines.length, cap); i++) {
        text(x, yy, font, size, lines[i]);
        yy -= lineGap;
      }
      return yy;
    };

    drawHeader();

    // Context block
    const leftColX = M + G;
    const rightColX = M + Math.floor((W - 2 * M) * 0.5);
    const goalsLine = goalLabels.length ? goalLabels.join(" + ") : "—";
    const goalWrapped = wrapLines(`Goals: ${goalsLine}`, 70);
    const goalLinesShown = goalWrapped.slice(0, 4);
    
    const goalsH = goalLinesShown.length * 14;
    const ctxH = 20 + 10 + 12 + 9 + 4 + 26 + 12 + 9 + 4 + goalsH + 16; 
    
    ensureSpace(ctxH + 32);
    const ctxY = y - ctxH;
    
    rect(M, ctxY, W - 2 * M, ctxH, C.cardBg, C.cardLine);
    rect(M, ctxY, 4, ctxH, C.brand, null); 
    
    let ty = ctxY + ctxH - 20;
    setFill(C.brand[0], C.brand[1], C.brand[2]);
    text(M + G, ty, "F2", 10, "CONTEXT");
    
    ty -= 22;
    setFill(C.muted[0], C.muted[1], C.muted[2]);
    text(leftColX, ty, "F1", 9, "Function");
    text(rightColX, ty, "F1", 9, "Service");
    
    ty -= 12;
    setFill(C.ink[0], C.ink[1], C.ink[2]);
    textBlock(leftColX, ty, "F2", 11, `${functionLabel || "-"}`, 40, 13, 2);
    textBlock(rightColX, ty, "F2", 11, `${serviceLabel || "-"}`, 40, 13, 2);
    
    ty -= 34;
    setFill(C.muted[0], C.muted[1], C.muted[2]);
    text(leftColX, ty, "F1", 9, "Goals");
    
    ty -= 12;
    setFill(C.ink[0], C.ink[1], C.ink[2]);
    for (const ln of goalLinesShown) {
      text(leftColX, ty, "F2", 11, ln.replace(/^Goals:\s*/i, ""));
      ty -= 14;
    }
    
    y = ctxY - 32;

    // Headline Impact
    ensureSpace(120);
    setFill(C.brand[0], C.brand[1], C.brand[2]);
    text(M, y, "F2", 14, "Headline Impact");
    y -= 16;

    const cardGap = 16;
    const cardW = (W - 2 * M - 2 * cardGap) / 3;
    const cardH = 80;
    const cardY = y - cardH;
    const innerPad = 16;
    const maxCharsKpi = 12;

    const k1x = M;
    const k2x = M + cardW + cardGap;
    const k3x = M + (cardW + cardGap) * 2;

    rect(k1x, cardY, cardW, cardH, C.brandSoft, null);
    rect(k2x, cardY, cardW, cardH, C.brandSoft, null);
    rect(k3x, cardY, cardW, cardH, C.brandSoft, null);
    rect(k1x, cardY, 3, cardH, C.brandLight, null);
    rect(k2x, cardY, 3, cardH, C.brandLight, null);
    rect(k3x, cardY, 3, cardH, C.brandLight, null);

    setFill(C.muted[0], C.muted[1], C.muted[2]);
    text(k1x + innerPad, cardY + cardH - 24, "F2", 9, "Monthly hours saved");
    text(k2x + innerPad, cardY + cardH - 24, "F2", 9, "Annual value (illustrative)");
    text(k3x + innerPad, cardY + cardH - 24, "F2", 9, "FTE / month");

    const str1 = String(fmtCur(computed.totals.monthlyHoursSaved) || "—");
    const str2 = String(fmtCur(computed.totals.annualValue) || "—");
    const str3 = String(fmtCur(computed.totals.monthlyFTE) || "—");

    const maxLen = Math.max(str1.length, str2.length, str3.length);
    const metricSize = maxLen > 9 ? 18 : 24;

    setFill(C.brand[0], C.brand[1], C.brand[2]);
    textBlock(k1x + innerPad, cardY + 32, "F2", metricSize, str1, maxCharsKpi, 16, 2);
    textBlock(k2x + innerPad, cardY + 32, "F2", metricSize, str2, maxCharsKpi, 18, 2);
    textBlock(k3x + innerPad, cardY + 32, "F2", metricSize, str3, maxCharsKpi, 16, 2);

    y = cardY - 40;

    // Breakdown
    ensureSpace(48);
    setFill(C.brand[0], C.brand[1], C.brand[2]);
    text(M, y + 10, "F2", 14, "Workload & Savings Breakdown");
    line(M, y + 2, W - M, y + 2, C.line, 1);
    y -= 14;

    const areas = Array.isArray(computed.areas) ? computed.areas : [];
    const sortedAreas = [...areas].sort((a, b) => (b.monthlyHoursSaved ?? 0) - (a.monthlyHoursSaved ?? 0));

    for (const a of sortedAreas) {
      const caps = Array.isArray(a.usedCapabilities) ? a.usedCapabilities : [];
      const capNames = caps.map(capId => data?.capabilityPatternMeta?.[capId]?.label ?? capId);
      const evidenceH = capNames.length * 14;
      const titleStr = a.areaLabel || a.areaId || "Service area";
      const titleLines = wrapLines(titleStr, 50);
      const titleH = titleLines.length * 14;
      
      const headerH = titleH + 34;
      const blockH = headerH + (capNames.length > 0 ? 16 + evidenceH + 16 : 16);
      ensureSpace(blockH + 24);

      const blockY = y - blockH;
      
      rect(M, blockY + blockH - headerH, W - 2 * M, headerH, C.soft, null);
      rect(M, blockY + blockH - headerH, 3, headerH, C.brandLight, null);

      const titleY = blockY + blockH - 22;
      let areaTy = titleY;
      setFill(C.ink[0], C.ink[1], C.ink[2]);
      for (const tl of titleLines.slice(0, 2)) {
        text(M + G, areaTy, "F2", 11, tl);
        areaTy -= 14;
      }

      const rightX = W - M - 120;
      const savingsStr = `${fmtCur(a.monthlyHoursSaved)} hrs/mo`;
      setFill(C.brand[0], C.brand[1], C.brand[2]);
      textBlock(rightX, titleY, "F2", 11, savingsStr, 20, 12, 2);

      if (capNames.length > 0) {
        let cy = blockY + blockH - headerH - 22;
        setFill(C.ink[0], C.ink[1], C.ink[2]);
        for (const cName of capNames) {
          text(M + G, cy, "F2", 9, cName);
          cy -= 14;
        }
      }

      line(M, blockY, W - M, blockY, C.cardLine, 0.75);

      y = blockY - 16;
    }

    pages.push(cur.join("\n") + "\n");
    return buildPdfFromPages({ pages: applyFooters(pages), pageW: W, pageH: H });
  }

  function buildPdfFromPages({ pages, pageW, pageH }) {
    const header = "%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n";

    // Object numbering:
    // 1 catalog, 2 pages root, 3.. page objs, then font objs, then content objs.
    const pageCount = pages.length;
    const pageObjNums = Array.from({ length: pageCount }, (_, i) => 3 + i);
    const fontObjNum1 = 3 + pageCount; // Helvetica
    const fontObjNum2 = 4 + pageCount; // Helvetica-Bold
    const contentObjNums = Array.from({ length: pageCount }, (_, i) => 5 + pageCount + i);

    const objs = [];
    objs.push(header);

    // 1: Catalog
    objs.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    // 2: Pages root
    objs.push(
      `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageCount} >>\nendobj\n`,
    );

    // Page objects
    for (let i = 0; i < pageCount; i++) {
      const pageObjNum = pageObjNums[i];
      const contentObjNum = contentObjNums[i];
      objs.push(
        `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
          `/Resources << /Font << /F1 ${fontObjNum1} 0 R /F2 ${fontObjNum2} 0 R >> >> ` +
          `/Contents ${contentObjNum} 0 R >>\nendobj\n`,
      );
    }

    // Fonts
    objs.push(
      `${fontObjNum1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    );
    objs.push(
      `${fontObjNum2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
    );

    // Contents
    for (let i = 0; i < pageCount; i++) {
      const s = pages[i] ?? "";
      const len = byteLen(s);
      const objNum = contentObjNums[i];
      objs.push(`${objNum} 0 obj\n<< /Length ${len} >>\nstream\n${s}endstream\nendobj\n`);
    }

    // xref
    const xrefOffsets = [];
    xrefOffsets.push(0); // obj 0
    let offset = 0;
    const joined = [];
    for (const chunk of objs) {
      joined.push(chunk);
    }
    // Need offsets per object: walk objs, tracking offsets at each "N 0 obj"
    // We'll re-walk the full PDF string deterministically by concatenating in order.
    const pdfSoFar = joined.join("");
    // Compute offsets by scanning for "\n<objNum> 0 obj\n" patterns is fragile.
    // Instead, rebuild offsets while concatenating.
    const objChunks = [];
    objChunks.push(header); // header is not an object

    const objectStrings = [];
    // Catalog and Pages root are objects 1 and 2; then page objects; then fonts; then contents
    objectStrings.push(objs[1]); // 1 0 obj...
    objectStrings.push(objs[2]); // 2 0 obj...
    for (let i = 0; i < pageCount; i++) objectStrings.push(objs[3 + i]);
    objectStrings.push(objs[3 + pageCount]); // font1
    objectStrings.push(objs[4 + pageCount]); // font2
    for (let i = 0; i < pageCount; i++) objectStrings.push(objs[5 + pageCount + i]); // contents

    const out = [];
    out.push(header);
    offset = byteLen(header);
    xrefOffsets.push(offset); // obj 1 offset
    out.push(objectStrings[0]);
    offset += byteLen(objectStrings[0]);
    xrefOffsets.push(offset); // obj 2 offset
    out.push(objectStrings[1]);
    offset += byteLen(objectStrings[1]);

    // objs 3..N
    for (let i = 2; i < objectStrings.length; i++) {
      xrefOffsets.push(offset);
      out.push(objectStrings[i]);
      offset += byteLen(objectStrings[i]);
    }

    const xrefStart = offset;
    const xref = [];
    xref.push("xref\n");
    xref.push(`0 ${xrefOffsets.length}\n`);
    xref.push("0000000000 65535 f \n");
    for (let i = 1; i < xrefOffsets.length; i++) {
      xref.push(String(xrefOffsets[i]).padStart(10, "0") + " 00000 n \n");
    }

    const trailer =
      "trailer\n" +
      `<< /Size ${xrefOffsets.length} /Root 1 0 R >>\n` +
      "startxref\n" +
      `${xrefStart}\n` +
      "%%EOF\n";

    const pdf = out.join("") + xref.join("") + trailer;
    return new TextEncoder().encode(pdf);
  }

  function byteLen(s) {
    return new TextEncoder().encode(String(s)).length;
  }

  const handlers = {
    selectFunction: (fnId) => {
      state = window.DiscoverGate1State.setFunctionService(state, fnId, "");
      rerender();
    },
    selectService: (svcId) => {
      state = window.DiscoverGate1State.setFunctionService(
        state,
        state.functionId,
        svcId,
      );
      rerender();
    },
    toggleGoal: (goalId) => {
      state = window.DiscoverGate1State.toggleGoal(state, goalId);
      rerender();
    },
    toggleTask: (areaId, taskId) => {
      state = window.DiscoverGate1State.toggleTask(state, areaId, taskId);
      state = window.DiscoverGate1State.setAreaOpen(state, areaId, true);
      rerender();
    },
    updateArea: (areaId, patch) => {
      state = window.DiscoverGate1State.updateAreaConfig(state, areaId, patch);
      state = window.DiscoverGate1State.setAreaOpen(state, areaId, true);
      rerender();
    },
    updateAreaPreview: (areaId, patch) => {
      const tempState = window.DiscoverGate1State.updateAreaConfig(state, areaId, patch);
      const computed = window.DiscoverGate1Calc.compute(tempState, data);
      window.DiscoverGate1Render.renderStep3Summary(tempState, data, computed);
    },
    toggleAreaOpen: (areaId) => {
      const cur = Boolean(state?.ui?.openAreas?.[String(areaId)]);
      state = window.DiscoverGate1State.setAreaOpen(state, areaId, !cur);
      rerender();
    },
    setInputs: (patch) => {
      state = window.DiscoverGate1State.setInputs(state, patch);
      rerender();
    },
    exportPdfFile,
  };

  function bindNav() {
    const back = $("discover-back");
    const next = $("discover-next");

    if (back) {
      back.addEventListener("click", () => {
        state = window.DiscoverGate1State.goStep(state, state.step - 1);
        rerender();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        if (!window.DiscoverGate1State.canGoNext(state, data)) return;
        if (state.step >= 3) {
          window.DiscoverGate1State.hardReset();
          state = window.DiscoverGate1State.load();
          rerender();
          return;
        }
        state = window.DiscoverGate1State.goStep(state, state.step + 1);
        rerender();
      });
    }

    const hourlyRate = $("g1-hourly-rate");
    const capHours = $("g1-capacity-hours");
    if (hourlyRate) {
      hourlyRate.addEventListener("input", () =>
        handlers.setInputs({ hourlyRate: hourlyRate.value }),
      );
    }
    if (capHours) {
      capHours.addEventListener("input", () =>
        handlers.setInputs({ monthlyCapacityHours: capHours.value }),
      );
    }
  }

  async function init() {
    if (window.AppShell) window.AppShell.init();
    if (typeof ThemeManager !== "undefined") ThemeManager.initTheme();

    try {
      data = await window.DiscoverGate1DataLoader.load();
    } catch (e) {
      console.error(e);
      if (window.Toast) window.Toast.error("Failed to load Discover data.");
      return;
    }

    state = window.DiscoverGate1State.load();
    bindNav();
    rerender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
