(function () {
    "use strict";

    const categories = [
        "Atomic Structure", "Periodic Table", "Chemical Bonding", "Chemical Reactions", "Acids and Bases"
    ];
    const points = [200, 400, 600, 800, 1000];
    const preferenceKey = "stemchem-jeopardy-audio";
    const state = { score: 0, correct: 0, incorrect: 0, unanswered: 0, completed: 0, active: null };
    const completed = new Set();
    const pvp = { matchId: null, matchStatus: null, state: null, userId: null, playerSlot: null, profile: null };
    let timerId = null;
    let pvpPollTimer = null;
    let pvpClockTimer = null;
    let pvpSyncBusy = false;
    let soloQuestionsLoading = false;
    let unsubscribeMatch = null;
    let secondsLeft = 30;

    const music = new Audio("../sfx/choice1.mov");
    music.loop = true;
    music.preload = "auto";

    const preferences = loadPreferences();
    music.volume = preferences.musicVolume;
    music.muted = !preferences.musicEnabled;
    if (window.ChemAudio) {
        window.ChemAudio.setEnabled(preferences.effectsEnabled);
        window.ChemAudio.setVolume(preferences.effectsVolume);
    }

    const elements = {
        intro: document.getElementById("introScreen"),
        board: document.getElementById("boardScreen"),
        question: document.getElementById("questionScreen"),
        final: document.getElementById("finalScreen"),
        matchmaking: document.getElementById("matchmakingScreen"),
        pvpFinal: document.getElementById("pvpFinalScreen"),
        searchingPanel: document.getElementById("searchingPanel"),
        matchFoundPanel: document.getElementById("matchFoundPanel"),
        headerScore: document.getElementById("headerScore"),
        opponentScoreChip: document.getElementById("opponentScoreChip"),
        opponentName: document.getElementById("opponentName"),
        opponentScore: document.getElementById("opponentScore"),
        boardElement: document.getElementById("jeopardyBoard"),
        remaining: document.getElementById("remainingCount"),
        category: document.getElementById("questionCategory"),
        points: document.getElementById("questionPoints"),
        clue: document.getElementById("questionClue"),
        timer: document.getElementById("timerValue"),
        ring: document.getElementById("timerProgress"),
        form: document.getElementById("answerForm"),
        input: document.getElementById("answerInput"),
        submit: document.getElementById("submitAnswerButton"),
        result: document.getElementById("answerResult"),
        resultLabel: document.getElementById("resultLabel"),
        correctAnswer: document.getElementById("correctAnswerText"),
        continue: document.getElementById("continueButton"),
        settings: document.getElementById("settingsDialog"),
        buzzStatus: document.getElementById("buzzStatus"),
        buzzButton: document.getElementById("buzzButton"),
        buzzPrompt: document.getElementById("buzzPrompt"),
        buzzTurnStatus: document.getElementById("buzzTurnStatus"),
        matchStatus: document.getElementById("matchmakingStatus"),
        matchError: document.getElementById("matchmakingError"),
        findMatch: document.getElementById("findMatchButton"),
        cancelMatch: document.getElementById("cancelMatchButton"),
        ready: document.getElementById("readyButton"),
        decline: document.getElementById("declineMatchButton")
    };

    function loadPreferences() {
        const defaults = {
            musicEnabled: true,
            effectsEnabled: window.ChemAudio ? window.ChemAudio.isEnabled() : true,
            musicVolume: 0.22,
            effectsVolume: 0.35
        };
        try {
            return { ...defaults, ...JSON.parse(localStorage.getItem(preferenceKey) || "{}") };
        } catch (error) {
            return defaults;
        }
    }

    function savePreferences() {
        preferences.musicVolume = Number(document.getElementById("musicVolume").value);
        preferences.musicEnabled = document.getElementById("musicToggle").checked;
        preferences.effectsEnabled = document.getElementById("effectsToggle").checked;
        preferences.effectsVolume = Number(document.getElementById("effectsVolume").value);
        music.volume = preferences.musicVolume;
        music.muted = !preferences.musicEnabled;
        localStorage.setItem(preferenceKey, JSON.stringify(preferences));
        if (window.ChemAudio) {
            window.ChemAudio.setEnabled(preferences.effectsEnabled);
            window.ChemAudio.setVolume(preferences.effectsVolume);
        }
    }

    function sfx(name) {
        if (preferences.effectsEnabled && window.ChemAudio) {
            window.ChemAudio.play(name);
        }
    }

    function normalizeAnswer(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFKC")
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .replace(/\s+/g, " ");
    }

    function questionsFor(category) {
        return (window.JEOPARDY_QUESTIONS && window.JEOPARDY_QUESTIONS[category]) || [];
    }

    function loadSoloQuestions() {
        const scripts = {
            "Atomic Structure": "atomic-structure.js",
            "Periodic Table": "periodic-table.js",
            "Chemical Bonding": "chemical-bonding.js",
            "Chemical Reactions": "chemical-reactions.js",
            "Acids and Bases": "acids-and-bases.js"
        };
        return Promise.all(categories.map((category) => new Promise((resolve, reject) => {
            if (questionsFor(category).length) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.src = `qna/${scripts[category]}`;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Could not load ${category} questions.`));
            document.head.appendChild(script);
        })));
    }

    function getQuestion(category, pointValue) {
        return questionsFor(category).find((question) => question.points === pointValue) || null;
    }

    function startMusic() {
        if (preferences.musicEnabled) {
            music.play().catch(() => {});
        }
    }

    function stopMusic() {
        music.pause();
        music.currentTime = 0;
    }

    function showOnly(screen) {
        const screens = [
            elements.intro, elements.board, elements.question, elements.final,
            elements.matchmaking, elements.pvpFinal
        ];
        const wasVisible = screen && !screen.hidden;
        screens.forEach((element) => {
            element.hidden = element !== screen;
        });
        if (screen && !wasVisible) {
            screen.classList.remove("screen-arrive");
            void screen.offsetWidth;
            screen.classList.add("screen-arrive");
        }
    }

    function resetHeaderForSolo() {
        elements.headerScore.parentElement.querySelector("span").textContent = "Score";
        elements.headerScore.textContent = String(state.score);
        elements.opponentScoreChip.hidden = true;
    }

    function renderBoard() {
        elements.boardElement.replaceChildren();
        categories.forEach((category) => {
            const heading = document.createElement("div");
            heading.className = "category-cell";
            heading.textContent = category;
            elements.boardElement.appendChild(heading);
        });
        points.forEach((pointValue, row) => {
            categories.forEach((category, column) => {
                const question = getQuestion(category, pointValue);
                const key = `${category}:${pointValue}`;
                const tile = document.createElement("button");
                tile.type = "button";
                tile.className = "clue-cell";
                tile.dataset.category = category;
                tile.dataset.points = String(pointValue);
                tile.dataset.position = String(row * categories.length + column);
                tile.setAttribute("aria-label", `${category}, ${pointValue} points`);
                if (!question || completed.has(key)) {
                    tile.disabled = true;
                    tile.classList.add("completed");
                    tile.setAttribute("aria-label", `${category}, ${pointValue} points, completed`);
                } else {
                    tile.textContent = `$${pointValue.toLocaleString("en-US")}`;
                }
                elements.boardElement.appendChild(tile);
            });
        });
        elements.remaining.textContent = String(categories.length * points.length - completed.size);
    }

    function openQuestion(category, pointValue) {
        const question = getQuestion(category, pointValue);
        const key = `${category}:${pointValue}`;
        if (!question || completed.has(key)) return;
        state.active = { category, pointValue, question, key };
        elements.category.textContent = category;
        elements.points.textContent = `$${pointValue.toLocaleString("en-US")}`;
        elements.clue.textContent = question.clue;
        elements.input.value = "";
        elements.input.disabled = false;
        elements.submit.disabled = false;
        elements.form.hidden = false;
        elements.buzzStatus.hidden = true;
        elements.result.hidden = true;
        showOnly(elements.question);
        sfx("openMenu");
        startMusic();
        window.setTimeout(() => {
            if (state.active && state.active.key === key) {
                elements.input.focus();
                startTimer();
            }
        }, 350);
    }

    function startTimer() {
        stopTimer();
        secondsLeft = 30;
        updateTimer();
        sfx("selectAnswer");
        timerId = window.setInterval(() => {
            secondsLeft -= 1;
            updateTimer();
            if (secondsLeft === 10) sfx("selectAnswer");
            if (secondsLeft === 5) sfx("closeMenu");
            if (secondsLeft <= 0) endQuestion(true);
        }, 1000);
    }

    function stopTimer() {
        if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
        }
    }

    function updateTimer() {
        elements.timer.textContent = String(Math.max(0, secondsLeft));
        const circumference = 326.73;
        elements.ring.style.strokeDashoffset = String(circumference * (1 - Math.max(0, secondsLeft) / 30));
        elements.ring.style.stroke = secondsLeft <= 5 ? "#f0b45a" : "#86c9bd";
    }

    function endQuestion(timedOut) {
        if (!state.active) return;
        stopTimer();
        const active = state.active;
        if (completed.has(active.key)) return;
        completed.add(active.key);
        state.completed += 1;
        elements.input.disabled = true;
        elements.submit.disabled = true;
        const alternatives = active.question.possibleAnswers || [];
        const correct = !timedOut && alternatives.some((answer) => normalizeAnswer(answer) === normalizeAnswer(elements.input.value));
        if (timedOut) {
            state.unanswered += 1;
            sfx("closeMenu");
        } else if (correct) {
            state.correct += 1;
            state.score += active.pointValue;
            sfx("correctAnswer");
        } else {
            state.incorrect += 1;
            state.score -= active.pointValue;
            sfx("wrongAnswer");
        }
        elements.headerScore.textContent = String(state.score);
        elements.resultLabel.textContent = timedOut ? "Time expired" : correct ? "Correct" : "Incorrect";
        elements.correctAnswer.textContent = alternatives[0] ? `Correct answer: ${alternatives[0]}` : "";
        elements.result.hidden = false;
        if (state.completed >= categories.length * points.length) {
            elements.continue.textContent = "View final score →";
        }
    }

    async function ensureSignedIn() {
        if (!window.chemSecureApp || !window.chemSecureApp.isConfigured()) {
            throw new Error("PvP requires a configured Chem Game account. Return to the app and sign in first.");
        }
        await window.chemSecureApp.start(
            (profile) => { pvp.profile = profile; pvp.userId = profile.id; },
            () => { pvp.profile = null; pvp.userId = null; },
            (message) => { pvp.profile = null; pvp.userId = null; pvp.authError = message; }
        );
        if (!pvp.profile || !pvp.userId) {
            throw new Error(pvp.authError || "Sign in to Chem Game before entering PvP matchmaking.");
        }
    }

    function stopPvpPolling() {
        if (pvpPollTimer !== null) {
            window.clearInterval(pvpPollTimer);
            pvpPollTimer = null;
        }
    }

    function startPvpPolling() {
        stopPvpPolling();
        pvpPollTimer = window.setInterval(async () => {
            if (pvpSyncBusy || (!pvp.matchId && pvp.matchStatus !== "searching")) return;
            pvpSyncBusy = true;
            try {
                const response = pvp.matchId
                    ? await window.chemSecureApp.jeopardyPvpAction("sync", { matchId: pvp.matchId })
                    : await window.chemSecureApp.jeopardyPvpAction("queue");
                applyPvpResponse(response);
            } catch (error) {
                showMatchError(error.message);
            } finally {
                pvpSyncBusy = false;
            }
        }, 1500);
    }

    function startPvpClock() {
        if (pvpClockTimer !== null) window.clearInterval(pvpClockTimer);
        pvpClockTimer = window.setInterval(() => {
            if (!pvp.state) return;
            const startAt = pvp.state.start_at ? Date.parse(pvp.state.start_at) : 0;
            if (pvp.matchStatus === "in_progress" && startAt > Date.now()) {
                document.getElementById("roundTitle").textContent = `Game starts in ${Math.ceil((startAt - Date.now()) / 1000)}`;
            } else if (pvp.matchStatus === "in_progress" && startAt && !pvp.state.active &&
                document.getElementById("roundTitle").textContent.startsWith("Game starts in ")) {
                renderPvpBoard();
            }
            updatePvpTimer();
        }, 250);
    }

    function showMatchError(message) {
        elements.matchError.textContent = message;
        elements.matchError.hidden = false;
    }

    async function pvpAction(action, payload) {
        if (!window.chemSecureApp) throw new Error("PvP services are unavailable.");
        const response = await window.chemSecureApp.jeopardyPvpAction(action, payload || {});
        applyPvpResponse(response);
        return response;
    }

    function subscribeToMatch(matchId) {
        if (unsubscribeMatch) {
            unsubscribeMatch();
            unsubscribeMatch = null;
        }
        window.chemSecureApp.subscribeJeopardyMatch(matchId, applyPvpRow, showMatchError)
            .then((unsubscribe) => { unsubscribeMatch = unsubscribe; })
            .catch((error) => showMatchError(error.message));
    }

    function applyPvpRow(row) {
        if (!row || row.id !== pvp.matchId) return;
        applyPvpResponse({
            queueStatus: "matched",
            matchId: row.id,
            status: row.status,
            state: row.public_state
        });
    }

    function applyPvpResponse(response) {
        if (!response) return;
        if (response.queueStatus === "searching") {
            pvp.matchId = null;
            pvp.matchStatus = "searching";
            pvp.state = null;
            elements.searchingPanel.hidden = false;
            elements.matchFoundPanel.hidden = true;
            elements.matchStatus.textContent = "Searching for another Chem Game student…";
            elements.findMatch.hidden = true;
            elements.cancelMatch.hidden = false;
            elements.matchError.hidden = true;
            elements.matchmaking.classList.add("searching");
            showOnly(elements.matchmaking);
            startMusic();
            if (pvpPollTimer === null) startPvpPolling();
            return;
        }
        if (response.queueStatus === "idle") {
            stopPvpPolling();
            if (unsubscribeMatch) {
                unsubscribeMatch();
                unsubscribeMatch = null;
            }
            pvp.matchId = null;
            pvp.matchStatus = "idle";
            pvp.state = null;
            elements.searchingPanel.hidden = false;
            elements.matchFoundPanel.hidden = true;
            elements.matchStatus.textContent = "Matchmaking is ready when you are.";
            elements.findMatch.hidden = false;
            elements.cancelMatch.hidden = true;
            elements.matchmaking.classList.remove("searching");
            showOnly(elements.matchmaking);
            return;
        }
        if (response.queueStatus !== "matched" || !response.state) return;

        if (response.matchId && pvp.matchId !== response.matchId) {
            pvp.matchId = response.matchId;
            subscribeToMatch(pvp.matchId);
            startPvpPolling();
        }
        pvp.matchStatus = response.status || response.state.status;
        pvp.state = response.state;
        if (response.playerSlot) pvp.playerSlot = response.playerSlot;
        elements.matchmaking.classList.remove("searching");
        if (pvp.matchStatus === "cancelled") {
            pvp.matchId = null;
            pvp.matchStatus = "searching";
            elements.searchingPanel.hidden = false;
            elements.matchFoundPanel.hidden = true;
            elements.matchStatus.textContent = "Your opponent left. Finding another student…";
            elements.findMatch.hidden = true;
            elements.cancelMatch.hidden = false;
            showOnly(elements.matchmaking);
            return;
        }
        if (pvp.matchStatus === "abandoned") {
            stopPvpPolling();
            pvp.matchId = null;
            pvp.matchStatus = "idle";
            elements.searchingPanel.hidden = false;
            elements.matchFoundPanel.hidden = true;
            elements.matchStatus.textContent = "The match ended because a player left. No match XP was awarded.";
            elements.findMatch.hidden = false;
            elements.cancelMatch.hidden = true;
            showOnly(elements.matchmaking);
            return;
        }
        if (pvp.matchStatus === "ready") {
            renderMatchFound();
        } else if (pvp.matchStatus === "in_progress") {
            startMusic();
            renderPvpGame();
        } else if (pvp.matchStatus === "finished") {
            renderPvpResults();
        }
    }

    function renderMatchFound() {
        const players = pvp.state.players || {};
        const mine = players[pvp.playerSlot] || {};
        const opponentSlot = pvp.playerSlot === "one" ? "two" : "one";
        const opponent = players[opponentSlot] || {};
        elements.searchingPanel.hidden = true;
        elements.matchFoundPanel.hidden = false;
        document.getElementById("myDisplayName").textContent = mine.name || pvp.profile?.display_name || "You";
        document.getElementById("opponentDisplayName").textContent = opponent.name || "Challenger";
        document.getElementById("myReadyStatus").textContent = mine.ready ? "Ready" : "Not ready";
        document.getElementById("opponentReadyStatus").textContent = opponent.ready ? "Ready" : "Not ready";
        document.getElementById("readyStatusText").textContent =
            mine.ready && opponent.ready ? "Both players are ready. The game is starting…" :
                opponent.ready ? "Your challenger is ready. Confirm to begin." :
                    mine.ready ? "You are ready. Waiting for your challenger…" :
                        "Confirm when you are ready to play.";
        elements.ready.disabled = Boolean(mine.ready);
        elements.ready.textContent = mine.ready ? "Ready confirmed" : "I'm ready →";
        elements.ready.hidden = Boolean(mine.ready);
        elements.decline.hidden = false;
        showOnly(elements.matchmaking);
    }

    function renderPvpBoard() {
        const stateNow = pvp.state;
        const players = stateNow.players || {};
        const mine = players[pvp.playerSlot] || {};
        const opponentSlot = pvp.playerSlot === "one" ? "two" : "one";
        const opponent = players[opponentSlot] || {};
        elements.headerScore.parentElement.querySelector("span").textContent = mine.name || "You";
        elements.headerScore.textContent = String(mine.score || 0);
        elements.opponentName.textContent = opponent.name || "Opponent";
        elements.opponentScore.textContent = String(opponent.score || 0);
        elements.opponentScoreChip.hidden = false;
        const done = Array.isArray(stateNow.answered_positions) ? stateNow.answered_positions : [];
        elements.boardElement.replaceChildren();
        const gameStarting = stateNow.start_at && Date.parse(stateNow.start_at) > Date.now();
        categories.forEach((category) => {
            const heading = document.createElement("div");
            heading.className = "category-cell";
            heading.textContent = category;
            elements.boardElement.appendChild(heading);
        });
        points.forEach((pointValue, row) => {
            categories.forEach((category, column) => {
                const position = row * categories.length + column;
                const tile = document.createElement("button");
                tile.type = "button";
                tile.className = "clue-cell";
                tile.dataset.position = String(position);
                tile.setAttribute("aria-label", `${category}, ${pointValue} points`);
                if (done.includes(position) || stateNow.active) {
                    tile.disabled = true;
                    tile.classList.add("completed");
                    tile.setAttribute("aria-label", `${category}, ${pointValue} points, unavailable`);
                } else {
                    tile.textContent = `$${pointValue.toLocaleString("en-US")}`;
                    if (gameStarting) {
                        tile.disabled = true;
                        tile.classList.add("starting");
                    }
                }
                elements.boardElement.appendChild(tile);
            });
        });
        elements.remaining.textContent = String(25 - done.length);
        if (stateNow.start_at && Date.parse(stateNow.start_at) > Date.now()) {
            document.getElementById("roundTitle").textContent = `Game starts in ${Math.ceil((Date.parse(stateNow.start_at) - Date.now()) / 1000)}`;
        } else {
            document.getElementById("roundTitle").textContent = "Choose a clue";
        }
        elements.buzzStatus.hidden = true;
        elements.form.hidden = false;
        elements.result.hidden = true;
        showOnly(elements.board);
    }

    function renderPvpGame() {
        if (!pvp.state) return;
        const active = pvp.state.active;
        if (!active || active === null) {
            elements.headerScore.parentElement.querySelector("span").textContent =
                pvp.state.players[pvp.playerSlot]?.name || "You";
            elements.headerScore.textContent = String(pvp.state.players[pvp.playerSlot]?.score || 0);
            renderPvpBoard();
            return;
        }
        elements.headerScore.parentElement.querySelector("span").textContent =
            pvp.state.players[pvp.playerSlot]?.name || "You";
        elements.headerScore.textContent = String(pvp.state.players[pvp.playerSlot]?.score || 0);
        const opponentSlot = pvp.playerSlot === "one" ? "two" : "one";
        elements.opponentName.textContent = pvp.state.players[opponentSlot]?.name || "Opponent";
        elements.opponentScore.textContent = String(pvp.state.players[opponentSlot]?.score || 0);
        elements.opponentScoreChip.hidden = false;
        elements.category.textContent = active.category;
        elements.points.textContent = `$${Number(active.points).toLocaleString("en-US")}`;
        elements.clue.textContent = active.clue;
        elements.form.hidden = true;
        elements.input.disabled = true;
        elements.submit.disabled = true;
        elements.result.hidden = true;
        elements.buzzStatus.hidden = false;
        const phase = pvp.state.phase;
        const mine = pvp.state.players[pvp.playerSlot] || {};
        const firstBuzzer = active.first_buzzer;
        const mineMayBuzz = phase === "buzz" || (phase === "steal" && firstBuzzer !== pvp.playerSlot);
        elements.buzzButton.hidden = !mineMayBuzz;
        elements.buzzButton.disabled = !mineMayBuzz || Boolean(active.buzzed_by);
        elements.buzzPrompt.textContent = phase === "steal" ? "Steal the clue!" : "Buzz in!";
        if (phase === "answer" && active.buzzed_by !== pvp.playerSlot) {
            elements.buzzTurnStatus.textContent = `${pvp.state.players[active.buzzed_by]?.name || "Your opponent"} is answering…`;
        } else if (phase === "steal" && firstBuzzer === pvp.playerSlot) {
            elements.buzzTurnStatus.textContent = "Waiting for your opponent to steal…";
        } else {
            elements.buzzTurnStatus.textContent = "";
        }
        if (phase === "answer" && active.buzzed_by === pvp.playerSlot) {
            elements.buzzStatus.hidden = true;
            elements.form.hidden = false;
            elements.input.disabled = false;
            elements.submit.disabled = false;
            elements.input.focus();
        }
        if (phase === "result") {
            elements.buzzStatus.hidden = true;
            elements.result.hidden = false;
            elements.resultLabel.textContent = active.was_correct ? "Correct answer" : "Clue resolved";
            elements.correctAnswer.textContent = `Correct answer: ${active.correct_answer}`;
            elements.continue.textContent = "Next clue →";
        } else if (pvp.state.feedback && phase === "steal") {
            elements.buzzTurnStatus.textContent = pvp.state.feedback;
        }
        showOnly(elements.question);
        updatePvpTimer();
    }

    function updatePvpTimer() {
        if (!pvp.state || !pvp.state.active || pvp.state.phase === "result") return;
        const active = pvp.state.active;
        const total = pvp.state.phase === "buzz" ? 30 : 10;
        const remaining = Math.max(0, Math.ceil((Date.parse(active.deadline) - Date.now()) / 1000));
        elements.timer.textContent = String(remaining);
        elements.ring.style.strokeDashoffset = String(326.73 * (1 - Math.min(1, remaining / total)));
        elements.ring.style.stroke = remaining <= 5 ? "#f0b45a" : "#86c9bd";
        if (remaining === 0 && !pvpSyncBusy && pvp.matchId) {
            pvpSyncBusy = true;
            window.chemSecureApp.jeopardyPvpAction("sync", { matchId: pvp.matchId })
                .then(applyPvpResponse)
                .catch((error) => showMatchError(error.message))
                .finally(() => { pvpSyncBusy = false; });
        }
    }

    function renderPvpResults() {
        stopPvpPolling();
        stopMusic();
        const awards = pvp.state.awards || [];
        const players = pvp.state.players || {};
        const one = players.one || {};
        const two = players.two || {};
        const a = Number(one.score || 0);
        const b = Number(two.score || 0);
        const title = a === b ? "It's a tie!" : `${a > b ? one.name : two.name} wins!`;
        document.getElementById("pvpWinnerTitle").textContent = title;
        document.getElementById("scoreDifference").textContent = `Final margin: ${Math.abs(a - b)} points`;
        document.getElementById("resultPlayerOneName").textContent = one.name || "Player one";
        document.getElementById("resultPlayerOneScore").textContent = String(a);
        document.getElementById("resultPlayerOneStats").textContent = `${one.correct || 0} correct · ${one.incorrect || 0} incorrect`;
        document.getElementById("resultPlayerTwoName").textContent = two.name || "Player two";
        document.getElementById("resultPlayerTwoScore").textContent = String(b);
        document.getElementById("resultPlayerTwoStats").textContent = `${two.correct || 0} correct · ${two.incorrect || 0} incorrect`;
        document.getElementById("resultPlayerOneXp").textContent = formatAward(awards.find((award) => award.slot === "one"));
        document.getElementById("resultPlayerTwoXp").textContent = formatAward(awards.find((award) => award.slot === "two"));
        showOnly(elements.pvpFinal);
    }

    function formatAward(award) {
        if (!award) return "XP award unavailable";
        return `Base ${award.baseXp} × ${award.matchMultiplier} match × ${award.lessonMultiplier} lesson = ${award.awardedXp} XP`;
    }

    async function beginMatchmaking() {
        elements.matchError.hidden = true;
        elements.matchStatus.textContent = "Connecting to Chem Game matchmaking…";
        try {
            await ensureSignedIn();
            const response = await window.chemSecureApp.jeopardyPvpAction("queue");
            applyPvpResponse(response);
        } catch (error) {
            showMatchError(error.message);
            elements.matchStatus.textContent = "Sign in to Chem Game to play PvP.";
        }
    }

    document.getElementById("startGameButton").addEventListener("click", async () => {
        if (soloQuestionsLoading) return;
        soloQuestionsLoading = true;
        document.getElementById("startGameButton").disabled = true;
        try {
            await loadSoloQuestions();
        } catch (error) {
            document.getElementById("introDialogue").textContent = error.message;
            document.getElementById("startGameButton").disabled = false;
            soloQuestionsLoading = false;
            return;
        }
        resetHeaderForSolo();
        sfx("openMenu");
        startMusic();
        showOnly(elements.board);
        renderBoard();
        soloQuestionsLoading = false;
    });

    document.getElementById("pvpModeButton").addEventListener("click", async () => {
        elements.searchingPanel.hidden = false;
        elements.matchFoundPanel.hidden = true;
        elements.findMatch.hidden = false;
        elements.cancelMatch.hidden = true;
        elements.matchStatus.textContent = "Find another authenticated Chem Game student and compete on the same board.";
        elements.matchError.hidden = true;
        showOnly(elements.matchmaking);
    });

    elements.findMatch.addEventListener("click", beginMatchmaking);
    elements.cancelMatch.addEventListener("click", async () => {
        try {
            await pvpAction("decline", { matchId: pvp.matchId });
        } catch (error) {
            showMatchError(error.message);
        }
    });
    elements.decline.addEventListener("click", async () => {
        try {
            await pvpAction("decline", { matchId: pvp.matchId });
        } catch (error) {
            showMatchError(error.message);
        }
    });
    elements.ready.addEventListener("click", async () => {
        elements.ready.disabled = true;
        try {
            await pvpAction("ready", { matchId: pvp.matchId });
        } catch (error) {
            elements.ready.disabled = false;
            showMatchError(error.message);
        }
    });

    elements.boardElement.addEventListener("click", async (event) => {
        const tile = event.target.closest(".clue-cell");
        if (!tile || tile.disabled) return;
        sfx("selectAnswer");
        if (pvp.matchStatus === "in_progress" && pvp.matchId) {
            try {
                const response = await pvpAction("select", {
                    matchId: pvp.matchId,
                    position: Number(tile.dataset.position)
                });
                if (response.state?.active) sfx("openMenu");
            } catch (error) {
                showMatchError(error.message);
            }
            return;
        }
        openQuestion(tile.dataset.category, Number(tile.dataset.points));
    });

    elements.buzzButton.addEventListener("click", async () => {
        elements.buzzButton.disabled = true;
        sfx("selectAnswer");
        try {
            await pvpAction("buzz", { matchId: pvp.matchId });
        } catch (error) {
            elements.buzzButton.disabled = false;
            showMatchError(error.message);
        }
    });

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (pvp.matchStatus === "in_progress" && pvp.matchId) {
            if (!elements.input.value.trim()) {
                elements.input.focus();
                return;
            }
            elements.input.disabled = true;
            elements.submit.disabled = true;
            sfx("selectAnswer");
            try {
                await pvpAction("answer", { matchId: pvp.matchId, answer: elements.input.value });
            } catch (error) {
                elements.input.disabled = false;
                elements.submit.disabled = false;
                showMatchError(error.message);
            }
            return;
        }
        if (!state.active || completed.has(state.active.key)) return;
        if (!elements.input.value.trim()) {
            elements.input.focus();
            return;
        }
        sfx("selectAnswer");
        endQuestion(false);
    });

    elements.continue.addEventListener("click", async () => {
        sfx("closeMenu");
        if (pvp.matchStatus === "in_progress" && pvp.matchId) {
            try {
                await pvpAction("next", { matchId: pvp.matchId });
            } catch (error) {
                showMatchError(error.message);
            }
            return;
        }
        state.active = null;
        if (completed.size >= categories.length * points.length) {
            finishGame();
        } else {
            renderBoard();
            showOnly(elements.board);
        }
    });

    function finishGame() {
        stopTimer();
        stopMusic();
        showOnly(elements.final);
        document.getElementById("finalScore").textContent = String(state.score);
        document.getElementById("correctCount").textContent = String(state.correct);
        document.getElementById("incorrectCount").textContent = String(state.incorrect);
        document.getElementById("unansweredCount").textContent = String(state.unanswered);
        document.getElementById("completedCount").textContent = String(state.completed);
        sfx("completeLesson");
    }

    document.getElementById("playAgainButton").addEventListener("click", () => {
        stopTimer();
        completed.clear();
        state.score = 0;
        state.correct = 0;
        state.incorrect = 0;
        state.unanswered = 0;
        state.completed = 0;
        state.active = null;
        resetHeaderForSolo();
        renderBoard();
        showOnly(elements.board);
        startMusic();
    });

    document.getElementById("settingsButton").addEventListener("click", () => {
        document.getElementById("musicToggle").checked = preferences.musicEnabled;
        document.getElementById("effectsToggle").checked = preferences.effectsEnabled;
        document.getElementById("musicVolume").value = String(preferences.musicVolume);
        document.getElementById("effectsVolume").value = String(preferences.effectsVolume);
        elements.settings.showModal();
    });
    document.getElementById("closeSettingsButton").addEventListener("click", () => elements.settings.close());
    ["musicToggle", "effectsToggle", "musicVolume", "effectsVolume"].forEach((id) => {
        document.getElementById(id).addEventListener("change", savePreferences);
    });

    async function initializeAuth() {
        if (!window.chemSecureApp || !window.chemSecureApp.isConfigured()) return;
        try {
            await window.chemSecureApp.start(
                (profile) => { pvp.profile = profile; pvp.userId = profile.id; },
                () => { pvp.profile = null; pvp.userId = null; },
                (message) => { pvp.authError = message; }
            );
        } catch (error) {
            pvp.authError = error.message;
        }
    }

    window.addEventListener("pagehide", () => {
        stopTimer();
        stopPvpPolling();
        stopMusic();
        if (pvp.matchId && pvp.matchStatus !== "finished") {
            window.chemSecureApp?.jeopardyPvpAction("decline", { matchId: pvp.matchId }).catch(() => {});
        }
        if (unsubscribeMatch) unsubscribeMatch();
        if (pvpClockTimer !== null) window.clearInterval(pvpClockTimer);
    });

    renderBoard();
    startPvpClock();
    initializeAuth();
})();
