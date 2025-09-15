'use client';
import { useEffect, useMemo, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Container, Typography, Paper, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Nav } from '@/components/Nav';

type PrestataireRow = { id:number; type:string; statut:string; contact_email:string|null; secteur:string|null };

export default function PrestatairesPage() {
  const [rows, setRows] = useState<PrestataireRow[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<PrestataireRow>>({ type:'', statut:'actif', contact_email:'', secteur:'' });

  const load = async () => {
    const r = await fetch('/api/prestataires?q=' + encodeURIComponent(q));
    setRows(await r.json());
  };
  useEffect(() => { load(); }, []);

  const cols = useMemo(() => [
    { field:'id', headerName:'#', width:80 },
    { field:'type', headerName:'Type', flex:1 },
    { field:'statut', headerName:'Statut', width:140 },
    { field:'contact_email', headerName:'Email', flex:1 },
    { field:'secteur', headerName:'Secteur', width:180 },
  ], []);

  const onCreate = async () => {
    await fetch('/api/prestataires', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setOpen(false); setForm({ type:'', statut:'actif', contact_email:'', secteur:'' }); await load();
  };

  return (
    <>
      <Nav />
      <Container sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Prestataires</Typography>

        <Paper sx={{ p:2, mb:2 }}>
          <Stack direction="row" spacing={2}>
            <TextField size="small" label="Recherche (type/statut/email/secteur)" variant="outlined" value={q} onChange={e=>setQ(e.target.value)} />
            <Button variant="outlined" onClick={load}>Filtrer</Button>
            <Button variant="contained" onClick={()=>setOpen(true)}>Nouveau prestataire</Button>
          </Stack>
        </Paper>

        <div style={{ height: 540, width:'100%' }}>
          <DataGrid rows={rows} columns={cols} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
        </div>

        <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Nouveau prestataire</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt:1 }}>
              <TextField label="Type" variant="outlined" value={form.type||''} onChange={e=>setForm(f=>({ ...f, type:e.target.value }))}/>
              <TextField label="Statut" variant="outlined" value={form.statut||''} onChange={e=>setForm(f=>({ ...f, statut:e.target.value }))}/>
              <TextField label="Email" variant="outlined" value={form.contact_email||''} onChange={e=>setForm(f=>({ ...f, contact_email:e.target.value }))}/>
              <TextField label="Secteur" variant="outlined" value={form.secteur||''} onChange={e=>setForm(f=>({ ...f, secteur:e.target.value }))}/>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={onCreate} disabled={!form.type}>Créer</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
