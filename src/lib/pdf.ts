/**
 * Extragere text din PDF — 100% client-side cu pdf.js.
 *
 * Înlocuiește vechea metodă care trimitea PDF-ul la Claude doar pentru a-i
 * extrage textul (un apel scump, inutil). Acum extragerea e gratuită, iar
 * Claude e folosit DOAR pentru analiza propriu-zisă. Vezi ROADMAP Faza 1.
 *
 * pdf.js (~1.2 MB) e încărcat dinamic, doar la prima procesare de PDF, ca să
 * nu îngreuneze bundle-ul inițial.
 */

export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    out += line + "\n";
  }
  return out.trim();
}
