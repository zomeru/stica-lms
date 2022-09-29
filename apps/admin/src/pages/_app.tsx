import type { AppProps } from 'next/app';

import { SidebarProvider, UserProvider } from '@src/contexts';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <SidebarProvider>
        <Component {...pageProps} />
      </SidebarProvider>
    </UserProvider>
  );
}

export default MyApp;
