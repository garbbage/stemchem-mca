(function () {
    const lessons = window.CHEM_LESSONS;
    let activeLesson = null;
    let activeSection = 0;
    let progress = {};
    let completedTopicNames = [];
    let integration = null;
    let challengeAnswers = {};
    let requestQueue = Promise.resolve();
    const diagrams = {
        measurements: {
            caption: "A measured result communicates value, unit, and resolution.",
            nodes: ["Measured value 12.34 g", "reported resolution ± 0.01 g"],
            connectors: ["with"]
        },
        "atomic-structure": {
            caption: "The nucleus sets element identity; electron count sets ion charge.",
            nodes: ["Nucleus · p⁺ + n⁰", "Electron cloud · e⁻", "Neutral: p⁺ = e⁻"],
            connectors: ["surrounded by", "if"]
        },
        "periodic-table": {
            caption: "Position helps predict valence patterns and broad property trends.",
            nodes: ["Across → radius tends to decrease", "Group ↓ similar chemistry", "Down → radius tends to increase"],
            connectors: ["·", "·"]
        },
        "chemical-bonding": {
            caption: "Electron transfer forms ions; their electrostatic attraction forms an ionic lattice.",
            nodes: ["Na atom", "e⁻ transfer", "Na⁺  ···  Cl⁻"],
            connectors: ["", "attraction"]
        },
        "intermolecular-forces": {
            caption: "Covalent bonds hold each molecule together; IMFs attract neighboring molecules.",
            nodes: ["H—O—H", "··· attraction ···", "H—O—H"],
            connectors: ["", ""]
        },
        "states-of-matter": {
            caption: "Particle spacing and mobility differ among common states.",
            nodes: ["SOLID · fixed positions", "LIQUID · close, mobile", "GAS · far apart"],
            connectors: ["|", "|"]
        },
        "chemical-equations": {
            caption: "Balanced coefficients preserve atom counts on both sides.",
            nodes: ["2H₂ + O₂", "2H₂O"],
            connectors: ["→"]
        },
        "chemical-reactions": {
            caption: "A reaction rearranges atoms into new combinations.",
            nodes: ["Reactants", "bonds reorganize", "Products"],
            connectors: ["→", "→"]
        },
        "gas-laws": {
            caption: "At constant temperature, compressing a fixed amount of gas raises pressure.",
            nodes: ["Larger V · lower P", "P₁V₁ = P₂V₂", "Smaller V · higher P"],
            connectors: ["Boyle’s law", "compression"]
        },
        solutions: {
            caption: "Molarity relates dissolved amount to total solution volume.",
            nodes: ["n solute (mol)", "V solution (L)", "M (mol·L⁻¹)"],
            connectors: ["÷", "="]
        },
        "acids-and-bases": {
            caption: "On the pH scale, each unit represents a tenfold concentration change.",
            nodes: ["More H₃O⁺", "lower pH", "less H₃O⁺"],
            connectors: ["means", "means"]
        },
        thermochemistry: {
            caption: "Heat flows between a defined system and its surroundings.",
            nodes: ["System", "q transfer", "Surroundings"],
            connectors: ["exchanges", "with"]
        }
    };

    function listAt(path, source = progress) {
        return path.reduce((value, key) => value && value[key], source) || [];
    }

    function completedSections(lesson = activeLesson) {
        return lesson ? listAt(["completed_sections", lesson.slug]).map(Number) : [];
    }

    function completedLessons() {
        return listAt(["completed_lessons"]);
    }

    function challengeFor(lesson) {
        return listAt(["challenges", lesson.slug]);
    }

    function make(tag, className, text) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function configure(options) {
        integration = options;
    }

    function sendRequest(action, payload) {
        const request = requestQueue.then(() => integration.request(action, payload));
        requestQueue = request.catch(() => {});
        return request;
    }

    function setProgress(value, topics = completedTopicNames) {
        progress = value && typeof value === "object" ? value : {};
        completedTopicNames = Array.isArray(topics) ? topics : [];
        renderCurriculum();
        if (activeLesson) {
            updateLessonProgress();
        }
    }

    function topicIsUnlocked(lesson) {
        const index = lessons.indexOf(lesson);
        return progress.all_lessons_unlocked === true || index === 0 || lessons
            .slice(0, index)
            .every((previous) => completedTopicNames.includes(previous.topic));
    }

    function renderCurriculum() {
        const list = document.getElementById("curriculumList");
        if (!list) {
            return;
        }
        list.replaceChildren();
        lessons.forEach((lesson, index) => {
            const isUnlocked = topicIsUnlocked(lesson);
            const isComplete = completedLessons().includes(lesson.slug);
            const challenge = challengeFor(lesson);
            const mastery = challenge && challenge.mastered
                ? "Mastered"
                : challenge && challenge.passed
                    ? "Completed"
                    : completedSections(lesson).length
                        ? "In progress"
                        : "Not started";
            const article = make("article", `curriculum-unit unit-unlocked${isComplete ? " unit-completed" : ""}`);
            const number = make("div", "curriculum-number", String(index + 1).padStart(2, "0"));
            const icon = make("div", "curriculum-icon", lesson.icon);
            icon.setAttribute("aria-hidden", "true");
            const copy = make("div", "curriculum-copy");
            const label = make("span", "unit-label", !isUnlocked ? "LOCKED" : isComplete ? "LESSON COMPLETED" : mastery.toUpperCase());
            const title = make("h3", "", lesson.topic === "IMF" ? "Intermolecular Forces" : lesson.topic);
            const description = make("p", "", lesson.description);
            const masteryLabel = make("small", "lesson-mastery", `Mastery · ${mastery}`);
            masteryLabel.dataset.mastery = mastery.toLowerCase().replace(" ", "-");
            copy.append(label, title, description, masteryLabel);

            const actions = make("div", "curriculum-actions");
            const open = make("button", "unit-challenge-button", isUnlocked ? (isComplete ? "Review lesson" : "Start lesson") : "Locked");
            open.type = "button";
            open.disabled = !isUnlocked;
            open.setAttribute("aria-label", isUnlocked ? `${isComplete ? "Review" : "Start"} ${lesson.topic} lesson` : `Locked: ${lesson.topic}`);
            open.addEventListener("click", () => integration.navigate(`lesson/${lesson.slug}`));
            actions.append(open);

            if (isUnlocked) {
                const words = make("button", "secondary-button study-words-button", "Study terms");
                words.type = "button";
                words.addEventListener("click", () => integration.openWords(lesson.topic));
                actions.append(words);
            }
            article.append(number, icon, copy, actions);
            if (!isUnlocked) {
                article.classList.add("unit-locked");
            }
            list.append(article);
        });
    }

    function renderSectionNavigation() {
        const nav = document.getElementById("lessonSectionNav");
        nav.replaceChildren();
        activeLesson.sections.forEach((section, index) => {
            const button = make("button", "lesson-section-link", "");
            button.type = "button";
            button.setAttribute("aria-current", index === activeSection ? "step" : "false");
            if (completedSections().includes(index)) {
                button.classList.add("section-done");
            }
            const marker = make("span", "lesson-section-marker", completedSections().includes(index) ? "✓" : String(index + 1));
            const title = make("span", "", section.title);
            button.append(marker, title);
            button.addEventListener("click", () => goToSection(index));
            nav.append(button);
        });
    }

    function addParagraphs(container, paragraphs) {
        paragraphs.forEach((text) => container.append(make("p", "", text)));
    }

    function createAnswerList(item, onChoose) {
        const list = make("div", "lesson-answer-list");
        item.choices.forEach((choice) => {
            const button = make("button", "lesson-answer-option", choice.label);
            button.type = "button";
            button.dataset.answer = choice.value;
            button.addEventListener("click", () => onChoose(button, choice));
            list.append(button);
        });
        return list;
    }

    function renderInteractiveQuestion(container, item, kind, sectionIndex) {
        const wrapper = make("section", `lesson-interaction lesson-${kind}`);
        const heading = make("h3", "", kind === "check" ? "Quick check" : "Practice it");
        const prompt = make("p", "lesson-question", item.prompt);
        const feedback = make("p", "lesson-feedback", "");
        feedback.setAttribute("aria-live", "polite");
        wrapper.append(heading, prompt);

        if (kind === "practice") {
            const hintButton = make("button", "secondary-button lesson-hint-button", "Show hint");
            hintButton.type = "button";
            const hint = make("p", "lesson-hint", item.hint || "Review the key idea in this section.");
            hint.hidden = true;
            hintButton.addEventListener("click", () => {
                hint.hidden = !hint.hidden;
                hintButton.textContent = hint.hidden ? "Show hint" : "Hide hint";
            });
            wrapper.append(hintButton, hint);
        }

        const answers = createAnswerList(item, async (button, choice) => {
            const buttons = Array.from(answers.querySelectorAll("button"));
            const isCorrect = choice.value === item.answer;
            if (isCorrect) {
                buttons.forEach((option) => {
                    option.disabled = true;
                    if (option.dataset.answer === item.answer) {
                        option.classList.add("is-correct");
                    }
                });
            } else {
                button.classList.add("is-incorrect");
                button.disabled = true;
            }
            feedback.textContent = `${isCorrect ? "Correct. " : "Not quite. "}${item.explanation}`;
            feedback.classList.toggle("is-correct", isCorrect);
            feedback.classList.toggle("is-incorrect", !isCorrect);

            if (kind === "check") {
                const result = await save("section", {
                    topic: activeLesson.slug,
                    sectionIndex,
                    answer: choice.value
                });
                if (result && !result.correct) {
                    feedback.textContent = `Your answer was not correct. Try another choice. ${item.explanation}`;
                    if (isCorrect) {
                        buttons.forEach((option) => {
                            option.disabled = false;
                            option.classList.remove("is-correct", "is-incorrect");
                        });
                    }
                } else if (!result && isCorrect) {
                    buttons.forEach((option) => {
                        option.disabled = false;
                        option.classList.remove("is-correct");
                    });
                    feedback.textContent = `Your answer could not be saved. Try again when the connection is available. ${item.explanation}`;
                }
            } else if (isCorrect) {
                try {
                    const result = await sendRequest("practice", {
                        topic: activeLesson.slug,
                        sectionIndex,
                        answer: choice.value
                    });
                    if (result.progress) {
                        integration.onProgress(result.progress);
                    }
                    if (!result.correct) {
                        buttons.forEach((option) => {
                            option.disabled = false;
                            option.classList.remove("is-correct");
                        });
                        feedback.textContent = `Your answer could not be verified by the learning service. ${item.explanation}`;
                        feedback.classList.add("is-incorrect");
                    } else {
                        feedback.textContent += " Practice complete.";
                    }
                } catch (error) {
                    buttons.forEach((option) => {
                        option.disabled = false;
                        option.classList.remove("is-correct");
                    });
                    feedback.textContent += ` ${error.message}`;
                }
            }
        });
        wrapper.append(answers, feedback);
        container.append(wrapper);
    }

    async function save(action, payload) {
        try {
            const result = await sendRequest(action, payload);
            if (result.progress) {
                integration.onProgress(result.progress);
            }
            return result;
        } catch (error) {
            integration.onToast(error.message);
            return null;
        }
    }

    function renderExample(example) {
        const article = make("section", "lesson-example");
        article.append(make("h3", "", "Worked example"), make("p", "", example.prompt));
        const steps = document.createElement("ol");
        example.steps.forEach((step) => steps.append(make("li", "", step)));
        article.append(steps, make("p", "lesson-example-answer", `Answer: ${example.answer}`));
        return article;
    }

    function renderDiagram(lesson) {
        const diagram = diagrams[lesson.slug];
        const figure = make("figure", "lesson-visual");
        figure.setAttribute("aria-label", diagram.caption);
        const flow = make("div", "lesson-visual-flow");
        diagram.nodes.forEach((label, index) => {
            const node = make("span", "lesson-visual-node", label);
            flow.append(node);
            if (index < diagram.nodes.length - 1) {
                flow.append(make("span", "lesson-visual-arrow", diagram.connectors[index]));
            }
        });
        figure.append(flow, make("figcaption", "", diagram.caption));
        return figure;
    }

    function renderChallenge(container) {
        const challenge = make("section", "lesson-challenge");
        challenge.setAttribute("aria-labelledby", "lessonChallengeTitle");
        const title = make("h2", "", "Lesson challenge");
        title.id = "lessonChallengeTitle";
        challenge.append(
            make("p", "eyebrow", "FINAL CHECK"),
            title,
            make("p", "lesson-challenge-intro", "Bring the ideas together. You need at least 2 of 3 correct to complete this topic; 3 of 3 earns mastery.")
        );
        const savedResult = challengeFor(activeLesson);
        if (savedResult && savedResult.score !== undefined) {
            challenge.append(make("p", "lesson-challenge-result", `Best score: ${savedResult.score} of ${savedResult.total}. ${savedResult.mastered ? "Topic mastered." : savedResult.passed ? "Topic completed." : "Try again to improve your understanding."}`));
        }

        const fieldsets = [];
        activeLesson.challenge.forEach((item, index) => {
            const fieldset = make("fieldset", "lesson-challenge-question");
            const legend = make("legend", "", `${index + 1}. ${item.prompt}`);
            fieldset.append(legend);
            const answers = createAnswerList(item, (button, choice) => {
                fieldset.querySelectorAll("button").forEach((option) => {
                    option.classList.remove("is-correct", "is-incorrect");
                    option.setAttribute("aria-pressed", "false");
                });
                button.setAttribute("aria-pressed", "true");
                challengeAnswers[item.id || `q${index + 1}`] = choice.value;
            });
            fieldset.append(answers);
            fieldsets.push(fieldset);
            challenge.append(fieldset);
        });

        const submit = make("button", "primary-button lesson-challenge-submit", "Check challenge");
        submit.type = "button";
        const feedback = make("p", "lesson-challenge-result", "");
        feedback.setAttribute("aria-live", "polite");
        submit.addEventListener("click", async () => {
            const answerIds = activeLesson.challenge.map((_, index) => `q${index + 1}`);
            if (answerIds.some((id) => !challengeAnswers[id])) {
                feedback.textContent = "Answer all three questions before checking your challenge.";
                return;
            }
            submit.disabled = true;
            submit.textContent = "Checking…";
            try {
                const result = await sendRequest("challenge", {
                    topic: activeLesson.slug,
                    answers: challengeAnswers
                });
                const returnedScore = Number(result.score) || 0;
                activeLesson.challenge.forEach((item, index) => {
                    const fieldset = fieldsets[index];
                    fieldset.querySelectorAll("button").forEach((button) => {
                        button.disabled = true;
                        if (button.dataset.answer === item.answer) {
                            button.classList.add("is-correct");
                        } else if (button.getAttribute("aria-pressed") === "true") {
                            button.classList.add("is-incorrect");
                        }
                    });
                    fieldset.append(make("p", "lesson-feedback", item.explanation));
                });
                feedback.textContent = `You scored ${returnedScore} of ${activeLesson.challenge.length}. ${result.passed ? "Topic complete — the next topic is available." : "Review the sections and try again."}`;
                if (result.progress) {
                    integration.onProgress(result.progress);
                }
                if (!result.passed) {
                    challengeAnswers = {};
                    fieldsets.forEach((fieldset) => {
                        fieldset.querySelectorAll("button").forEach((button) => {
                            button.disabled = false;
                            button.classList.remove("is-correct", "is-incorrect");
                            button.setAttribute("aria-pressed", "false");
                        });
                        const explanation = fieldset.querySelector(".lesson-feedback");
                        if (explanation) {
                            explanation.remove();
                        }
                    });
                    submit.disabled = false;
                    submit.textContent = "Try challenge again";
                    return;
                }
            } catch (error) {
                feedback.textContent = error.message;
                submit.disabled = false;
                submit.textContent = "Try challenge again";
                return;
            }
            submit.hidden = true;
        });
        challenge.append(submit, feedback);
        container.append(challenge);
    }

    function renderLesson() {
        if (!activeLesson) {
            return;
        }
        const idx = lessons.indexOf(activeLesson);
        const section = activeLesson.sections[activeSection];
        document.getElementById("lessonTopicLabel").textContent = `TOPIC ${idx + 1} · ${activeLesson.topic.toUpperCase()}`;
        document.getElementById("lessonTitle").textContent = activeLesson.topic === "IMF"
            ? "Intermolecular Forces"
            : activeLesson.topic;
        document.getElementById("lessonIntro").textContent = activeLesson.why;
        updateLessonProgress();

        const reading = document.getElementById("lessonReading");
        reading.replaceChildren();
        if (activeSection === 0) {
            const objectives = make("section", "lesson-objectives");
            objectives.append(make("h2", "", "What you’ll learn"));
            const items = document.createElement("ul");
            activeLesson.objectives.forEach((objective) => items.append(make("li", "", objective)));
            objectives.append(items);
            reading.append(objectives, renderDiagram(activeLesson));
        }
        reading.append(make("h2", "", section.title));
        addParagraphs(reading, section.reading);
        const principle = make("aside", "lesson-principle");
        principle.append(make("strong", "", "Key idea"), make("span", "", section.principle));
        reading.append(principle, renderExample(section.example));
        renderInteractiveQuestion(reading, section.check, "check", activeSection);
        renderInteractiveQuestion(reading, section.practice, "practice", activeSection);

        const lessonCompleted = completedLessons().includes(activeLesson.slug);
        if (activeSection === activeLesson.sections.length - 1) {
            if (lessonCompleted) {
                renderChallenge(reading);
            } else {
                reading.append(make("p", "lesson-feedback", "Complete the lesson to open its final challenge. Use the button below after answering all three quick checks."));
            }
        } else if (lessonCompleted) {
            const completed = make("p", "lesson-feedback is-correct", "Lesson completed. Continue reviewing or move on to the topic challenge.");
            reading.append(completed);
        }

    }

    function updateLessonProgress() {
        if (!activeLesson) {
            return;
        }
        const done = completedSections();
        document.getElementById("lessonProgressLabel").textContent = `${done.length} of ${activeLesson.sections.length} sections complete`;
        const progressValue = Math.round(done.length / activeLesson.sections.length * 100);
        document.getElementById("lessonProgressBar").style.width = `${progressValue}%`;
        document.getElementById("lessonProgressTrack").setAttribute("aria-valuenow", String(progressValue));
        renderSectionNavigation();
        document.getElementById("previousLessonSection").disabled = activeSection === 0;
        const completed = completedLessons().includes(activeLesson.slug);
        const nextButton = document.getElementById("nextLessonSection");
        const canComplete = done.length === activeLesson.sections.length;
        nextButton.textContent = activeSection === activeLesson.sections.length - 1
            ? completed ? "Lesson completed ✓" : "Mark lesson complete"
            : "Next section →";
        nextButton.disabled = activeSection === activeLesson.sections.length - 1 && (completed || !canComplete);
        document.getElementById("lessonNavigationStatus").textContent = done.includes(activeSection)
            ? "Section complete"
            : "Answer the quick check to record this section.";
    }

    async function goToSection(index) {
        if (!activeLesson || index < 0 || index >= activeLesson.sections.length) {
            return;
        }
        activeSection = index;
        challengeAnswers = {};
        renderLesson();
        await save("position", { topic: activeLesson.slug, sectionIndex: activeSection });
        document.getElementById("lessonReading").scrollIntoView({
            block: "start",
            behavior: "smooth"
        });
    }

    async function openTopic(slug) {
        activeLesson = lessons.find((lesson) => lesson.slug === slug) || null;
        if (!activeLesson) {
            integration.onToast("That Chemistry lesson could not be found.");
            integration.navigate("lessons");
            return;
        }
        if (!topicIsUnlocked(activeLesson)) {
            integration.onToast("Complete the previous topic challenge to unlock this lesson.");
            integration.navigate("lessons");
            return;
        }
        const resumeTopic = progress.current_topic === activeLesson.slug;
        const savedSection = Math.min(Number(progress.current_section) || 0, activeLesson.sections.length - 1);
        const doneSections = completedSections(activeLesson);
        const sectionIsComplete = doneSections.includes(savedSection);
        const firstIncomplete = activeLesson.sections.findIndex((_, index) => !doneSections.includes(index));
        activeSection = resumeTopic
            ? sectionIsComplete && savedSection < activeLesson.sections.length - 1
                ? savedSection + 1
                : savedSection
            : firstIncomplete === -1
                ? activeLesson.sections.length - 1
                : firstIncomplete;
        challengeAnswers = {};
        renderLesson();
        await save("position", { topic: activeLesson.slug, sectionIndex: activeSection });
    }

    async function next() {
        if (activeSection < activeLesson.sections.length - 1) {
            await goToSection(activeSection + 1);
            return;
        }
        const result = await save("complete_lesson", { topic: activeLesson.slug });
        if (result && result.progress) {
            integration.onProgress(result.progress);
        }
        renderLesson();
    }

    function previous() {
        if (activeSection > 0) {
            goToSection(activeSection - 1);
        }
    }

    document.getElementById("lessonBackButton").addEventListener("click", () => integration.navigate("lessons"));
    document.getElementById("previousLessonSection").addEventListener("click", previous);
    document.getElementById("nextLessonSection").addEventListener("click", next);

    window.ChemLearning = {
        configure,
        setProgress,
        renderCurriculum,
        openTopic,
        getLessons: () => lessons,
        getProgress: () => progress
    };
})();
