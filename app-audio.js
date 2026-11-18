(function () {
    const preferenceKey = "stemchem-sound-effects";
    const sounds = {
        openMenu: "openmenu.mp3",
        closeMenu: "closemenh.mp3",
        selectAnswer: "selectingasnwe.mp3",
        correctAnswer: "correctanswer.mp3",
        wrongAnswer: "wronganswer.mp3",
        completeLesson: "comptelesson.mp3",
        crossword: "crossword.mp3"
    };
    const audioDirectory = new URL("sfx/", document.currentScript.src);
    const players = {};
    let enabled = true;
    let activePlayer = null;

    Object.entries(sounds).forEach(([name, fileName]) => {
        const player = new Audio(new URL(fileName, audioDirectory).href);
        player.preload = "auto";
        player.volume = 0.35;
        player.addEventListener("ended", () => {
            if (activePlayer === player) {
                activePlayer = null;
            }
        });
        player.load();
        players[name] = player;
    });

    try {
        enabled = window.localStorage.getItem(preferenceKey) !== "false";
    } catch (error) {
        console.warn("Could not read the sound-effects preference.", error);
    }

    function play(name) {
        const player = players[name];
        if (!enabled || !player) {
            return;
        }

        if (activePlayer) {
            activePlayer.pause();
            activePlayer.currentTime = 0;
        }
        activePlayer = player;
        player.currentTime = 0;
        player.play().catch((error) => {
            if (error.name !== "AbortError") {
                console.warn(`Could not play the ${name} sound effect.`, error);
            }
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
        if (!enabled && activePlayer) {
            activePlayer.pause();
            activePlayer.currentTime = 0;
            activePlayer = null;
        }
    }

    window.ChemAudio = {
        play,
        isEnabled: () => enabled,
        setEnabled
    };
})();
