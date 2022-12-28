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
// import toast from 'react-hot-toast';

import { auth, db } from '@lms/db';
import { IUserDoc } from '@lms/types';
import {
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  // signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { blobToFile } from '@src/utils';
import { useUploadImage } from '@lms/ui/hooks';

export interface MSAuthContextProps {
  user: IUserDoc | null;
  login: () => void;
  logout: () => void;
  // loginRedirect: () => void;
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
      // setLoading(true);
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
      // setLoading(false);
    });
  }, []);

  const login = () => {
    setLoading(true);
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: process.env.NEXT_PUBLIC_AZURE_STICA_TENANT_ID!,
      prompt: 'select_account',
    });
    provider.addScope('user.read');

    signInWithPopup(auth, provider)
      .then(async (result) => {
        if (result) {
          const userInfo = result.user;
          const credential = OAuthProvider.credentialFromResult(result);
          const accessToken = credential?.accessToken;

          const userObject: IUserDoc = {} as IUserDoc;

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

          const q = query(
            collection(db, 'users'),
            where('email', '==', userInfo.email)
          );
          const querySnapshot = await getDocs(q);

          let newUserDoc: IUserDoc | null = null;

          if (querySnapshot.empty) {
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

            const timestamp = serverTimestamp();

            newUserDoc = await addDoc(collection(db, 'users'), {
              ...userObject,
              totalBorrowedBooks: 0,
              totalReturnedBooks: 0,
              totalRenewedBooks: 0,
              totalLostBooks: 0,
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
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log('error sign in pop up', err.message);

        if (err.message.includes('auth/popup-closed-by-user')) {
          // toast.error('The log in window was closed');
        }

        setLoading(false);
      });
  };

  // const loginRedirect = () => {
  //   const provider = new OAuthProvider('microsoft.com');
  //   provider.setCustomParameters({
  //     prompt: 'select_account',
  //     tenant: process.env.NEXT_PUBLIC_AZURE_STICA_TENANT_ID!,
  //   });
  //   provider.addScope('user.read');

  //   signInWithRedirect(auth, provider);
  // };

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
