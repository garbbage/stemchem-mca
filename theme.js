(function () {
    const storageKey = "stemchem-theme";
    const allowedThemes = ["light", "dark", "system"];
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
    let preference = "system";

    try {
        const savedPreference = localStorage.getItem(storageKey);
        if (allowedThemes.includes(savedPreference)) {
            preference = savedPreference;
        }
    } catch (error) {
        console.warn("Could not read the saved appearance preference.", error);
    }

    function applyTheme() {
        const theme = preference === "system"
            ? (systemPreference.matches ? "dark" : "light")
            : preference;
        document.documentElement.dataset.theme = theme;
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = theme === "dark" ? "#111d1d" : "#f4f5ef";
        }
        document.querySelectorAll("[data-theme-choice]").forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.themeChoice === preference));
        });
    }

    function chooseTheme(theme) {
        if (!allowedThemes.includes(theme)) {
            return;
        }
        preference = theme;
        try {
            localStorage.setItem(storageKey, preference);
        } catch (error) {
            console.error("Could not save the appearance preference.", error);
        }
        applyTheme();
    }

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-theme-choice]");
        if (button) {
            chooseTheme(button.dataset.themeChoice);
        }
    });

    systemPreference.addEventListener("change", () => {
        if (preference === "system") {
            applyTheme();
        }
    });

    applyTheme();
    document.addEventListener("DOMContentLoaded", applyTheme);
})();
