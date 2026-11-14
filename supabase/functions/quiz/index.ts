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
        .select("role, is_active")
        .eq("id", identity.user.id)
        .maybeSingle();
    if (error || !profile || profile.role !== "student" || !profile.is_active) {
        throw new Error("This account is not active for games.");
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
        .insert({ user_id: userId, topic, game_type: "quiz", question_ids: selected.map((question) => question.id) })
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
    const { data, error } = await adminClient.rpc("submit_quiz_answer", {
        p_user_id: userId,
        p_session_id: body.sessionId,
        p_question_id: body.questionId,
        p_selected_word: body.answer.trim()
    }).single();
    if (error || !data) {
        throw new Error(error?.message || "Your answer could not be checked. Please try again.");
    }
    const progress = data.complete ? {
        total_xp: data.total_xp,
        daily_xp: data.daily_xp,
        daily_date: data.daily_date,
        completed_topics: data.completed_topics,
        activity_dates: data.activity_dates,
        learning_progress: data.learning_progress,
        game_xp_multiplier: data.game_xp_multiplier
    } : undefined;
    return {
        correct: data.correct,
        correctAnswer: data.correct_answer,
        awarded: data.awarded,
        awardedXp: data.awarded_xp,
        complete: data.complete,
        passed: data.passed,
        multiplier: data.game_xp_multiplier,
        progress
    };
}

async function startCrossword(userId: string, requestedEntries: unknown) {
    if (!Array.isArray(requestedEntries) || requestedEntries.length < 2 || requestedEntries.length > 20) {
        throw new Error("Build a crossword with 2–20 valid words.");
    }
    const entries = requestedEntries.map((value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            throw new Error("The crossword word list is not valid.");
        }
        const entry = value as Record<string, unknown>;
        if (typeof entry.topic !== "string" || !topicNames.includes(entry.topic) ||
            typeof entry.word !== "string" || !entry.word.trim() || entry.word.length > 120) {
            throw new Error("The crossword word list is not valid.");
        }
        return { topic: entry.topic, word: entry.word.trim() };
    });
    const topics = [...new Set(entries.map((entry) => entry.topic))];
    const { data: bank, error: bankError } = await adminClient
        .from("question_bank")
        .select("id, topic, word")
        .eq("active", true)
        .in("topic", topics);
    if (bankError || !bank) {
        throw new Error("Could not verify the crossword word list.");
    }
    const byKey = new Map(bank.map((question) => [
        `${question.topic}:${question.word.trim().toLocaleLowerCase()}`,
        question
    ]));
    const selected = entries.map((entry) =>
        byKey.get(`${entry.topic}:${entry.word.toLocaleLowerCase()}`)
    );
    const questions = selected.filter(
        (question): question is NonNullable<typeof question> => question !== undefined
    );
    if (questions.length !== entries.length ||
        new Set(questions.map((question) => question.id)).size !== questions.length) {
        throw new Error("The crossword contains a word that is not in the approved game bank.");
    }
    const { data: session, error: sessionError } = await adminClient
        .from("quiz_sessions")
        .insert({
            user_id: userId,
            topic: null,
            game_type: "crossword",
            question_ids: questions.map((question) => question.id)
        })
        .select("id")
        .single();
    if (sessionError || !session) {
        throw new Error("Could not start the crossword. Please try again.");
    }
    return {
        sessionId: session.id,
        questions: questions.map(({ id, topic, word }) => ({ id, topic, word }))
    };
}

async function submitCrossword(userId: string, body: Record<string, unknown>) {
    if (!isUuid(body.sessionId) || !body.answers || typeof body.answers !== "object" ||
        Array.isArray(body.answers) || Object.entries(body.answers).some(([id, answer]) =>
            !isUuid(id) || typeof answer !== "string" || answer.length > 120
        )) {
        throw new Error("The crossword answers are not valid.");
    }
    const { data, error } = await adminClient.rpc("submit_crossword_attempt", {
        p_user_id: userId,
        p_session_id: body.sessionId,
        p_answers: body.answers
    }).single();
    if (error || !data) {
        throw new Error(error?.message || "Your crossword result could not be saved. Please try again.");
    }
    return {
        score: data.score,
        total: data.total,
        awardedXp: data.awarded_xp,
        multiplier: data.game_xp_multiplier,
        progress: {
            total_xp: data.total_xp,
            daily_xp: data.daily_xp,
            daily_date: data.daily_date,
            completed_topics: data.completed_topics,
            activity_dates: data.activity_dates,
            learning_progress: data.learning_progress,
            game_xp_multiplier: data.game_xp_multiplier
        }
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
        if (body.action === "start_crossword") {
            return jsonResponse(200, await startCrossword(userId, body.entries));
        }
        if (body.action === "submit_crossword") {
            return jsonResponse(200, await submitCrossword(userId, body));
        }
        return jsonResponse(400, { error: "Unknown quiz action." });
    } catch (error) {
        const message = error instanceof Error ? error.message : "The quiz request failed.";
        console.error("Quiz function failed.", message);
        const status = message.includes("Sign in") || message.includes("session") || message.includes("active") ? 403 : 400;
        return jsonResponse(status, { error: message });
    }
});
