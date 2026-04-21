/**
 * Scaling AI Framework — Page driver.
 * Handles PDF export via jsPDF + autoTable; theme and shell init.
 */

(function () {
  'use strict';

  function handleExportPDF() {
    var btn = document.getElementById('btn-export-pdf');
    var label = document.getElementById('btn-export-label');
    if (btn) btn.disabled = true;
    if (label) label.textContent = 'Exporting…';

    try {
      var jsPDF = window.jspdf.jsPDF;
      var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      var pageW = doc.internal.pageSize.getWidth();
      var pageH = doc.internal.pageSize.getHeight();
      var margin = 18;
      var contentW = pageW - margin * 2;
      var y = 0;

      var NAVY = [0, 32, 95];
      var BLUE = [0, 51, 141];
      var PURPLE = [123, 47, 190];
      var LIGHT_BG = [252, 249, 248];
      var BORDER = [235, 231, 231];
      var TEXT_PRIMARY = [28, 27, 27];
      var TEXT_MUTED = [116, 118, 131];

      function addPageHeader() {
        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.rect(0, 0, pageW, 12, 'F');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('KPMG AI Intelligence Hub', margin, 8);
        doc.setFont('helvetica', 'normal');
        doc.text('Scale Model — Management Blueprint', pageW - margin, 8, { align: 'right' });
        y = 20;
      }

      function checkPageBreak(needed) {
        if (y + needed > pageH - 18) {
          doc.addPage();
          addPageHeader();
        }
      }

      // Cover page
      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.rect(0, 0, pageW, 55, 'F');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('KPMG', margin, 22);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 200, 240);
      doc.text('AI Intelligence Hub', margin, 30);
      doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.rect(0, 55, pageW, 3, 'F');
      doc.setFontSize(18);
      doc.setTextColor(TEXT_PRIMARY[0], TEXT_PRIMARY[1], TEXT_PRIMARY[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('How KPMG scales AI from isolated pilots to embedded ways of working', margin, 75);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text('Management blueprint for scaled AI adoption and realised value', margin, 85);
      doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
      doc.roundedRect(margin, 100, contentW, 30, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Generated:', margin + 6, 113);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT_PRIMARY[0], TEXT_PRIMARY[1], TEXT_PRIMARY[2]);
      doc.text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), margin + 34, 113);
      doc.setFontSize(7);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.setFont('helvetica', 'italic');
      doc.text('Illustrative management view — intended for leadership discussion and operating alignment.', pageW / 2, pageH - 14, { align: 'center' });

      // Page 2: Outcomes to move
      doc.addPage();
      addPageHeader();
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Outcomes to move', margin + 7, y + 6.5);
      y += 16;

      var focusItems   = FrameworkData.FOCUS_ITEMS;
      var actionGroups = FrameworkData.ACTION_GROUPS;

      var boxW = (contentW - 9) / 4;
      focusItems.forEach(function (item, i) {
        var bx = margin + i * (boxW + 3);
        doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
        doc.roundedRect(bx, y, boxW, 20, 2, 2, 'F');
        var c = item.trend === 'up' ? [15, 110, 86] : [220, 50, 50];
        doc.setFillColor(c[0], c[1], c[2]);
        doc.rect(bx, y, boxW, 2.5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(item.label, bx + boxW / 2, y + 12, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.text(item.trend === 'up' ? '\u25b2 Increase' : '\u25bc Control', bx + boxW / 2, y + 17, { align: 'center' });
      });
      y += 28;

      // Owners and actions
      checkPageBreak(20);
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Owners and actions', margin + 7, y + 6.5);
      y += 14;

      doc.autoTable({
        startY: y,
        head: [['Team', 'Actions']],
        body: actionGroups.map(function (g) { return [g.team, g.items.join('\n')]; }),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 4, textColor: TEXT_PRIMARY, lineColor: BORDER, lineWidth: 0.2 },
        headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_BG },
        columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: contentW - 60 } },
        didDrawPage: function () { addPageHeader(); },
      });
      y = doc.lastAutoTable.finalY + 10;

      // Enablers and governance
      checkPageBreak(30);
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Enablers and governance', margin + 7, y + 6.5);
      y += 14;

      var support = FrameworkData.SUPPORT;
      doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
      doc.roundedRect(margin, y, contentW, 28, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Firm Teams:', margin + 6, y + 9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT_PRIMARY[0], TEXT_PRIMARY[1], TEXT_PRIMARY[2]);
      doc.text(support.teams, margin + 30, y + 9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Tools:', margin + 6, y + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT_PRIMARY[0], TEXT_PRIMARY[1], TEXT_PRIMARY[2]);
      doc.text(support.tools, margin + 20, y + 18);
      y += 36;

      // Board questions
      checkPageBreak(50);
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('Board questions', margin + 7, y + 6.5);
      y += 14;

      var questions = FrameworkData.QUESTIONS;
      questions.forEach(function (q, i) {
        checkPageBreak(12);
        doc.setFillColor(235, 240, 255);
        doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(TEXT_PRIMARY[0], TEXT_PRIMARY[1], TEXT_PRIMARY[2]);
        doc.text((i + 1) + '. ' + q, margin + 5, y + 6.5);
        y += 13;
      });

      // Footer
      var totalPages = doc.internal.getNumberOfPages();
      for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.setFont('helvetica', 'normal');
        doc.text('Page ' + p + ' of ' + totalPages + '  |  KPMG AI Intelligence Hub  |  Scale Model', pageW / 2, pageH - 7, { align: 'center' });
      }

      doc.save('KPMG_Scale_Model_' + Date.now() + '.pdf');
      Toast.showToast('success', 'Briefing PDF downloaded');
    } catch (err) {
      console.error('PDF export error:', err);
      Toast.showToast('error', 'PDF export failed', { description: err.message });
    } finally {
      if (btn) btn.disabled = false;
      if (label) label.textContent = 'Export briefing PDF';
    }
  }

  function init() {
    ThemeManager.initTheme();
    AppShell.init();
    document.getElementById('btn-export-pdf').addEventListener('click', handleExportPDF);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
