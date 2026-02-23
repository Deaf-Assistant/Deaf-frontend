import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
    try {
        // ── Auth check ──────────────────────────────────────────────
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token)
            return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

        const { data: { user: caller }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
        if (tokenErr || !caller)
            return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

        const { data: callerProfile } = await supabaseAdmin
            .from("users").select("role").eq("id", caller.id).single();
        if (!["ADMIN", "INTERPRETER", "LECTURER"].includes(callerProfile?.role ?? ""))
            return NextResponse.json({ ok: false, message: "Permission denied" }, { status: 403 });

        // ── Fetch raw data ──────────────────────────────────────────
        // 1. All courses
        const { data: courses } = await supabaseAdmin
            .from("courses")
            .select("id, code, name, description, visibility, created_at, view_count")
            .order("name");

        // 2. All chapters
        const { data: chapters } = await supabaseAdmin
            .from("chapters")
            .select("id, name, order, course_id")
            .order("order");

        // 3. All vocabularies (only the fields we need)
        const { data: vocabs } = await supabaseAdmin
            .from("vocabularies")
            .select("id, term_thai, term_english, course_id, chapter_id, view_count");

        // 4. Pins per course
        const { data: pins } = await supabaseAdmin
            .from("user_pinned_courses")
            .select("course_id");

        // 5. Favorites per vocabulary
        const { data: favorites } = await supabaseAdmin
            .from("favoriteWord")
            .select("vocabulary_id");

        // ── Build lookup maps ───────────────────────────────────────
        const pinsByCourse = new Map<string, number>();
        (pins ?? []).forEach((p: any) => {
            pinsByCourse.set(p.course_id, (pinsByCourse.get(p.course_id) ?? 0) + 1);
        });

        const favsByVocab = new Map<string, number>();
        (favorites ?? []).forEach((f: any) => {
            favsByVocab.set(f.vocabulary_id, (favsByVocab.get(f.vocabulary_id) ?? 0) + 1);
        });

        // Map vocabs to chapId → vocab[]
        const vocabsByChapter = new Map<string, any[]>();
        const vocabsByCourse = new Map<string, number>();
        (vocabs ?? []).forEach((v: any) => {
            // count by course
            vocabsByCourse.set(v.course_id, (vocabsByCourse.get(v.course_id) ?? 0) + 1);
            // group by chapter (some vocabs may have no chapter_id)
            const chKey = v.chapter_id ?? `__no_chapter__${v.course_id}`;
            if (!vocabsByChapter.has(chKey)) vocabsByChapter.set(chKey, []);
            vocabsByChapter.get(chKey)!.push({
                id: v.id,
                term_thai: v.term_thai,
                term_english: v.term_english ?? null,
                favoritesCount: favsByVocab.get(v.id) ?? 0,
                viewCount: v.view_count ?? 0,
            });
        });

        // Map chapters to course_id → chapter[]
        const chaptersByCourse = new Map<string, any[]>();
        (chapters ?? []).forEach((ch: any) => {
            if (!chaptersByCourse.has(ch.course_id)) chaptersByCourse.set(ch.course_id, []);
            const chVocabs = vocabsByChapter.get(ch.id) ?? [];
            chaptersByCourse.get(ch.course_id)!.push({
                id: ch.id,
                name: ch.name,
                order: ch.order,
                vocabCount: chVocabs.length,
                totalFavorites: chVocabs.reduce((s: number, v: any) => s + v.favoritesCount, 0),
                totalViews: chVocabs.reduce((s: number, v: any) => s + v.viewCount, 0),
                vocabs: chVocabs,
            });
        });

        // ── Assemble response ───────────────────────────────────────
        const result = (courses ?? []).map((c: any) => {
            const courseChapters = chaptersByCourse.get(c.id) ?? [];
            const vocabCount = vocabsByCourse.get(c.id) ?? 0;
            const pinnedCount = pinsByCourse.get(c.id) ?? 0;
            const totalFavorites = courseChapters.reduce(
                (s: number, ch: any) => s + ch.totalFavorites,
                0
            );
            const totalVocabViews = courseChapters.reduce(
                (s: number, ch: any) => s + ch.totalViews,
                0
            );
            return {
                id: c.id,
                code: c.code ?? "",
                name: c.name,
                description: c.description ?? "",
                visibility: c.visibility ?? "everyone",
                createdAt: c.created_at,
                pinnedCount,
                vocabCount,
                chapterCount: courseChapters.length,
                totalFavorites,
                viewCount: c.view_count ?? 0,
                totalVocabViews,
                chapters: courseChapters,
            };
        });

        return NextResponse.json({ ok: true, courses: result });
    } catch (err: any) {
        console.error("Course-stats API error:", err);
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }
}
