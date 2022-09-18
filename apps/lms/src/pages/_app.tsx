import type { AppProps } from 'next/app';
import { Router, useRouter } from 'next/router';
import { EventType, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import NProgress from 'nprogress';

import { msalConfig } from '@src/config';
import { CustomNavigationClient } from '@src/utils';

import 'nprogress/nprogress.css';
import '../styles/globals.css';

export const msalInstance = new PublicClientApplication(msalConfig);

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: any) => {
  if (
    event.eventType === EventType.LOGIN_SUCCESS &&
    event.payload?.account
  ) {
    const {account} = event.payload;
    msalInstance.setActiveAccount(account);
  }
});

Router.events.on('routeChangeStart', () => {
  NProgress.configure({ showSpinner: false });
  NProgress.start();
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const navigationClient = new CustomNavigationClient(router);
  msalInstance.setNavigationClient(navigationClient);

  return (
    <MsalProvider instance={msalInstance}>
      <Component {...pageProps} />
    </MsalProvider>
  );
}

export default MyApp;
