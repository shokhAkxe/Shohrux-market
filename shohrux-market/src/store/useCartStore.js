import { create } from "zustand";
import { persist } from "zustand/middleware"; // Xotirada saqlash uchun

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      
      // Mahsulot qo'shish logikasi
      addToCart: (product) => 
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id 
                  ? { ...item, quantity: (item.quantity || 1) + 1 } 
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),

      // Mahsulotni savatdan butunlay o'chirish
      removeFromCart: (id) => 
        set((state) => ({ 
          items: state.items.filter((item) => item.id !== id) 
        })),

      // Savatni tozalash
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "shohrux-market-storage", // LocalStorage'dagi kalit nomi
    }
  )
);