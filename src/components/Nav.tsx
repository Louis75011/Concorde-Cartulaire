"use client";
import { useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WorkIcon from "@mui/icons-material/Work";
import GroupIcon from "@mui/icons-material/Group";
import PaymentIcon from "@mui/icons-material/Payment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SettingsIcon from "@mui/icons-material/Settings";

const links = [
  { href: "/", label: "Tableau", icon: <DashboardIcon /> },
  { href: "/clients", label: "Clients", icon: <PeopleIcon /> },
  { href: "/contrats", label: "Contrats", icon: <AssignmentIcon /> },
  { href: "/factures", label: "Factures", icon: <ReceiptIcon /> },
  { href: "/prestataires", label: "Prestataires", icon: <WorkIcon /> },
  { href: "/collaborateurs", label: "Collaborateurs", icon: <GroupIcon /> },
  { href: "/paiements", label: "Paiements", icon: <PaymentIcon /> },
  { href: "/signatures", label: "Signatures", icon: <EditNoteIcon /> },
  { href: "/settings", label: "Paramètres", icon: <SettingsIcon /> },
];

export function Nav() {
  const [value, setValue] = useState(0);

  return (
    <>
      {/* Desktop (>= md) */}
      <AppBar position="static" sx={{ display: { xs: "none", lg: "block" } }}>
        <Toolbar>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}
          >
            <img
              src="/assets/cc-draft-logo.jpg"
              alt="Logo Concorde Cartulaire"
              style={{ width: 42, height: 42, borderRadius: 4 }}
            />
            <Typography
              variant="h6"
              sx={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1 }}
            >
              Concorde<br />Cartulaire
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}
            >
              (draft)
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {links.map((link) => (
              <Button
                key={link.href}
                color="inherit"
                component={Link}
                href={link.href}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile (< md) */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "block", lg: "none" },
          zIndex: 1200,
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, newValue) => setValue(newValue)}
          sx={{
            flexWrap: "wrap", // passe en 2 lignes si besoin
            height: "auto",
          }}
        >
          {links.map((link, idx) => (
            <BottomNavigationAction
              key={link.href}
              label={link.label}
              icon={link.icon}
              component={Link}
              href={link.href}
              sx={{ flex: "1 0 33%", p: 0.5 }} // 3 icônes par ligne
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
}
