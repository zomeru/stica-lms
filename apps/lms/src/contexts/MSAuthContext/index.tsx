import {
  createContext,
  FC,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
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

import { auth, db } from '@lms/db';
import { IUserDoc } from '@lms/types';
import {
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { blobToFile } from '@src/utils';
import useUploadImage from '@lms/ui/hooks/useUploadImage';

export interface MSAuthContextProps {
  user: IUserDoc | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

export const MSAuthContext = createContext<MSAuthContextProps>(
  null as unknown as MSAuthContextProps
);

export function useAuth() {
  return useContext(MSAuthContext);
}

interface MSAuthProviderProps {
  children: ReactNode;
}

export const MSAuthProvider: FC<MSAuthProviderProps> = ({ children }) => {
  const { uploadImage } = useUploadImage();

  const [user, setUser] = useState<IUserDoc | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const q = query(
          collection(db, 'users'),
          where('email', '==', currentUser.email)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          } as IUserDoc;
          setUser(userDoc);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const login = () => {
    setLoading(true);
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: process.env.NEXT_PUBLIC_AZURE_STICA_TENANT_ID!,
    });
    provider.addScope('user.read');

    signInWithPopup(auth, provider).then(async (result) => {
      if (result) {
        const userInfo = result.user;
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        const userObject: IUserDoc = {} as IUserDoc;

        if (userInfo) {
          const displayName = userInfo.displayName!.replace(
            ' (Student)',
            ''
          );
          const givenName = displayName.split(',')[1].slice(1);
          const surname = displayName.split(',')[0];

          userObject.displayName = displayName;
          userObject.email = userInfo.email!;
          userObject.givenName = givenName;
          userObject.surname = surname;

          const photoRes = await fetch(
            'https://graph.microsoft.com/v1.0/me/photo/$value',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const photoBlob = await photoRes.blob();
          const photoFile = blobToFile(
            photoBlob,
            `${surname}-${givenName}`
          );

          const profilePhoto = await uploadImage('profiles', photoFile);

          if (profilePhoto) {
            userObject.photo = profilePhoto;
          }
        }

        const q = query(
          collection(db, 'users'),
          where('email', '==', userInfo.email)
        );
        const querySnapshot = await getDocs(q);

        let newUserDoc: IUserDoc | null = null;

        if (querySnapshot.empty) {
          const timestamp = serverTimestamp();

          newUserDoc = await addDoc(collection(db, 'users'), {
            ...userObject,
            numSuccessBookRequest: 0,
            numFailedBookRequest: 0,
            numSuccessRenewalRequest: 0,
            numFailedRenewalRequest: 0,
            numSuccessBookReturnRequest: 0,
            numFailedBookReturnRequest: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
          }).then(async (docRef) => {
            const docSnap = await getDoc(doc(db, 'users', docRef.id));

            return {
              id: docRef.id,
              ...docSnap.data(),
            } as IUserDoc;
          });
        } else {
          newUserDoc = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          } as IUserDoc;
        }

        setUser(newUserDoc);
      }
    });
    setLoading(false);
  };

  const logout = () => {
    signOut(auth).then(() => {
      setUser(null);
    });
  };

  const value = useMemo(
    () => ({ user, login, logout, loading }),
    [user, login, logout, loading]
  );

  return (
    <MSAuthContext.Provider value={value}>
      {children}
    </MSAuthContext.Provider>
  );
};
