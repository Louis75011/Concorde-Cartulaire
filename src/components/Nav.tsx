'use client';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export function Nav() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Cartulaire</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={Link} href="/">Tableau de bord</Button>
          <Button color="inherit" component={Link} href="/clients">Clients</Button>
          <Button color="inherit" component={Link} href="/contrats">Contrats</Button>
          <Button color="inherit" component={Link} href="/factures">Factures</Button>
          <Button color="inherit" component={Link} href="/prestataires">Prestataires</Button>
          <Button color="inherit" component={Link} href="/collaborateurs">Collaborateurs</Button>
          <Button color="inherit" component={Link} href="/paiements">Paiements</Button>
          <Button color="inherit" component={Link} href="/signatures">Signatures</Button>
          <Button color="inherit" component={Link} href="/settings">Paramètres</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
