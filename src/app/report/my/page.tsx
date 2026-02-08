"use client";

import { useEffect, useState } from "react";
import { reportsApi } from "@/lib/api";
import { auth } from "@/lib/auth";
import Loading from "@/components/ui/Loading";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = auth.getUser();
      if (!user) return;

      const data = await reportsApi.getMine(user.id);
      setReports(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-bold mb-6">
            ประวัติการรายงานปัญหา
          </h1>

          {reports.length === 0 ? (
            <p className="text-gray-500">คุณยังไม่เคยรายงานปัญหา</p>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {r.vocabularies?.term_thai || "-"}
                        {r.vocabularies?.term_english &&
                          ` (${r.vocabularies.term_english})`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(r.reported_at).toLocaleDateString("th-TH")}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : r.status === "RESOLVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.status === "PENDING"
                        ? "รอตรวจสอบ"
                        : r.status === "RESOLVED"
                        ? "แก้ไขแล้ว"
                        : "ปฏิเสธ"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-700">
                    <strong>ประเภท:</strong> {r.problem_type}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
