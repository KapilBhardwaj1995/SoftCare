import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Product, CartItem, Order, User, Coupon, Notification, OrderStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_USERS, INITIAL_NOTIFICATIONS } from './data';

interface StoreContextType {
  products: Product[];
  setProducts: (p: Product[]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  cart: CartItem[];
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  orders: Order[];
  placeOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  users: User[];
  registerUser: (u: Omit<User, 'id'>) => User;
  currentUser: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;

  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;

  notifications: Notification[];
  markNotifRead: (id: string) => void;
  addNotification: (n: Notification) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const value = useMemo<StoreContextType>(
    () => ({
      products,
      setProducts,
      addProduct: (p) => setProducts((prev) => [p, ...prev]),
      updateProduct: (id, patch) =>
        setProducts((prev) => prev.map((pr) => (pr.id === id ? { ...pr, ...patch } : pr))),
      deleteProduct: (id) => setProducts((prev) => prev.filter((p) => p.id !== id)),

      cart,
      addToCart: (productId, qty = 1) =>
        setCart((prev) => {
          const ex = prev.find((c) => c.productId === productId);
          if (ex) return prev.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + qty } : c));
          return [...prev, { productId, quantity: qty }];
        }),
      removeFromCart: (productId) => setCart((prev) => prev.filter((c) => c.productId !== productId)),
      updateCartQty: (productId, qty) =>
        setCart((prev) =>
          prev
            .map((c) => (c.productId === productId ? { ...c, quantity: Math.max(1, qty) } : c))
            .filter((c) => c.quantity > 0)
        ),
      clearCart: () => setCart([]),

      orders,
      placeOrder: (o) => setOrders((prev) => [o, ...prev]),
      updateOrderStatus: (id, status) =>
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))),

      users,
      registerUser: (u) => {
        const newUser = { ...u, id: 'u' + (users.length + 10) };
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        return newUser;
      },
      currentUser,
      login: (email, password) => {
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (found) setCurrentUser(found);
        return found ?? null;
      },
      logout: () => setCurrentUser(null),

      coupons,
      addCoupon: (c) => setCoupons((prev) => [...prev.filter((x) => x.code !== c.code), c]),
      toggleCoupon: (code) =>
        setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))),
      deleteCoupon: (code) => setCoupons((prev) => prev.filter((c) => c.code !== code)),

      notifications,
      markNotifRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      addNotification: (n) => setNotifications((prev) => [n, ...prev]),
    }),
    [products, cart, orders, users, currentUser, coupons, notifications]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
