(function () {
    const config = window.STEMCHEM_SUPABASE_CONFIG || {};
    const configured = Boolean(config.url && config.anonKey && window.supabase);
    const client = configured
        ? window.supabase.createClient(config.url, config.anonKey, {
            auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
        })
        : null;
    let activeUserId = null;
    let loadingUserId = null;
    let onAuthenticated = () => {};
    let onSignedOut = () => {};
    let onAuthError = () => {};
    let leaderboardChannel = null;
    let onLeaderboardChange = () => {};
    let onLeaderboardError = () => {};

    function usernameEmail(studentId) {
        const normalized = String(studentId || "").trim().toLowerCase();
        if (!/^(?!.*\.\.)[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$/.test(normalized)) {
            throw new Error("Enter the assigned student ID using 3–32 letters, numbers, dots, underscores, or hyphens.");
        }
        return `${normalized}@students.chemgame.invalid`;
    }

    function ensureConfigured() {
        if (!client) {
            throw new Error("Supabase is not configured yet. Add the project URL and public anon key to supabase-config.js.");
        }
        return client;
    }

    async function clearLeaderboard() {
        if (client && leaderboardChannel) {
            await client.removeChannel(leaderboardChannel);
            leaderboardChannel = null;
        }
        onLeaderboardChange = () => {};
        onLeaderboardError = () => {};
    }

    async function callFunction(name, body) {
        const { data, error } = await ensureConfigured().functions.invoke(name, { body });
        if (error) {
            let details = data && data.error;
            if (!details && error.context instanceof Response) {
                try {
                    details = (await error.context.clone().json()).error;
                } catch (parseError) {
                    console.error("Could not read the secure server error response.", parseError);
                }
            }
            throw new Error(details || error.message || "The secure server request failed.");
        }
        if (data && data.error) {
            throw new Error(data.error);
        }
        return data;
    }

    async function hydrateSession(session) {
        if (!session) {
            activeUserId = null;
            loadingUserId = null;
            await clearLeaderboard();
            onSignedOut();
            return;
        }
        if (activeUserId === session.user.id || loadingUserId === session.user.id) {
            return;
        }

        loadingUserId = session.user.id;
        try {
            const db = ensureConfigured();
            const { data: profile, error: profileError } = await db
                .from("profiles")
                .select("id, student_id, display_name, role, is_active")
                .eq("id", session.user.id)
                .single();
            if (profileError || !profile || !profile.is_active) {
                throw new Error("This account is not active. Contact the researcher if you think this is a mistake.");
            }

            const { data: progress, error: progressError } = await db
                .from("student_progress")
                .select("total_xp, daily_xp, daily_date, completed_topics, activity_dates, learning_progress")
                .eq("user_id", session.user.id)
                .single();
            if (progressError || !progress) {
                throw new Error("Your learning progress could not be loaded. Please try signing in again.");
            }

            activeUserId = session.user.id;
            onAuthenticated(profile, progress);
        } catch (error) {
            activeUserId = null;
            onAuthError(error.message);
            await ensureConfigured().auth.signOut();
        } finally {
            loadingUserId = null;
        }
    }

    async function start(authenticated, signedOut, authError) {
        onAuthenticated = authenticated;
        onSignedOut = signedOut;
        onAuthError = authError;
        if (!configured) {
            onAuthError("Supabase is not configured yet. Add the project URL and public anon key to supabase-config.js.");
            return;
        }
        client.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                activeUserId = null;
                clearLeaderboard().finally(onSignedOut);
                return;
            }
            if (session) {
                window.setTimeout(() => hydrateSession(session), 0);
            }
        });
        const { data, error } = await client.auth.getSession();
        if (error) {
            onAuthError("Could not restore your saved session. Please sign in again.");
            return;
        }
        await hydrateSession(data.session);
    }

    async function signIn(studentId, password) {
        const db = ensureConfigured();
        const { data, error } = await db.auth.signInWithPassword({
            email: usernameEmail(studentId),
            password
        });
        if (error || !data.session) {
            throw new Error("Student ID or password is incorrect, or the account is inactive.");
        }
        await hydrateSession(data.session);
    }

    async function signOut() {
        const { error } = await ensureConfigured().auth.signOut();
        if (error) {
            throw new Error(`Could not log out: ${error.message}`);
        }
    }

    async function startQuiz(topic) {
        return callFunction("quiz", { action: "start", topic: topic || null });
    }

    async function submitAnswer(sessionId, questionId, answer) {
        return callFunction("quiz", { action: "answer", sessionId, questionId, answer });
    }

    async function updateLearning(action, payload) {
        return callFunction("learning", { action, ...payload });
    }

    async function updatePassword(password) {
        if (typeof password !== "string" || password.length < 12) {
            throw new Error("Use a password with at least 12 characters.");
        }
        const { error } = await ensureConfigured().auth.updateUser({ password });
        if (error) {
            throw new Error(error.message);
        }
    }

    async function adminRequest(body) {
        return callFunction("admin", body);
    }

    async function subscribeLeaderboard(callback, errorCallback = () => {}) {
        onLeaderboardChange = callback;
        onLeaderboardError = errorCallback;
        const db = ensureConfigured();
        const { data, error } = await db
            .from("leaderboard_scores")
            .select("display_name, total_xp")
            .order("total_xp", { ascending: false })
            .order("display_name", { ascending: true });
        if (error) {
            throw new Error(`Could not load the class leaderboard: ${error.message}`);
        }
        if (leaderboardChannel) {
            await db.removeChannel(leaderboardChannel);
        }
        leaderboardChannel = db.channel("stemchem-leaderboard")
            .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_scores" }, () => {
                refreshLeaderboard();
            })
            .subscribe();
        onLeaderboardChange(data || []);
    }

    async function refreshLeaderboard() {
        try {
            const { data, error } = await ensureConfigured()
                .from("leaderboard_scores")
                .select("display_name, total_xp")
                .order("total_xp", { ascending: false })
                .order("display_name", { ascending: true });
            if (error) {
                throw error;
            }
            onLeaderboardChange(data || []);
        } catch (error) {
            console.error("Could not refresh the class leaderboard.", error);
            onLeaderboardError("The live leaderboard could not refresh. Try opening the page again.");
        }
    }

    window.chemSecureApp = {
        start,
        signIn,
        signOut,
        startQuiz,
        submitAnswer,
        updateLearning,
        updatePassword,
        adminRequest,
        subscribeLeaderboard,
        isConfigured: () => configured
    };
})();
