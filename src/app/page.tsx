"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Stack,
  Box,
  Button,
} from "@mui/material";
import { Nav } from "@/components/Nav";
import Image from "next/image";

type DashboardData = {
  clients: number;
  contrats: number;
  factures: number;
  prestataires: number;
  collaborateurs: number;
  activites: string[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      setIsAuth(res.ok);
    } catch {
      setIsAuth(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard");
      const json = await r.json();
      setData(json);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuth) load();
  }, [isAuth]);

  return (
    <>
      {/* ✅ La Nav est toujours visible */}
      <Nav />

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>

        {/* Cas 1 : pas connecté */}
        {isAuth === false && (
          <Stack alignItems="center" spacing={4} sx={{ py: 4 }}>
            <Typography variant="h6">
              Vous devez vous connecter pour accéder aux données.
            </Typography>
            <Button variant="contained" href="/login">
              Aller à la page de connexion
            </Button>

            <Image
              src="/assets/cc-draft-logo.jpg"
              alt="Logo"
              width={350}
              height={350}
              style={{ borderRadius: 4 }}
            />
          </Stack>
        )}

        {/* Cas 2 : en cours de vérification */}
        {isAuth === null && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
        )}

        {/* Cas 3 : connecté → afficher données */}
        {isAuth && !loading && (
          <>
            <Grid container spacing={2}>
              {/* Clients */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Clients</Typography>
                  <Typography>Total : {data?.clients}</Typography>
                </Paper>
              </Grid>

              {/* Contrats */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Contrats</Typography>
                  <Typography>Actifs : {data?.contrats}</Typography>
                </Paper>
              </Grid>
              
              {/* Factures */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Factures</Typography>
                  <Typography>Payées : {data?.factures}</Typography>
                </Paper>
              </Grid>


              {/* Prestataires */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Prestataires</Typography>
                  <Typography>Total : {data?.prestataires}</Typography>
                </Paper>
              </Grid>

              {/* Collaborateurs */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Collaborateurs</Typography>
                  <Typography>Total : {data?.collaborateurs}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Dernières activités */}
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6">Dernières activités</Typography>
              <ul>
                {data?.activites.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </Paper>
          </>
        )}

        {/* Loader si connecté mais data en cours */}
        {isAuth && loading && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
        )}
      </Container>
    </>
  );
}
