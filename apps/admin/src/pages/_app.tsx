import type { AppProps } from 'next/app';
import Head from 'next/head';

import { SidebarProvider, UserProvider } from '@src/contexts';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <SidebarProvider>
        <Head>
          <title>Admin - STICA LMS</title>
        </Head>
        <Component {...pageProps} />
      </SidebarProvider>
    </UserProvider>
  );
}

export default MyApp;
