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
    prices: product.prices,
    categoryKey: product.categoryKey || product.categoryId,
    emoji: product.emoji,
    image: product.image || '',
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
      limits: data?.limits || { maxProducts: 5 },
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
        const payload = await apiFetch(`/business/me/products/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...changes,
            ...(changes.categoryId && { categoryKey: changes.categoryId }),
            ...(changes.price !== undefined && { price: Number(changes.price) }),
            ...(changes.prices !== undefined && { prices: changes.prices }),
          }),
        });
        if (changes.image && !payload.product?.image) {
          throw new Error(
            "La API no guardó la imagen. Verifica que la API esté actualizada y vuelve a intentarlo.",
          );
        }
        await refresh();
      },
      addProduct: async (product) => {
        const payload = await apiFetch("/business/me/products", {
          method: "POST",
          body: JSON.stringify(productPayload(product)),
        });
        if (product.image && !payload.product?.image) {
          throw new Error(
            "La API no guardó la imagen. Verifica que la API esté actualizada y vuelve a intentarlo.",
          );
        }
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
