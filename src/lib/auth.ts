// src/lib/auth.ts
import { User } from "@/types";

export const auth = {
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      
      try {
        const userData = JSON.parse(userStr);
        if (typeof userData !== 'object') return null;
        return userData as User;
      } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
      }
    }
    return null;
  },

  setUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    if (!user) return false;

    // --- แก้ไขจุดที่ Error ---
    // ใช้ user.role โดยตรง (ลบ user_metadata ออก)
    const userRole = user.role;
    
    return (
      userRole === "ADMIN" ||
      userRole === "INTERPRETER" ||
      userRole === "LECTURER"
    );
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event('auth-change'));
    }
  },
};