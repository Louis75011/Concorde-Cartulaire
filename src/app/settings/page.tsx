'use client';
import { Container, Typography, Grid, Paper, Button, TextField, Stack } from '@mui/material';
import { Nav } from '../../components/Nav';
import { useState } from 'react';

export default function SettingsPage() {
  const [gocardlessKey, setGC] = useState('');
  const [docusealKey, setDS] = useState('');

  const testGC = async () => {
    const r = await fetch('/api/payments/gocardless/ping', { method: 'POST' });
    alert(await r.text());
  };
  const testDS = async () => {
    const r = await fetch('/api/signature/docuseal/ping', { method: 'POST' });
    alert(await r.text());
  };
  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Paramètres & Intégrations</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">GoCardless (sandbox)</Typography>
              <Stack spacing={2}>
                <TextField label="Access Token (.env)" variant="outlined" value={gocardlessKey} onChange={e=>setGC(e.target.value)} placeholder="via .env - lecture non incluse ici" />
                <Button variant="contained" onClick={testGC}>Tester connexion</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">DocuSeal</Typography>
              <Stack spacing={2}>
                <TextField label="API Key (.env)" variant="outlined" value={docusealKey} onChange={e=>setDS(e.target.value)} placeholder="via .env - lecture non incluse ici" />
                <Button variant="contained" onClick={testDS}>Tester connexion</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
