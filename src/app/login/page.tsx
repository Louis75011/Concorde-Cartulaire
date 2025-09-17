// src\app\login\page.tsx
"use client";
import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Stack,
  TextField,
  Alert,
} from "@mui/material";
import * as SimpleWebAuthnBrowser from "@simplewebauthn/browser";
import { Nav } from "@/components/Nav";
import { startRegistration } from "@simplewebauthn/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [platformOK, setPlatformOK] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onCreatePasskey() {
    if (!email) {
      alert("Indiquez un email.");
      return;
    }

    // 1) start → reçoit les options + pose le cookie uid
    const r = await fetch("/api/webauthn/registration/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, displayName }),
    });
    if (!r.ok) {
      alert("Erreur serveur /start");
      return;
    }
    const opts = await r.json();

    // 2) création côté navigateur
    const attResp = await startRegistration(opts);

    // 3) finish → vérifie et enregistre la passkey
    const r2 = await fetch("/api/webauthn/registration/finish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(attResp),
    });
    if (!r2.ok) {
      alert("Échec /finish");
      return;
    }

    // Succès
    window.location.href = "/";
  }

  async function startLogin() {
    setMsg(null);

    // 1) Demander les options d’authentification
    const r1 = await fetch("/api/auth/webauthn/options", { method: "POST" });
    if (!r1.ok) {
      const text = await r1.text();
      console.error("auth/options failed:", text);
      alert("Erreur serveur à la connexion (voir console)");
      return;
    }

    // 2) Hints pour pousser le téléphone
    const { options: authOpts } = await r1.json();
    (authOpts as any).hints = ["client-device", "hybrid"]; // ignoré par Firefox, utile sur Chrome/Edge

    // 3) Lancer l’auth dans le navigateur
    const assertion = await SimpleWebAuthnBrowser.startAuthentication(authOpts);

    // 4) Vérification côté serveur
    const r2 = await fetch("/api/auth/webauthn/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assertion),
    });

    if (!r2.ok) {
      const text = await r2.text();
      console.error("auth/verify failed:", text);
      alert("Échec de la connexion Passkey");
      return;
    }

    window.location.href = "/";
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok =
          "PublicKeyCredential" in window &&
          // @ts-ignore (API non typée dans TS lib.dom parfois)
          (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.());
        if (mounted) setPlatformOK(!!ok);
      } catch {
        if (mounted) setPlatformOK(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Nav />
      <Container sx={{ py: 4, maxWidth: 720 }}>
        <Typography variant="h4" gutterBottom>
          Connexion
        </Typography>

        {platformOK === false && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Windows Hello n’est pas disponible sur cet appareil. Vous pouvez
            utiliser votre <strong>iPhone</strong> (ou Android) via “utiliser un
            téléphone” lors de la création/connexion de la Passkey.
          </Alert>
        )}

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
          <Button variant="outlined" onClick={onCreatePasskey}>
            Créer une Passkey
          </Button>
        </Stack>

        <Stack spacing={2}>
          <Button variant="contained" onClick={startLogin}>
            Se connecter par Passkey
          </Button>
        </Stack>

        {msg && <Typography sx={{ mt: 2 }}>{msg}</Typography>}
      </Container>
    </>
  );
}
