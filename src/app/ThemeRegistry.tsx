'use client';
import * as React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export default function ThemeRegistry({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  const [cache] = React.useState(() => createCache({ key: 'mui', nonce }));
  const theme = React.useMemo(() => createTheme({
    palette: { mode: 'light', primary: { main: '#0d47a1' }, secondary: { main: '#00695c' } },
  }), []);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
