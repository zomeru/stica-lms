import {
  createContext,
  FC,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useIsAuthenticated } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

import { loginRequest } from '@src/config';
import { db } from '@lms/db';
import { IUserDoc } from '@lms/types';

export interface UserContextProps {
  user: IUserDoc | null;
  loading: boolean;
}

export const UserContext = createContext<UserContextProps>(
  null as unknown as UserContextProps
);

export function useUser() {
  return useContext(UserContext);
}

interface UserProviderProps {
  children: ReactNode;
  msalInstance: PublicClientApplication;
}

export const UserProvider: FC<UserProviderProps> = ({
  children,
  msalInstance,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<IUserDoc | null>(null);
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

        const userObject: IUserDoc = {} as IUserDoc;
        if (newUser) {
          userObject.displayName = newUser.displayName.replace(
            ' (Student)',
            ''
          );
          userObject.givenName = newUser.givenName;
          userObject.surname = newUser.surname;
          // userObject.username = newUser.mailNickname;
          userObject.email = newUser.mail;
        }

        const q = query(
          collection(db, 'users'),
          where('email', '==', newUser.mail)
        );

        const querySnapshot = await getDocs(q);

        let newUserDoc: IUserDoc | null = null;

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
            } as IUserDoc;
          });
        } else {
          newUserDoc = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          } as IUserDoc;
        }

        // const photoRes = await fetch(
        //   'https://graph.microsoft.com/v1.0/me/photo/$value',
        //   {
        //     method: 'GET',
        //     headers: {
        //       Authorization: `Bearer ${instance.accessToken}`,
        //     },
        //   }
        // );

        // const photo = await photoRes.blob();
        // const photoUrl = URL.createObjectURL(photo);
        // if (photoUrl && newUserDoc) newUserDoc.photo = photoUrl;

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

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};
