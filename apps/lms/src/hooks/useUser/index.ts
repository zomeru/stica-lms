import { useState, useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';

import { msalInstance } from '@src/pages/_app';
import { loginRequest } from '@src/config';

export interface IUser {
  displayName: string;
  givenName: string;
  surname: string;
  email: string;
  photo: string;
}

export const useUser = () => {
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);

      try {
        const instance = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: msalInstance.getActiveAccount()!,
        });

        if (instance) {
          const userRes = await fetch(
            'https://graph.microsoft.com/beta/me',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${instance.accessToken}`,
              },
            }
          );

          const newUser = await userRes.json();

          const photoRes = await fetch(
            'https://graph.microsoft.com/v1.0/me/photo/$value',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${instance.accessToken}`,
              },
            }
          );

          const photo = await photoRes.blob();
          const photoUrl = URL.createObjectURL(photo);

          const userObject: IUser = {} as IUser;
          if (newUser) {
            userObject.displayName = newUser.displayName;
            userObject.givenName = newUser.givenName;
            userObject.surname = newUser.surname;
            userObject.email = newUser.mail;
          }
          if (photoUrl) userObject.photo = photoUrl;

          setUser(userObject);
        }
      } catch (error) {
        console.log('error', error);
      }

      setLoading(false);
    };

    if (isAuthenticated && !user) getUser();
    if (!isAuthenticated && !loading) setUser(null);
  }, [isAuthenticated, user, loading]);

  return {
    user,
    loading,
  };
};
