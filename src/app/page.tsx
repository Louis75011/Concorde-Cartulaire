'use client';
import { Container, Typography, Grid, Paper, Stack, Divider } from '@mui/material';
import { Nav } from '../components/Nav';

export default function Page() {
  return (
    <>
      <Nav />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>

        <Grid container spacing={3}>
          {/* Bloc Contrats */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Contrats
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Brouillons : 3</Typography>
                <Typography variant="body2">Actifs : 8</Typography>
                <Typography variant="body2">Suspendus : 2</Typography>
                <Typography variant="body2">Clos : 5</Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Bloc Factures */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Factures
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">En attente : 4</Typography>
                <Typography variant="body2">Payées : 12</Typography>
                <Typography variant="body2">En retard : 1</Typography>
                <Typography variant="body2">Annulées : 2</Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Bloc payments */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                payments
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Mandats : 6</Typography>
                <Typography variant="body2">Prélèvements : 14</Typography>
                <Typography variant="body2">Échecs : 2</Typography>
                <Typography variant="body2">Webhooks actifs : 3</Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Bloc Clients */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Clients
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Total : 20</Typography>
                <Typography variant="body2">Nouveaux ce mois : 3</Typography>
                <Typography variant="body2">Secteur BTP : 5</Typography>
                <Typography variant="body2">Secteur Santé : 7</Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Bloc Collaborateurs */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Collaborateurs
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Actifs : 4</Typography>
                <Typography variant="body2">Rôles : chef de projet, support, commercial</Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Bloc Prestataires */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Prestataires
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Actifs : 3</Typography>
                <Typography variant="body2">Types : dev front, dev back, sécurité</Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Section supplémentaire */}
        <Paper sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Dernières activités
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2">• Facture #1023 payée par Société Dupont</Typography>
          <Typography variant="body2">• Nouveau contrat signé avec Clinique Pégase</Typography>
          <Typography variant="body2">• Ajout d’un collaborateur (Anne Durand)</Typography>
        </Paper>
      </Container>
    </>
  );
}

// DONNEES DYNAMIQUES
// 'use client';
// import { useEffect, useState } from 'react';
// import { Container, Typography, Grid, Paper, Stack, Divider } from '@mui/material';
// import { Nav } from '../components/Nav';

// export default function DashboardPage() {
//   const [stats, setStats] = useState<any>(null);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [clients, collaborateurs, contrats, factures, prestataires, payments] = await Promise.all([
//           fetch('/api/clients').then(r => r.json()),
//           fetch('/api/collaborateurs').then(r => r.json()),
//           fetch('/api/contrats').then(r => r.json()),
//           fetch('/api/factures').then(r => r.json()),
//           fetch('/api/prestataires').then(r => r.json()),
//           fetch('/api/payments').then(r => r.json()),
//         ]);

//         setStats({
//           clients: {
//             total: clients.length,
//             nouveaux: clients.filter((c:any) =>
//               new Date(c.date_creation) > new Date(Date.now() - 30*24*60*60*1000)
//             ).length,
//             secteurs: {
//               btp: clients.filter((c:any) => c.secteur?.toLowerCase() === 'btp').length,
//               sante: clients.filter((c:any) => c.secteur?.toLowerCase() === 'santé').length,
//             }
//           },
//           collaborateurs: {
//             total: collaborateurs.length,
//             roles: [...new Set(collaborateurs.map((c:any) => c.role))].join(', ')
//           },
//           contrats: {
//             brouillon: contrats.filter((c:any)=>c.statut==='brouillon').length,
//             actif: contrats.filter((c:any)=>c.statut==='actif').length,
//             suspendu: contrats.filter((c:any)=>c.statut==='suspendu').length,
//             clos: contrats.filter((c:any)=>c.statut==='clos').length,
//           },
//           factures: {
//             en_attente: factures.filter((f:any)=>f.statut_paiement==='draft' || f.statut_paiement==='envoyee').length,
//             payees: factures.filter((f:any)=>f.statut_paiement==='payee').length,
//             retard: factures.filter((f:any)=>f.statut_paiement==='en_retard').length,
//             annulees: factures.filter((f:any)=>f.statut_paiement==='annulee').length,
//           },
//           prestataires: {
//             total: prestataires.length,
//             types: [...new Set(prestataires.map((p:any)=>p.type))].join(', ')
//           },
//           payments: {
//             mandats: payments.filter((p:any)=>p.type==='mandat').length,
//             prelevements: payments.filter((p:any)=>p.type==='prelevement').length,
//             echecs: payments.filter((p:any)=>p.statut==='failed').length,
//             webhooks: payments.filter((p:any)=>p.webhook_actif===true).length,
//           }
//         });
//       } catch (err) {
//         console.error('Erreur dashboard', err);
//       }
//     };
//     load();
//   }, []);

