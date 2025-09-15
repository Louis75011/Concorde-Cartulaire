"use client";
import { useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarExport,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { Nav } from "@/components/Nav";

type ContratRow = {
  id: number;
  client: string;
  titre: string;
  cree_le: string;
  client_id: number;
};
type ClientOpt = { id: number; nom: string };

export default function ContratsPage() {
  const [rows, setRows] = useState<ContratRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [form, setForm] = useState<{ client_id: number | ""; titre: string }>({
    client_id: "",
    titre: "",
  });

  // --- Chargement principal ---
  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/contrats?q=" + encodeURIComponent(q));
    const data = await r.json();
    setRows(data);
    setLoading(false);
  };

  const loadOpts = async () => {
    const r = await fetch("/api/contrats/options");
    setClients(await r.json());
  };

  useEffect(() => {
    load();
    loadOpts();
  }, []);

  // --- Colonnes du tableau ---
  const cols = useMemo(
    () => [
      { field: "id", headerName: "#", width: 80 },
      { field: "client", headerName: "Client", flex: 1 },
      { field: "titre", headerName: "Titre", flex: 1.2 },
      {
        field: "cree_le",
        headerName: "Créé le",
        width: 150,
        valueFormatter: (params: any) =>
          params.value
            ? new Date(params.value).toLocaleDateString("fr-FR")
            : "",
      },
    ],
    []
  );

  // --- Création ---
  const onCreate = async () => {
    await fetch("/api/contrats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm({ client_id: "", titre: "" });
    await load();
  };

  // --- Toolbar personnalisée ---
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
          Contrats
        </Typography>

        {/* Filtres + boutons */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              label="Recherche (client/titre)"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button variant="outlined" onClick={load}>
              Filtrer
            </Button>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Nouveau contrat
            </Button>
          </Stack>
        </Paper>

        {/* Loader ou DataGrid */}
        {loading ? (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography>Chargement...</Typography>
          </Stack>
        ) : (
          <div style={{ height: 540, width: "100%" }}>
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
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Nouveau contrat</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="clbl">Client</InputLabel>
                <Select
                  labelId="clbl"
                  label="Client"
                  value={form.client_id === "" ? "" : String(form.client_id)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      client_id: Number(e.target.value),
                    }))
                  }
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Titre"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={form.titre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titre: e.target.value }))
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={onCreate}
              disabled={form.client_id === "" || !form.titre.trim()}
            >
              Créer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
