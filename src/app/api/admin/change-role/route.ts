import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

        const { data: { user: caller }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
        if (tokenErr || !caller) return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

        const { data: callerProfile } = await supabaseAdmin
            .from("users").select("id, name, role").eq("id", caller.id).single();
        if (callerProfile?.role !== "ADMIN")
            return NextResponse.json({ ok: false, message: "Permission denied" }, { status: 403 });

        const { userId, newRole } = await req.json();
        if (!userId || !newRole) return NextResponse.json({ ok: false, message: "userId and newRole required" }, { status: 400 });

        // Fetch target's current role for the log
        const { data: target } = await supabaseAdmin
            .from("users").select("id, name, role").eq("id", userId).single();
        if (!target) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });

        const oldRole = target.role;

        const { error } = await supabaseAdmin
            .from("users").update({ role: newRole }).eq("id", userId);
        if (error) throw error;

        // Write audit log
        await logAdminAction(
            { id: callerProfile.id, name: callerProfile.name, role: callerProfile.role },
            "CHANGE_ROLE",
            "user",
            userId,
            target.name ?? target.id,
            { from: oldRole, to: newRole }
        );

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("change-role error:", err);
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }
}
