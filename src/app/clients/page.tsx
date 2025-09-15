"use client";
import { useEffect, useState, useMemo } from "react";
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
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
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
    const r = await fetch("/api/clients?q=" + encodeURIComponent(q));
    const data = await r.json();
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // useEffect(() => {
  //   console.log("Clients chargés :", rows);
  // }, [rows]);

  const cols = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      { field: "nom", headerName: "Nom", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "tel", headerName: "Téléphone", width: 160 },
      { field: "entreprise", headerName: "Entreprise", flex: 1 },
      { field: "secteur", headerName: "Secteur", width: 160 },
    ],
    []
  );

  const onCreate = async () => {
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm({ nom: "", email: "" });
    await load();
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Clients
        </Typography>

        {/* Filtre + bouton création */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Nom"
              variant="outlined"
              InputLabelProps={{ shrink: true }} // ✅ évite bug d’affichage
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button variant="outlined" onClick={load}>
              Filtrer
            </Button>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Nouveau client
            </Button>
          </Stack>
        </Paper>

        {/* Loader ou tableau */}
        {loading ? (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography>Chargement...</Typography>
          </Stack>
        ) : (
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={cols}
              getRowId={(row) => row.id}
              slots={{ toolbar: CustomToolbar }}
              disableRowSelectionOnClick
            />
          </div>
        )}

        {/* Dialog création */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Nouveau client</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nom"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={form.nom || ""}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
              <TextField
                label="Email"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label="Téléphone"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={form.tel || ""}
                onChange={(e) => setForm({ ...form, tel: e.target.value })}
              />
              <TextField
                label="Entreprise"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={form.entreprise || ""}
                onChange={(e) =>
                  setForm({ ...form, entreprise: e.target.value })
                }
              />
              <TextField
                label="Secteur"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={form.secteur || ""}
                onChange={(e) => setForm({ ...form, secteur: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={onCreate} variant="contained">
              Créer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