//   return (
//     <>
//       <Nav />
//       <Container sx={{ py: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Tableau de bord
//         </Typography>

//         {!stats ? (
//           <Typography>Chargement...</Typography>
//         ) : (
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={4}>
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="h6">Contrats</Typography>
//                 <Stack>
//                   <Typography>Brouillons : {stats.contrats.brouillon}</Typography>
//                   <Typography>Actifs : {stats.contrats.actif}</Typography>
//                   <Typography>Suspendus : {stats.contrats.suspendu}</Typography>
//                   <Typography>Clos : {stats.contrats.clos}</Typography>
//                 </Stack>
//               </Paper>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="h6">Factures</Typography>
//                 <Stack>
//                   <Typography>En attente : {stats.factures.en_attente}</Typography>
//                   <Typography>Payées : {stats.factures.payees}</Typography>
//                   <Typography>En retard : {stats.factures.retard}</Typography>
//                   <Typography>Annulées : {stats.factures.annulees}</Typography>
//                 </Stack>
//               </Paper>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="h6">payments</Typography>
//                 <Stack>
//                   <Typography>Mandats : {stats.payments.mandats}</Typography>
//                   <Typography>Prélèvements : {stats.payments.prelevements}</Typography>
//                   <Typography>Échecs : {stats.payments.echecs}</Typography>
//                   <Typography>Webhooks actifs : {stats.payments.webhooks}</Typography>
//                 </Stack>
//               </Paper>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="h6">Clients</Typography>
//                 <Stack>
//                   <Typography>Total : {stats.clients.total}</Typography>
//                   <Typography>Nouveaux ce mois : {stats.clients.nouveaux}</Typography>
//                   <Typography>Secteur BTP : {stats.clients.secteurs.btp}</Typography>
//                   <Typography>Secteur Santé : {stats.clients.secteurs.sante}</Typography>
//                 </Stack>
//               </Paper>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="h6">Collaborateurs</Typography>
//                 <Stack>
//                   <Typography>Actifs : {stats.collaborateurs.total}</Typography>
//                   <Typography>Rôles : {stats.collaborateurs.roles}</Typography>
//                 </Stack>
//               </Paper>
//             </Grid>

//             <Grid item xs={12} md={4}>
//               <Paper sx={{ p: 2 }}>
//                 <Typography variant="h6">Prestataires</Typography>
//                 <Stack>
//                   <Typography>Actifs : {stats.prestataires.total}</Typography>
//                   <Typography>Types : {stats.prestataires.types}</Typography>
//                 </Stack>
//               </Paper>
//             </Grid>
//           </Grid>
//         )}

//         <Paper sx={{ p: 2, mt: 4 }}>
//           <Typography variant="h6" gutterBottom>
//             Dernières activités
//           </Typography>
//           <Divider sx={{ mb: 1 }} />
//           <Typography variant="body2">
//             (👉 à compléter plus tard via une route `/api/activity`)
//           </Typography>
//         </Paper>
//       </Container>
//     </>
//   );
// }
