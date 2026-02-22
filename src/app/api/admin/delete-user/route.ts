import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit";

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await req.json();
        if (!userId) {
            return NextResponse.json({ ok: false, message: "userId is required" }, { status: 400 });
        }

        const token = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
        }

        const { data: { user: callerAuthUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token);
        if (tokenError || !callerAuthUser) {
            return NextResponse.json({ ok: false, message: "Invalid token" }, { status: 401 });
        }

        const { data: callerProfile } = await supabaseAdmin
            .from("users")
            .select("id, name, role")
            .eq("id", callerAuthUser.id)
            .single();

        if (callerProfile?.role !== "ADMIN") {
            return NextResponse.json({ ok: false, message: "Permission denied" }, { status: 403 });
        }

        if (callerAuthUser.id === userId) {
            return NextResponse.json({ ok: false, message: "Cannot delete your own account" }, { status: 400 });
        }

        // Fetch target info for audit log before deletion
        const { data: targetUser } = await supabaseAdmin
            .from("users").select("id, name, email, role").eq("id", userId).single();

        // Delete from Supabase Auth (cascades to users table if FK is set)
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authDeleteError) throw authDeleteError;

        // Also delete from users table in case there's no cascade
        await supabaseAdmin.from("users").delete().eq("id", userId);

        // Write audit log
        await logAdminAction(
            { id: callerProfile.id, name: callerProfile.name, role: callerProfile.role },
            "DELETE_USER",
            "user",
            userId,
            targetUser?.name ?? targetUser?.email ?? userId,
            { email: targetUser?.email, role: targetUser?.role }
        );

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Delete User Error:", error);
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
}
