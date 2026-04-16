/**
 * Boardroom PDF Report Generator
 * Generates a downloadable PDF from live AI Architecture Explorer data.
 * Uses jsPDF + jsPDF-AutoTable — runs entirely client-side, no print dialog.
 */

import type { AICase } from '@/lib/mockData';
import { DEMO_CONTEXT } from '@/lib/config/demoContext';

// ─── Color palette (KPMG brand) ───────────────────────────────────────────────
const KPMG_NAVY = [0, 32, 95] as [number, number, number];
const KPMG_BLUE = [0, 51, 141] as [number, number, number];
const KPMG_TEAL = [0, 122, 115] as [number, number, number];
const KPMG_LIGHT_BG = [252, 249, 248] as [number, number, number];
const KPMG_BORDER = [235, 231, 231] as [number, number, number];
const TEXT_PRIMARY = [28, 27, 27] as [number, number, number];
const TEXT_MUTED = [116, 118, 131] as [number, number, number];

export interface PDFExportOptions {
  cases: AICase[];
  selectedCase?: AICase | null;
  activeFunction?: string | null;
  searchQuery?: string;
  reportTitle?: string;
}

export async function exportArchitecturePDF(options: PDFExportOptions): Promise<void> {
  // Dynamic import to avoid SSR issues
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
  await import('jspdf-autotable');

  const {
    cases,
    selectedCase,
    activeFunction,
    searchQuery,
    reportTitle = DEMO_CONTEXT.defaults.reportTitle,
  } = options;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ─── Helper: add new page with header ─────────────────────────────────────
  function addPageHeader() {
    doc.setFillColor(...KPMG_NAVY);
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('KPMG AI Intelligence Hub', margin, 8);
    doc.setFont('helvetica', 'normal');
    doc.text(reportTitle, pageW - margin, 8, { align: 'right' });
    y = 20;
  }

  function checkPageBreak(needed: number) {
    if (y + needed > pageH - 18) {
      doc.addPage();
      addPageHeader();
    }
  }

  // ─── Cover page ───────────────────────────────────────────────────────────
  // Navy header band
  doc.setFillColor(...KPMG_NAVY);
  doc.rect(0, 0, pageW, 55, 'F');

  // KPMG wordmark area
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('KPMG', margin, 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 200, 240);
  doc.text('AI Intelligence Hub', margin, 30);

  // Teal accent bar
  doc.setFillColor(...KPMG_TEAL);
  doc.rect(0, 55, pageW, 3, 'F');

  // Report title
  doc.setFontSize(18);
  doc.setTextColor(...TEXT_PRIMARY);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(reportTitle, contentW);
  doc.text(titleLines, margin, 75);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('AI Architecture Explorer — Portfolio Analysis Report', margin, 75 + titleLines.length * 8 + 4);

  // Meta block
  const metaY = 105;
  doc.setFillColor(...KPMG_LIGHT_BG);
  doc.roundedRect(margin, metaY, contentW, 42, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...KPMG_NAVY);

  const metaItems = [
    ['Prepared by', `${DEMO_CONTEXT.user.name}, ${DEMO_CONTEXT.user.role}`],
    ['Office', DEMO_CONTEXT.user.office],
    ['Reporting Period', DEMO_CONTEXT.firm.reportingPeriod],
    ['Generated', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Cases Analysed', String(cases.length)],
    ['Active Filter', activeFunction ? `Function: ${activeFunction}` : searchQuery ? `Search: "${searchQuery}"` : 'All Cases'],
  ];

  metaItems.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? margin + 6 : margin + contentW / 2 + 3;
    const row = metaY + 8 + Math.floor(i / 2) * 12;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(label + ':', col, row);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(value, col + 28, row);
  });

  // Confidentiality notice
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'CONFIDENTIAL — For internal boardroom use only. Not for external distribution.',
    pageW / 2,
    pageH - 14,
    { align: 'center' },
  );

  // ─── Page 2: Executive Summary ────────────────────────────────────────────
  doc.addPage();
  addPageHeader();

  // Section heading
  doc.setFillColor(...KPMG_BLUE);
  doc.rect(margin, y, 3, 8, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...KPMG_NAVY);
  doc.text('Executive Summary', margin + 7, y + 6.5);
  y += 16;

  // Portfolio KPIs
  const totalROI = cases.reduce((s, c) => s + c.numericMetrics.annualizedReturn, 0);
  const totalHours = cases.reduce((s, c) => s + c.numericMetrics.hoursRecoveredPerMonth, 0);
  const totalFTEs = cases.reduce((s, c) => s + c.numericMetrics.ftesFreed, 0);
  const avgAdoption = cases.length
    ? Math.round(cases.reduce((s, c) => s + c.numericMetrics.adoptionRate, 0) / cases.length)
    : 0;

  const kpiBoxW = (contentW - 9) / 4;
  const kpis = [
    { label: 'Total Annualised ROI', value: `$${(totalROI / 1_000_000).toFixed(2)}M`, color: KPMG_TEAL },
    { label: 'Hours Recovered / Mo', value: `${totalHours.toLocaleString()}`, color: KPMG_BLUE },
    { label: 'FTEs Freed', value: totalFTEs.toFixed(1), color: KPMG_NAVY },
    { label: 'Avg Adoption Rate', value: `${avgAdoption}%`, color: [15, 110, 86] as [number, number, number] },
  ];

  kpis.forEach((kpi, i) => {
    const bx = margin + i * (kpiBoxW + 3);
    doc.setFillColor(...KPMG_LIGHT_BG);
    doc.roundedRect(bx, y, kpiBoxW, 22, 2, 2, 'F');
    doc.setFillColor(...kpi.color);
    doc.rect(bx, y, kpiBoxW, 2.5, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, bx + kpiBoxW / 2, y + 13, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(kpi.label, bx + kpiBoxW / 2, y + 19, { align: 'center' });
  });
  y += 30;

  // Assumptions block
  doc.setFillColor(235, 240, 255);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...KPMG_NAVY);
  doc.text('Key Assumptions & Methodology', margin + 5, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_PRIMARY);
  doc.setFontSize(7.5);
  const assumptions = [
    '• ROI figures are annualised estimates based on pilot data and extrapolated at current adoption rates.',
    '• Hours recovered are calculated per month at full deployment capacity for each case.',
    '• FTE equivalents assume 160 productive hours per FTE per month.',
    '• Adoption rates reflect active users as a percentage of target user population at time of report.',
  ];
  assumptions.forEach((line, i) => {
    doc.text(line, margin + 5, y + 14 + i * 4.5);
  });
  y += 36;

  // ─── Page 2 continued / Page 3: Case Trace Table ─────────────────────────
  checkPageBreak(20);
  doc.setFillColor(...KPMG_BLUE);
  doc.rect(margin, y, 3, 8, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...KPMG_NAVY);
  doc.text('AI Case Portfolio — Scenario Outputs', margin + 7, y + 6.5);
  y += 14;

  // Build table rows
  const tableRows = cases.map((c) => [
    c.code,
    c.title,
    c.tech,
    c.status,
    `$${(c.numericMetrics.annualizedReturn / 1000).toFixed(0)}K`,
    `${c.numericMetrics.hoursRecoveredPerMonth.toLocaleString()} hrs`,
    `${c.numericMetrics.ftesFreed}`,
    `${c.numericMetrics.adoptionRate}%`,
  ]);

  // @ts-ignore — jspdf-autotable extends jsPDF prototype
  doc.autoTable({
    startY: y,
    head: [['Code', 'Case Title', 'AI Technique', 'Status', 'Ann. ROI', 'Hrs/Mo', 'FTEs', 'Adoption']],
    body: tableRows,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: TEXT_PRIMARY,
      lineColor: KPMG_BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: KPMG_NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: KPMG_LIGHT_BG,
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      1: { cellWidth: 38 },
      2: { cellWidth: 38 },
      3: { cellWidth: 20 },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 12, halign: 'right' },
      7: { cellWidth: 14, halign: 'right' },
    },
    didDrawPage: () => {
      addPageHeader();
    },
  });

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 10;

  // ─── Selected Case Deep-Dive (if a case is traced) ────────────────────────
  if (selectedCase) {
    checkPageBreak(30);

    doc.setFillColor(...KPMG_BLUE);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...KPMG_NAVY);
    doc.text(`Case Trace: ${selectedCase.code} — ${selectedCase.title}`, margin + 7, y + 6.5);
    y += 16;

    // Case header card
    doc.setFillColor(...KPMG_LIGHT_BG);
    doc.roundedRect(margin, y, contentW, 30, 2, 2, 'F');
    doc.setFillColor(...KPMG_NAVY);
    doc.rect(margin, y, contentW, 2.5, 'F');

    const caseFields = [
      ['AI Technique', selectedCase.tech],
      ['Status', selectedCase.status],
      ['Maturity', selectedCase.maturityLevel],
      ['Source', selectedCase.source],
      ['Value Score', `${selectedCase.valueScore}/100`],
      ['Readiness', `${selectedCase.readinessScore}/100`],
    ];

    caseFields.forEach(([label, value], i) => {
      const col = margin + 6 + (i % 3) * (contentW / 3);
      const row = y + 10 + Math.floor(i / 3) * 11;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT_MUTED);
      doc.text(label + ':', col, row);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(value, col, row + 5);
    });
    y += 38;

    // Problem statement
    checkPageBreak(30);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...KPMG_NAVY);
    doc.text('Problem Statement', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_PRIMARY);
    const psLines = doc.splitTextToSize(selectedCase.problemStatement, contentW);
    doc.text(psLines, margin, y);
    y += psLines.length * 4.5 + 6;

    // Executive summary
    checkPageBreak(30);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...KPMG_NAVY);
    doc.text('Executive Summary', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_PRIMARY);
    const esLines = doc.splitTextToSize(selectedCase.executiveSummary, contentW);
    doc.text(esLines, margin, y);
    y += esLines.length * 4.5 + 6;

    // Partner insight
    checkPageBreak(30);
    doc.setFillColor(235, 240, 255);
    const insightLines = doc.splitTextToSize(`"${selectedCase.partnerInsight}"`, contentW - 12);
    const insightH = insightLines.length * 4.5 + 14;
    doc.roundedRect(margin, y, contentW, insightH, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(...KPMG_NAVY);
    doc.text('Partner Insight', margin + 6, y + 7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(insightLines, margin + 6, y + 13);
    y += insightH + 6;

    // Architecture lineage
    checkPageBreak(20);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...KPMG_NAVY);
    doc.text('Architecture Lineage', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_PRIMARY);
    const alLines = doc.splitTextToSize(selectedCase.architectureLineage, contentW);
    doc.text(alLines, margin, y);
    y += alLines.length * 4.5 + 6;

    // Governance notes
    checkPageBreak(20);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...KPMG_NAVY);
    doc.text('Governance & Compliance Notes', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_PRIMARY);
    const gnLines = doc.splitTextToSize(selectedCase.governanceNotes, contentW);
    doc.text(gnLines, margin, y);
    y += gnLines.length * 4.5 + 6;

    // Metrics table
    checkPageBreak(30);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...KPMG_NAVY);
    doc.text('Value Metrics', margin, y);
    y += 4;

    // @ts-ignore
    doc.autoTable({
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Annualised Return', `$${(selectedCase.numericMetrics.annualizedReturn / 1000).toFixed(0)}K`],
        ['Hours Recovered / Month', `${selectedCase.numericMetrics.hoursRecoveredPerMonth.toLocaleString()} hrs`],
        ['FTEs Freed', String(selectedCase.numericMetrics.ftesFreed)],
        ['Adoption Rate', `${selectedCase.numericMetrics.adoptionRate}%`],
        ...selectedCase.metrics.map((m) => ['Key Metric', m]),
      ],
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3, textColor: TEXT_PRIMARY },
      headStyles: { fillColor: KPMG_NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: KPMG_LIGHT_BG },
      columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' }, 1: { cellWidth: contentW - 70 } },
      didDrawPage: () => { addPageHeader(); },
    });

    // @ts-ignore
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ─── Footer on last page ──────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${p} of ${totalPages}  |  ${DEMO_CONTEXT.firm.name} ${DEMO_CONTEXT.firm.product}  |  ${DEMO_CONTEXT.firm.reportingPeriod}`,
      pageW / 2,
      pageH - 7,
      { align: 'center' },
    );
  }

  // ─── Download ─────────────────────────────────────────────────────────────
  const filename = `KPMG_AI_Architecture_${DEMO_CONTEXT.firm.reportingPeriod.replace(/\s/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}
