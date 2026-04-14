import { createContext, useContext, useState, ReactNode } from "react";

interface UserFilterContextValue {
  activeUserId: string | null;
  setActiveUserId: (id: string | null) => void;
}

const UserFilterContext = createContext<UserFilterContextValue | null>(null);

interface UserFilterProviderProps {
  children: ReactNode;
}

export function UserFilterProvider({ children }: UserFilterProviderProps) {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  return (
    <UserFilterContext.Provider value={{ activeUserId, setActiveUserId }}>
      {children}
    </UserFilterContext.Provider>
  );
}

export function useUserFilter(): UserFilterContextValue {
  const ctx = useContext(UserFilterContext);
  if (!ctx) {
    throw new Error("useUserFilter must be used within a UserFilterProvider");
  }
  return ctx;
}
