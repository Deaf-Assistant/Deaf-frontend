/**
 * @file audit.ts
 * @description Server-side audit logging helper.
 * Uses the Supabase admin client to write entries directly into the `audit_logs` table,
 * bypassing Row Level Security (RLS). This module is intended for use in
 * Next.js API routes and server actions only.
 *
 * Audit logging is designed to be non-blocking: failures are caught internally
 * and will never cause the main operation to throw.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Union type of all permitted audit action identifiers for server-side logging.
 */
export type AuditAction =
    | "DELETE_USER"
    | "CHANGE_ROLE"
    | "DELETE_MEDIA"
    | "DELETE_VOCAB"
    | "ADD_VOCAB"
    | "EDIT_VOCAB";

/**
 * The entity type that the audit log entry is associated with.
 */
export type AuditEntityType = "user" | "vocabulary" | "media_file";

/**
 * Represents the user performing an audited action.
 */
export interface AuditActor {
    /** The UUID of the acting user. */
    id: string;
    /** The display name of the acting user. */
    name?: string | null;
    /** The role of the acting user (e.g., 'ADMIN', 'LECTURER'). */
    role?: string | null;
}

/**
 * Records an administrative or privileged action into the `audit_logs` table.
 * Uses the admin Supabase client to bypass RLS policies.
 *
 * This function is intentionally fire-and-forget: errors are caught and logged
 * to the console, but are never re-thrown, so audit failures cannot disrupt
 * the primary user-facing operation.
 *
 * @param {AuditActor} actor - The user performing the action.
 * @param {AuditAction} action - The action type being recorded.
 * @param {AuditEntityType} entityType - The category of entity being acted upon.
 * @param {string} entityId - The UUID of the entity being acted upon.
 * @param {string} entityName - A human-readable name for the entity (for display in the audit log UI).
 * @param {Record<string, unknown>} [details] - Optional additional metadata about the action.
 * @returns {Promise<void>}
 *
 * @example
 * await logAdminAction(
 *   { id: session.user.id, name: 'Alice', role: 'ADMIN' },
 *   'DELETE_USER',
 *   'user',
 *   targetUserId,
 *   targetUserName
 * );
 */
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
