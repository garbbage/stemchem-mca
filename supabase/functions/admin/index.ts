import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const topicNames = [
    "Measurements", "Atomic Structure", "Periodic Table", "Chemical Bonding", "IMF",
    "States of Matter", "Chemical Equations", "Chemical Reactions", "Gas Laws",
    "Solutions", "Acids and Bases", "Thermochemistry", "General Chemistry"
];
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

function normalizeStudentId(value: unknown) {
    if (typeof value !== "string") {
        throw new Error("Enter a valid student ID.");
    }
    const studentId = value.trim().toLowerCase();
    if (!/^(?!.*\.\.)[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$/.test(studentId)) {
        throw new Error("Student IDs must be 3–32 letters, numbers, dots, underscores, or hyphens.");
    }
    return studentId;
}

function isUuid(value: unknown): value is string {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function requireAdministrator(request: Request) {
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
        throw new Error("Sign in with an administrator account.");
    }
    const identityClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: identity, error: identityError } = await identityClient.auth.getUser(token);
    if (identityError || !identity.user) {
        throw new Error("Your session is invalid or expired. Sign in again.");
    }
    const { data: profile, error } = await adminClient
        .from("profiles")
        .select("role, is_active")
        .eq("id", identity.user.id)
        .maybeSingle();
    if (error || !profile || profile.role !== "admin" || !profile.is_active) {
        throw new Error("Administrator access is required.");
    }
    return identity.user.id;
}

async function listStudents() {
    const { data: profiles, error: profileError } = await adminClient
        .from("profiles")
        .select("id, student_id, display_name, is_active, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: true });
    if (profileError) {
        throw new Error("Could not load student accounts.");
    }
    const ids = (profiles || []).map((profile) => profile.id);
    const { data: progress, error: progressError } = ids.length
        ? await adminClient.from("student_progress")
            .select("user_id, total_xp, daily_xp, daily_date, completed_topics, activity_dates")
            .in("user_id", ids)
        : { data: [], error: null };
    if (progressError) {
        throw new Error("Could not load student progress.");
    }
    const progressById = new Map((progress || []).map((row) => [row.user_id, row]));
    return (profiles || []).map((profile) => ({
        ...profile,
        progress: progressById.get(profile.id) || {
            total_xp: 0, daily_xp: 0, daily_date: null, completed_topics: [], activity_dates: []
        }
    }));
}

async function createStudent(body: Record<string, unknown>) {
    const studentId = normalizeStudentId(body.studentId);
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const password = typeof body.temporaryPassword === "string" ? body.temporaryPassword : "";
    if (displayName.length < 1 || displayName.length > 60) {
        throw new Error("Display names must contain 1–60 characters.");
    }
    if (password.length < 12 || password.length > 128) {
        throw new Error("Temporary passwords must contain 12–128 characters.");
    }
    const { data: existing, error: lookupError } = await adminClient
        .from("profiles")
        .select("id")
        .eq("student_id", studentId)
        .maybeSingle();
    if (lookupError) {
        throw new Error("Could not verify whether that student ID is available.");
    }
    if (existing) {
        throw new Error("That student ID is already assigned.");
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: `${studentId}@students.chemgame.invalid`,
        password,
        email_confirm: true,
        user_metadata: { student_id: studentId }
    });
    if (createError || !created.user) {
        throw new Error("The student account could not be created.");
    }

    const { error: profileError } = await adminClient.from("profiles").insert({
        id: created.user.id,
        student_id: studentId,
        display_name: displayName,
        role: "student",
        is_active: true
    });
    if (profileError) {
        const { error: cleanupError } = await adminClient.auth.admin.deleteUser(created.user.id);
        if (cleanupError) {
            console.error("Could not clean up an Auth user after profile creation failed.", cleanupError);
        }
        throw new Error("The account was created but its profile could not be saved. Contact the administrator.");
    }
    return { success: true };
}

async function changeStudent(body: Record<string, unknown>, action: string) {
    if (!isUuid(body.userId)) {
        throw new Error("Choose a valid student account.");
    }
    const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("id, role")
        .eq("id", body.userId)
        .maybeSingle();
    if (profileError || !profile || profile.role !== "student") {
        throw new Error("The selected student account was not found.");
    }

    if (action === "set_active") {
        if (typeof body.isActive !== "boolean") {
            throw new Error("Choose whether the student account should be active.");
        }
        const { error } = await adminClient.from("profiles")
            .update({ is_active: body.isActive }).eq("id", profile.id);
        if (error) {
            throw new Error("Could not update the account status.");
        }
        const { error: authError } = await adminClient.auth.admin.updateUserById(profile.id, {
            ban_duration: body.isActive ? "none" : "876000h"
        });
        if (authError) {
            throw new Error("The profile status changed, but Supabase Auth could not be updated. Contact the researcher.");
        }
        return { success: true };
    }

    const password = typeof body.temporaryPassword === "string" ? body.temporaryPassword : "";
    if (password.length < 12 || password.length > 128) {
        throw new Error("Temporary passwords must contain 12–128 characters.");
    }
    const { error } = await adminClient.auth.admin.updateUserById(profile.id, { password });
    if (error) {
        throw new Error("Could not reset the student password.");
    }
    return { success: true };
}

async function syncQuestionBank(body: Record<string, unknown>) {
    if (!Array.isArray(body.questions) || body.questions.length < 2 || body.questions.length > 3000) {
        throw new Error("The chemistry word bank is missing or too large to import.");
    }
    const questions = body.questions.map((item) => {
        const question = item as Record<string, unknown>;
        const topic = question.topic;
        const word = typeof question.word === "string" ? question.word.trim() : "";
        const clue = typeof question.clue === "string" ? question.clue.trim() : "";
        if (typeof topic !== "string" || !topicNames.includes(topic) ||
            word.length < 1 || word.length > 120 || clue.length < 1 || clue.length > 2000) {
            throw new Error("The word bank contains an invalid entry.");
        }
        return { topic, word, clue, active: true };
    });

    for (let offset = 0; offset < questions.length; offset += 200) {
        const { error } = await adminClient.from("question_bank")
            .upsert(questions.slice(offset, offset + 200), { onConflict: "topic,word" });
        if (error) {
            throw new Error("Could not save the game question bank.");
        }
    }
    return { success: true, imported: questions.length };
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
    if (request.method !== "POST") {
        return jsonResponse(405, { error: "Method not allowed." });
    }
    try {
        await requireAdministrator(request);
        const body = await request.json() as Record<string, unknown>;
        switch (body.action) {
            case "list_students":
                return jsonResponse(200, { students: await listStudents() });
            case "create_student":
                return jsonResponse(200, await createStudent(body));
            case "set_active":
                return jsonResponse(200, await changeStudent(body, "set_active"));
            case "reset_password":
                return jsonResponse(200, await changeStudent(body, "reset_password"));
            case "sync_questions":
                return jsonResponse(200, await syncQuestionBank(body));
            default:
                return jsonResponse(400, { error: "Unknown administrator action." });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "The administrator request failed.";
        console.error("Administrator function failed.", message);
        const status = message.includes("required") || message.includes("session") ? 403 : 400;
        return jsonResponse(status, { error: message });
    }
});
