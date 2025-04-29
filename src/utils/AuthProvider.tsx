import { createContext, ReactNode, useContext, useState } from "react";
import Cookies from "js-cookie";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (token: string | undefined) => void;
  logout: () => void;
  getToken: () => string | undefined;
};

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!Cookies.get("token")
  );

  const login = (token: string | undefined) => {
    if(token)
    Cookies.set("token", token,{expires : 7});
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
  };
  const getToken = (): string | undefined => {
    return Cookies.get("token");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
