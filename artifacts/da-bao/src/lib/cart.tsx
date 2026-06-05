import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string; // unique ID for cart item to handle same menu item added multiple times
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("da-bao-cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("da-bao-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "id" | "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, id: crypto.randomUUID(), quantity }];
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
