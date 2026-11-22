"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

const BusinessContext = createContext(null);

const emptyMetrics = {
  score: null,
  ratingsCount: 0,
  ratedProducts: 0,
  activeProducts: 0,
  availableProducts: 0,
  categoryScores: [],
};

function productPayload(product) {
  return {
    name: product.name,
    description: product.description,
    price: Number(product.price),
    categoryKey: product.categoryKey || product.categoryId,
    emoji: product.emoji,
    isAvailable: product.isAvailable,
    isActive: product.isActive,
  };
}

export function BusinessProvider({ children }) {
  const { token, user, ready: authReady } = useAuth();
  const { mutate } = useSWRConfig();
  const key = token && user?.role === "business" ? "/business/me" : null;
  const { data, error, isLoading } = useSWR(key, apiFetch, {
    revalidateOnFocus: false,
  });

  const refresh = useCallback(() => mutate("/business/me"), [mutate]);

  const value = useMemo(
    () => ({
      business: data?.business || null,
      products: data?.products || [],
      categories: data?.categories || [],
      metrics: data?.metrics
        ? { ...data.metrics, categoryScores: data.metrics.categories || [] }
        : emptyMetrics,
      ready: authReady && (!key || !isLoading),
      error,
      refresh,
      updateBusiness: async (changes) => {
        await apiFetch("/business/me", {
          method: "PUT",
          body: JSON.stringify(changes),
        });
        await refresh();
      },
      updateProduct: async (id, changes) => {
        await apiFetch(`/business/me/products/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...changes,
            ...(changes.categoryId && { categoryKey: changes.categoryId }),
            ...(changes.price !== undefined && { price: Number(changes.price) }),
          }),
        });
        await refresh();
      },
      addProduct: async (product) => {
        await apiFetch("/business/me/products", {
          method: "POST",
          body: JSON.stringify(productPayload(product)),
        });
        await refresh();
      },
      deleteProduct: async (id) => {
        await apiFetch(`/business/me/products/${id}`, { method: "DELETE" });
        await refresh();
      },
    }),
    [authReady, data, error, isLoading, key, refresh],
  );

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness debe usarse dentro de BusinessProvider");
  }
  return context;
}
