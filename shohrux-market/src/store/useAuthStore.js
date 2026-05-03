import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [],

      register: (userData) => {
        const { users } = get();
        const existing = users.find(
          (u) => u.email === userData.email || u.phone === userData.phone
        );
        if (existing) {
          return { success: false, error: "User already exists" };
        }
        const newUser = {
          id: Date.now(),
          ...userData,
          orders: [],
          addresses: [],
          createdAt: new Date().toISOString(),
        };
        set({ users: [...users, newUser] });
        return { success: true };
      },

      login: (emailOrPhone, password) => {
        const { users } = get();
        const user = users.find(
          (u) =>
            (u.email === emailOrPhone || u.phone === emailOrPhone) &&
            u.password === password
        );
        if (user) {
          set({ user, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: "Invalid credentials" };
      },

      googleLogin: (googleData) => {
        const { users } = get();
        let user = users.find((u) => u.email === googleData.email);
        if (!user) {
          user = {
            id: Date.now(),
            full_name: googleData.name,
            email: googleData.email,
            phone: "",
            password: "",
            googleId: googleData.id,
            orders: [],
            addresses: [],
            createdAt: new Date().toISOString(),
          };
          set({ users: [...users, user] });
        }
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (updatedData) => {
        const { user, users } = get();
        const updatedUser = { ...user, ...updatedData };
        const updatedUsers = users.map((u) =>
          u.id === user.id ? updatedUser : u
        );
        set({ user: updatedUser, users: updatedUsers });
        return { success: true };
      },

      changePassword: (oldPassword, newPassword) => {
        const { user, users } = get();
        if (user.password !== oldPassword) {
          return { success: false, error: "Old password is incorrect" };
        }
        const updatedUser = { ...user, password: newPassword };
        const updatedUsers = users.map((u) =>
          u.id === user.id ? updatedUser : u
        );
        set({ user: updatedUser, users: updatedUsers });
        return { success: true };
      },

      deleteAccount: () => {
        const { user, users } = get();
        const updatedUsers = users.filter((u) => u.id !== user.id);
        set({ users: updatedUsers, user: null, isAuthenticated: false });
        return { success: true };
      },

      addOrder: (order) => {
        const { user, users } = get();
        if (!user) return;
        const updatedUser = {
          ...user,
          orders: [
            ...(user.orders || []),
            { ...order, id: Date.now(), date: new Date().toISOString() },
          ],
        };
        const updatedUsers = users.map((u) =>
          u.id === user.id ? updatedUser : u
        );
        set({ user: updatedUser, users: updatedUsers });
      },
    }),
    { name: "auth-storage" }
  )
);