import React from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';

import { loginRequest } from '@src/config';

const SignButton = () => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = (loginType: string) => {
    if (loginType === 'popup') {
      instance.loginPopup(loginRequest);
    } else if (loginType === 'redirect') {
      instance.loginRedirect(loginRequest);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button
          className='py-1 px-3 bg-white'
          type='button'
          onClick={() => {
            instance.logoutRedirect({
              postLogoutRedirectUri: '/',
            });
          }}
        >
          Sign out
        </button>
      ) : (
        <button
          className='py-1 px-3 bg-orange-500 text-white'
          type='button'
          onClick={() => {
            handleLogin('redirect');
          }}
        >
          Sign in with microsoft
        </button>
      )}
    </div>
  );
};

export default SignButton;
