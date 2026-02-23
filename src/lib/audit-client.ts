/**
 * @file audit-client.ts
 * @description Client-side audit logging helper.
 * Designed to work for any authenticated role (ADMIN, INTERPRETER, LECTURER, etc.).
 * Sends a POST request to `/api/log-action` with the current user's Bearer token;
 * the server route reads the actor's role from the database to ensure accuracy.
 *
 * Audit logging is non-blocking: this function silently swallows all errors so
 * it can never interfere with the primary user-facing action.
 */

import { createClient } from "@/lib/supabase";

const supabase = createClient();

/**
 * Union type of all permitted audit action identifiers for client-side logging.
 * Covers vocabulary and course lifecycle events.
 */
export type ClientAuditAction =
    | "ADD_VOCAB"
    | "EDIT_VOCAB"
    | "DELETE_VOCAB"
    | "ADD_COURSE"
    | "EDIT_COURSE"
    | "DELETE_COURSE"
    | "DELETE_MEDIA"
    | "ASSIGN_MEDIA";

/**
 * Sends an audit log entry to the server via the `/api/log-action` endpoint.
 * The server resolves the actor's identity and role from the provided Bearer token.
 *
 * This function is intentionally fire-and-forget: if the user is not logged in
 * or the request fails for any reason, the error is silently ignored so that
 * audit logging never disrupts the main user action.
 *
 * @param {ClientAuditAction} action - The action type being logged (e.g., 'ADD_VOCAB').
 * @param {string} entityType - The category of entity being acted upon (e.g., 'vocabulary', 'course').
 * @param {string} entityId - The UUID of the entity being acted upon.
 * @param {string} entityName - A human-readable identifier for the entity.
 * @param {Record<string, unknown>} [details] - Optional metadata to include in the log entry.
 * @returns {Promise<void>}
 *
 * @example
 * await logAction('ADD_VOCAB', 'vocabulary', vocab.id, vocab.term_thai, { course: courseName });
 */
export async function logAction(
    action: ClientAuditAction,
    entityType: string,
    entityId: string,
    entityName: string,
    details?: Record<string, unknown>
) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return; // Not logged in - skip silently

        await fetch("/api/log-action", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action, entity_type: entityType, entity_id: entityId, entity_name: entityName, details }),
        });
    } catch {
        // Audit logging must never crash the main action
    }
}
