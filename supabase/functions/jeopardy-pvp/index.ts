import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const url = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

function jsonResponse(status: number, body: Record<string, unknown>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
    if (request.method !== "POST") {
        return jsonResponse(405, { error: "Method not allowed." });
    }
    try {
        const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) {
            return jsonResponse(403, { error: "Sign in to play Jeopardy PvP." });
        }
        const identityClient = createClient(url, anonKey, { auth: { persistSession: false } });
        const { data: identity, error: identityError } = await identityClient.auth.getUser(token);
        if (identityError || !identity.user) {
            return jsonResponse(403, { error: "Your session is invalid or expired. Sign in again." });
        }

        const { data: profile, error: profileError } = await adminClient
            .from("profiles")
            .select("role, is_active")
            .eq("id", identity.user.id)
            .maybeSingle();
        if (profileError || !profile || profile.role !== "student" || !profile.is_active) {
            return jsonResponse(403, { error: "This account is not eligible for Jeopardy PvP." });
        }

        const body = await request.json() as Record<string, unknown>;
        if (typeof body.action !== "string" ||
            (body.matchId !== undefined && typeof body.matchId !== "string") ||
            (body.answer !== undefined && typeof body.answer !== "string") ||
            (body.position !== undefined &&
                (typeof body.position !== "number" || !Number.isInteger(body.position)))) {
            return jsonResponse(400, { error: "That PvP action is not valid." });
        }
        const { data, error } = await adminClient.rpc("jeopardy_pvp_action", {
            p_user_id: identity.user.id,
            p_action: body.action,
            p_payload: body
        });
        if (error || !data) {
            throw new Error(error?.message || "The PvP action could not be completed.");
        }
        return jsonResponse(200, data as Record<string, unknown>);
    } catch (error) {
        const message = error instanceof Error ? error.message : "The Jeopardy PvP request failed.";
        console.error("Jeopardy PvP function failed.", message);
        return jsonResponse(400, { error: message });
    }
});
