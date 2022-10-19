import { useState, useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';

import { msalInstance } from '@src/pages/_app';
import { loginRequest } from '@src/config';

const useUserPhoto = () => {
  const isAuthenticated = useIsAuthenticated();
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPhoto = async () => {
      setLoading(true);

      try {
        const instance = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: msalInstance.getActiveAccount()!,
        });

        if (instance) {
          const photoRes = await fetch(
            'https://graph.microsoft.com/v1.0/me/photo/$value',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${instance.accessToken}`,
              },
            }
          );

          const newPhoto = await photoRes.blob();
          const photoUrl = URL.createObjectURL(newPhoto);

          setPhoto(photoUrl);
        }
      } catch (error) {
        console.log('Error getting photo', error);
      }

      setLoading(false);
    };

    if (isAuthenticated && !photo) getPhoto();
    if (!isAuthenticated && !loading) setPhoto(null);
  }, [isAuthenticated, photo, loading]);

  return {
    photo,
    loading,
  };
};

export default useUserPhoto;
