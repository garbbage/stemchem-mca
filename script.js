const lessonDialog = document.getElementById("lessonDialog");
const toast = document.getElementById("toast");
const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const authForm = document.getElementById("authForm");
const authPasswordInput = document.getElementById("authPassword");
const authFeedback = document.getElementById("authFeedback");
let currentProfile = null;
const topicDetails = [
    { title: "Measurements", icon: "📏", description: "Measure matter and make every digit count." },
    { title: "Atomic Structure", icon: "⚛", description: "Explore the particles inside every atom." },
    { title: "Periodic Table", icon: "🧩", description: "Spot patterns in the elements." },
    { title: "Chemical Bonding", icon: "🔗", description: "Discover how atoms join together." },
    { title: "Intermolecular Forces (IMF)", key: "IMF", icon: "🧲", description: "Explore attractions between molecules." },
    { title: "States of Matter", icon: "🫧", description: "Compare solids, liquids, gases, and more." },
    { title: "Chemical Equations", icon: "🧮", description: "Read and balance the language of reactions." },
    { title: "Chemical Reactions", icon: "✨", description: "Recognize how substances transform." },
    { title: "Gas Laws", icon: "🎈", description: "Connect gas pressure, volume, and temperature." },
    { title: "Solutions", icon: "🧪", description: "Learn how solutes mix into solvents." },
    { title: "Acids and Bases", icon: "🧫", description: "Compare pH, acids, bases, and neutralization." },
    { title: "Thermochemistry", icon: "🌡️", description: "Track heat and energy in chemical change." },
    { title: "General Chemistry", icon: "🔬", description: "Bring the course together in a mixed review." }
];
const topicNames = TOPICS;
const topicNameMap = new Map(topicDetails.map((topic) => [topic.key || topic.title, topic]));
const wordLabelMap = {
    significantfigures: "Significant figures",
    atomicnumber: "Atomic number",
    atomicmass: "Atomic mass",
    periodictable: "Periodic table",
    alkalimetals: "Alkali metals",
    transitionmetals: "Transition metals",
    noblegas: "Noble gas",
    strongacid: "Strong acid",
    diproticacid: "Diprotic acid",
    actualyield: "Actual yield",
    ionicbond: "Ionic bond",
    covalentbond: "Covalent bond",
    metallicbond: "Metallic bond",
    intermolecular: "Intermolecular",
    intramolecular: "Intramolecular",
    boyleslaw: "Boyle’s law",
    charlesslaw: "Charles’s law",
    combinedgaslaw: "Combined gas law",
    idealgaslaw: "Ideal gas law",
    limitingreagent: "Limiting reagent",
    theoreticalyield: "Theoretical yield",
    singledisplacement: "Single displacement",
    doubledisplacement: "Double displacement",
    dipoledipole: "Dipole-dipole",
    londondispersion: "London dispersion",
    ph: "pH"
};
let toastTimer;
let totalXp = 0;
let dailyXp = 0;
let completedTopics = [];
let activityDates = [];
let learningProgress = {};
let adminStudents = [];
let flashcardState = { words: [], index: 0, topic: "" };
let quizState = null;

function todayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

function updateName(name) {
    document.getElementById("greetingName").textContent = name;
    document.getElementById("sidebarName").textContent = name;
    document.getElementById("profilePageName").textContent = name;
}

function updateProgress(progress) {
    totalXp = progress.total_xp || 0;
    dailyXp = progress.daily_date === todayKey() ? (progress.daily_xp || 0) : 0;
    completedTopics = Array.isArray(progress.completed_topics)
        ? progress.completed_topics.filter((topic) => topicNames.includes(topic))
        : [];
    if (Object.prototype.hasOwnProperty.call(progress, "learning_progress")) {
        learningProgress = progress.learning_progress && typeof progress.learning_progress === "object"
            ? progress.learning_progress
            : {};
    }
    activityDates = Array.isArray(progress.activity_dates)
        ? progress.activity_dates.map((date) => String(date).slice(0, 10))
        : [];
    window.ChemLearning.setProgress(learningProgress, completedTopics);
    updateXpDisplay();
    updateStreak();
    updateCurriculumProgress();
    renderCurriculum();
}

