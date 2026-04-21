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
  function buildCSV(rows, separator = ';') {
    const BOM = '\uFEFF';
    const escapeRegex = new RegExp(`[${separator}"\n]`);
    
    const csvContent = rows
      .map(row =>
        row
          .map(cell => {
            const s = String(cell);
            return escapeRegex.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(separator)
      )
      .join('\n');
      
    return BOM + csvContent;
  }

  return { downloadFile, buildCSV };
})();
