import Link from "next/link";
import { db } from "@/server/db/client";
import { factures, contrats, clients } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { Nav } from "@/components/Nav";
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
} from "@mui/material";

export const dynamic = "force-dynamic";

type Row = {
  id: number;
  date_emission: Date | null;
  montant_ttc: string;
  statut_paiement: string;
  client_nom: string | null;
  client_email: string | null;
};

async function getRows(): Promise<Row[]> {
  const rows = await db
    .select({
      id: factures.id,
      date_emission: factures.date_emission,
      montant_ttc: factures.montant_ttc,
      statut_paiement: factures.statut_paiement,
      client_nom: clients.nom,
      client_email: clients.email,
    })
    .from(factures)
    .leftJoin(contrats, eq(contrats.id, factures.contrat_id))
    .leftJoin(clients, eq(clients.id, contrats.client_id))
    .orderBy(desc(factures.id));

  return rows as Row[];
}

export default async function FacturesPage() {
  const facturesRows = await getRows();

  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Factures
        </Typography>

        {facturesRows.length === 0 && (
          <Typography>Aucune facture pour le moment.</Typography>
        )}

        <Stack spacing={2}>
          {facturesRows.map((f) => {
            const clientEmail = f.client_email ?? "demo@example.com";
            const clientNom = f.client_nom ?? "Client Démo";
            const pdfHref = `/api/factures/${f.id}/pdf`;
            const payHref =
              `/api/payments/gc/redirect/start` +
              `?invoice_id=${f.id}` +
              `&client_email=${encodeURIComponent(clientEmail)}` +
              `&client_nom=${encodeURIComponent(clientNom)}`;

            return (
              <Paper key={f.id} sx={{ p: 2 }}>
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item xs={12} md="auto">
                    <Typography variant="subtitle1" fontWeight={600}>
                      Facture #{f.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Émise le{" "}
                      {f.date_emission
                        ? new Date(f.date_emission).toLocaleDateString("fr-FR")
                        : "—"}
                    </Typography>
                    <Typography variant="body2">
                      Client : {f.client_nom ?? "—"}
                    </Typography>
                    <Typography variant="body2">
                      Montant TTC : {Number(f.montant_ttc).toFixed(2)} €
                    </Typography>
                    <Typography variant="body2">
                      Statut paiement : {f.statut_paiement}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md="auto">
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        color="primary"
                        component={Link}
                        href={pdfHref}
                        target="_blank"
                      >
                        Télécharger PDF
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        href={payHref}
                      >
                        Payer par SEPA
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Stack>
      </Container>
    </>
  );
}
