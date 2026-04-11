"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { IMeal } from "@/types/meal.types";
import { IProviderProfile } from "@/types/user.types";

export interface ICartItem {
  meal: IMeal;
  quantity: number;
}

type AddToCartOptions = {
  forceReplace?: boolean;
};

export type AddToCartResult = "added" | "provider_mismatch";

interface CartContextProps {
  items: ICartItem[];
  providerId: string | null;
  providerInfo: IProviderProfile | null;
  addToCart: (
    meal: IMeal,
    providerInfo: IProviderProfile,
    quantity?: number,
    options?: AddToCartOptions
  ) => AddToCartResult;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ICartItem[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<IProviderProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("foodhub_cart");
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        setItems(parsed.items || []);
        setProviderId(parsed.providerId || null);
        setProviderInfo(parsed.providerInfo || null);
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Sync to local storage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(
        "foodhub_cart",
        JSON.stringify({ items, providerId, providerInfo })
      );
    }
  }, [items, providerId, providerInfo, isInitialized]);

  const addToCart = (
    meal: IMeal,
    updatedProviderInfo: IProviderProfile,
    quantity = 1,
    options?: AddToCartOptions
  ): AddToCartResult => {
    if (providerId && providerId !== updatedProviderInfo.id) {
      if (!options?.forceReplace) {
        return "provider_mismatch";
      }

      setItems([]);
    }

    setProviderId(updatedProviderInfo.id);
    setProviderInfo(updatedProviderInfo);

    setItems((prev) => {
      const existing = prev.find((item) => item.meal.id === meal.id);
      if (existing) {
        return prev.map((item) =>
          item.meal.id === meal.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { meal, quantity }];
    });

    return "added";
  };

  const removeFromCart = (mealId: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.meal.id !== mealId);
      if (updated.length === 0) {
        setProviderId(null);
        setProviderInfo(null);
      }
      return updated;
    });
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.meal.id === mealId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setProviderId(null);
    setProviderInfo(null);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.meal.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        providerId,
        providerInfo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};