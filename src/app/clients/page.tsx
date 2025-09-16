"use client";
import { useEffect, useState } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import { Nav } from "@/components/Nav";

interface Client {
  id: number;
  nom: string;
  email: string;
  tel?: string;
  entreprise?: string;
  secteur?: string;
  date_creation: string;
}

export default function ClientsPage() {
  const [rows, setRows] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({ nom: "", email: "" });

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/clients?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm({ nom: "", email: "" });
    load();
  };

  return (
    <>
      <Nav />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Clients
          </Typography>

          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <TextField
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un client"
              size="small"
            />
            <Button variant="contained" onClick={load}>
              Rechercher
            </Button>
            <Button variant="outlined" onClick={() => setOpen(true)}>
              Ajouter
            </Button>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 4,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Chargement des données...
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={[
                { field: "id", headerName: "ID", width: 70 },
                { field: "nom", headerName: "Nom", width: 150 },
                { field: "email", headerName: "Email", width: 200 },
                { field: "entreprise", headerName: "Entreprise", width: 150 },
                { field: "secteur", headerName: "Secteur", width: 150 },
              ]}
              autoHeight
              pageSizeOptions={[5, 10, 20]}
              slots={{
                toolbar: () => (
                  <GridToolbarContainer>
                    <GridToolbarQuickFilter />
                    <GridToolbarExport />
                  </GridToolbarContainer>
                ),
              }}
            />
          )}
        </Paper>

        {/* Dialog ajout client */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Ajouter un client</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Nom"
              fullWidth
              value={form.nom || ""}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Téléphone"
              fullWidth
              value={form.tel || ""}
              onChange={(e) => setForm({ ...form, tel: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Entreprise"
              fullWidth
              value={form.entreprise || ""}
              onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Secteur"
              fullWidth
              value={form.secteur || ""}
              onChange={(e) => setForm({ ...form, secteur: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleAdd} variant="contained">
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
