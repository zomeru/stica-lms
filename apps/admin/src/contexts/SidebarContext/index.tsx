import {
  createContext,
  FC,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';

export interface SidebarContextProps {
  sidebarOpen: boolean;
  showHideSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextProps>(
  {} as SidebarContextProps
);

export function useSidebar() {
  return useContext(SidebarContext);
}

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: FC<SidebarProviderProps> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const showHideSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const value = useMemo(
    () => ({ sidebarOpen, showHideSidebar } as SidebarContextProps),
    [sidebarOpen, showHideSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
