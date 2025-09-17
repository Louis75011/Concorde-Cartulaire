// ⚠️ Utiliser la build standalone pour éviter la lecture de Helvetica.afm
// @ts-ignore - pas de types pour la build standalone
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

export type InvoiceData = {
  id: number;
  clientNom: string;
  clientEmail: string;
  dateEmission?: Date | null;
  montantTTC: number; // en euros
};

export async function renderInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const chunks: Buffer[] = [];
    doc.on("data", (c: any) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text(`Facture #${data.id}`, { align: "left" });
    doc.moveDown();
    doc.fontSize(12).text(`Client : ${data.clientNom}`);
    doc.text(`Email  : ${data.clientEmail}`);
    doc.text(
      `Émise le : ${
        data.dateEmission
          ? new Date(data.dateEmission).toLocaleDateString("fr-FR")
          : "—"
      }`
    );
    doc.moveDown();

    doc.fontSize(14).text(`Montant TTC : ${data.montantTTC.toFixed(2)} €`);
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#666").text("Merci pour votre règlement.");
    doc.end();
  });
}
