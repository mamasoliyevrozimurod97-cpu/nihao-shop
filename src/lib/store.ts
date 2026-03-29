import { create } from 'zustand';
import { initialProducts, Product } from './data';
import { Language } from './translations';

interface AppState {
  lang: Language;
  setLang: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  cart: (Product & { qty: number })[];
  addToCart: (product: Product) => void;
  updateQty: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  user: any;
  setUser: (user: any) => void;
  // Delivery settings
  deliveryConfig: { nearbyPrice: number, farPrice: number, freeThreshold: number };
  setDeliveryConfig: (config: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lang: 'uz',
  setLang: (lang) => set({ lang }),
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),
  products: [],
  setProducts: (items: Product[]) => set({ products: items }),
  cart: [],
  addToCart: (product) => set((state) => {
    const ex = state.cart.find(i => i.id === product.id);
    if (ex) {
      return { cart: state.cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
    }
    return { cart: [...state.cart, { ...product, qty: 1 }] };
  }),
  updateQty: (id, delta) => set((state) => ({
    cart: state.cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  })),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(i => i.id !== id)
  })),
  clearCart: () => set({ cart: [] }),
  wishlist: [],
  toggleWishlist: (product) => set((state) => {
    const exists = state.wishlist.find(i => i.id === product.id);
    if (exists) {
      return { wishlist: state.wishlist.filter(i => i.id !== product.id) };
    }
    return { wishlist: [...state.wishlist, product] };
  }),
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  checkoutOpen: false,
  setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen }),
  activePage: 'home',
  setActivePage: (activePage) => set({ activePage }),
  authOpen: false,
  setAuthOpen: (authOpen) => set({ authOpen }),
  user: null,
  setUser: (user) => set({ user }),
  deliveryConfig: { nearbyPrice: 50000, farPrice: 100000, freeThreshold: 1000000 },
  setDeliveryConfig: (deliveryConfig) => set({ deliveryConfig }),
}));
