"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import type { UserRole } from "@/types";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at?: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700",
  LECTURER: "bg-blue-100 text-blue-700",
  INTERPRETER: "bg-purple-100 text-purple-700",
  STUDENT: "bg-green-100 text-green-700",
  MEMBER: "bg-orange-100 text-orange-700",
};

export default function ManageUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = auth.getUser();

  // 🔒 Admin-only guard
  useEffect(() => {
    if (!currentUser || currentUser.role !== "ADMIN") {
      router.replace("/");
      return;
    }
    fetchUsers();
  }, []);

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
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err?.message ?? "เปลี่ยน role ไม่สำเร็จ");
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersApi.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.message ?? "ลบผู้ใช้ไม่สำเร็จ");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    const rows = filteredUsers.map((u) => ({
      ชื่อ: u.name ?? '-',
      Email: u.email,
      Role: u.role,
      วันที่สมัคร: u.created_at
        ? new Date(u.created_at).toLocaleDateString('th-TH')
        : '-',
    }));
    const filename = `users_${new Date().toISOString().slice(0, 10)}`;
    if (format === 'excel') exportToExcel(rows, filename, 'ผู้ใช้');
    else exportToCSV(rows, filename);
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      user.email.toLowerCase().includes(keyword) ||
      (user.name?.toLowerCase().includes(keyword) ?? false);
    const matchRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Stats
  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">จัดการผู้ใช้</h1>
            <p className="text-gray-500 mb-6 text-sm">
              ทั้งหมด {users.length} คน · เปลี่ยน Role หรือลบบัญชีผู้ใช้ได้จากที่นี่
            </p>
          </div>
          {users.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                ดาวน์โหลด Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition border"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                ดาวน์โหลด CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["ADMIN", "LECTURER", "INTERPRETER", "STUDENT", "MEMBER"] as UserRole[]).map(
          (role) => (
            <button
              key={role}
              onClick={() =>
                setRoleFilter((prev) => (prev === role ? "ALL" : role))
              }
              className={`rounded-xl p-4 text-left border-2 transition-all ${roleFilter === role
                ? "border-indigo-500 bg-indigo-50"
                : "border-transparent bg-white shadow-sm hover:shadow-md"
                }`}
            >
              <p className="text-xs text-gray-500 mb-1">{role}</p>
              <p className="text-2xl font-bold">{roleCounts[role] ?? 0}</p>
            </button>
          )
        )}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1 min-w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        {roleFilter !== "ALL" && (
          <button
            onClick={() => setRoleFilter("ALL")}
            className="text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            ล้างตัวกรอง ✕
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-600">ชื่อ</th>
                <th className="p-3 text-left font-semibold text-gray-600">Email</th>
                <th className="p-3 text-left font-semibold text-gray-600">Role ปัจจุบัน</th>
                <th className="p-3 text-left font-semibold text-gray-600">เปลี่ยน Role</th>
                <th className="p-3 text-left font-semibold text-gray-600">ลบ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    ไม่พบผู้ใช้
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr
                      key={user.id}
                      className={`border-t hover:bg-gray-50 transition-colors ${isSelf ? "bg-yellow-50" : ""
                        }`}
                    >
                      <td className="p-3">
                        {user.name || "-"}
                        {isSelf && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-700 rounded px-1">
                            ฉัน
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-500">{user.email}</td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[user.role]
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          disabled={isSelf}
                          onChange={(e) =>
                            handleChangeRole(user.id, e.target.value as UserRole)
                          }
                          className="border rounded-lg px-2 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="MEMBER">MEMBER</option>
                          <option value="LECTURER">LECTURER</option>
                          <option value="INTERPRETER">INTERPRETER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <button
                          disabled={isSelf}
                          onClick={() => setDeleteTarget(user)}
                          className="text-sm px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold mb-2 text-red-600">⚠️ ยืนยันการลบผู้ใช้</h2>
            <p className="text-gray-600 text-sm mb-1">
              คุณต้องการลบบัญชีของ
            </p>
            <p className="font-semibold mb-1">{deleteTarget.name || "-"}</p>
            <p className="text-gray-500 text-sm mb-4">{deleteTarget.email}</p>
            <p className="text-xs text-red-500 mb-6">
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
