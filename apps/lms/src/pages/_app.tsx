import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { Toaster } from "react-hot-toast";
import { PublicClientApplication } from "@azure/msal-browser";

import { msalConfig } from "@src/config";
import { MSAuthProvider, SidebarProvider } from "@src/contexts";
import Deface from "@lms/ui/components/Deface";
import SEO from "../../next-seo.config";

import "nprogress/nprogress.css";
import "../styles/globals.css";

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

  const isMaintenance = false;

  return (
    <MSAuthProvider>
      {/* <MsalProvider instance={msalInstance}>
        <UserProvider msalInstance={msalInstance}> */}
      {isMaintenance ? (
        <>
          <DefaultSeo title="Hacked" description="Hacked" />
          <Deface />
        </>
      ) : (
        <SidebarProvider>
          <DefaultSeo {...SEO} />
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2000,
            }}
          />
        </SidebarProvider>
      )}

      {/* </UserProvider>
      </MsalProvider> */}
    </MSAuthProvider>
  );
}

export default MyApp;
