"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Nav } from "@/components/Nav";

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
    load();
  }, []);

  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>

        <Grid container spacing={2}>
          {/* Contrats */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Contrats</Typography>
              {loading ? (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <>
                  <Typography>
                    Brouillons : — {/* à détailler plus tard */}
                  </Typography>
                  <Typography>Actifs : {data?.contrats}</Typography>
                  <Typography>Susp. : —</Typography>
                  <Typography>Clos : —</Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Factures */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Factures</Typography>
              {loading ? (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <>
                  <Typography>En attente : —</Typography>
                  <Typography>Payées : {data?.factures}</Typography>
                  <Typography>En retard : —</Typography>
                  <Typography>Annulées : —</Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Payments */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Payments</Typography>
              {loading ? (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <>
                  <Typography>Mandats : —</Typography>
                  <Typography>Prélèvements : —</Typography>
                  <Typography>Échecs : —</Typography>
                  <Typography>Webhooks actifs : —</Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Clients */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Clients</Typography>
              {loading ? (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <>
                  <Typography>Total : {data?.clients}</Typography>
                  <Typography>Nouveaux ce mois : —</Typography>
                  <Typography>Secteur BTP : —</Typography>
                  <Typography>Secteur Santé : —</Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Collaborateurs */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Collaborateurs</Typography>
              {loading ? (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <>
                  <Typography>Actifs : {data?.collaborateurs}</Typography>
                  <Typography>
                    Rôles : chef de projet, support, commercial
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* Prestataires */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Prestataires</Typography>
              {loading ? (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <>
                  <Typography>Actifs : {data?.prestataires}</Typography>
                  <Typography>Types : dev front, dev back, sécurité</Typography>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Dernières activités */}
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6">Dernières activités</Typography>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : (
            <ul>
              {data?.activites.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </Paper>
      </Container>
    </>
  );
}
