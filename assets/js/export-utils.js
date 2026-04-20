/**
 * Client-side export utilities — no external dependencies.
 * Ported 1:1 from src/lib/exportUtils.ts
 */

const ExportUtils = (() => {
  'use strict';

  /** Download any string content as a file */
  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Build a CSV string from rows (array of arrays) */
  function buildCSV(rows) {
    return rows
      .map(row =>
        row
          .map(cell => {
            const s = String(cell);
            return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(',')
      )
      .join('\n');
  }

  return { downloadFile, buildCSV };
})();
