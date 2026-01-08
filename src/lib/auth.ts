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

  // แก้ไขส่วนนี้ให้ดึงข้อมูล Object ออกมาให้ชัวร์
  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      
      try {
        const userData = JSON.parse(userStr);
        // ป้องกันกรณีข้อมูลที่เก็บไม่ใช่ Object (เช่น เก็บแค่คำว่า "authenticated")
        if (typeof userData !== 'object') return null;
        return userData;
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
      // เพิ่มบรรทัดนี้ เพื่อบอก Header ว่าข้อมูล User มาแล้วนะ!
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    const userRole = user?.user_metadata?.role || user?.role;
    if (!user) return false;
    // ตรวจสอบ Role ตามที่นายกำหนดไว้
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
      // บังคับยิง Event เพื่อให้ Header รู้ตัวและอัปเดตทันที
      window.dispatchEvent(new Event('auth-change'));
    }
  },
};