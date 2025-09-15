import { Container, Typography, Grid, Paper } from '@mui/material';
import { Nav } from '../components/Nav';

export default function Page() {
  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Tableau de bord</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Statuts contrats</Typography>
              <Typography variant="body2">Brouillon/Actifs/Suspendus/Clos</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Paiements</Typography>
              <Typography variant="body2">Mandats, prélèvements, webhooks</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