function showSignedOut() {
    currentProfile = null;
    totalXp = 0;
    dailyXp = 0;
    completedTopics = [];
    activityDates = [];
    learningProgress = {};
    authScreen.hidden = false;
    appShell.hidden = true;
    document.getElementById("adminNavLink").hidden = true;
    document.getElementById("authPassword").value = "";
    document.getElementById("authUsername").value = "";
    if (window.location.hash) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    document.getElementById("adminCreateForm").reset();
    document.getElementById("passwordChangeForm").reset();
    document.getElementById("passwordChangeFeedback").textContent = "";
    document.getElementById("adminFeedback").textContent = "";
    adminStudents = [];
    updateName("Chemist");
    window.ChemLearning.setProgress(learningProgress, completedTopics);
    updateXpDisplay();
    updateStreak();
    updateCurriculumProgress();
    renderCurriculum();
    document.getElementById("adminRosterBody").replaceChildren();
    const leaderboard = document.getElementById("leaderboardList");
    if (leaderboard) {
        leaderboard.replaceChildren();
    }
}

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!authForm.reportValidity()) {
        return;
    }

    const username = document.getElementById("authUsername").value;
    const password = authPasswordInput.value;
    const submit = document.getElementById("authSubmit");
    submit.disabled = true;
    submit.textContent = "Signing in…";
    authFeedback.textContent = "";
    try {
        await window.chemSecureApp.signIn(username, password);
    } catch (error) {
        authFeedback.textContent = error.message;
    } finally {
        submit.disabled = false;
        submit.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
    }
});

function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function getTopicEntries(topic) {
    if (topic === "All units") {
        return wordBank;
    }
    return wordBank.filter((entry) => entry.topic === topic && entry.word && entry.clue);
}

function getClue(entry) {
    return Array.isArray(entry.clue) ? entry.clue[0] : entry.clue;
}

