import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Extract the storage file path from a public URL
// e.g. "https://<project>.supabase.co/storage/v1/object/public/images/1234.jpg" → "1234.jpg"
function extractFilePath(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
        const u = new URL(url);
        // pathname looks like: /storage/v1/object/public/<bucket>/<filepath>
        const parts = u.pathname.split("/storage/v1/object/public/");
        if (parts.length < 2) return null;
        const withBucket = parts[1]; // e.g. "images/1234.jpg"
        const slashIdx = withBucket.indexOf("/");
        if (slashIdx === -1) return null;
        return withBucket.slice(slashIdx + 1); // e.g. "1234.jpg"
    } catch {
        return null;
    }
}

function getBucket(url: string): "images" | "videos" | null {
    if (url.includes("/object/public/images/")) return "images";
    if (url.includes("/object/public/videos/")) return "videos";
    return null;
}

// DELETE /api/admin/delete-vocabulary
// Body: { ids: string[] }   (one or many)
export async function DELETE(req: NextRequest) {
    try {
        // ── Auth check ────────────────────────────────────────────
        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token)
            return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

        const { data: { user: caller }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
        if (tokenErr || !caller)
            return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });

        const { data: callerProfile } = await supabaseAdmin
            .from("users").select("role").eq("id", caller.id).single();
        if (callerProfile?.role !== "ADMIN")
            return NextResponse.json({ ok: false, message: "Permission denied" }, { status: 403 });

        // ── Parse body ────────────────────────────────────────────
        const body = await req.json();
        const ids: string[] = Array.isArray(body.ids) ? body.ids : [body.id].filter(Boolean);
        if (ids.length === 0)
            return NextResponse.json({ ok: false, message: "No ids provided" }, { status: 400 });

        // ── 1. Fetch vocab records to get their media URLs ────────
        const { data: vocabs, error: fetchErr } = await supabaseAdmin
            .from("vocabularies")
            .select("id, image_url, image_url2, image_url3, video_url, fingerspelling_video_url")
            .in("id", ids);

        if (fetchErr) throw fetchErr;

        // ── 2. Collect all files to delete from storage ───────────
        const toDeleteByBucket: Record<"images" | "videos", string[]> = { images: [], videos: [] };

        (vocabs ?? []).forEach((v: any) => {
            const urls = [v.image_url, v.image_url2, v.image_url3, v.video_url, v.fingerspelling_video_url];
            urls.forEach((url: string | null) => {
                if (!url) return;
                const bucket = getBucket(url);
                const filePath = extractFilePath(url);
                if (bucket && filePath) {
                    toDeleteByBucket[bucket].push(filePath);
                }
            });
        });

        // ── 3. Delete files from storage (best-effort) ────────────
        const storageErrors: string[] = [];
        for (const bucket of ["images", "videos"] as const) {
            const paths = toDeleteByBucket[bucket];
            if (paths.length === 0) continue;
            const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
            if (error) storageErrors.push(`${bucket}: ${error.message}`);
        }

        // ── 4. Delete the vocabulary rows from the DB ─────────────
        const { error: deleteErr } = await supabaseAdmin
            .from("vocabularies")
            .delete()
            .in("id", ids);

        if (deleteErr) throw deleteErr;

        return NextResponse.json({
            ok: true,
            deleted: ids.length,
            storageWarnings: storageErrors.length > 0 ? storageErrors : undefined,
        });
    } catch (err: any) {
        console.error("Delete vocabulary error:", err);
        return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
    }
}
