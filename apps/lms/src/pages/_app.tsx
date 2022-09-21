import type { AppProps } from 'next/app';
import { Router, useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import {
  EventType,
  PublicClientApplication,
  EventMessage,
  AuthenticationResult,
} from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import NProgress from 'nprogress';

import { UserProvider } from '@src/contexts';
import { msalConfig } from '@src/config';
import { CustomNavigationClient } from '@src/utils';
import SEO from '../../next-seo.config';

import 'nprogress/nprogress.css';
import '../styles/globals.css';

export const msalInstance = new PublicClientApplication(msalConfig);

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const { account } = payload;
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
      <UserProvider msalInstance={msalInstance}>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </UserProvider>
    </MsalProvider>
  );
}

export default MyApp;
