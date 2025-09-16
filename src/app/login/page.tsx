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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [platformOK, setPlatformOK] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  // const [password, setPassword] = useState("");
  // const [error, setError] = useState("");
  // const router = useRouter();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError("");
  //   try {
  //     const res = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });
  //     if (!res.ok) {
  //       const { error } = await res.json();
  //       setError(error || "Erreur de connexion");
  //       return;
  //     }
  //     router.push("/"); // redirige vers tableau de bord
  //   } catch (err) {
  //     setError("Erreur réseau");
  //   }
  // };

  async function registerPasskey() {
    setMsg(null);
    if (!email) {
      alert("Indiquez un email.");
      return;
    }

    // 1) Demander les options d’inscription au serveur
    const r1 = await fetch("/api/auth/webauthn/register/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName }),
    });

    if (!r1.ok) {
      const text = await r1.text();
      console.error("register/options failed:", text);
      alert("Erreur serveur à l’inscription (voir console)");
      return;
    }

    // 2) Ajouter des hints pour favoriser le téléphone (QR / caBLE)
    const { options: regOpts } = await r1.json();
    (regOpts as any).hints = ["client-device", "hybrid", "security-key"]; // ignoré par Firefox, utile sur Chrome/Edge

    // 3) Lancer l’enregistrement WebAuthn dans le navigateur
    const att = await SimpleWebAuthnBrowser.startRegistration(regOpts);

    // 4) Vérification côté serveur
    const r2 = await fetch("/api/auth/webauthn/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(att),
    });

    if (!r2.ok) {
      const text = await r2.text();
      console.error("register/verify failed:", text);
      alert("Échec de l’enregistrement");
      return;
    }

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
          <Button variant="outlined" onClick={registerPasskey}>
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

      {/* <div className="flex items-center justify-center min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white shadow-md rounded"
        >
          <h1 className="text-xl font-bold mb-4">Connexion</h1>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="border p-2 mb-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="border p-2 mb-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Se connecter
          </button>
        </form>
      </div> */}
    </>
  );
}
