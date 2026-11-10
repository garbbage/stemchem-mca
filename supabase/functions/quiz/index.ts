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

function shuffle<T>(values: T[]): T[] {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swap = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
        [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
}

function isUuid(value: unknown): value is string {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function requireActiveUser(request: Request) {
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
        throw new Error("Sign in to continue.");
    }
    const identityClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: identity, error: identityError } = await identityClient.auth.getUser(token);
    if (identityError || !identity.user) {
        throw new Error("Your session is invalid or expired. Sign in again.");
    }
    const { data: profile, error } = await adminClient
        .from("profiles")
        .select("is_active")
        .eq("id", identity.user.id)
        .maybeSingle();
    if (error || !profile || !profile.is_active) {
        throw new Error("This account is not active.");
    }
    return identity.user.id;
}

async function startQuiz(userId: string, requestedTopic: unknown) {
    const topic = requestedTopic === null ? null : typeof requestedTopic === "string" ? requestedTopic : "";
    if (topic === "" || (topic !== null && !topicNames.includes(topic))) {
        throw new Error("Choose a valid chemistry unit.");
    }
    if (topic !== null) {
        const { data: progress, error: progressError } = await adminClient
            .from("student_progress")
            .select("completed_topics")
            .eq("user_id", userId)
            .single();
        if (progressError || !progress) {
            throw new Error("Could not verify unit access.");
        }
        const completed = new Set(progress.completed_topics || []);
        const firstIncomplete = topicNames.findIndex((name) => !completed.has(name));
        const latestUnlockedIndex = firstIncomplete === -1 ? topicNames.length - 1 : firstIncomplete;
        if (topicNames.indexOf(topic) > latestUnlockedIndex) {
            throw new Error("Complete the previous chemistry unit before starting this challenge.");
        }
    }
    let query = adminClient.from("question_bank")
        .select("id, topic, word, clue")
        .eq("active", true);
    if (topic) {
        query = query.eq("topic", topic);
    }
    const { data: bank, error } = await query;
    if (error || !bank || bank.length < 2) {
        throw new Error("This game is not ready yet. Ask the researcher to initialize the question bank.");
    }
    const selected = shuffle(bank).slice(0, Math.min(5, bank.length));
    const questions = selected.map((question) => {
        const distractors = shuffle(bank.filter((entry) => entry.id !== question.id && entry.word !== question.word))
            .slice(0, 3)
            .map((entry) => entry.word);
        return {
            id: question.id,
            topic: question.topic,
            word: question.word,
            clue: question.clue,
            choices: shuffle([question.word, ...distractors])
        };
    });
    const { data: session, error: sessionError } = await adminClient
        .from("quiz_sessions")
        .insert({ user_id: userId, topic, question_ids: selected.map((question) => question.id) })
        .select("id")
        .single();
    if (sessionError || !session) {
        throw new Error("Could not start the quiz. Please try again.");
    }
    return {
        sessionId: session.id,
        questions: questions.map(({ word: _answer, ...question }) => question)
    };
}

async function answerQuiz(userId: string, body: Record<string, unknown>) {
    if (!isUuid(body.sessionId) || !isUuid(body.questionId) ||
        typeof body.answer !== "string" || body.answer.length > 120) {
        throw new Error("That quiz answer is not valid.");
    }
    const { data: session, error: sessionError } = await adminClient
        .from("quiz_sessions")
        .select("id, user_id, topic, question_ids, finished_at, created_at")
        .eq("id", body.sessionId)
        .eq("user_id", userId)
        .maybeSingle();
    if (sessionError || !session || session.finished_at ||
        Date.now() - new Date(session.created_at).getTime() > 2 * 60 * 60 * 1000 ||
        !session.question_ids.includes(body.questionId)) {
        throw new Error("This quiz has expired or is no longer available.");
    }

    const { data: question, error: questionError } = await adminClient
        .from("question_bank")
        .select("id, word")
        .eq("id", body.questionId)
        .eq("active", true)
        .single();
    if (questionError || !question) {
        throw new Error("That quiz question is no longer available.");
    }
    const isCorrect = body.answer.trim().toLocaleLowerCase() === question.word.trim().toLocaleLowerCase();
    const { error: answerError } = await adminClient.from("quiz_session_answers").insert({
        session_id: session.id,
        question_id: question.id,
        selected_word: body.answer.trim(),
        is_correct: isCorrect
    });
    if (answerError) {
        throw new Error("This question has already been answered.");
    }

    let awarded = false;
    if (isCorrect) {
        const { data, error } = await adminClient.rpc("award_quiz_xp", {
            p_user_id: userId,
            p_session_id: session.id,
            p_question_id: question.id
        }).maybeSingle();
        if (error || !data) {
            throw new Error("The answer was checked, but progress could not be saved. Please contact the researcher.");
        }
        awarded = data.awarded;
    }

    const { data: completion, error: completionError } = await adminClient.rpc("finish_quiz_session", {
        p_session_id: session.id
    }).maybeSingle();
    if (completionError) {
        throw new Error("Your answer was saved, but the quiz result could not be finalized.");
    }
    const { data: currentProgress, error: progressError } = await adminClient.from("student_progress")
        .select("total_xp, daily_xp, daily_date, completed_topics, activity_dates, learning_progress")
        .eq("user_id", userId)
        .single();
    if (progressError || !currentProgress) {
        throw new Error("Your answer was saved, but your progress could not be refreshed.");
    }

    const { count, error: countError } = await adminClient.from("quiz_session_answers")
        .select("question_id", { count: "exact", head: true })
        .eq("session_id", session.id);
    if (countError) {
        throw new Error("Could not load the quiz result.");
    }
    return {
        correct: isCorrect,
        correctAnswer: question.word,
        awarded,
        complete: count === session.question_ids.length,
        passed: Boolean(completion?.passed),
        progress: currentProgress
    };
}

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
    if (request.method !== "POST") {
        return jsonResponse(405, { error: "Method not allowed." });
    }
    try {
        const userId = await requireActiveUser(request);
        const body = await request.json() as Record<string, unknown>;
        if (body.action === "start") {
            return jsonResponse(200, await startQuiz(userId, body.topic));
        }
        if (body.action === "answer") {
            return jsonResponse(200, await answerQuiz(userId, body));
        }
        return jsonResponse(400, { error: "Unknown quiz action." });
    } catch (error) {
        const message = error instanceof Error ? error.message : "The quiz request failed.";
        console.error("Quiz function failed.", message);
        const status = message.includes("Sign in") || message.includes("session") || message.includes("active") ? 403 : 400;
        return jsonResponse(status, { error: message });
    }
});
