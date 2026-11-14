import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const lessons = {
    measurements: { topic: "Measurements", check: ["b", "a", "b"], practice: ["a", "a", "b"], challenge: ["a", "a", "b"] },
    "atomic-structure": { topic: "Atomic Structure", check: ["b", "b", "a"], practice: ["a", "b", "a"], challenge: ["a", "c", "a"] },
    "periodic-table": { topic: "Periodic Table", check: ["a", "a", "b"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    "chemical-bonding": { topic: "Chemical Bonding", check: ["a", "c", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    "intermolecular-forces": { topic: "IMF", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    "states-of-matter": { topic: "States of Matter", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    "chemical-equations": { topic: "Chemical Equations", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    "chemical-reactions": { topic: "Chemical Reactions", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    "gas-laws": { topic: "Gas Laws", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    solutions: { topic: "Solutions", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    "acids-and-bases": { topic: "Acids and Bases", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] },
    thermochemistry: { topic: "Thermochemistry", check: ["a", "a", "a"], practice: ["a", "a", "a"], challenge: ["a", "a", "a"] }
} as const;

type LessonSlug = keyof typeof lessons;
const lessonSlugs = Object.keys(lessons) as LessonSlug[];
type LearningState = {
    completed_sections: Record<string, number[]>;
    practice_completed: Record<string, number[]>;
    completed_lessons: string[];
    challenges: Record<string, { score: number; total: number; passed: boolean; mastered: boolean }>;
    all_lessons_unlocked: boolean;
    current_topic?: string;
    current_section?: number;
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

function isLessonSlug(value: unknown): value is LessonSlug {
    return typeof value === "string" && Object.hasOwn(lessons, value);
}

async function requireActiveUser(request: Request) {
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
        throw new Error("Sign in to save learning progress.");
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
        throw new Error("This account is not active for learning.");
    }
    return identity.user.id;
}

function normalizeState(value: unknown): LearningState {
    const state = value && typeof value === "object" ? value as Partial<LearningState> : {};
    return {
        completed_sections: state.completed_sections && typeof state.completed_sections === "object"
            ? state.completed_sections
            : {},
        practice_completed: state.practice_completed && typeof state.practice_completed === "object"
            ? state.practice_completed
            : {},
        completed_lessons: Array.isArray(state.completed_lessons) ? state.completed_lessons : [],
        challenges: state.challenges && typeof state.challenges === "object" ? state.challenges : {},
        all_lessons_unlocked: state.all_lessons_unlocked === true,
        current_topic: state.current_topic,
        current_section: state.current_section
    };
}

async function loadProgress(userId: string) {
    const { data, error } = await adminClient
        .from("student_progress")
        .select("total_xp, daily_xp, daily_date, completed_topics, activity_dates, learning_progress, game_xp_multiplier")
        .eq("user_id", userId)
        .single();
    if (error || !data) {
        throw new Error("Your learning progress could not be loaded.");
    }
    return data;
}

async function saveState(userId: string, state: LearningState, completedTopics?: string[]) {
    const completedLessons = new Set(
        state.completed_lessons.filter((slug): slug is LessonSlug => isLessonSlug(slug))
    );
    const completedCount = completedLessons.size;
    const multiplier = completedCount >= 11 ? 1.5
        : completedCount >= 8 ? 1.4
            : completedCount >= 5 ? 1.3
                : completedCount >= 3 ? 1.2
                    : completedCount >= 1 ? 1.1
                        : 1.0;
    const { error } = await adminClient.rpc("save_student_learning_progress", {
        p_user_id: userId,
        p_learning_progress: state,
        p_completed_topics: completedTopics || null,
        p_multiplier: multiplier
    });
    if (error) {
        throw new Error("Your lesson progress could not be saved. Please try again.");
    }
    return loadProgress(userId);
}

function responseProgress(row: Awaited<ReturnType<typeof loadProgress>>) {
    return {
        total_xp: row.total_xp,
        daily_xp: row.daily_xp,
        daily_date: row.daily_date,
        completed_topics: row.completed_topics,
        activity_dates: row.activity_dates,
        learning_progress: normalizeState(row.learning_progress),
        game_xp_multiplier: row.game_xp_multiplier
    };
}

async function handleLearning(userId: string, body: Record<string, unknown>) {
    if (!isLessonSlug(body.topic)) {
        throw new Error("Choose a valid Chemistry lesson.");
    }
    const slug = body.topic;
    const lesson = lessons[slug];
    const needsSection = body.action === "position" || body.action === "section" || body.action === "practice";
    const sectionIndex = needsSection ? Number(body.sectionIndex) : -1;
    if (needsSection && (!Number.isInteger(sectionIndex) || sectionIndex < 0 || sectionIndex >= lesson.check.length)) {
        throw new Error("Choose a valid lesson section.");
    }

    const current = await loadProgress(userId);
    const state = normalizeState(current.learning_progress);
    if (body.action !== "position") {
        const completedTopics = new Set(Array.isArray(current.completed_topics) ? current.completed_topics : []);
        const firstIncomplete = lessonSlugs.findIndex((lessonSlug) =>
            !completedTopics.has(lessons[lessonSlug].topic)
        );
        const latestUnlocked = firstIncomplete === -1 ? lessonSlugs.length - 1 : firstIncomplete;
        if (!state.all_lessons_unlocked && lessonSlugs.indexOf(slug) > latestUnlocked) {
            throw new Error("Complete the previous Chemistry topic challenge to continue.");
        }
    }
    state.current_topic = slug;
    if (needsSection) {
        state.current_section = sectionIndex;
    }

    if (body.action === "position") {
        const saved = await saveState(userId, state);
        return { progress: responseProgress(saved) };
    }

    if (body.action === "section") {
        if (body.answer !== lesson.check[sectionIndex]) {
            return { correct: false, progress: responseProgress(current) };
        }
        const sections = new Set(state.completed_sections[slug] || []);
        sections.add(sectionIndex);
        state.completed_sections[slug] = Array.from(sections).sort((a, b) => a - b);
        const saved = await saveState(userId, state);
        return { correct: true, progress: responseProgress(saved) };
    }

    if (body.action === "practice") {
        if (body.answer !== lesson.practice[sectionIndex]) {
            return { correct: false, awarded: false, progress: responseProgress(current) };
        }
        const practices = new Set(state.practice_completed[slug] || []);
        practices.add(sectionIndex);
        state.practice_completed[slug] = Array.from(practices).sort((a, b) => a - b);
        const saved = await saveState(userId, state);
        return { correct: true, progress: responseProgress(saved) };
    }

    if (body.action === "complete_lesson") {
        const sections = state.completed_sections[slug] || [];
        if (![0, 1, 2].every((index) => sections.includes(index))) {
            throw new Error("Answer each section's quick check before completing the lesson.");
        }
        const firstCompletion = !state.completed_lessons.includes(slug);
        if (firstCompletion) {
            state.completed_lessons.push(slug);
        }
        const saved = await saveState(userId, state);
        return {
            completed: true,
            firstCompletion,
            game_xp_multiplier: saved.game_xp_multiplier,
            progress: responseProgress(saved)
        };
    }

    if (body.action === "challenge") {
        if (!state.completed_lessons.includes(slug)) {
            throw new Error("Complete the lesson before taking its final challenge.");
        }
        if ((state.completed_sections[slug] || []).length < 3) {
            throw new Error("Complete all three section quick checks before taking the lesson challenge.");
        }
        if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
            throw new Error("Answer all challenge questions.");
        }
        const answers = body.answers as Record<string, unknown>;
        if (!["q1", "q2", "q3"].every((key) => ["a", "b", "c"].includes(String(answers[key]))) ||
            Object.keys(answers).some((key) => !["q1", "q2", "q3"].includes(key))) {
            throw new Error("The challenge answers are not valid.");
        }
        const score = lesson.challenge.reduce((sum, correct, index) =>
            sum + (answers[`q${index + 1}`] === correct ? 1 : 0), 0);
        const passed = score >= 2;
        const mastered = score === 3;
        const previous = state.challenges[slug];
        const bestScore = Math.max(previous?.score || 0, score);
        state.challenges[slug] = {
            score: bestScore,
            total: lesson.challenge.length,
            passed: Boolean(previous?.passed || passed),
            mastered: Boolean(previous?.mastered || mastered)
        };
        let completedTopics = Array.isArray(current.completed_topics) ? current.completed_topics : [];
        if (passed && !completedTopics.includes(lesson.topic)) {
            completedTopics = [...completedTopics, lesson.topic];
        }
        const saved = await saveState(userId, state, completedTopics);
        return {
            score,
            total: lesson.challenge.length,
            passed: state.challenges[slug].passed,
            mastered: state.challenges[slug].mastered,
            progress: responseProgress(saved)
        };
    }

    throw new Error("Unknown learning action.");
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
        return jsonResponse(200, await handleLearning(userId, body));
    } catch (error) {
        const message = error instanceof Error ? error.message : "The learning request failed.";
        console.error("Learning function failed.", message);
        const status = message.includes("Sign in") || message.includes("session") || message.includes("active") ? 403 : 400;
        return jsonResponse(status, { error: message });
    }
});
