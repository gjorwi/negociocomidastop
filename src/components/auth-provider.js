"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  apiFetch,
  getToken,
  login as loginRequest,
  setToken,
} from "@/lib/api";

const AuthContext = createContext(null);

function subscribe(callback) {
  window.addEventListener("dondecomo:token", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("dondecomo:token", callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerToken() {
  return "";
}

export function AuthProvider({ children }) {
  const token = useSyncExternalStore(subscribe, getToken, getServerToken);
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR(
    token ? "/auth/me" : null,
    apiFetch,
    { revalidateOnFocus: false },
  );

  const login = useCallback(
    async (email, password) => {
      const payload = await loginRequest(email, password);
      setToken(payload.token);
      await mutate("/auth/me");
      return payload;
    },
    [mutate],
  );

  const logout = useCallback(() => {
    setToken("");
    mutate("/auth/me", null, { revalidate: false });
    mutate("/business/me", null, { revalidate: false });
  }, [mutate]);

  const value = useMemo(
    () => ({
      token,
      user: data?.user || null,
      business: data?.business || null,
      error,
      ready: !token || !isLoading,
      login,
      logout,
    }),
    [data, error, isLoading, login, logout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
