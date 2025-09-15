import { Container, Typography, Grid, Paper } from '@mui/material';
import { Nav } from '@/components/Nav';
import { db } from '@/db/client';
import { prelevements } from '@/db/schema';

export const dynamic = 'force-dynamic';

async function getData() {
  const rows = await db.select().from(prelevements).limit(100);
  const totals = { created:0, submitted:0, paid:0, failed:0, cancelled:0 } as Record<string, number>;
  rows.forEach(r => { totals[r.statut] = (totals[r.statut]||0)+1; });
  return { rows, totals };
}

export default async function PaymentsPage() {
  const { rows, totals } = await getData();
  return (
    <>
      <Nav />
      <Container sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Paiements</Typography>
        <Grid container spacing={2}>
          {Object.entries(totals).map(([k,v]) => (
            <Grid key={k} item xs={12} md={2}>
              <Paper sx={{ p:2 }}>
                <Typography variant="h6">
                  {k === 'created' && 'Créés'}
                  {k === 'submitted' && 'Soumis'}
                  {k === 'paid' && 'Payés'}
                  {k === 'failed' && 'Échoués'}
                  {k === 'cancelled' && 'Annulés'}
                </Typography>
                <Typography>{v}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Paper sx={{ p:2, mt:2 }}>
          <Typography variant="h6">Derniers événements</Typography>
          <pre style={{ overflow:'auto' }}>
            {JSON.stringify(rows.slice(0,20), null, 2)}
          </pre>
        </Paper>
      </Container>
    </>
  );
}
