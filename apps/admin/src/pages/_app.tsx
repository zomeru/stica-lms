import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';

// import NProgress from 'nprogress';
// import { Router } from 'next/router';

import { SidebarProvider, UserProvider } from '@src/contexts';

import 'nprogress/nprogress.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/globals.css';

// Router.events.on('routeChangeStart', () => {
//   NProgress.configure({ showSpinner: false });
//   NProgress.start();
// });
// Router.events.on('routeChangeComplete', () => NProgress.done());
// Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <SidebarProvider>
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 2000,
          }}
        />
        <Head>
          <title>Admin - STICA Library Management System</title>
        </Head>
        <Component {...pageProps} />
      </SidebarProvider>
    </UserProvider>
  );
}

export default MyApp;
