import { useState, useEffect, useCallback } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import {
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  addDoc,
  doc,
  getDoc,
  FieldValue,
} from 'firebase/firestore';

import { msalInstance } from '@src/pages/_app';
import { loginRequest } from '@src/config';
import { db } from '@src/utils';

export interface IUser {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  email: string;
  username: string;
  numSuccessBookRequest: number;
  numFailedBookRequest: number;
  numSuccessRenewalRequest: number;
  numFailedRenewalRequest: number;
  numSuccessBookReturnRequest: number;
  numFailedBookReturnRequest: number;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  photo?: string;
}

export const useUser = () => {
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  const getUser = useCallback(async () => {
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

        const userObject: IUser = {} as IUser;
        if (newUser) {
          userObject.displayName = newUser.displayName.replace(
            ' (Student)',
            ''
          );
          userObject.givenName = newUser.givenName;
          userObject.surname = newUser.surname;
          userObject.username = newUser.mailNickname;
          userObject.email = newUser.mail;
        }

        const q = query(
          collection(db, 'users'),
          where('email', '==', newUser.mail)
        );

        const querySnapshot = await getDocs(q);

        let newUserDoc: IUser | null = null;

        if (querySnapshot.empty) {
          const timeStamp = serverTimestamp();

          newUserDoc = await addDoc(collection(db, 'users'), {
            ...userObject,
            numSuccessBookRequest: 0,
            numFailedBookRequest: 0,
            numSuccessRenewalRequest: 0,
            numFailedRenewalRequest: 0,
            numSuccessBookReturnRequest: 0,
            numFailedBookReturnRequest: 0,
            createdAt: timeStamp,
            updatedAt: timeStamp,
          }).then(async (docRef) => {
            const newDocRef = doc(db, 'users', docRef.id);
            const docSnap = await getDoc(newDocRef);

            return {
              id: docSnap.id,
              ...docSnap.data(),
            } as IUser;
          });
        } else {
          newUserDoc = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          } as IUser;
        }

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
        if (photoUrl && newUserDoc) newUserDoc.photo = photoUrl;

        setUser(newUserDoc);
      }
    } catch (error) {
      console.log('error', error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) getUser();
    if (!isAuthenticated && !loading) setUser(null);
  }, [isAuthenticated]);

  return {
    user,
    loading,
  };
};
