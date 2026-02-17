"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api";

type UserRole = "ADMIN" | "LECTURER" | "INTERPRETER" | "STUDENT";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export default function ManageUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔒 ป้องกัน: ให้เฉพาะ ADMIN เข้าได้
  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      router.replace("/");
      return;
    }

    fetchUsers();
  }, []);

  // mock fetch (เดี๋ยวเปลี่ยนเป็น API จริง)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await usersApi.updateRole(userId, newRole);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      alert("เปลี่ยน role ไม่สำเร็จ");
      console.error(err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    return (
      user.email.toLowerCase().includes(keyword) ||
      (user.name?.toLowerCase().includes(keyword) ?? false)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">จัดการผู้ใช้ (เปลี่ยน Role)</h1>
      <input
        type="text"
        placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border rounded-lg px-4 py-2"
      />

      <table className="w-full border rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ชื่อ</th>

            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-3">{user.name || "-"}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3 font-semibold">{user.role}</td>
              <td className="p-3">
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleChangeRole(user.id, e.target.value as UserRole)
                  }
                  className="border rounded-lg px-3 py-1"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="LECTURER">LECTURER</option>
                  <option value="INTERPRETER">INTERPRETER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
