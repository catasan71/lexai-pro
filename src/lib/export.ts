/**
 * Utilitare export documente — Word (.docx) și PDF.
 * Ambele librării sunt lazy-loaded (dynamic import) ca să nu crească bundle-ul principal.
 */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_. ăîâșțĂÎÂȘȚ]/g, "_").slice(0, 80);
}

// ---------------------------------------------------------------------------
// WORD (.docx)
// ---------------------------------------------------------------------------

export async function exportDocx(title: string, text: string): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } =
    await import("docx");

  const lines = text.split("\n");
  const children = lines.map((line) => {
    const trimmed = line.trim();

    // Detectăm titluri (linii scurte cu majuscule sau ce încep cu "Art." / numerotate)
    const isHeading =
      /^(ART\.|ARTICOL|CAPITOLUL|SECȚIUNEA|ANEXA|ANEXĂ)/i.test(trimmed) ||
      (/^[A-ZĂÎÂȘȚ\s]{6,}$/.test(trimmed) && trimmed.length < 60);

    const isSubheading =
      /^\d+\.\s/.test(trimmed) && trimmed.length < 80;

    if (!trimmed) {
      return new Paragraph({ text: "" });
    }
    if (isHeading) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: trimmed, bold: true, color: "1E3A5F" })],
        spacing: { before: 240, after: 120 },
      });
    }
    if (isSubheading) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: trimmed, bold: true })],
        spacing: { before: 120, after: 60 },
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: line, size: 24, font: "Arial" })],
      spacing: { after: 60 },
    });
  });

  const doc = new Document({
    creator: "LexAI Pro",
    title,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1134, bottom: 1440, left: 1134 }, // 2.54cm / 2cm
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: title, bold: true, size: 32, color: "1E3A5F", font: "Arial" })],
            spacing: { after: 480 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "818CF8" } },
          }),
          ...children,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Generat cu LexAI Pro — lexai.pro", size: 16, color: "94A3B8", italics: true })],
            spacing: { before: 720 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, sanitizeFilename(title) + ".docx");
}

// ---------------------------------------------------------------------------
// PDF (jsPDF)
// ---------------------------------------------------------------------------

export async function exportPdf(title: string, text: string): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 20;
  const marginR = 20;
  const marginT = 25;
  const marginB = 20;
  const textW = pageW - marginL - marginR;
  let y = marginT;

  function checkPage(needed = 6) {
    if (y + needed > pageH - marginB) {
      doc.addPage();
      y = marginT;
      addPageFooter();
    }
  }

  function addPageFooter() {
    const pg = (doc.internal as unknown as { getCurrentPageInfo: () => { pageNumber: number } }).getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`LexAI Pro — lexai.pro   |   Pagina ${pg}`, pageW / 2, pageH - 8, { align: "center" });
    doc.setTextColor(30, 58, 95);
  }

  // Titlu
  doc.setFillColor(7, 13, 26);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setFontSize(14);
  doc.setTextColor(129, 140, 248);
  doc.setFont("helvetica", "bold");
  doc.text("LexAI Pro", marginL, 12);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.text("Asistență juridică AI", marginL + 32, 12);
  y = 26;

  doc.setFontSize(13);
  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(title, textW) as string[];
  doc.text(titleLines, pageW / 2, y, { align: "center" });
  y += titleLines.length * 7 + 6;

  doc.setDrawColor(129, 140, 248);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, pageW - marginR, y);
  y += 6;

  addPageFooter();

  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      y += 3;
      continue;
    }

    const isHeading =
      /^(ART\.|ARTICOL|CAPITOLUL|SECȚIUNEA|ANEXA|ANEXĂ)/i.test(trimmed) ||
      (/^[A-ZĂÎÂȘȚ\s]{6,}$/.test(trimmed) && trimmed.length < 60);

    if (isHeading) {
      checkPage(12);
      y += 4;
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 95);
      doc.setFont("helvetica", "bold");
      doc.text(trimmed, marginL, y);
      y += 6;
      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.2);
      doc.line(marginL, y, pageW - marginR, y);
      y += 3;
    } else {
      checkPage(5);
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(line, textW) as string[];
      for (const wl of wrapped) {
        checkPage(5);
        doc.text(wl, marginL, y);
        y += 4.5;
      }
    }
  }

  doc.save(sanitizeFilename(title) + ".pdf");
}

// ---------------------------------------------------------------------------
// PDF Analiză (structurată)
// ---------------------------------------------------------------------------

interface AnalysisResult {
  rezumat?: { tip?: string; parti?: string; valoare?: string; durata?: string; scor?: string };
  riscuri?: Array<{ titlu?: string; severitate?: string; categorie?: string; descriere?: string; remediere?: string }>;
  clauze_lipsa?: Array<{ titlu?: string; importanta?: string }>;
  recomandari?: string[];
  avocat?: { necesar?: boolean; motiv?: string };
}

