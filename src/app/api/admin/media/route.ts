import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit";

// Helper: list all files in a bucket (recursively handles pagination)
async function listAllFiles(bucket: string) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).list("", {
    limit: 1000,
    offset: 0,
  });
  if (error) throw error;
  return (data ?? []).filter((f) => f.id); // filter out folders (no id)
}

// GET /api/admin/media — returns all storage files + which ones are orphaned
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );

    const {
      data: { user: callerUser },
      error: tokenError,
    } = await supabaseAdmin.auth.getUser(token);
    if (tokenError || !callerUser)
      return NextResponse.json(
        { ok: false, message: "Invalid token" },
        { status: 401 },
      );

    const { data: callerProfile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", callerUser.id)
      .single();
    if (callerProfile?.role !== "ADMIN")
      return NextResponse.json(
        { ok: false, message: "Permission denied" },
        { status: 403 },
      );

    // 1. List all files from both buckets
    const [imageFiles, videoFiles] = await Promise.all([
      listAllFiles("images"),
      listAllFiles("videos"),
    ]);

    // 2. Get public URL base
    // const imageBase = supabaseAdmin.storage.from("images").getPublicUrl("").data.publicUrl.replace(/\/$/, "");
    // const videoBase = supabaseAdmin.storage.from("videos").getPublicUrl("").data.publicUrl.replace(/\/$/, "");
    const publicBaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000";
    const imageBase = `${publicBaseUrl}/storage/v1/object/public/images`;
    const videoBase = `${publicBaseUrl}/storage/v1/object/public/videos`;
    // 3. Fetch all vocabulary media URLs from DB
    const { data: vocabs } = await supabaseAdmin
      .from("vocabularies")
      .select(
        "id, term_thai, image_url, image_url2, image_url3, video_url, fingerspelling_video_url",
      );

    const { data: courses } = await supabaseAdmin
      .from("courses")
      .select("id, name, image_url");

    // 4. Build a set of all referenced file paths (extract filename from URL)
    const referencedUrls = new Set<string>();
    (vocabs ?? []).forEach((v: any) => {
      [
        v.image_url,
        v.image_url2,
        v.image_url3,
        v.video_url,
        v.fingerspelling_video_url,
      ].forEach((url: string | null) => {
        if (url) referencedUrls.add(url);
      });
    });
    (courses ?? []).forEach((c: any) => {
      if (c.image_url) referencedUrls.add(c.image_url);
    });

    // 5. Tag each file as orphaned or referenced
    const buildFileEntry = (file: any, bucket: string, baseUrl: string) => {
      const publicUrl = `${baseUrl}/${file.name}`;
      const isOrphaned = !referencedUrls.has(publicUrl);

      // Find which vocabulary uses this file
      let usedBy: { id: string; term_thai: string } | null = null;
      if (!isOrphaned) {
        const match = (vocabs ?? []).find((v: any) =>
          [
            v.image_url,
            v.image_url2,
            v.image_url3,
            v.video_url,
            v.fingerspelling_video_url,
          ].includes(publicUrl),
        );
        if (match) usedBy = { id: match.id, term_thai: match.term_thai };
      }

      return {
        name: file.name,
        bucket,
        publicUrl,
        size: file.metadata?.size ?? 0,
        createdAt: file.created_at,
        isOrphaned,
        usedBy,
      };
    };

    const imageEntries = imageFiles.map((f) =>
      buildFileEntry(f, "images", imageBase),
    );
    const videoEntries = videoFiles.map((f) =>
      buildFileEntry(f, "videos", videoBase),
    );

    return NextResponse.json({
      ok: true,
      files: [...imageEntries, ...videoEntries],
    });
  } catch (error: any) {
    console.error("Media API Error:", error);
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/media — delete a file from storage
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );

    const {
      data: { user: callerUser },
      error: tokenError,
    } = await supabaseAdmin.auth.getUser(token);
    if (tokenError || !callerUser)
      return NextResponse.json(
        { ok: false, message: "Invalid token" },
        { status: 401 },
      );

    const { data: callerProfile } = await supabaseAdmin
      .from("users")
      .select("id, name, role")
      .eq("id", callerUser.id)
      .single();
    if (callerProfile?.role !== "ADMIN")
      return NextResponse.json(
        { ok: false, message: "Permission denied" },
        { status: 403 },
      );

    const { bucket, name } = await req.json();
    if (!bucket || !name)
      return NextResponse.json(
        { ok: false, message: "bucket and name are required" },
        { status: 400 },
      );

    const { error } = await supabaseAdmin.storage.from(bucket).remove([name]);
    if (error) throw error;

    // Write audit log
    await logAdminAction(
      {
        id: callerProfile.id,
        name: callerProfile.name,
        role: callerProfile.role,
      },
      "DELETE_MEDIA",
      "media_file",
      `${bucket}/${name}`,
      name,
      { bucket },
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Media Delete Error:", error);
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 },
    );
  }
}