function formatWord(word) {
    const normalized = String(word).toLowerCase();
    if (wordLabelMap[normalized]) {
        return wordLabelMap[normalized];
    }
    return String(word)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shuffle(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function updateXpDisplay() {
    document.getElementById("xpCount").textContent = String(totalXp);
    const level = Math.floor(totalXp / 100) + 1;
    const displayedLevel = Math.min(30, level);
    document.getElementById("playerLevel").textContent = String(displayedLevel);
    document.getElementById("heroLevel").textContent = String(displayedLevel);
    document.getElementById("profilePageLevel").textContent = String(displayedLevel);
    document.getElementById("profileXp").textContent = `${totalXp} XP`;
    const score = Math.min(20, dailyXp);
    document.getElementById("goalScore").textContent = String(score);
    document.getElementById("goalProgress").style.width = `${score * 5}%`;
    document.getElementById("goalRemaining").textContent = score >= 20
        ? "Goal complete!"
        : `${20 - score} XP to go`;
}

function getCurrentStreak() {
    const activeDates = new Set(activityDates);
    const cursor = new Date();
    if (!activeDates.has(todayKey(cursor))) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        if (!activeDates.has(todayKey(cursor))) {
            return 0;
        }
    }

    let count = 0;
    while (activeDates.has(todayKey(cursor))) {
        count += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return count;
}

function updateStreak() {
    const streak = getCurrentStreak();
    document.getElementById("streakCount").textContent = String(streak);
    document.getElementById("profileStreak").textContent = `${streak} day${streak === 1 ? "" : "s"}`;
    document.querySelector(".streak-stat img").src = streak
        ? "icons/Streak Activated_.png"
        : "icons/Streak Dead.png";
    document.getElementById("streakCaption").innerHTML = streak
        ? `<strong>${streak} day${streak === 1 ? "" : "s"} in a row!</strong> Come back tomorrow to keep your streak.`
        : "Complete a lesson or game to start your streak.";

    const weekDays = document.querySelectorAll(".week-days span");
    const monday = new Date();
    monday.setUTCHours(0, 0, 0, 0);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    weekDays.forEach((day, index) => {
        const date = new Date(monday);
        date.setUTCDate(monday.getUTCDate() + index);
        const active = activityDates.includes(todayKey(date));
        day.querySelector("small").textContent = new Intl.DateTimeFormat("en-US", { weekday: "narrow", timeZone: "UTC" }).format(date);
        day.querySelector("b").textContent = active ? "✓" : "·";
        day.querySelector("b").classList.toggle("day-done", active);
        day.setAttribute("aria-label", `${new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(date)}${active ? ", activity complete" : ", no activity yet"}`);
    });
}

function updateCurriculumProgress() {
    const lessons = window.ChemLearning.getLessons();
    const completed = Array.isArray(learningProgress.completed_lessons)
        ? learningProgress.completed_lessons
        : [];
    const completedCount = lessons.filter((lesson) => completed.includes(lesson.slug)).length;
    document.getElementById("profileUnits").textContent = `${completedCount} of ${lessons.length}`;
    document.getElementById("courseProgressLabel").textContent = `${completedCount} of ${lessons.length} lessons`;
    document.getElementById("courseProgressBar").style.width = `${(completedCount / lessons.length) * 100}%`;

    const lastTopic = lessons.find((lesson) => lesson.slug === learningProgress.current_topic);
    const firstIncomplete = lessons.find((lesson) => !completed.includes(lesson.slug));
    const unlockedIndex = lessons.findIndex((lesson) => !completedTopics.includes(lesson.topic));
    const maxAvailableIndex = unlockedIndex === -1 ? lessons.length - 1 : unlockedIndex;
    const candidate = lastTopic &&
        !completed.includes(lastTopic.slug) &&
        lessons.indexOf(lastTopic) <= maxAvailableIndex
        ? lastTopic
        : firstIncomplete && lessons.indexOf(firstIncomplete) <= maxAvailableIndex
            ? firstIncomplete
            : lessons[maxAvailableIndex];
    const candidateIndex = lessons.indexOf(candidate);
    document.getElementById("nextUnitLabel").textContent =
        `Recommended next lesson · Topic ${candidateIndex + 1}: ${candidate.topic === "IMF" ? "Intermolecular Forces" : candidate.topic}`;
}

function renderCurriculum() {
    window.ChemLearning.renderCurriculum();
    updateCurriculumProgress();
}

function renderDictionary(searchTerm = "") {
    const query = searchTerm.trim().toLocaleLowerCase();
    const matches = wordBank.filter((entry) => {
        const clue = getClue(entry);
        return `${entry.word} ${entry.topic} ${clue}`.toLocaleLowerCase().includes(query);
    });
    const list = document.getElementById("dictionaryList");
    list.replaceChildren();
    document.getElementById("dictionaryResultCount").textContent =
        `${matches.length} term${matches.length === 1 ? "" : "s"}`;

    if (!matches.length) {
        const empty = document.createElement("p");
        empty.className = "dictionary-empty";
        empty.textContent = "No matching terms. Try another search.";
        list.append(empty);
        return;
    }

    matches.forEach((entry) => {
        const card = document.createElement("article");
        card.className = "dictionary-entry";
        const term = document.createElement("h2");
        term.textContent = formatWord(entry.word);
        const topic = document.createElement("span");
        topic.className = "dictionary-topic";
        topic.textContent = topicNameMap.get(entry.topic)?.title || entry.topic;
        const definition = document.createElement("p");
        definition.textContent = getClue(entry);
        card.append(term, topic, definition);
        list.append(card);
    });
}

function openFlashcards(topic) {
    const words = getTopicEntries(topic);
    if (!words.length) {
        showToast(`There are no word bank terms available for ${topic} yet.`);
        return;
    }
    flashcardState = { words: topic === "All units" ? shuffle(words) : words, index: 0, topic };
    document.getElementById("dialogEyebrow").textContent = "UNIT WORD BANK";
    document.getElementById("dialogTitle").textContent = topicNameMap.get(topic)?.title || topic;
    document.getElementById("flashcardPanel").hidden = false;
    document.getElementById("challengePanel").hidden = true;
    document.getElementById("startTopicChallenge").hidden = false;
    document.getElementById("startTopicChallenge").textContent = "Start unit challenge →";
    renderFlashcard();
    lessonDialog.showModal();
}

function renderFlashcard() {
    const entry = flashcardState.words[flashcardState.index];
    const clue = document.getElementById("wordClue");
    document.getElementById("wordTopic").textContent = flashcardState.topic === "All units"
        ? `ALL UNITS · ${entry.topic}`
        : flashcardState.topic;
    document.getElementById("wordTerm").textContent = formatWord(entry.word);
    document.getElementById("wordCounter").textContent = `WORD ${flashcardState.index + 1} OF ${flashcardState.words.length}`;
    clue.textContent = getClue(entry);
    clue.hidden = true;
    document.getElementById("flipWordButton").textContent = "Show definition";
    document.getElementById("previousWordButton").disabled = flashcardState.index === 0;
    document.getElementById("nextWordButton").disabled = flashcardState.index === flashcardState.words.length - 1;
}

function startQuiz(topic, completesUnit = false) {
    window.chemSecureApp.startQuiz(topic).then((result) => {
        quizState = {
            sessionId: result.sessionId,
            questions: result.questions,
            index: 0,
            correct: 0,
            topic,
            completesUnit,
            serverPassed: false,
            serverComplete: false
        };
        document.getElementById("dialogEyebrow").textContent = completesUnit ? "UNIT CHALLENGE" : "GAMES LAB · WORD BANK SPRINT";
        document.getElementById("dialogTitle").textContent = topic
            ? `${topicNameMap.get(topic)?.title || topic} challenge`
            : "Word bank sprint";
        document.getElementById("flashcardPanel").hidden = true;
        document.getElementById("challengePanel").hidden = false;
        renderQuestion();
        if (!lessonDialog.open) {
            lessonDialog.showModal();
        }
    }).catch((error) => {
        showToast(error.message);
    });
}

function renderQuestion() {
    const question = quizState.questions[quizState.index];
    const answerContainer = document.getElementById("challengeAnswers");
    document.getElementById("challengePrompt").textContent = `Which term matches this clue? ${question.clue}`;
    document.getElementById("quizFeedback").textContent = "";
    document.getElementById("quizContinueButton").hidden = true;
    answerContainer.replaceChildren();
    question.choices.forEach((word) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-option";
        button.dataset.answer = word;
        button.textContent = formatWord(word);
        answerContainer.append(button);
        button.addEventListener("click", () => chooseAnswer(button, question));
    });
}

async function chooseAnswer(button, question) {
    const answerContainer = document.getElementById("challengeAnswers");
    answerContainer.querySelectorAll(".answer-option").forEach((option) => {
        option.disabled = true;
    });
    const quizFeedback = document.getElementById("quizFeedback");
    quizFeedback.textContent = "Checking your answer…";
    try {
        const result = await window.chemSecureApp.submitAnswer(
            quizState.sessionId,
            question.id,
            button.dataset.answer
        );
        if (result.correct) {
            quizState.correct += 1;
            quizFeedback.textContent = result.awarded
                ? "Correct! +10 XP"
                : "Correct! This question has already earned XP.";
        } else {
            button.classList.add("incorrect");
            quizFeedback.textContent = `Not quite — the answer is ${formatWord(result.correctAnswer)}.`;
        }
        answerContainer.querySelectorAll(".answer-option").forEach((option) => {
            if (option.dataset.answer.toLowerCase() === result.correctAnswer.toLowerCase()) {
                option.classList.add("correct");
            }
        });
        updateProgress(result.progress);
        quizState.serverPassed = result.passed;
        quizState.serverComplete = result.complete;
    } catch (error) {
        quizFeedback.textContent = `${error.message} Start a new round if this question cannot be saved.`;
    }
    document.getElementById("quizContinueButton").hidden = false;
}

function finishQuiz() {
    const passed = quizState.serverPassed;
    const complete = quizState.serverComplete;
    document.getElementById("challengePrompt").textContent = complete
        ? `Round complete! You got ${quizState.correct} of ${quizState.questions.length} correct.`
        : "This round was not fully saved. Start another round to continue earning progress.";
    document.getElementById("challengeAnswers").innerHTML = "";
    document.getElementById("quizFeedback").textContent = !complete
        ? "Only answers verified by the server count toward your progress."
        : quizState.completesUnit
        ? passed ? "Unit cleared! The next unit is unlocked." : "Score 60% or higher to clear this unit and unlock the next."
        : "Play again or study a unit word bank to keep your streak going.";
    const continueButton = document.getElementById("quizContinueButton");
    continueButton.textContent = "Done";
    continueButton.dataset.finished = "true";
    continueButton.hidden = false;
    quizState.finished = true;
}

document.getElementById("quizContinueButton").addEventListener("click", () => {
    if (!quizState) {
        lessonDialog.close();
        return;
    }
    if (quizState.finished) {
        quizState = null;
        const button = document.getElementById("quizContinueButton");
        button.dataset.finished = "false";
        button.innerHTML = 'Continue <span aria-hidden="true">→</span>';
        lessonDialog.close();
        return;
    }
    quizState.index += 1;
    if (quizState.index >= quizState.questions.length || quizState.serverComplete) {
        finishQuiz();
    } else {
        renderQuestion();
    }
});

document.getElementById("previousWordButton").addEventListener("click", () => {
    if (flashcardState.index > 0) {
        flashcardState.index -= 1;
        renderFlashcard();
    }
});

document.getElementById("nextWordButton").addEventListener("click", () => {
    if (flashcardState.index < flashcardState.words.length - 1) {
        flashcardState.index += 1;
        renderFlashcard();
    }
});

document.getElementById("flipWordButton").addEventListener("click", () => {
    const clue = document.getElementById("wordClue");
    clue.hidden = !clue.hidden;
    document.getElementById("flipWordButton").textContent = clue.hidden ? "Show definition" : "Hide definition";
});

document.getElementById("startTopicChallenge").addEventListener("click", () => {
    startQuiz(flashcardState.topic, true);
});

document.getElementById("wordSprintButton").addEventListener("click", () => startQuiz(null, false));
document.getElementById("flashcardGameButton").addEventListener("click", () => openFlashcards("All units"));
document.getElementById("profileButton").addEventListener("click", () => navigateToPage("profile"));
document.getElementById("topProfileButton").addEventListener("click", () => navigateToPage("profile"));
document.getElementById("dictionarySearch").addEventListener("input", (event) => {
    renderDictionary(event.currentTarget.value);
});
document.getElementById("continueButton").addEventListener("click", () => {
    const lessons = window.ChemLearning.getLessons();
    const current = lessons.find((lesson) => lesson.slug === learningProgress.current_topic);
    const nextIncomplete = lessons.find((lesson) =>
        !(learningProgress.completed_lessons || []).includes(lesson.slug)
    );
    const unlockedIndex = lessons.findIndex((lesson) => !completedTopics.includes(lesson.topic));
    const lastUnlockedIndex = unlockedIndex === -1 ? lessons.length - 1 : unlockedIndex;
    const topic = current &&
        !(learningProgress.completed_lessons || []).includes(current.slug) &&
        lessons.indexOf(current) <= lastUnlockedIndex
        ? current
        : nextIncomplete && lessons.indexOf(nextIncomplete) <= lastUnlockedIndex
            ? nextIncomplete
            : lessons[lastUnlockedIndex];
    navigateToPage(`lesson/${topic.slug}`);
});

document.getElementById("logoutButton").addEventListener("click", async () => {
    try {
        await window.chemSecureApp.signOut();
    } catch (error) {
        showToast(error.message);
    }
});

document.getElementById("passwordChangeForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = document.getElementById("changePasswordButton");
    const feedback = document.getElementById("passwordChangeFeedback");
    const password = document.getElementById("newPassword").value;
    button.disabled = true;
    feedback.textContent = "";
    try {
        await window.chemSecureApp.updatePassword(password);
        form.reset();
        feedback.textContent = "Password updated. Keep it private and do not reuse your school account password.";
    } catch (error) {
        feedback.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});

function showAppPage(pageName) {
    const lessonSlug = pageName.startsWith("lesson/") ? pageName.slice("lesson/".length) : null;
    const validPages = ["home", "lessons", "games", "leaderboard", "dictionary", "profile", "lesson"];
    if (pageName === "admin" && currentProfile?.role === "admin") {
        validPages.push("admin");
    }
    const selectedPage = lessonSlug
        ? "lesson"
        : validPages.includes(pageName) ? pageName : "home";
    document.querySelectorAll(".app-page").forEach((page) => {
        page.hidden = page.id !== `page-${selectedPage}`;
    });
    const navPage = selectedPage === "lesson" ? "lessons" : selectedPage;
    document.querySelectorAll(".nav-link").forEach((link) => {
        const isCurrent = link.dataset.page === navPage;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
    window.scrollTo({ top: 0, behavior: "instant" });
    if (selectedPage === "leaderboard") {
        loadLeaderboard();
    }
    if (selectedPage === "admin" && currentProfile?.role === "admin") {
        loadAdminRoster();
    }
    if (selectedPage === "lesson" && lessonSlug) {
        window.ChemLearning.openTopic(lessonSlug);
    }
}

function navigateToPage(pageName) {
    const destination = `#${pageName}`;
    if (window.location.hash === destination) {
        showAppPage(pageName);
    } else {
        window.location.hash = destination;
    }
}

window.addEventListener("hashchange", () => {
    showAppPage(window.location.hash.slice(1));
});

async function loadLeaderboard() {
    const empty = document.querySelector(".class-leaderboard-empty");
    const card = document.querySelector(".leaderboard-card");
    if (empty) {
        empty.hidden = true;
    }
    if (!document.getElementById("leaderboardList")) {
        card.querySelector(".leaderboard-heading").insertAdjacentHTML(
            "afterend",
            '<ol class="leaderboard-list" id="leaderboardList" aria-live="polite"></ol>'
        );
    }
    try {
        await window.chemSecureApp.subscribeLeaderboard(
            renderLeaderboard,
            (message) => {
                document.getElementById("leaderboardList").textContent = message;
            }
        );
    } catch (error) {
        document.getElementById("leaderboardList").textContent = error.message;
    }
}

function renderLeaderboard(students) {
    const list = document.getElementById("leaderboardList");
    if (!list || !currentProfile) {
        return;
    }
    list.replaceChildren();
    students.forEach((student, index) => {
        const row = document.createElement("li");
        row.className = "leaderboard-row";
        const rank = document.createElement("span");
        rank.className = "leaderboard-rank";
        rank.textContent = String(index + 1);
        const name = document.createElement("strong");
        name.textContent = student.display_name;
        const xp = document.createElement("span");
        xp.textContent = `${student.total_xp} XP`;
        row.append(rank, name, xp);
        list.append(row);
    });
    if (!students.length) {
        list.textContent = "No active students are on the leaderboard yet.";
    }
}

async function loadAdminRoster() {
    const feedback = document.getElementById("adminFeedback");
    feedback.textContent = "Loading student accounts…";
    try {
        const result = await window.chemSecureApp.adminRequest({ action: "list_students" });
        if (currentProfile?.role !== "admin") {
            return;
        }
        renderAdminRoster(result.students);
        feedback.textContent = "";
    } catch (error) {
        feedback.textContent = error.message;
    }
}

function renderAdminRoster(students) {
    if (currentProfile?.role !== "admin") {
        return;
    }
    adminStudents = students;
    const body = document.getElementById("adminRosterBody");
    body.replaceChildren();
    students.forEach((student) => {
        const row = document.createElement("tr");
        const identity = document.createElement("td");
        const name = document.createElement("strong");
        name.textContent = student.display_name;
        const id = document.createElement("small");
        id.textContent = student.student_id;
        identity.append(name, id);

        const status = document.createElement("td");
        status.textContent = student.is_active ? "Active" : "Inactive";
        const xp = document.createElement("td");
        xp.textContent = `${student.progress.total_xp} XP`;
        const progress = document.createElement("td");
        const units = student.progress.completed_topics.length;
        const activeDays = student.progress.activity_dates.length;
        progress.textContent = `${units} units · ${activeDays} active days`;
        const actions = document.createElement("td");
        const toggle = document.createElement("button");
        toggle.className = "secondary-button roster-action";
        toggle.type = "button";
        toggle.textContent = student.is_active ? "Deactivate" : "Activate";
        toggle.dataset.action = "set_active";
        toggle.dataset.userId = student.id;
        toggle.dataset.active = String(!student.is_active);
        const reset = document.createElement("button");
        reset.className = "secondary-button roster-action";
        reset.type = "button";
        reset.textContent = "Reset password";
        reset.dataset.action = "reset_password";
        reset.dataset.userId = student.id;
        const viewProgress = document.createElement("button");
        viewProgress.className = "secondary-button roster-action";
        viewProgress.type = "button";
        viewProgress.textContent = "View progress";
        viewProgress.dataset.action = "view_progress";
        viewProgress.dataset.userId = student.id;
        actions.append(toggle, reset, viewProgress);
        row.append(identity, status, xp, progress, actions);
        body.append(row);
    });
}

document.getElementById("adminCreateForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = document.getElementById("createStudentButton");
    const feedback = document.getElementById("adminFeedback");
    const studentId = document.getElementById("newStudentId").value;
    const displayName = document.getElementById("newDisplayName").value;
    const temporaryPassword = document.getElementById("newTemporaryPassword").value;
    submit.disabled = true;
    feedback.textContent = "Creating student account…";
    try {
        await window.chemSecureApp.adminRequest({
            action: "create_student", studentId, displayName, temporaryPassword
        });
        form.reset();
        feedback.textContent = "Student account created. Share the temporary password with the student privately.";
        await loadAdminRoster();
    } catch (error) {
        feedback.textContent = error.message;
    } finally {
        submit.disabled = false;
    }
});

document.getElementById("adminRosterBody").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }
    const feedback = document.getElementById("adminFeedback");
    button.disabled = true;
    try {
        if (button.dataset.action === "set_active") {
            await window.chemSecureApp.adminRequest({
                action: "set_active",
                userId: button.dataset.userId,
                isActive: button.dataset.active === "true"
            });
        } else {
            if (button.dataset.action === "reset_password") {
                const temporaryPassword = window.prompt("Enter a new temporary password (6–128 characters).");
                if (!temporaryPassword) {
                    return;
                }
                await window.chemSecureApp.adminRequest({
                    action: "reset_password",
                    userId: button.dataset.userId,
                    temporaryPassword
                });
                feedback.textContent = "Password reset. Share the new temporary password with the student privately.";
            } else {
                const student = adminStudents.find((item) => item.id === button.dataset.userId);
                if (student) {
                    const units = student.progress.completed_topics.length
                        ? student.progress.completed_topics.join(", ")
                        : "none completed";
                    const dates = student.progress.activity_dates.length
                        ? student.progress.activity_dates.join(", ")
                        : "no recorded activity";
                    const dailyXp = student.progress.daily_date === todayKey()
                        ? student.progress.daily_xp
                        : 0;
                    feedback.textContent = `${student.display_name}: ${student.progress.total_xp} total XP, ${dailyXp} XP today, units: ${units}; activity dates: ${dates}.`;
                }
            }
        }
        if (button.dataset.action !== "view_progress") {
            await loadAdminRoster();
        }
    } catch (error) {
        feedback.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});

