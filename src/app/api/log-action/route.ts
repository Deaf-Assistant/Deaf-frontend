import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST /api/log-action
// Any authenticated user (ADMIN, INTERPRETER, LECTURER) can call this
// to write an entry into audit_logs.
export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token)
            return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

        const { data: { user: caller }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
        if (tokenErr || !caller)
            return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

        // Fetch the caller's real name and role from DB
        const { data: profile } = await supabaseAdmin
            .from("users")
            .select("name, role")
            .eq("id", caller.id)
            .single();

        const body = await req.json();
        const { action, entity_type, entity_id, entity_name, details } = body;

        if (!action || !entity_type)
            return NextResponse.json({ ok: false, message: "action and entity_type are required" }, { status: 400 });

        const { error } = await supabaseAdmin.from("audit_logs").insert({
            actor_id: caller.id,
            actor_name: profile?.name ?? caller.email ?? null,
            actor_role: profile?.role ?? null,
            action,
            entity_type,
            entity_id: entity_id ?? null,
            entity_name: entity_name ?? null,
            details: details ?? null,
        });

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("[log-action]", err);
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }
}
