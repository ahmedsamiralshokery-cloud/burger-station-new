import { create } from 'zustand';
import { DEFAULT_MENU, MenuData, MenuItem } from '../data/menuData';
import { CONFIG } from '../utils/format';

export interface CartEntry { k: string; qty: number; }
export interface CustomerDetails { name: string; phone: string; addr: string; }
export interface ResolvedCartItem { k: string; qty: number; name: string; price: number; emoji: string; img: string; }

const readStorage = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};
const writeStorage = (key: string, val: unknown): boolean => {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
};

interface AppState {
  menu: MenuData;
  cart: CartEntry[];
  customer: CustomerDetails;
  isCartOpen: boolean;
  isAdminOpen: boolean;
  toastMsg: string | null;
  bumpCount: boolean;
  setCartOpen: (open: boolean) => void;
  setAdminOpen: (open: boolean) => void;
  showToast: (msg: string, ms?: number) => void;
  addToCart: (k: string) => void;
  updateCartQty: (k: string, delta: number) => void;
  removeFromCart: (k: string) => void;
  setCustomer: (details: Partial<CustomerDetails>) => void;
  setMenu: (newMenu: MenuData) => boolean;
  resetMenu: () => void;
  lookupItem: (k: string) => Omit<ResolvedCartItem, 'k' | 'qty'> | null;
}

let toastTimer: ReturnType<typeof setTimeout>;
const initialMenu = (() => {
  const saved = readStorage<MenuData | null>(CONFIG.menuKey, null);
  if (!saved || !Array.isArray(saved.items) || !Array.isArray(saved.categories)) return structuredClone(DEFAULT_MENU);
  return saved;
})();

export const useStore = create<AppState>((set, get) => ({
  menu: initialMenu,
  cart: readStorage<CartEntry[]>(CONFIG.cartKey, []),
  customer: readStorage<CustomerDetails>(CONFIG.custKey, { name: '', phone: '', addr: '' }),
  isCartOpen: false,
  isAdminOpen: window.location.hash === '#admin',
  toastMsg: null,
  bumpCount: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  setAdminOpen: (open) => {
    if (!open && window.location.hash === '#admin') history.replaceState(null, '', window.location.pathname + window.location.search);
    set({ isAdminOpen: open });
  },
  showToast: (msg, ms = 1600) => {
    clearTimeout(toastTimer);
    set({ toastMsg: msg });
    toastTimer = setTimeout(() => set({ toastMsg: null }), ms);
  },
  lookupItem: (k: string) => {
    const [id, sz] = k.split('|');
    const { menu } = get();
    const it: MenuItem | undefined = menu.items.find((i) => i.id === id);
    if (!it) return null;
    const cat = menu.categories.find((c) => c.id === it.cat);
    const isDouble = sz === 'd' && it.p2 != null;
    return {
      name: it.ar + (cat?.sized ? (isDouble ? ' (دبل)' : ' (سنجل)') : ''),
      price: Number(isDouble ? it.p2 : it.p1),
      emoji: cat?.emoji || '🍽️',
      img: it.img,
    };
  },
  addToCart: (k) => {
    const { cart, lookupItem, showToast } = get();
    const validCart = cart.filter((c) => lookupItem(c.k) !== null);
    const existing = validCart.find((x) => x.k === k);
    const nextCart = existing ? validCart.map((x) => (x.k === k ? { ...x, qty: x.qty + 1 } : x)) : [...validCart, { k, qty: 1 }];
    writeStorage(CONFIG.cartKey, nextCart);
    set({ cart: nextCart, bumpCount: true });
    setTimeout(() => set({ bumpCount: false }), 400);
    showToast('تمت الإضافة للسلة ✓');
  },
  updateCartQty: (k, delta) => {
    const { cart, lookupItem } = get();
    const nextCart = cart.filter((c) => lookupItem(c.k) !== null).map((c) => (c.k === k ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty >= 1);
    writeStorage(CONFIG.cartKey, nextCart);
    set({ cart: nextCart });
  },
  removeFromCart: (k) => {
    const nextCart = get().cart.filter((c) => c.k !== k);
    writeStorage(CONFIG.cartKey, nextCart);
    set({ cart: nextCart });
  },
  setCustomer: (details) => {
    const nextCust = { ...get().customer, ...details };
    writeStorage(CONFIG.custKey, nextCust);
    set({ customer: nextCust });
  },
  setMenu: (newMenu) => {
    if (!writeStorage(CONFIG.menuKey, newMenu)) return false;
    set({ menu: structuredClone(newMenu) });
    return true;
  },
  resetMenu: () => {
    try { localStorage.removeItem(CONFIG.menuKey); } catch {}
    set({ menu: structuredClone(DEFAULT_MENU) });
  },
}));
