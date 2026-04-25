/**
 * discover-gate1-render.js — DOM rendering for Gate 1 flow.
 */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined) continue;
      if (k === "class") node.className = String(v);
      else if (k.startsWith("data-")) node.setAttribute(k, String(v));
      else if (k === "text") node.textContent = String(v);
      else node.setAttribute(k, String(v));
    }
    for (const c of children) node.appendChild(c);
    return node;
  }

  function showStep(step) {
    for (let i = 0; i <= 3; i++) {
      const s = $("ds" + i);
      if (s) s.classList.toggle("active", i === step);
    }
  }

  function renderStep1(state, data, on) {
    const fnGrid = $("g1-fn-grid");
    const svcList = $("g1-svc-list");
    if (!fnGrid || !svcList) return;

    fnGrid.innerHTML = "";
    for (const fn of data.functions ?? []) {
      const isSel = fn.id === state.functionId;
      const card = el("button", {
        class: "g1-fn-card" + (isSel ? " selected" : ""),
        type: "button",
        "data-fn": fn.id,
      });
      const top = el("div", { class: "g1-fn-top" });
      const icon = el("div", { class: "g1-fn-ic", text: fn.icon || "•" });
      const name = el("div", { class: "g1-fn-name", text: fn.label });
      top.appendChild(icon);
      top.appendChild(name);
      card.appendChild(top);
      card.addEventListener("click", () => on.selectFunction(fn.id));
      fnGrid.appendChild(card);
    }

    svcList.innerHTML = "";
    const fnId = state.functionId;
    const services = fnId ? data.servicesByFunction?.[fnId] ?? [] : [];

    if (!fnId) {
      svcList.appendChild(
        el("div", { class: "g1-empty", text: "Select a function to view services." }),
      );
      return;
    }

    for (const svc of services) {
      const isSel = svc.id === state.serviceId;
      const item = el("button", {
        class: "g1-svc-item" + (isSel ? " selected" : ""),
        type: "button",
        "data-svc": svc.id,
      });
      item.appendChild(el("div", { class: "g1-svc-name", text: svc.label }));
      item.appendChild(el("div", { class: "g1-svc-arr", text: "→" }));
      item.addEventListener("click", () => on.selectService(svc.id));
      svcList.appendChild(item);
    }
  }

  function renderStep2(state, data, on) {
    const grid = $("g1-goals-grid");
    const helper = $("g1-goals-helper");
    const examples = $("g1-goal-examples");
    if (!grid || !helper || !examples) return;

    grid.innerHTML = "";
    examples.innerHTML = "";
    const goals = data.goals ?? [];
    if (goals.length === 0) {
      helper.textContent =
        "Goals are not configured in the current data artifact.";
      return;
    }

    helper.textContent =
      state.selectedGoals.length >= 2
        ? "Maximum 2 goals selected."
        : "What do you want to achieve? Select up to two management goals.";

    for (const g of goals) {
      const isSel = state.selectedGoals.includes(g.id);
      const card = el("button", {
        class: "g1-goal-card" + (isSel ? " selected" : ""),
        type: "button",
        "data-goal": g.id,
      });
      card.appendChild(el("div", { class: "g1-goal-label", text: g.label }));
      card.addEventListener("click", () => on.toggleGoal(g.id));
      grid.appendChild(card);
    }

    const byFn = data.goalExamplesByFunction?.[state.functionId] ?? null;
    const selected = state.selectedGoals ?? [];

    if (!byFn || selected.length === 0) {
      examples.appendChild(
        el("div", {
          class: "g1-goal-ex-empty",
          text:
            selected.length === 0
              ? "Select a goal to view an example for your function."
              : "No function-specific examples available.",
        }),
      );
      return;
    }

    examples.appendChild(el("div", { class: "g1-goal-ex-title", text: "Examples" }));
    const ul = el("ul", { class: "g1-goal-ex-list" });
    for (const goalId of selected) {
      const goal = goals.find((x) => x.id === goalId);
      const copy = byFn?.[goalId] ?? null;
      if (!copy) continue;
      ul.appendChild(
        el("li", { class: "g1-goal-ex-item" }, [
          el("div", { class: "g1-goal-ex-k", text: goal?.label ?? goalId }),
          el("div", { class: "g1-goal-ex-v", text: copy }),
        ]),
      );
    }
    if (!ul.childNodes.length) {
      examples.appendChild(
        el("div", {
          class: "g1-goal-ex-empty",
          text: "No examples available for the selected goals in this function.",
        }),
      );
      return;
    }
    examples.appendChild(ul);
  }

  function renderStep3(state, data, computed, on) {
    const list = $("g1-area-list");
    const sidebar = $("g1-summary");
    const sticky = $("g1-sticky");
    if (!list || !sidebar || !sticky) return;

    // Inputs
    const hourlyRate = $("g1-hourly-rate");
    const capHours = $("g1-capacity-hours");
    const hourlyDraft = state?.ui?.inputDraft?.hourlyRate;
    const capDraft = state?.ui?.inputDraft?.monthlyCapacityHours;
    if (hourlyRate) hourlyRate.value = hourlyDraft ? hourlyDraft : state.hourlyRate ?? "";
    if (capHours) capHours.value = capDraft ? capDraft : state.monthlyCapacityHours ?? "";

    list.innerHTML = "";

    const svcId = state.serviceId;
    for (const area of data.serviceAreas ?? []) {
      const areaId = area.id;
      const tasks = svcId ? data.taskMapByService?.[svcId]?.[areaId] ?? [] : [];
      const aState = state.areas?.[areaId];
      const hasTasks = (aState?.taskIds?.length ?? 0) > 0;
      const isOpen = Boolean(state?.ui?.openAreas?.[areaId]);

      const item = el("div", { class: "g1-acc-item" + (hasTasks ? " has-tasks" : "") });
      item.dataset.area = areaId;
      if (isOpen) item.classList.add("open");

      const hdr = el("button", { class: "g1-acc-hdr", type: "button" });
      const bodyId = `g1-acc-body-${areaId}`;
      hdr.setAttribute("aria-controls", bodyId);
      hdr.setAttribute("aria-expanded", isOpen ? "true" : "false");
      hdr.appendChild(
        el("div", {
          class: "g1-acc-ic",
          text: data.serviceAreaMeta?.[areaId]?.icon ?? "•",
        }),
      );
      const info = el("div", { class: "g1-acc-info" });
      info.appendChild(el("div", { class: "g1-acc-lbl", text: area.label }));
      info.appendChild(
        el("div", {
          class: "g1-acc-dsc",
          text: data.serviceAreaMeta?.[areaId]?.description ?? "",
        }),
      );
      hdr.appendChild(info);
      hdr.appendChild(el("div", { class: "g1-acc-chev", text: "›", "aria-hidden": "true" }));
      item.appendChild(hdr);

      const body = el("div", {
        class: "g1-acc-body",
        id: bodyId,
        role: "region",
        "aria-label": area.label,
      });
      if (!svcId) {
        body.appendChild(el("div", { class: "g1-empty", text: "Select a service first." }));
      } else if (tasks.length === 0) {
        body.appendChild(el("div", { class: "g1-empty", text: "No mapped tasks for this area." }));
      } else {
        const chips = el("div", { class: "g1-task-chips" });
        for (const t of tasks) {
          const sel = aState?.taskIds?.includes(t.id) ?? false;
          const chip = el("button", {
            class: "g1-task-chip" + (sel ? " selected" : ""),
            type: "button",
            title: t.description ?? "",
          });
          chip.appendChild(el("div", { class: "g1-task-label", text: t.label }));
          chip.addEventListener("click", () => on.toggleTask(areaId, t.id));
          chips.appendChild(chip);
        }
        body.appendChild(chips);

        const cfg = aState;
        if (cfg && cfg.taskIds.length > 0) {
          const controls = el("div", { class: "g1-controls" });
          controls.appendChild(
            el("div", { class: "g1-controls-title", text: "Workload assumptions (per month)" }),
          );

          const row = (label, key, min, max, step, suffix) => {
            const wrap = el("div", { class: "g1-ctrl" });
            wrap.appendChild(el("div", { class: "g1-ctrl-label", text: label }));
            const input = el("input", {
              class: "g1-ctrl-input",
              type: "range",
              min,
              max,
              step,
              value: String(cfg[key]),
            });
            const val = el("div", {
              class: "g1-ctrl-val",
              text: `${cfg[key]}${suffix ?? ""}`,
            });
            input.addEventListener("input", () => {
              val.textContent = `${input.value}${suffix ?? ""}`;
              if (on.updateAreaPreview) {
                on.updateAreaPreview(areaId, { [key]: Number(input.value) });
              }
            });
            input.addEventListener("change", () => {
              on.updateArea(areaId, { [key]: Number(input.value) });
            });
            wrap.appendChild(input);
            wrap.appendChild(val);
            return wrap;
          };

          controls.appendChild(row("People involved", "people", 0, 2000, 1, ""));
          controls.appendChild(row("Times per person", "freq", 0, 500, 1, " times"));
          controls.appendChild(row("Avg minutes per task", "avgMin", 0, 600, 1, " min"));
          body.appendChild(controls);
        }
      }

      hdr.addEventListener("click", () => on.toggleAreaOpen(areaId));
      item.appendChild(body);
      list.appendChild(item);
    }

    renderStep3Summary(state, data, computed);
  }

  function renderStep3Summary(state, data, computed) {
    const sidebar = $("g1-summary");
    const sticky = $("g1-sticky");
    if (!sidebar || !sticky) return;

    // Summary
    const t = computed?.totals ?? { monthlyHoursSaved: 0, annualValue: 0, monthlyFTE: 0 };
    sidebar.innerHTML = "";
    sidebar.appendChild(el("div", { class: "g1-sum-title", text: "Signal summary" }));
    sidebar.appendChild(
      el("div", { class: "g1-sum-row" }, [
        el("div", { class: "g1-sum-k", text: "Monthly hours saved" }),
        el("div", { class: "g1-sum-v", text: window.DiscoverGate1Calc.fmtCurrency(t.monthlyHoursSaved) }),
      ]),
    );
    sidebar.appendChild(
      el("div", { class: "g1-sum-row" }, [
        el("div", { class: "g1-sum-k", text: "Annual value" }),
        el("div", { class: "g1-sum-v", text: window.DiscoverGate1Calc.fmtCurrency(t.annualValue) }),
      ]),
    );
    sidebar.appendChild(
      el("div", { class: "g1-sum-row" }, [
        el("div", { class: "g1-sum-k", text: "FTE / month" }),
        el("div", { class: "g1-sum-v", text: (t.monthlyFTE ? window.DiscoverGate1Calc.fmtCurrency(t.monthlyFTE) : "—") }),
      ]),
    );

    // Selected items (outside accordion)
    const picked = (computed?.areas ?? []).filter((a) => (a?.tasks?.length ?? 0) > 0);
    if (picked.length) {
      sidebar.appendChild(el("div", { class: "g1-sum-subtitle", text: "Selected items" }));
      const wrap = el("div", { class: "g1-picked" });
      for (const a of picked) {
        const block = el("div", { class: "g1-picked-area" });
        block.appendChild(el("div", { class: "g1-picked-area-k", text: a.areaLabel }));
        const chips = el("div", { class: "g1-picked-chips" });
        for (const task of a.tasks ?? []) {
          chips.appendChild(el("span", { class: "g1-picked-chip", text: task.label }));
        }
        block.appendChild(chips);
        wrap.appendChild(block);
      }
      sidebar.appendChild(wrap);
    }

    // Sticky (mobile)
    sticky.innerHTML = "";
    sticky.appendChild(
      el("div", { class: "g1-sticky-cell" }, [
        el("div", { class: "g1-sticky-k", text: "Hours/mo" }),
        el("div", { class: "g1-sticky-v", text: window.DiscoverGate1Calc.fmtCurrency(t.monthlyHoursSaved) }),
      ]),
    );
    sticky.appendChild(
      el("div", { class: "g1-sticky-cell" }, [
        el("div", { class: "g1-sticky-k", text: "Value/yr" }),
        el("div", { class: "g1-sticky-v", text: window.DiscoverGate1Calc.fmtCurrency(t.annualValue) }),
      ]),
    );
    sticky.appendChild(
      el("div", { class: "g1-sticky-cell" }, [
        el("div", { class: "g1-sticky-k", text: "FTE/mo" }),
        el("div", { class: "g1-sticky-v", text: (t.monthlyFTE ? window.DiscoverGate1Calc.fmtCurrency(t.monthlyFTE) : "—") }),
      ]),
    );
  }

  function renderStep4(state, data, computed, on) {
    const hero = $("g1-result-hero");
    const list = $("g1-result-list");
    const dl = $("g1-download");
    if (!hero || !list || !dl) return;

    const t = computed?.totals ?? { monthlyHoursSaved: 0, annualValue: 0, monthlyFTE: 0 };
    hero.querySelector("[data-k='hours']").textContent =
      window.DiscoverGate1Calc.fmtCurrency(t.monthlyHoursSaved);
    hero.querySelector("[data-k='value']").textContent =
      window.DiscoverGate1Calc.fmtCurrency(t.annualValue);
    hero.querySelector("[data-k='fte']").textContent =
      t.monthlyFTE ? window.DiscoverGate1Calc.fmtCurrency(t.monthlyFTE) : "—";

    // Context line: selected goals (management priorities).
    const ctx = computed?.context ?? {};
    const goalLineText =
      Array.isArray(ctx.selectedGoalLabels) && ctx.selectedGoalLabels.length > 0
        ? `Goals: ${ctx.selectedGoalLabels.join(" + ")}`
        : "Goals: —";
    const existingCtx = hero.querySelector(".g1-hero-context");
    const ctxEl =
      existingCtx ||
      el("div", {
        class: "g1-hero-context",
      });
    ctxEl.textContent = goalLineText;
    if (!existingCtx) hero.appendChild(ctxEl);

    list.innerHTML = "";
    for (const a of computed.areas ?? []) {
      const card = el("div", { class: "g1-result-card" });
      card.appendChild(el("div", { class: "g1-result-area", text: a.areaLabel }));
      card.appendChild(
        el("div", { class: "g1-result-metrics" }, [
          el("div", { class: "g1-result-metric", text: `${window.DiscoverGate1Calc.fmtCurrency(a.monthlyHoursSaved)} hrs/mo saved` }),
        ]),
      );

      const caps = el("div", { class: "g1-result-caps" });
      // Per request: remove evidence/source strings from the UI (partner-facing output).
      // Keep only capability names.
      for (const capId of a.usedCapabilities ?? []) {
        const m = data.capabilityPatternMeta?.[capId];
        const line = el("div", { class: "g1-result-cap" });
        line.appendChild(el("div", { class: "g1-cap-name", text: m?.label ?? capId }));
        caps.appendChild(line);
      }
      card.appendChild(caps);
      list.appendChild(card);
    }

    // Avoid accumulating listeners across rerenders.
    dl.textContent = "Export PDF";
    dl.onclick = () => on.exportPdfFile(computed);
  }

  function setNavState(state) {
    const back = $("discover-back");
    const next = $("discover-next");
    if (!back || !next) return;
    back.disabled = state.step <= 0;
  }

  window.DiscoverGate1Render = {
    showStep,
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep3Summary,
    renderStep4,
    setNavState,
  };
})();

