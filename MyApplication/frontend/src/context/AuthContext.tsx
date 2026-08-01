import React, { createContext, useContext, useState, useEffect } from 'react';
import { Web3AuthService, AuthSession } from '../services/web3Auth';

export type UserRole = 'client' | 'freelancer' | null;

interface AuthContextType {
  walletAddress: string | null;
  jwtToken: string | null;
  userRole: UserRole;
  isConnected: boolean;
  isLoggingIn: boolean;
  balanceEth: string;
  error: string | null;
  login: (selectedRole?: 'client' | 'freelancer') => Promise<void>;
  setUserRole: (role: 'client' | 'freelancer') => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [balanceEth, setBalanceEth] = useState<string>('0.0000');
  const [error, setError] = useState<string | null>(null);

  // Restore stored session on mount
  useEffect(() => {
    const { walletAddress: storedAddr, token: storedToken } = Web3AuthService.getStoredSession();
    const storedRole = localStorage.getItem('blindhire_user_role') as UserRole;

    if (storedAddr && storedToken) {
      setWalletAddress(storedAddr);
      setJwtToken(storedToken);
      setUserRoleState(storedRole || 'freelancer');
      setIsConnected(true);
    }
  }, []);

  const setUserRole = (role: 'client' | 'freelancer') => {
    setUserRoleState(role);
    localStorage.setItem('blindhire_user_role', role);
  };

  const login = async (selectedRole: 'client' | 'freelancer' = 'freelancer') => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const session: AuthSession = await Web3AuthService.loginWithWallet();
      setWalletAddress(session.walletAddress);
      setJwtToken(session.token);
      setBalanceEth(session.balanceEth);
      setUserRole(selectedRole);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Login Failed:', err);
      setError(err.message || 'Failed to authenticate wallet');
      setIsConnected(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    Web3AuthService.logout();
    localStorage.removeItem('blindhire_user_role');
    setWalletAddress(null);
    setJwtToken(null);
    setUserRoleState(null);
    setIsConnected(false);
    setBalanceEth('0.0000');
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        jwtToken,
        userRole,
        isConnected,
        isLoggingIn,
        balanceEth,
        error,
        login,
        setUserRole,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
