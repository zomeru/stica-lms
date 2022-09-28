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
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from 'db';
import { useRouter } from 'next/router';

export interface UserContextProps {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
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
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<User>({} as User);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (router.pathname !== '/dashboard') router.push('/dashboard');
      } else if (router.pathname !== '/') router.push('/');

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () =>
      ({
        user,
        loading,
        setUser,
      } as UserContextProps),
    [user, loading]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};
