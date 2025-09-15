'use client';

import * as React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d47a1' },
    secondary: { main: '#00695c' },
  },
});

export default function ThemeRegistry({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  const cache = React.useMemo(
    () =>
      createCache({
        key: 'mui',
        prepend: true,
        nonce, // applique le nonce CSP
      }),
    [nonce]
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
