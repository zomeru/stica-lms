import {
  FC,
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@lms/db';
import { IUserDoc } from '@lms/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export type UserType = User & IUserDoc;
export interface UserContextProps {
  user: UserType;
  setUser: Dispatch<SetStateAction<User>>;
  loading: boolean;
  loginWithO356: () => void;
}

export const UserContext = createContext<UserContextProps>(
  null as unknown as UserContextProps
);

export function useUser() {
  return useContext(UserContext);
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType>({} as UserType);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.email?.includes('@sticalms.com')) {
          setUser(currentUser as UserType);
        } else {
          const q = query(
            collection(db, 'users'),
            where('email', '==', currentUser.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = {
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data(),
            } as UserType;

            if (userDoc.terminated) {
              toast.error('Your account has been terminated.');
              signOut(auth).then(() => {
                setUser({} as UserType);
              });
            } else if (!userDoc.isAdmin) {
              toast.error(
                'You are not authorized to access this website.'
              );
              signOut(auth).then(() => {
                setUser({} as UserType);
              });
            } else {
              setUser(userDoc);
            }
          } else {
            toast.error('You are not authorized to access this website.');
            signOut(auth).then(() => {
              setUser({} as UserType);
            });
          }
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithO356 = () => {
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

          if (querySnapshot.empty) {
            signOut(auth).then(() => {
              setUser({} as UserType);
            });
            setLoading(false);
            toast.error('You are not authorized to access this website.');
            
          } else {
            let newUserDoc: IUserDoc | null = null;
            newUserDoc = {
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data(),
            } as UserType;

            if (newUserDoc.terminated) {
              signOut(auth).then(() => {
                setUser({} as UserType);
              });
              setLoading(false);
              toast.error('Your account has been terminated.');
              return;
            }

            if (!newUserDoc.isAdmin) {
              signOut(auth).then(() => {
                setUser({} as UserType);
              });
              setLoading(false);
              toast.error(
                'You are not authorized to access this website.'
              );
              return;
            }

            setUser(newUserDoc as UserType);
            setLoading(false);
          }
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

  const value = useMemo(
    () =>
      ({
        user,
        loading,
        setUser,
        loginWithO356,
      } as UserContextProps),
    [user, loading, setUser, loginWithO356]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};
