"use client";
import { useState } from "react";
import { Container, Typography, Button, Stack, TextField } from "@mui/material";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import { Nav } from "@/components/Nav";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  const registerPasskey = async () => {
    if (!email) return alert("Indiquez un email.");

    const resp = await fetch("/api/auth/webauthn/register/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("register/options failed:", text);
      alert("Erreur serveur à l’inscription (voir console)");
      return;
    }

    const { options } = await resp.json();
    const att = await SimpleWebAuthnBrowser.startRegistration(options);

    const verify = await fetch("/api/auth/webauthn/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(att),
    });

    if (verify.ok) window.location.href = "/";
    else alert("Échec de l’enregistrement");
  };

  const startLogin = async () => {
    const resp = await fetch("/api/auth/webauthn/options", { method: "POST" });
    const { options } = await resp.json();

    const assertion = await SimpleWebAuthnBrowser.startAuthentication(options);

    const verify = await fetch("/api/auth/webauthn/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assertion),
    });

    if (verify.ok) window.location.href = "/";
    else alert("Échec de la connexion Passkey");
  };

  return (
    <>
      <Nav />
      <Container sx={{ py: 4, maxWidth: 720 }}>
        <Typography variant="h4" gutterBottom>
          Connexion
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Email (pour créer votre Passkey)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Nom d’affichage (facultatif)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button variant="outlined" onClick={registerPasskey}>
            Créer une Passkey
          </Button>
        </Stack>

        <Stack spacing={2}>
          <Button variant="contained" onClick={startLogin}>
            Se connecter par Passkey
          </Button>
        </Stack>
      </Container>
    </>
  );
}