export async function exportAnalysisPdf(title: string, result: AnalysisResult): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mL = 18, mR = 18, mT = 22, mB = 18;
  const tw = pageW - mL - mR;
  let y = mT;

  function checkPage(n = 6) {
    if (y + n > pageH - mB) { doc.addPage(); y = mT; }
  }

  function section(label: string, color: [number, number, number]) {
    checkPage(12);
    y += 4;
    doc.setFillColor(...color);
    doc.roundedRect(mL, y - 4, tw, 8, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(label, mL + 4, y + 1);
    y += 9;
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
  }

  // Header
  doc.setFillColor(7, 13, 26);
  doc.rect(0, 0, pageW, 16, "F");
  doc.setFontSize(12); doc.setTextColor(129, 140, 248); doc.setFont("helvetica", "bold");
  doc.text("LexAI Pro — Raport Analiză Contract", mL, 11);
  y = 24;

  doc.setFontSize(11); doc.setTextColor(30, 58, 95); doc.setFont("helvetica", "bold");
  const tl = doc.splitTextToSize(title, tw) as string[];
  doc.text(tl, pageW / 2, y, { align: "center" });
  y += tl.length * 6 + 4;

  doc.setFontSize(8); doc.setTextColor(148, 163, 184); doc.setFont("helvetica", "normal");
  doc.text(`Generat: ${new Date().toLocaleDateString("ro-RO")} — lexai.pro`, pageW / 2, y, { align: "center" });
  y += 8;

  // Rezumat
  if (result.rezumat) {
    const r = result.rezumat;
    const scorColor: Record<string, [number, number, number]> = {
      Scazut: [16, 185, 129], Scăzut: [16, 185, 129],
      Mediu: [251, 191, 36], Ridicat: [249, 115, 22], Critic: [239, 68, 68],
    };
    const sc = scorColor[r.scor ?? ""] ?? [129, 140, 248];
    section("📋 Rezumat Contract", [30, 58, 95]);
    const rows = [["Tip contract", r.tip], ["Părți", r.parti], ["Valoare", r.valoare], ["Durată", r.durata]];
    for (const [k, v] of rows) {
      if (!v) continue;
      checkPage(7);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
      doc.text(k + ":", mL, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(51, 65, 85);
      const vl = doc.splitTextToSize(String(v), tw - 30) as string[];
      doc.text(vl, mL + 30, y);
      y += vl.length * 4.5 + 1;
    }
    checkPage(10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); doc.text("Scor risc:", mL, y);
    doc.setTextColor(...sc); doc.text(r.scor ?? "N/A", mL + 22, y);
    y += 7;
  }

  // Riscuri
  if (result.riscuri?.length) {
    section(`⚠️ Riscuri identificate (${result.riscuri.length})`, [185, 28, 28]);
    for (const r of result.riscuri) {
      checkPage(16);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 58, 95);
      doc.text(`${r.titlu ?? ""} [${r.severitate ?? ""}]`, mL + 2, y);
      y += 4.5;
      if (r.descriere) {
        doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
        const dl = doc.splitTextToSize(r.descriere, tw - 4) as string[];
        for (const l of dl) { checkPage(5); doc.text(l, mL + 2, y); y += 4; }
      }
      if (r.remediere) {
        checkPage(6);
        doc.setTextColor(16, 185, 129); doc.setFont("helvetica", "italic");
        const rl = doc.splitTextToSize("💡 " + r.remediere, tw - 4) as string[];
        for (const l of rl) { checkPage(5); doc.text(l, mL + 2, y); y += 4; }
      }
      y += 3;
    }
  }

  // Clauze lipsă
  if (result.clauze_lipsa?.length) {
    section(`📋 Clauze lipsă (${result.clauze_lipsa.length})`, [146, 64, 14]);
    for (const c of result.clauze_lipsa) {
      checkPage(10);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 58, 95);
      doc.text(c.titlu ?? "", mL + 2, y); y += 4.5;
      if (c.importanta) {
        doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
        const il = doc.splitTextToSize(c.importanta, tw - 4) as string[];
        for (const l of il) { checkPage(5); doc.text(l, mL + 2, y); y += 4; }
      }
      y += 2;
    }
  }

  // Recomandări
  if (result.recomandari?.length) {
    section("🎯 Recomandări", [67, 56, 202]);
    for (let i = 0; i < result.recomandari.length; i++) {
      checkPage(8);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
      const rl = doc.splitTextToSize(`${i + 1}. ${result.recomandari[i]}`, tw - 4) as string[];
      for (const l of rl) { checkPage(5); doc.text(l, mL + 2, y); y += 4; }
      y += 1;
    }
  }

  // Avocat
  if (result.avocat) {
    checkPage(16);
    y += 4;
    const avColor: [number, number, number] = result.avocat.necesar ? [185, 28, 28] : [16, 185, 129];
    doc.setFillColor(...avColor);
    doc.roundedRect(mL, y - 4, tw, result.avocat.motiv ? 18 : 10, 3, 3, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text(`⚖️ Avocat necesar: ${result.avocat.necesar ? "DA" : "NU"}`, mL + 4, y + 1);
    if (result.avocat.motiv) {
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
      const ml = doc.splitTextToSize(result.avocat.motiv, tw - 8) as string[];
      doc.text(ml, mL + 4, y + 7);
      y += ml.length * 4 + 14;
    } else { y += 12; }
  }

  doc.save(sanitizeFilename(title) + "_analiza.pdf");
}