document.getElementById("syncQuestionBankButton").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const feedback = document.getElementById("adminFeedback");
    button.disabled = true;
    feedback.textContent = "Saving the chemistry question bank…";
    try {
        const questionsByKey = new Map();
        wordBank.forEach((entry) => {
            const clue = getClue(entry);
            if (entry.word && clue) {
                const key = `${entry.topic}:${entry.word.toLocaleLowerCase()}`;
                if (!questionsByKey.has(key)) {
                    questionsByKey.set(key, { topic: entry.topic, word: entry.word, clue });
                }
            }
        });
        const result = await window.chemSecureApp.adminRequest({
            action: "sync_questions",
            questions: [...questionsByKey.values()]
        });
        feedback.textContent = `${result.imported} chemistry questions are ready for games.`;
    } catch (error) {
        feedback.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});

function handleAuthenticated(profile, progress) {
    currentProfile = profile;
    authScreen.hidden = true;
    appShell.hidden = false;
    document.getElementById("adminNavLink").hidden = profile.role !== "admin";
    updateName(profile.display_name);
    updateProgress(progress);
    showAppPage(window.location.hash.slice(1));
}

document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
}).format(new Date());
window.ChemLearning.configure({
    request: (action, payload) => window.chemSecureApp.updateLearning(action, payload),
    onProgress: updateProgress,
    onToast: showToast,
    navigate: navigateToPage,
    openWords: openFlashcards
});
renderDictionary();
showSignedOut();
window.chemSecureApp.start(
    handleAuthenticated,
    showSignedOut,
    (message) => {
        authFeedback.textContent = message;
        showSignedOut();
    }
);
