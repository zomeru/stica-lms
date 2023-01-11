import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { Toaster } from 'react-hot-toast';
import { PublicClientApplication } from '@azure/msal-browser';

import { msalConfig } from '@src/config';
import { MSAuthProvider, SidebarProvider } from '@src/contexts';
import SEO from '../../next-seo.config';

import 'nprogress/nprogress.css';
import '../styles/globals.css';

export const msalInstance = new PublicClientApplication(msalConfig);

// const accounts = msalInstance.getAllAccounts();
// if (accounts.length > 0) {
//   msalInstance.setActiveAccount(accounts[0]);
// }

// msalInstance.addEventCallback((event: EventMessage) => {
//   if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
//     const payload = event.payload as AuthenticationResult;
//     const { account } = payload;
//     msalInstance.setActiveAccount(account);
//   }
// });

function MyApp({ Component, pageProps }: AppProps) {
  // const router = useRouter();
  // const navigationClient = new CustomNavigationClient(router);
  // msalInstance.setNavigationClient(navigationClient);

  return (
    <MSAuthProvider>
      <SidebarProvider>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 2000,
          }}
        />
      </SidebarProvider>
    </MSAuthProvider>
  );
}

export default MyApp;
