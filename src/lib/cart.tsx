import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CartLine = { product_id: number; product_code: string; name: string; unit_price: number; quantity: number };

type Cart = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  boxCount: number;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const value = useMemo<Cart>(
    () => ({
      lines,
      add: (line) =>
        setLines((ls) => {
          const existing = ls.find((l) => l.product_id === line.product_id);
          if (!existing) return [...ls, line];
          return ls.map((l) => (l.product_id === line.product_id ? { ...l, quantity: l.quantity + line.quantity } : l));
        }),
      setQuantity: (id, q) => setLines((ls) => ls.map((l) => (l.product_id === id ? { ...l, quantity: q } : l))),
      remove: (id) => setLines((ls) => ls.filter((l) => l.product_id !== id)),
      clear: () => setLines([]),
      boxCount: lines.reduce((s, l) => s + l.quantity, 0),
    }),
    [lines],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Cart {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
