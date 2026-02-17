import { NextRequest, NextResponse } from "next/server";
import { validateCMUCode } from "@/lib/cmu-services";
import { signInWithCMUUser } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { authorizationCode } = await req.json();
    if (!authorizationCode) return NextResponse.json({ ok: false }, { status: 400 });

    // 1. ตรวจสอบ code กับมช.
    const cmuUser = await validateCMUCode(authorizationCode);
    if (!cmuUser) return NextResponse.json({ ok: false, message: "Invalid CMU Code" }, { status: 400 });

    // 2. จัดการ User ใน Supabase
    const redirectUrl = await signInWithCMUUser(cmuUser);
    
    // 3. ส่ง URL กลับไปให้หน้าเว็บ Redirect
    return NextResponse.json({ ok: true, redirectUrl });

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}