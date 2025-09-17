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
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [platformOK, setPlatformOK] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onCreatePasskey() {
    if (!email) return alert("Indiquez un email.");

    try {
      // 1) Demander les options
      const r = await fetch("/api/webauthn/registration/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, displayName }),
      });

      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        console.error("registration/start error:", msg);
        return alert(`/registration/start: ${msg || r.statusText}`);
      }

      // 2) Lancer la création dans le navigateur
      const opts = await r.json();
      const creationOpts =
        // au cas où le backend renverrait {options: ...}
        (opts && (opts.options ?? opts)) || opts;

      let attResp;
      try {
        attResp = await startRegistration(creationOpts);
      } catch (err: any) {
        // Erreur typique si l’utilisateur annule / pas de clé dispo
        if (err?.name === "NotAllowedError") {
          return alert("Opération annulée (NotAllowedError).");
        }
        console.error("startRegistration failed:", err);
        return alert(`WebAuthn create() a échoué: ${err?.message || err}`);
      }

      // 3) Vérifier côté serveur
      const r2 = await fetch("/api/webauthn/registration/finish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(attResp),
      });

      if (!r2.ok) {
        const msg = await r2.text().catch(() => "");
        console.error("registration/finish error:", msg);
        return alert(`/registration/finish: ${msg || r2.statusText}`);
      }

      window.location.href = "/";
    } catch (err: any) {
      console.error("onCreatePasskey fatal:", err);
      alert(`Erreur inattendue: ${err?.message || err}`);
    }
  }

  async function onLogin() {
    if (!email) return alert("Indiquez un email.");

    try {
      // 1) Demander les options
      const r = await fetch("/api/webauthn/authentication/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        console.error("authentication/start error:", msg);
        return alert(`/authentication/start: ${msg || r.statusText}`);
      }

      const opts = await r.json();
      const requestOpts = (opts && (opts.options ?? opts)) || opts;

      // 2) Lancer l’auth navigateur
      let assertion;
      try {
        // petit bonus: hints pour pousser l’usage mobile/caBLE si supportés
        (requestOpts as any).hints = ["client-device", "hybrid"];
        assertion = await startAuthentication(requestOpts);
      } catch (err: any) {
        if (err?.name === "NotAllowedError") {
          return alert("Opération annulée (NotAllowedError).");
        }
        console.error("startAuthentication failed:", err);
        return alert(`WebAuthn get() a échoué: ${err?.message || err}`);
      }

      // 3) Vérifier côté serveur
      const r2 = await fetch("/api/webauthn/authentication/finish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(assertion),
      });

      if (!r2.ok) {
        const msg = await r2.text().catch(() => "");
        console.error("authentication/finish error:", msg);
        return alert(`/authentication/finish: ${msg || r2.statusText}`);
      }

      window.location.href = "/";
    } catch (err: any) {
      console.error("onLogin fatal:", err);
      alert(`Erreur inattendue: ${err?.message || err}`);
    }
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
          <Button variant="contained" onClick={onLogin}>
            Se connecter par Passkey
          </Button>
        </Stack>

        {msg && <Typography sx={{ mt: 2 }}>{msg}</Typography>}
      </Container>
    </>
  );
}
