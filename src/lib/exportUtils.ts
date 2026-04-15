/**
 * Client-side export utilities — no external dependencies.
 * CSV: Blob + anchor download
 * PDF: browser print dialog (print-specific CSS hides everything except the target div)
 */

/** Download any string content as a file */
export function downloadFile(content: string, filename: string, mimeType: string) {
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
export function buildCSV(rows: (string | number)[][]): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          const s = String(cell);
          // Wrap in quotes if contains comma, quote, or newline
          return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Trigger browser print dialog for a specific DOM element.
 * Temporarily injects a <style> that hides everything except the target element.
 */
export function printElement(elementId: string, title: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const styleId = '__print_override__';
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    @media print {
      body > * { display: none !important; }
      #${elementId} { display: block !important; }
      #${elementId} * { display: revert !important; }
    }
  `;
  document.head.appendChild(style);

  const prevTitle = document.title;
  document.title = title;
  window.print();
  document.title = prevTitle;

  // Clean up after print dialog closes
  setTimeout(() => {
    const s = document.getElementById(styleId);
    if (s) s.remove();
  }, 1000);
}
