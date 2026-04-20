/**
 * Chart Bar — lightweight DOM-based bar chart replacing Recharts.
 * Renders scenario comparison bars into a container element.
 */

const ChartBar = (() => {
  'use strict';

  function fmtExecShort(value) {
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(0) + 'K';
    return '$' + Math.round(value);
  }

  /**
   * Render bars into a container element.
   * @param {string} containerId
   * @param {Array<{name: string, value: number, color: string}>} data
   */
  function render(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const maxVal = Math.max(...data.map(d => d.value), 1);

    let html = '<div class="chart-bars">';
    data.forEach(d => {
      const pct = Math.max((d.value / maxVal) * 100, 2);
      html += `
        <div class="chart-bar-group">
          <div class="chart-bar-label-top">${fmtExecShort(d.value)}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="height:${pct}%;background:${d.color};border-radius:6px 6px 0 0;"></div>
          </div>
          <div class="chart-bar-label">${d.name}</div>
        </div>`;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  return { render };
})();
