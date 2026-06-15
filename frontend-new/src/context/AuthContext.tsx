import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    console.log("TOKEN =", token);
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response =
        await axios.get(
          `${import.meta.env.VITE_API_URL}/api/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setUser(response.data);
    } catch (error) {
      localStorage.removeItem(
        "token"
      );

      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);