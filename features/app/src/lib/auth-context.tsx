import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { CurrentUser, User } from "@shared/schema";
import { fetchProfile, setRole as setRoleApi } from "./posts-api";

interface AuthContextType {
  currentUser: CurrentUser | null;
  connect: (user: User) => void;
  logout: () => void;
  setRole: (role: "fan" | "creator" | "admin") => Promise<void>;
  isAuthenticated: boolean;
  isCreator: boolean;
  isFan: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    const readSessionToken = () => {
      try {
        const raw = localStorage.getItem("x402_wallet_session");
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { sessionToken?: string };
        return parsed?.sessionToken ?? null;
      } catch {
        return null;
      }
    };

    const syncSession = () => {
      const sessionToken = readSessionToken();
      setHasSession(!!sessionToken);

      if (!sessionToken) {
        setCurrentUser(null);
        if (!initialized) {
          initialized = true;
          if (mounted) setIsReady(true);
        }
        return;
      }

      fetchProfile()
        .then((profile) => {
          if (!mounted) return;
          const walletAddress = profile.walletAddress || "unknown";
          const sessionUser: CurrentUser = {
            id: walletAddress,
            username: `wallet_${walletAddress.slice(2, 8)}`,
            role: profile.role,
          };
          setCurrentUser(sessionUser);
        })
        .catch(() => {})
        .finally(() => {
          if (!initialized) {
            initialized = true;
            if (mounted) setIsReady(true);
          }
        });
    };

    syncSession();
    window.addEventListener("wallet-session-updated", syncSession);

    return () => {
      mounted = false;
      window.removeEventListener("wallet-session-updated", syncSession);
    };
  }, []);

  const connect = useCallback((user: User) => {
    const sessionUser: CurrentUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    setCurrentUser(sessionUser);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const setRole = useCallback(
    async (role: "fan" | "creator" | "admin") => {
      if (!currentUser) return;
      const updated = await setRoleApi(role);
      const sessionUser: CurrentUser = {
        id: currentUser.id,
        username: currentUser.username,
        role: updated.role,
      };
      setCurrentUser(sessionUser);
    },
    [currentUser]
  );

  const value: AuthContextType = {
    currentUser,
    connect,
    logout,
    setRole,
    isAuthenticated: hasSession,
    isCreator: currentUser?.role === "creator",
    isFan: currentUser?.role === "fan",
    isReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
