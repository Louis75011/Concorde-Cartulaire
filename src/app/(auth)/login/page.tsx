'use client';
import { Container, Typography, Button, Stack } from '@mui/material';
import { Nav } from '../../../components/Nav';
import * as SimpleWebAuthnBrowser from '@simplewebauthn/browser';

export default function LoginPage() {
  const startLogin = async () => {
    const resp = await fetch('/api/auth/webauthn/options', { method: 'POST' });
    const { options } = await resp.json();
    const assertion = await SimpleWebAuthnBrowser.startAuthentication(options);
    const verify = await fetch('/api/auth/webauthn/verify', { method: 'POST', body: JSON.stringify(assertion) });
    alert(await verify.text());
  };

  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Connexion</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={startLogin}>Se connecter par Passkey</Button>
        </Stack>
      </Container>
    </>
  );
}
