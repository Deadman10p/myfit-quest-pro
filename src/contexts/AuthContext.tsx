import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
  onboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, setUser: () => {}, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("fitai-user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem("fitai-user", JSON.stringify(u));
    else localStorage.removeItem("fitai-user");
  };

  const isAdmin = user?.email === "bulegafarid@gmail.com";

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
