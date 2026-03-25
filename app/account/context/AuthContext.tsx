// import { createContext } from "react";

// export interface AuthContextType {
//   user: any;
//   CallLogin: (email: string, password: string) => Promise<void>;
//   logout: () => void;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);
import { createContext } from "react";

export interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  CallLogin: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

export interface RegisterDto {

  firstName:string;
  lastName:string;
  username: string;
  email: string;
  phoneNo: string;
  password: string;
}

export interface LoginDto {
  username:string,
  password:string
}

export const AuthContext = createContext<AuthContextType | null>(null);