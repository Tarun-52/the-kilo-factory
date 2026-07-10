import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppView =
  | "home"
  | "checkout"
  | "order-confirmation"
  | "order-tracking"
  | "order-history";

export interface CartItem {
  variantId: string;
  itemId: string;
  itemName: string;
  unit: string;
  price: number;
  qty: number;
  vegFlag: boolean;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
}

export interface AppState {
  // -- View / Navigation -----------------------------------------------------
  view: AppView;
  selectedOrderId: string | null;
  confirmedOrderId: string | null;
  setView: (view: AppView) => void;
  goToCheckout: () => void;
  goToOrderConfirmation: (orderId: string) => void;
  goToOrderTracking: (orderId: string) => void;
  goToHome: () => void;
  goToOrderHistory: () => void;

  // -- Cart ------------------------------------------------------------------
  cartItems: CartItem[];
  couponCode: string;
  couponDiscount: number;
  deliveryFee: number;
  deliveryPincode: string;
  addToCart: (
    variantId: string,
    itemId: string,
    itemName: string,
    unit: string,
    price: number,
    vegFlag: boolean,
  ) => void;
  removeFromCart: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartCount: () => number;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  setDeliveryFee: (fee: number) => void;
  setDeliveryPincode: (pincode: string) => void;

  // -- Auth ------------------------------------------------------------------
  user: User | null;
  isAdmin: boolean;
  setUser: (user: User, isAdmin?: boolean) => void;
  logout: () => void;

  // -- UI --------------------------------------------------------------------
  searchQuery: string;
  vegOnly: boolean;
  activeCategory: string;
  itemDetailOpen: boolean;
  selectedItem: any;
  cartOpen: boolean;
  setSearchQuery: (q: string) => void;
  toggleVegOnly: () => void;
  setActiveCategory: (cat: string) => void;
  openItemDetail: (item: any) => void;
  closeItemDetail: () => void;
  setCartOpen: (open: boolean) => void;

  // -- Menu Data Cache -------------------------------------------------------
  categories: any[];
  items: any[];
  menuLoaded: boolean;
  setMenuData: (categories: any[], items: any[]) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ======================== View / Navigation ============================

      view: "home" as AppView,
      selectedOrderId: null,
      confirmedOrderId: null,

      setView: (view) => set({ view }),

      goToCheckout: () =>
        set({ view: "checkout", selectedOrderId: null, confirmedOrderId: null }),

      goToOrderConfirmation: (orderId) =>
        set({ view: "order-confirmation", confirmedOrderId: orderId, selectedOrderId: null }),

      goToOrderTracking: (orderId) =>
        set({ view: "order-tracking", selectedOrderId: orderId, confirmedOrderId: null }),

      goToHome: () =>
        set({ view: "home", selectedOrderId: null, confirmedOrderId: null }),

      goToOrderHistory: () =>
        set({ view: "order-history", selectedOrderId: null, confirmedOrderId: null }),

      // ======================== Cart =========================================

      cartItems: [] as CartItem[],
      couponCode: "",
      couponDiscount: 0,
      deliveryFee: 0,
      deliveryPincode: "",

      addToCart: (variantId, itemId, itemName, unit, price, vegFlag) =>
        set((state) => {
          const existing = state.cartItems.find((i) => i.variantId === variantId);
          if (existing) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.variantId === variantId ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }
          return {
            cartItems: [
              ...state.cartItems,
              { variantId, itemId, itemName, unit, price, qty: 1, vegFlag },
            ],
          };
        }),

      removeFromCart: (variantId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.variantId !== variantId),
        })),

      updateQty: (variantId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return {
              cartItems: state.cartItems.filter((i) => i.variantId !== variantId),
            };
          }
          return {
            cartItems: state.cartItems.map((i) =>
              i.variantId === variantId ? { ...i, qty } : i,
            ),
          };
        }),

      clearCart: () =>
        set({
          cartItems: [],
          couponCode: "",
          couponDiscount: 0,
          deliveryFee: 0,
          deliveryPincode: "",
        }),

      getCartSubtotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      },

      getCartCount: () => {
        const { cartItems } = get();
        return cartItems.reduce((sum, item) => sum + item.qty, 0);
      },

      setCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),

      clearCoupon: () => set({ couponCode: "", couponDiscount: 0 }),

      setDeliveryFee: (fee) => set({ deliveryFee: fee }),

      setDeliveryPincode: (pincode) => set({ deliveryPincode: pincode }),

      // ======================== Auth =========================================

      user: null,
      isAdmin: false,

      setUser: (user, isAdmin = false) => set({ user, isAdmin }),

      logout: () => set({ user: null, isAdmin: false }),

      // ======================== UI ===========================================

      searchQuery: "",
      vegOnly: false,
      activeCategory: "all",
      itemDetailOpen: false,
      selectedItem: null,
      cartOpen: false,

      setSearchQuery: (q) => set({ searchQuery: q }),

      toggleVegOnly: () => set((state) => ({ vegOnly: !state.vegOnly })),

      setActiveCategory: (cat) => set({ activeCategory: cat }),

      openItemDetail: (item) => set({ itemDetailOpen: true, selectedItem: item }),

      closeItemDetail: () => set({ itemDetailOpen: false, selectedItem: null }),

      setCartOpen: (open) => set({ cartOpen: open }),

      // ======================== Menu Data Cache ==============================

      categories: [],
      items: [],
      menuLoaded: false,

      setMenuData: (categories, items) =>
        set({ categories, items, menuLoaded: true }),
    }),
    {
      name: "dawat-cart-storage",
      /**
       * Only persist cart-related state to localStorage.
       * Everything else resets on page reload.
       */
      partialize: (state) => ({
        cartItems: state.cartItems,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        deliveryFee: state.deliveryFee,
        deliveryPincode: state.deliveryPincode,
      }),
    },
  ),
);