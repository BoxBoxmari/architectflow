'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Download, ArrowUpRight, TrendingDown, Layers, HelpCircle, Zap, Target } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────
const FOCUS_ITEMS = [
  { label: 'Use Case', trend: 'up' },
  { label: 'Adoption', trend: 'up' },
  { label: 'Value', trend: 'up' },
  { label: 'Platform Cost', trend: 'down' },
];

const ACTION_GROUPS = [
  {
    team: 'AI Function Core Team',
    items: ['Measure use case values', 'Use case portfolio'],
  },
  {
    team: 'AI Service Line Team',
    items: ['Implementation', 'Testing, Pilot, Appy, Scale'],
  },
  {
    team: 'Employees',
    items: ['Skill training', 'Quality feedback', 'Adoption rate'],
  },
];

const SUPPORT_DATA = {
  firmTeams: 'AI Innovation, KDC, L&D, QRM, NITSO',
  tools: 'AI management template package\nFunctional AI Platform, Copilot, alQChat, Workbench',
};

const QUESTIONS = [
  'Who are best for "AI-enabled workflow" program?',
  'Your top 03 areas can free up human capacity?',
  'How to speed up AI use case enablement?',
  'How to avoid AI is just "optional"?',
  'How use cases can be 100% adopted daily?',
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScalingAIFrameworkPage() {
  const [exporting, setExporting] = useState(false);

  async function handleExportPDF() {
    setExporting(true);
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || (jsPDFModule as any).jsPDF;
      await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 0;

      const NAVY: [number, number, number] = [0, 32, 95];
      const BLUE: [number, number, number] = [0, 51, 141];
      const PURPLE: [number, number, number] = [123, 47, 190];
      const LIGHT_BG: [number, number, number] = [252, 249, 248];
      const BORDER: [number, number, number] = [235, 231, 231];
      const TEXT_PRIMARY: [number, number, number] = [28, 27, 27];
      const TEXT_MUTED: [number, number, number] = [116, 118, 131];

      function addPageHeader() {
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, pageW, 12, 'F');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('KPMG AI Intelligence Hub', margin, 8);
        doc.setFont('helvetica', 'normal');
        doc.text('Scaling AI Implementation Framework', pageW - margin, 8, { align: 'right' });
        y = 20;
      }

      function checkPageBreak(needed: number) {
        if (y + needed > pageH - 18) {
          doc.addPage();
          addPageHeader();
        }
      }

      // Cover page
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageW, 55, 'F');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('KPMG', margin, 22);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 200, 240);
      doc.text('AI Intelligence Hub', margin, 30);
      doc.setFillColor(...PURPLE);
      doc.rect(0, 55, pageW, 3, 'F');
      doc.setFontSize(18);
      doc.setTextColor(...TEXT_PRIMARY);
      doc.setFont('helvetica', 'bold');
      doc.text('Scaling AI Implementation Framework', margin, 75);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_MUTED);
      doc.text('Strategic Framework for AI Adoption at Scale', margin, 85);
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(margin, 100, contentW, 30, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text('Generated:', margin + 6, 113);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), margin + 34, 113);
      doc.setFontSize(7);
      doc.setTextColor(...TEXT_MUTED);
      doc.setFont('helvetica', 'italic');
      doc.text('CONFIDENTIAL — For internal boardroom use only. Not for external distribution.', pageW / 2, pageH - 14, { align: 'center' });

      // Page 2: Focus Areas
      doc.addPage();
      addPageHeader();
      doc.setFillColor(...BLUE);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text('Focus Areas', margin + 7, y + 6.5);
      y += 16;

      const focusItems = [
        { label: 'Use Case', trend: 'up' },
        { label: 'Adoption', trend: 'up' },
        { label: 'Value', trend: 'up' },
        { label: 'Platform Cost', trend: 'down' },
      ];
      const boxW = (contentW - 9) / 4;
      focusItems.forEach((item, i) => {
        const bx = margin + i * (boxW + 3);
        doc.setFillColor(...LIGHT_BG);
        doc.roundedRect(bx, y, boxW, 20, 2, 2, 'F');
        doc.setFillColor(item.trend === 'up' ? 15 : 220, item.trend === 'up' ? 110 : 50, item.trend === 'up' ? 86 : 50);
        doc.rect(bx, y, boxW, 2.5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...NAVY);
        doc.text(item.label, bx + boxW / 2, y + 12, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...TEXT_MUTED);
        doc.text(item.trend === 'up' ? '▲ Increase' : '▼ Decrease', bx + boxW / 2, y + 17, { align: 'center' });
      });
      y += 28;

      // Action Groups
      checkPageBreak(20);
      doc.setFillColor(...BLUE);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text('Action Groups', margin + 7, y + 6.5);
      y += 14;

      const actionGroups = [
        { team: 'AI Function Core Team', items: ['Measure use case values', 'Use case portfolio'] },
        { team: 'AI Service Line Team', items: ['Implementation', 'Testing, Pilot, Apply, Scale'] },
        { team: 'Employees', items: ['Skill training', 'Quality feedback', 'Adoption rate'] },
      ];

      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Team', 'Actions']],
        body: actionGroups.map(g => [g.team, g.items.join('\n')]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 4, textColor: TEXT_PRIMARY, lineColor: BORDER, lineWidth: 0.2 },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_BG },
        columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: contentW - 60 } },
        didDrawPage: () => { addPageHeader(); },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 10;

      // Support Section
      checkPageBreak(30);
      doc.setFillColor(...BLUE);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text('Support Structure', margin + 7, y + 6.5);
      y += 14;

      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(margin, y, contentW, 28, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text('Firm Teams:', margin + 6, y + 9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text('AI Innovation, KDC, L&D, QRM, NITSO', margin + 30, y + 9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text('Tools:', margin + 6, y + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text('AI management template package, Functional AI Platform, Copilot, alQChat, Workbench', margin + 20, y + 18);
      y += 36;

      // Key Questions
      checkPageBreak(50);
      doc.setFillColor(...BLUE);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text('Key Questions', margin + 7, y + 6.5);
      y += 14;

      const questions = [
        'Who are best for "AI-enabled workflow" program?',
        'Your top 03 areas can free up human capacity?',
        'How to speed up AI use case enablement?',
        'How to avoid AI is just "optional"?',
        'How use cases can be 100% adopted daily?',
      ];
      questions.forEach((q, i) => {
        checkPageBreak(12);
        doc.setFillColor(235, 240, 255);
        doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...TEXT_PRIMARY);
        doc.text(`${i + 1}. ${q}`, margin + 5, y + 6.5);
        y += 13;
      });

      // Footer
      const totalPages = (doc.internal as any).getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(...TEXT_MUTED);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${p} of ${totalPages}  |  KPMG AI Intelligence Hub  |  Scaling AI Framework`, pageW / 2, pageH - 7, { align: 'center' });
      }

      doc.save(`KPMG_Scaling_AI_Framework_${Date.now()}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppLayout activeRoute="/scaling-ai-framework">
      <main id="main-content" aria-label="Scaling AI Implementation Framework">
        <div className="space-y-8 animate-fade-in">

          {/* ── Hero Header ──────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1
                className="font-display font-extrabold leading-tight"
                style={{ fontSize: '2rem', color: '#00205F', letterSpacing: '-0.01em' }}
              >
                Scaling AI Implementation Framework
              </h1>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: '13px', background: 'linear-gradient(135deg, #00205F 0%, #003380 100%)', boxShadow: '0 2px 8px rgba(0,32,95,0.25)' }}
              >
                <Download size={15} />
                {exporting ? 'Exporting…' : 'Export PDF'}
              </button>
            </div>
          </div>

          {/* ── Framework Table ───────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: '0px 1px 4px rgba(0,32,95,0.08), 0px 0px 0px 1px rgba(196,198,212,0.3)' }}
          >
            {/* Column Headers */}
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {/* FOCUS header */}
              <div
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                style={{ fontSize: '15px', background: '#7B2FBE', letterSpacing: '0.12em' }}
              >
                <Target size={16} className="opacity-80" />
                FOCUS
              </div>
              {/* ACTION header */}
              <div
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                style={{ fontSize: '15px', background: '#00897B', letterSpacing: '0.12em' }}
              >
                <Zap size={16} className="opacity-80" />
                ACTION
              </div>
              {/* SUPPORT header */}
              <div
                className="flex items-center justify-center gap-2 py-4 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                style={{ fontSize: '15px', background: '#1565C0', letterSpacing: '0.12em' }}
              >
                <Layers size={16} className="opacity-80" />
                SUPPORT
              </div>
            </div>

            {/* Column Bodies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 min-h-[340px]">

              {/* FOCUS body */}
              <div
                className="p-6 flex flex-col justify-center gap-5"
                style={{ background: '#FFFFFF', borderRight: '1px solid rgba(196,198,212,0.3)' }}
              >
                {FOCUS_ITEMS?.map((item) => (
                  <div key={item?.label} className="flex items-center gap-3">
                    {item?.trend === 'up' ? (
                      <ArrowUpRight size={28} style={{ color: '#00897B', flexShrink: 0 }} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={28} style={{ color: '#C0006A', flexShrink: 0 }} strokeWidth={2.5} />
                    )}
                    <span
                      className="font-display font-bold"
                      style={{ fontSize: '1.35rem', color: '#111827' }}
                    >
                      {item?.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACTION body */}
              <div
                className="p-6 flex flex-col gap-5"
                style={{ background: '#FFFFFF', borderRight: '1px solid rgba(196,198,212,0.3)' }}
              >
                {ACTION_GROUPS?.map((group) => (
                  <div key={group?.team}>
                    <p
                      className="font-body font-bold mb-2"
                      style={{ fontSize: '13px', color: '#111827' }}
                    >
                      {group?.team}
                    </p>
                    <ul className="space-y-1">
                      {group?.items?.map((item) => (
                        <li key={item} className="flex items-start gap-1.5">
                          <ArrowUpRight size={13} style={{ color: '#00897B', flexShrink: 0, marginTop: '2px' }} strokeWidth={2.5} />
                          <span className="font-body text-gray-600" style={{ fontSize: '12px' }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* SUPPORT + QUESTION stacked */}
              <div className="flex flex-col">
                {/* SUPPORT body */}
                <div
                  className="flex-1 p-6"
                  style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(196,198,212,0.3)' }}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="font-body font-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>
                        Firm Support Teams
                      </p>
                      <p className="font-body text-gray-600" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                        {SUPPORT_DATA?.firmTeams}
                      </p>
                    </div>
                    <div>
                      <p className="font-body font-bold mb-1" style={{ fontSize: '13px', color: '#111827' }}>
                        Tools
                      </p>
                      <p className="font-body text-gray-600" style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {SUPPORT_DATA?.tools}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QUESTION header */}
                <div
                  className="flex items-center justify-center gap-2 py-3 px-6 font-body font-extrabold text-white tracking-widest uppercase"
                  style={{ fontSize: '14px', background: '#C0006A', letterSpacing: '0.12em' }}
                >
                  <HelpCircle size={15} className="opacity-80" />
                  QUESTION
                </div>

                {/* QUESTION body */}
                <div
                  className="p-5"
                  style={{ background: '#FFFFFF' }}
                >
                  <ol className="space-y-2">
                    {QUESTIONS?.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="font-body font-bold flex-shrink-0"
                          style={{ fontSize: '12px', color: '#C0006A', minWidth: '22px' }}
                        >
                          Q{i + 1}
                        </span>
                        <span className="font-body font-semibold" style={{ fontSize: '12px', color: '#C0006A', lineHeight: '1.4' }}>
                          {q}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </AppLayout>
  );
}
