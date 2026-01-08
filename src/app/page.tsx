"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage"; // หรือโค้ดเดิมของคุณ

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   router.replace("/login");
    // }
  }, [router]);

  return <LandingPage />;
}
