import PDFDocument from "pdfkit";

export type InvoiceData = {
  id: number;
  client: { nom: string; email?: string; adresse?: string };
  date: Date;
  montant: number; // euros
  lignes?: { label: string; qty: number; price: number }[];
};

export async function renderInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => {
      const buf = Buffer.concat(chunks);
      resolve(new Uint8Array(buf)); // ✅ Uint8Array
    });

    doc.fontSize(18).text("FACTURE", { align: "right" }).moveDown();

    doc.fontSize(12).text(`Facture n° ${data.id}`);
    doc.text(`Date : ${data.date.toLocaleDateString("fr-FR")}`);
    doc.moveDown();

    doc.text(`Client : ${data.client.nom}`);
    if (data.client.email) doc.text(`Email : ${data.client.email}`);
    if (data.client.adresse) doc.text(data.client.adresse);
    doc.moveDown();

    if (data.lignes?.length) {
      doc.text("Détails :").moveDown(0.5);
      data.lignes.forEach((l) => {
        doc.text(`• ${l.label} — ${l.qty} x ${l.price.toFixed(2)} €`);
      });
      doc.moveDown();
    }

    doc.fontSize(14).text(`Total TTC : ${data.montant.toFixed(2)} €`, { align: "right" });

    doc.end();
  });
}
