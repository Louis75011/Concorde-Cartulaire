"use client";
import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
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

type FactureRow = {
  id: number;
  client: string;
  contrat: string;
  emission: string | null;
  echeance: string | null;
  ht: string | null;
  ttc: string | null;
  statut: string | null;
  contrat_id: number;
};
type ContratOpt = { id: number; titre: string; client: string };

export default function FacturesPage() {
  const [rows, setRows] = useState<FactureRow[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [contrats, setContrats] = useState<ContratOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{
    contrat_id: number | "";
    montant_ht: string;
    tva: string;
    date_echeance?: string;
  }>({ contrat_id: "", montant_ht: "", tva: "20.00" });

  const euro = (v?: string | null) =>
    v
      ? Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €"
      : "—";

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/factures?q=" + encodeURIComponent(q));
    const data = await r.json();
    setRows(data);
    setLoading(false);
  };
  const loadOpts = async () => {
    const r = await fetch("/api/factures/options");
    setContrats(await r.json());
  };

  useEffect(() => {
    load();
    loadOpts();
  }, []);

  const cols = useMemo(
    () => [
      { field: "id", headerName: "#", width: 80 },
      { field: "client", headerName: "Client", flex: 1 },
      { field: "contrat", headerName: "Contrat", flex: 1.2 },
      {
        field: "emission",
        headerName: "Émission",
        width: 120,
        valueFormatter: (p: any) =>
          p.value ? new Date(p.value).toLocaleDateString("fr-FR") : "",
      },
      {
        field: "echeance",
        headerName: "Échéance",
        width: 120,
        valueFormatter: (p: any) =>
          p.value ? new Date(p.value).toLocaleDateString("fr-FR") : "",
      },
      {
        field: "ht",
        headerName: "HT",
        width: 120,
        valueFormatter: (p: any) => euro(p.value),
      },
      {
        field: "ttc",
        headerName: "TTC",
        width: 120,
        valueFormatter: (p: any) => euro(p.value),
      },
      { field: "statut", headerName: "Statut", width: 140 },
    ],
    []
  );

  const onCreate = async () => {
    await fetch("/api/factures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm({ contrat_id: "", montant_ht: "", tva: "20.00" });
    await load();
  };

  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Factures
        </Typography>

        {/* Recherche + création */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              label="Recherche (client/contrat/statut)"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button variant="outlined" onClick={load}>
              Filtrer
            </Button>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Nouvelle facture
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
          <div style={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={cols}
              getRowId={(row) => row.id}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
            />
          </div>
        )}

        {/* Dialog de création */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Nouvelle facture</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="flbl">Contrat</InputLabel>
                <Select
                  labelId="flbl"
                  label="Contrat"
                  value={form.contrat_id === "" ? "" : String(form.contrat_id)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      contrat_id: Number(e.target.value),
                    }))
                  }
                >
                  {contrats.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.client} — {c.titre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Montant HT (€)"
                type="number"
                InputLabelProps={{ shrink: true }}
                value={form.montant_ht}
                onChange={(e) =>
                  setForm((f) => ({ ...f, montant_ht: e.target.value }))
                }
              />
              <TextField
                label="TVA (%)"
                type="number"
                InputLabelProps={{ shrink: true }}
                value={form.tva}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tva: e.target.value }))
                }
              />
              <TextField
                label="Échéance (YYYY-MM-DD)"
                InputLabelProps={{ shrink: true }}
                value={form.date_echeance || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date_echeance: e.target.value }))
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={onCreate}
              disabled={form.contrat_id === "" || !form.montant_ht.trim()}
            >
              Créer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
