"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminVocabularyPage() {
  // mock
  const vocabularies = [
    { id: "t1", term: "Chiaroscuro", course: "ประวัติศาสตร์ศิลป์" },
    { id: "t2", term: "Perspective", course: "ศิลปะร่วมสมัย" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">จัดการคำศัพท์</h1>
        <Link href="/admin/vocabulary/add">
          <Button>+ เพิ่มคำศัพท์</Button>
        </Link>
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-600">
              <th>คำศัพท์</th>
              <th>รายวิชา</th>
              <th className="text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {vocabularies.map((v) => (
              <tr key={v.id} className="border-t">
                <td>{v.term}</td>
                <td>{v.course}</td>
                <td className="text-right">
                  <Link href={`/admin/vocabulary/${v.id}/edit`}>
                    <Button size="sm">แก้ไข</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
