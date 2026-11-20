(function () {
    const config = window.STEMCHEM_SUPABASE_CONFIG || {};
    const configured = Boolean(config.url && config.anonKey && window.supabase);
    const client = configured
        ? window.supabase.createClient(config.url, config.anonKey, {
            auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
        })
        : null;
    let activeUserId = null;
    let activeAvatarPath = null;
    let loadingUserId = null;
    let authListenerStarted = false;
    let onAuthenticated = () => {};
    let onSignedOut = () => {};
    let onAuthError = () => {};
    let leaderboardChannel = null;
    let leaderboardRefreshTimer = null;
    let jeopardyMatchChannel = null;
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

    function createAvatarId() {
        if (window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }
        if (!window.crypto?.getRandomValues) {
            throw new Error("This browser cannot securely create a profile picture upload ID.");
        }
        const bytes = window.crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        return [...bytes].map((byte, index) => {
            const value = byte.toString(16).padStart(2, "0");
            return [4, 6, 8, 10].includes(index) ? `-${value}` : value;
        }).join("");
    }

    async function clearLeaderboard() {
        if (client && leaderboardChannel) {
            await client.removeChannel(leaderboardChannel);
            leaderboardChannel = null;
        }
        if (client && jeopardyMatchChannel) {
            await client.removeChannel(jeopardyMatchChannel);
            jeopardyMatchChannel = null;
        }
        if (leaderboardRefreshTimer !== null) {
            window.clearInterval(leaderboardRefreshTimer);
            leaderboardRefreshTimer = null;
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
            activeAvatarPath = null;
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
                .select("id, student_id, display_name, role, is_active, avatar_path")
                .eq("id", session.user.id)
                .single();
            if (profileError?.code === "42703" || profileError?.code === "PGRST204") {
                throw new Error("The database is missing shared profile-picture support. Apply the latest Supabase migration, then sign in again.");
            }
            if (profileError || !profile || !profile.is_active) {
                throw new Error("This account is not active. Contact the researcher if you think this is a mistake.");
            }

            const { data: progress, error: progressError } = await db
                .from("student_progress")
                .select("total_xp, daily_xp, daily_date, completed_topics, activity_dates, learning_progress, game_xp_multiplier")
                .eq("user_id", session.user.id)
                .single();
            if (progressError || !progress) {
                console.error("Could not load the signed-in ac  count's progress record.", progressError);
                if (progressError?.code === "PGRST116") {
                    throw new Error("This account has no progress record yet. Run the updated supabase/schema.sql to create progress records for existing accounts, then sign in again.");
                }
                if (progressError?.code === "42703" || progressError?.code === "PGRST204") {
                    throw new Error("The database is missing the new learning progress column. Run the updated supabase/schema.sql, then sign in again.");
                }
                throw new Error(`Your learning progress could not be loaded${progressError?.message ? `: ${progressError.message}` : ". Please try signing in again."}`);
            }

            activeUserId = session.user.id;
            activeAvatarPath = profile.avatar_path;
            onAuthenticated(profile, progress);
        } catch (error) {
            activeUserId = null;
            activeAvatarPath = null;
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
        if (!authListenerStarted) {
            client.auth.onAuthStateChange((event, session) => {
                if (event === "SIGNED_OUT") {
                    activeUserId = null;
                    activeAvatarPath = null;
                    clearLeaderboard().finally(onSignedOut);
                    return;
                }
                if (session) {
                    window.setTimeout(() => hydrateSession(session), 0);
                }
            });
            authListenerStarted = true;
        }
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
        if (typeof password !== "string" || password.length < 6) {
            throw new Error("Use a password with at least 6 characters.");
        }
        const { error } = await ensureConfigured().auth.updateUser({ password });
        if (error) {
            throw new Error(error.message);
        }
    }

    async function updateDisplayName(displayName) {
        const name = typeof displayName === "string" ? displayName.trim() : "";
        if (name.length < 1 || name.length > 60) {
            throw new Error("Display names must contain 1–60 characters.");
        }
        if (!activeUserId) {
            throw new Error("Sign in again before changing your display name.");
        }
        const { data, error } = await ensureConfigured()
            .from("profiles")
            .update({ display_name: name })
            .eq("id", activeUserId)
            .select("id, display_name")
            .single();
        if (error || !data) {
            throw new Error(error?.message || "Could not update your display name.");
        }
        return data;
    }

    async function signProfileAvatarPaths(paths) {
        const uniquePaths = [...new Set(paths.filter((path) =>
            typeof path === "string" && path.startsWith("avatars/")
        ))];
        if (!uniquePaths.length) {
            return {};
        }
        const { data, error } = await ensureConfigured()
            .storage.from("student-avatars")
            .createSignedUrls(uniquePaths, 3600);
        if (error) {
            throw new Error(`Could not load profile pictures: ${error.message}`);
        }
        return Object.fromEntries((data || [])
            .filter((entry) => entry.path && entry.signedUrl)
            .map((entry) => [entry.path, new URL(entry.signedUrl, config.url).href]));
    }

    async function profileAvatarUrls(paths) {
        return signProfileAvatarPaths(Array.isArray(paths) ? paths : []);
    }

    async function persistAvatarPath(avatarPath) {
        if (!activeUserId) {
            throw new Error("Sign in again before changing your profile picture.");
        }
        const db = ensureConfigured();
        const previousPath = activeAvatarPath;
        const { data, error } = await db
            .from("profiles")
            .update({ avatar_path: avatarPath })
            .eq("id", activeUserId)
            .select("id, avatar_path")
            .single();
        if (error || !data) {
            throw new Error(error?.message || "Could not save your profile picture.");
        }
        activeAvatarPath = data.avatar_path;
        let cleanupError = null;
        if (previousPath && previousPath !== data.avatar_path && previousPath.startsWith("avatars/")) {
            const { error: removeError } = await db.storage
                .from("student-avatars")
                .remove([previousPath]);
            if (removeError) {
                cleanupError = removeError.message;
                console.error("Could not remove the previous profile picture.", removeError);
            }
        }
        return { ...data, cleanupError };
    }

    async function setProfileAvatar(avatarPath) {
        const presets = [
            "preset:blue", "preset:green", "preset:orange",
            "preset:pink", "preset:purple", "preset:red"
        ];
        if (avatarPath !== null && !presets.includes(avatarPath)) {
            throw new Error("Choose one of the available profile pictures.");
        }
        return persistAvatarPath(avatarPath);
    }

    async function uploadProfileAvatar(imageBlob) {
        if (!activeUserId) {
            throw new Error("Sign in again before changing your profile picture.");
        }
        if (!(imageBlob instanceof Blob) || imageBlob.type !== "image/jpeg" || imageBlob.size > 2 * 1024 * 1024) {
            throw new Error("The cropped picture must be a JPEG smaller than 2 MB.");
        }
        const db = ensureConfigured();
        const path = `avatars/${activeUserId}/${createAvatarId()}.jpg`;
        const { error: uploadError } = await db.storage
            .from("student-avatars")
            .upload(path, imageBlob, {
                cacheControl: "3600",
                contentType: "image/jpeg",
                upsert: false
            });
        if (uploadError) {
            throw new Error(`Could not upload your profile picture: ${uploadError.message}`);
        }
        let profile;
        try {
            profile = await persistAvatarPath(path);
        } catch (error) {
            if (activeAvatarPath !== path) {
                const { error: cleanupError } = await db.storage
                    .from("student-avatars")
                    .remove([path]);
                if (cleanupError) {
                    console.error("Could not remove an unlinked profile picture.", cleanupError);
                }
            }
            throw error;
        }
        try {
            const urls = await signProfileAvatarPaths([path]);
            return { ...profile, avatar_url: urls[path] || null };
        } catch (error) {
            console.error("The profile picture was saved but its preview could not be loaded.", error);
            return { ...profile, avatar_url: null, previewError: error.message };
        }
    }

    async function refreshProgress() {
        if (!activeUserId) {
            return null;
        }
        const { data, error } = await ensureConfigured()
            .from("student_progress")
            .select("total_xp, daily_xp, daily_date, completed_topics, activity_dates, learning_progress, game_xp_multiplier")
            .eq("user_id", activeUserId)
            .single();
        if (error || !data) {
            throw new Error(error?.message || "Could not refresh your learning progress.");
        }
        return data;
    }

    async function adminRequest(body) {
        return callFunction("admin", body);
    }

    async function jeopardyPvpAction(action, payload = {}) {
        return callFunction("jeopardy-pvp", { action, ...payload });
    }

    async function subscribeJeopardyMatch(matchId, callback, errorCallback = () => {}) {
        const db = ensureConfigured();
        if (jeopardyMatchChannel) {
            await db.removeChannel(jeopardyMatchChannel);
            jeopardyMatchChannel = null;
        }
        jeopardyMatchChannel = db.channel(`jeopardy-match-${matchId}`)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "jeopardy_pvp_matches",
                filter: `id=eq.${matchId}`
            }, (payload) => callback(payload.new))
            .subscribe((status, error) => {
                if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    errorCallback(error?.message || "The live match connection was interrupted.");
                }
            });
        return async () => {
            if (jeopardyMatchChannel) {
                await db.removeChannel(jeopardyMatchChannel);
                jeopardyMatchChannel = null;
            }
        };
    }

    async function subscribeLeaderboard(callback, errorCallback = () => {}) {
        onLeaderboardChange = callback;
        onLeaderboardError = errorCallback;
        const db = ensureConfigured();
        const { data, error } = await db
            .from("leaderboard_scores")
            .select("display_name, total_xp, avatar_path")
            .order("total_xp", { ascending: false })
            .order("display_name", { ascending: true });
        if (error) {
            throw new Error(`Could not load the class leaderboard: ${error.message}`);
        }
        if (leaderboardChannel) {
            await db.removeChannel(leaderboardChannel);
        }
        if (leaderboardRefreshTimer !== null) {
            window.clearInterval(leaderboardRefreshTimer);
        }
        leaderboardChannel = db.channel("stemchem-leaderboard")
            .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_scores" }, () => {
                refreshLeaderboard();
            })
            .subscribe();
        leaderboardRefreshTimer = window.setInterval(refreshLeaderboard, 45 * 60 * 1000);
        onLeaderboardChange(await addLeaderboardAvatarUrls(data || []));
    }

    async function addLeaderboardAvatarUrls(students) {
        let urls = {};
        try {
            urls = await signProfileAvatarPaths(students.map((student) => student.avatar_path));
        } catch (error) {
            console.error("Could not create leaderboard profile picture links.", error);
        }
        return students.map((student) => ({
            ...student,
            avatar_url: urls[student.avatar_path] || null,
            avatar_load_failed: Boolean(student.avatar_path?.startsWith("avatars/") && !urls[student.avatar_path])
        }));
    }

    async function refreshLeaderboard() {
        try {
            const { data, error } = await ensureConfigured()
                .from("leaderboard_scores")
                .select("display_name, total_xp, avatar_path")
                .order("total_xp", { ascending: false })
                .order("display_name", { ascending: true });
            if (error) {
                throw error;
            }
            onLeaderboardChange(await addLeaderboardAvatarUrls(data || []));
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
        updateDisplayName,
        refreshProgress,
        adminRequest,
        profileAvatarUrls,
        setProfileAvatar,
        uploadProfileAvatar,
        jeopardyPvpAction,
        subscribeJeopardyMatch,
        subscribeLeaderboard,
        isConfigured: () => configured
    };
})();
