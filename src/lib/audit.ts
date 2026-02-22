// Shared server-side helper to write audit log entries using supabaseAdmin

import { supabaseAdmin } from "@/lib/supabase-admin";

export type AuditAction =
    | "DELETE_USER"
    | "CHANGE_ROLE"
    | "DELETE_MEDIA"
    | "DELETE_VOCAB"
    | "ADD_VOCAB"
    | "EDIT_VOCAB";

export type AuditEntityType = "user" | "vocabulary" | "media_file";

export interface AuditActor {
    id: string;
    name?: string | null;
    role?: string | null;
}

export async function logAdminAction(
    actor: AuditActor,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    entityName: string,
    details?: Record<string, unknown>
) {
    try {
        await supabaseAdmin.from("audit_logs").insert({
            actor_id: actor.id,
            actor_name: actor.name ?? null,
            actor_role: actor.role ?? null,
            action,
            entity_type: entityType,
            entity_id: entityId,
            entity_name: entityName,
            details: details ?? null,
        });
    } catch (err) {
        // Audit logging should never crash the main action
        console.error("[audit] Failed to write log:", err);
    }
}
