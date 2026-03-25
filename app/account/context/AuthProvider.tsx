

import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginDto, RegisterDto } from "./AuthContext";
import { authService } from "~/services/authService";

interface Props {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CallLogin = async (data: LoginDto) => {
    try {
      debugger
      setLoading(true);
      setError(null);

      const response = await authService.LoginServiceCall("api/test-decrypt", "POST", 
       data
      ,false,["password"]);

      setUser(response);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.SignUpServiceCall("api/test-decrypt", "POST", data, true, ["email", "password"]);
      setUser(response);
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        CallLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};