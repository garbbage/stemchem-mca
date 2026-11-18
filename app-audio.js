(function () {
    const preferenceKey = "stemchem-sound-effects";
    const sounds = {
        buttonClick: "buttonclick.mp3",
        openMenu: "openmenu.mp3",
        closeMenu: "closemenh.mp3",
        selectAnswer: "selectingasnwe.mp3",
        correctAnswer: "correctanswer.mp3",
        wrongAnswer: "wronganswer.mp3",
        completeLesson: "comptelesson.mp3",
        crossword: "crossword.mp3"
    };
    const audioDirectory = new URL("sfx/", document.currentScript.src);
    let enabled = true;

    try {
        enabled = window.localStorage.getItem(preferenceKey) !== "false";
    } catch (error) {
        console.warn("Could not read the sound-effects preference.", error);
    }

    function play(name) {
        const fileName = sounds[name];
        if (!enabled || !fileName) {
            return;
        }

        const audio = new Audio(new URL(fileName, audioDirectory).href);
        audio.volume = 0.35;
        audio.play().catch((error) => {
            console.warn(`Could not play the ${name} sound effect.`, error);
        });
    }

    function setEnabled(value) {
        const nextValue = Boolean(value);
        try {
            window.localStorage.setItem(preferenceKey, String(nextValue));
        } catch (error) {
            throw new Error(`Could not save the sound-effects setting: ${error.message}`);
        }
        enabled = nextValue;
    }

    window.ChemAudio = {
        play,
        isEnabled: () => enabled,
        setEnabled
    };
})();
