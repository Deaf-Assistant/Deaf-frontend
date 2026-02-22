import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
    try {
        // Auth check
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

        const { data: { user: caller }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
        if (tokenErr || !caller) return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

        const { data: callerProfile } = await supabaseAdmin
            .from("users").select("role").eq("id", caller.id).single();
        if (callerProfile?.role !== "ADMIN")
            return NextResponse.json({ ok: false, message: "Permission denied" }, { status: 403 });

        // 1. All users
        const { data: users } = await supabaseAdmin
            .from("users")
            .select("id, name, email, role, created_at")
            .order("created_at", { ascending: false });

        // 2. Favorites per user (count)
        const { data: favorites } = await supabaseAdmin
            .from("favoriteWord")
            .select("user_id, vocabulary_id, created_at, vocabularies(course_id, courses(name))");

        // 3. Pinned courses per user (count)
        const { data: pins } = await supabaseAdmin
            .from("user_pinned_courses")
            .select("user_id, course_id, created_at, courses(name)");

        // 4. Reports filed per user
        const { data: reports } = await supabaseAdmin
            .from("reports")
            .select("reported_by, status");

        // 5. Aggregate per user
        const favMap = new Map<string, { count: number; courseSet: Set<string>; lastAt: string | null }>();
        (favorites ?? []).forEach((f: any) => {
            if (!favMap.has(f.user_id)) favMap.set(f.user_id, { count: 0, courseSet: new Set(), lastAt: null });
            const entry = favMap.get(f.user_id)!;
            entry.count++;
            if (f.vocabularies?.course_id) entry.courseSet.add(f.vocabularies.course_id);
            if (!entry.lastAt || f.created_at > entry.lastAt) entry.lastAt = f.created_at;
        });

        const pinMap = new Map<string, { count: number; lastAt: string | null }>();
        (pins ?? []).forEach((p: any) => {
            if (!pinMap.has(p.user_id)) pinMap.set(p.user_id, { count: 0, lastAt: null });
            const entry = pinMap.get(p.user_id)!;
            entry.count++;
            if (!entry.lastAt || p.created_at > entry.lastAt) entry.lastAt = p.created_at;
        });

        const reportMap = new Map<string, { total: number; pending: number }>();
        (reports ?? []).forEach((r: any) => {
            if (!reportMap.has(r.reported_by)) reportMap.set(r.reported_by, { total: 0, pending: 0 });
            const entry = reportMap.get(r.reported_by)!;
            entry.total++;
            if (r.status === "PENDING") entry.pending++;
        });

        // 6. Build result
        const stats = (users ?? []).map((u: any) => {
            const fav = favMap.get(u.id) ?? { count: 0, courseSet: new Set(), lastAt: null };
            const pin = pinMap.get(u.id) ?? { count: 0, lastAt: null };
            const rep = reportMap.get(u.id) ?? { total: 0, pending: 0 };

            // Last active = latest event across all activities
            const dates = [fav.lastAt, pin.lastAt].filter(Boolean) as string[];
            const lastActive = dates.length > 0 ? dates.sort().reverse()[0] : null;

            return {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                joinedAt: u.created_at,
                favoritesCount: fav.count,
                coursesEngaged: fav.courseSet.size,
                pinnedCourses: pin.count,
                reportsFiled: rep.total,
                pendingReports: rep.pending,
                lastActive,
            };
        });

        return NextResponse.json({ ok: true, stats });
    } catch (err: any) {
        console.error("Stats API error:", err);
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }
}
