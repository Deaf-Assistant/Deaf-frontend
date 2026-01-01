import type { ReactNode } from "react";
import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = {
  title: "Admin | Deaf Assistant",
  description: "Admin dashboard and management pages for Deaf Assistant",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  // AdminLayout เป็น client component ที่เช็ค auth/role แล้ว redirect ให้เอง
  return <AdminLayout>{children}</AdminLayout>;
}
