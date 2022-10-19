import { useEffect } from 'react';
import {
  // getRedirectResult,
  // OAuthProvider,
  // onAuthStateChanged,
  // signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth } from '@lms/db';

const Testing = () => {
  useEffect(() => {
    // onAuthStateChanged(auth, async (currentUser) => {
    //   console.log('currentUser', currentUser);
    // });
    // getRedirectResult(auth)
    //   .then((result) => {
    //     console.log('result', result);
    //     if (result) {
    //       const credential = OAuthProvider.credentialFromResult(result);
    //       console.log('credential', credential);
    //     }
    //   })
    //   .catch((error) => {
    //     // Handle error.
    //     console.log('error', error);
    //   });
  }, []);

  const handleLogin = () => {
    // const provider = new OAuthProvider('microsoft.com');
    // provider.setCustomParameters({
    //   prompt: 'select_account',
    //   tenant: process.env.NEXT_PUBLIC_AZURE_STICA_TENANT_ID!,
    //   // redirect_uri: '/testing',
    // });
    // provider.addScope('user.read');
    // signInWithRedirect(auth, provider);
  };
  return (
    <div>
      <button type='button' onClick={handleLogin}>
        Sign in
      </button>
      <button type='button' onClick={() => signOut(auth)}>
        Sign out
      </button>
    </div>
  );
};

export default Testing;
