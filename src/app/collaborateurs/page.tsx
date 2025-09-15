'use client';
import { useEffect, useMemo, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Container, Typography, Paper, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Nav } from '@/components/Nav';

type CollabRow = { id:number; nom:string; email:string; role:string; clients:string };

export default function CollaborateursPage() {
  const [rows, setRows] = useState<CollabRow[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ nom:string; email:string; role:string }>({ nom:'', email:'', role:'' });

  const load = async () => {
    const r = await fetch('/api/collaborateurs?q=' + encodeURIComponent(q));
    setRows(await r.json());
  };
  useEffect(() => { load(); }, []);

  const cols = useMemo(() => [
    { field:'id', headerName:'#', width:80 },
    { field:'nom', headerName:'Nom', flex:1 },
    { field:'email', headerName:'Email', flex:1 },
    { field:'role', headerName:'Rôle', width:180 },
    { field:'clients', headerName:'Clients suivis', flex:1.2 },
  ], []);

  const onCreate = async () => {
    await fetch('/api/collaborateurs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setOpen(false); setForm({ nom:'', email:'', role:'' }); await load();
  };

  return (
    <>
      <Nav />
      <Container sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Collaborateurs</Typography>

        <Paper sx={{ p:2, mb:2 }}>
          <Stack direction="row" spacing={2}>
            <TextField size="small" label="Recherche (nom/email/role/client)" variant="outlined" value={q} onChange={e=>setQ(e.target.value)} />
            <Button variant="outlined" onClick={load}>Filtrer</Button>
            <Button variant="contained" onClick={()=>setOpen(true)}>Nouveau collaborateur</Button>
          </Stack>
        </Paper>

        <div style={{ height: 560, width:'100%' }}>
          <DataGrid rows={rows} columns={cols} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
        </div>

        <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Nouveau collaborateur</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt:1 }}>
              <TextField label="Nom" variant="outlined" value={form.nom} onChange={e=>setForm(f=>({ ...f, nom:e.target.value }))}/>
              <TextField label="Email" variant="outlined" value={form.email} onChange={e=>setForm(f=>({ ...f, email:e.target.value }))}/>
              <TextField label="Rôle" variant="outlined" value={form.role} onChange={e=>setForm(f=>({ ...f, role:e.target.value }))}/>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={onCreate} disabled={!form.nom || !form.email}>Créer</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
