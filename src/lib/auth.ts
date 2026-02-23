import { User } from "@/types";

/**
 * Client-side authentication utility for managing user sessions via localStorage.
 * Provides helpers for storing/retrieving the auth token and user profile,
 * checking authentication state, and performing logout.
 *
 * NOTE: All methods check for `window` availability to ensure safe execution
 * in server-side rendering (SSR) contexts (e.g., Next.js).
 */
export const auth = {
  /**
   * Stores the authentication token in localStorage.
   *
   * @param {string} token - The JWT access token to persist.
   */
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  /**
   * Retrieves the stored authentication token from localStorage.
   *
   * @returns {string | null} The stored JWT token, or null if not found or in SSR.
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  /**
   * Retrieves and parses the stored user profile from localStorage.
   * Returns null if unauthenticated, in SSR, or if the stored data is malformed.
   *
   * @returns {User | null} The parsed user object, or null on failure.
   */
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

  /**
   * Serializes and stores the user profile in localStorage.
   * Also fires an `auth-change` window event to notify other components of the update.
   *
   * @param {User} user - The user object to persist.
   */
  setUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  /**
   * Checks whether a user is currently authenticated by verifying the stored token.
   *
   * @returns {boolean} True if a token exists in localStorage, false otherwise.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Checks whether the current user has an elevated role (ADMIN, INTERPRETER, or LECTURER).
   * Used to control access to admin-side features.
   *
   * @returns {boolean} True if the user has an admin-level role, false otherwise.
   */
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

  /**
   * Clears the stored authentication token and user profile from localStorage.
   * Also fires an `auth-change` window event to notify other components of the logout.
   */
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event('auth-change'));
    }
  },
};