// src/components/Nav.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  Tooltip,
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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"; // ✚ croix
import Image from "next/image";

const linksMobile = [
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

const linksDesktop = linksMobile.filter((l) => l.href !== "/");

export function Nav() {
  const [value, setValue] = useState(0);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        setIsAuth(res.ok);
      } catch {
        setIsAuth(false);
      }
    })();
  }, []);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    // redirige proprement
    router.push("/login");
    // ce fallback force la navigation si un CSP bloque le client router
    window.location.href = "/login";
  };

  return (
    <>
      {/* Desktop */}
      <AppBar position="static" sx={{ display: { xs: "none", lg: "block" } }}>
        <Toolbar>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Image
                src="/assets/cc-draft-logo.jpg"
                alt="Logo"
                width={42}
                height={42}
                style={{ borderRadius: 4 }}
              />
              <Box sx={{ ml: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1 }}
                >
                  Concorde
                  <br />
                  Cartulaire
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}
                >
                  (draft)
                </Typography>
              </Box>
            </Link>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isAuth ? (
              <>
                {linksDesktop.map((link) => (
                  <Button
                    key={link.href}
                    color="inherit"
                    component={Link}
                    href={link.href}
                  >
                    {link.label}
                  </Button>
                ))}
                {/* Déconnexion */}
                <Tooltip title="Se déconnecter">
                  <span>
                    <IconButton
                      onClick={logout}
                      disabled={loggingOut}
                      sx={{ ml: 0.5, color: "inherit" }}
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Authentification requise
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile */}
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
        {isAuth ? (
          <BottomNavigation
            showLabels
            value={value}
            onChange={(_, newValue) => setValue(newValue)}
            sx={{ flexWrap: "wrap", height: "auto" }}
          >
            {linksMobile.map((link) => (
              <BottomNavigationAction
                key={link.href}
                label={link.label}
                icon={link.icon}
                component={Link}
                href={link.href}
                sx={{ flex: "1 0 33%", py: 0.5, pt: 0.5, pb: 3 }}
              />
            ))}
            {/* ✚ action Déconnexion */}
            <BottomNavigationAction
              label={loggingOut ? "…" : "Quitter"}
              icon={<CloseRoundedIcon />}
              onClick={logout}
              sx={{ flex: "1 0 33%", py: 0.5, pt: 0.5, pb: 3 }}
            />
          </BottomNavigation>
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Authentification requise
            </Typography>
          </Box>
        )}
      </Paper>
    </>
  );
}
