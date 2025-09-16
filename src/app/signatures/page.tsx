import { Container, Typography, Grid, Paper } from '@mui/material';
import { Nav } from '@/components/Nav';
import { db } from "@/server/db/client";
import { sign_requests, documents } from '@/db/schema';

export const dynamic = 'force-dynamic';

async function getData() {
  const reqs = await db.select().from(sign_requests).limit(50);
  const docs = await db.select().from(documents).limit(50);
  return { reqs, docs };
}

export default async function SignaturesPage() {
  const { reqs, docs } = await getData();
  return (
    <>
      <Nav />
      <Container sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Signatures</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><Paper sx={{ p:2 }}><Typography variant="h6">Demandes</Typography><pre>{JSON.stringify(reqs, null, 2)}</pre></Paper></Grid>
          <Grid item xs={12} md={6}><Paper sx={{ p:2 }}><Typography variant="h6">Documents archivés</Typography><pre>{JSON.stringify(docs, null, 2)}</pre></Paper></Grid>
        </Grid>
      </Container>
    </>
  );
}
