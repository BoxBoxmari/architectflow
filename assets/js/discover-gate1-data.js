/**
 * discover-gate1-data.js — Loads workbook-derived Gate 1 data artifact.
 * Exposes: window.DiscoverGate1DataLoader.load() => Promise<DiscoverGate1Data>
 */

(() => {
  "use strict";

  const DATA_URL = "../assets/data/discover-gate1-data.json";

  async function load() {
    const res = await fetch(DATA_URL, { cache: "no-cache" });
    if (!res.ok) {
      throw new Error(`Failed to load Gate1 data (${res.status})`);
    }
    return await res.json();
  }

  window.DiscoverGate1DataLoader = { load, DATA_URL };
})();

