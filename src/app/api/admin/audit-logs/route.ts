import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

        const { data: { user: caller }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
        if (tokenErr || !caller) return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

        const { data: callerProfile } = await supabaseAdmin
            .from("users").select("role").eq("id", caller.id).single();
        if (callerProfile?.role !== "ADMIN")
            return NextResponse.json({ ok: false, message: "Permission denied" }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") ?? "";
        const search = searchParams.get("search") ?? "";
        const dateFrom = searchParams.get("dateFrom") ?? "";
        const dateTo = searchParams.get("dateTo") ?? "";
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);

        let query = supabaseAdmin
            .from("audit_logs")
            .select("id, actor_name, actor_role, action, entity_type, entity_id, entity_name, details, created_at")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (action) query = query.eq("action", action);
        if (search) query = query.or(`actor_name.ilike.%${search}%,entity_name.ilike.%${search}%`);
        if (dateFrom) query = query.gte("created_at", dateFrom);
        if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ ok: true, logs: data ?? [] });
    } catch (err: any) {
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }
}
