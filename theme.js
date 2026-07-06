const modeSelect = document.getElementById("mode1");

// Charger le thème sauvegardé
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "sombre") {
    document.body.classList.add("sombre");
    if (modeSelect) modeSelect.value = "sombre";
} else {
    if (modeSelect) modeSelect.value = "clair";
}

// Changement de thème
if (modeSelect) {
    modeSelect.addEventListener("change", function () {
        if (this.value === "sombre") {
            document.body.classList.add("sombre");
            localStorage.setItem("theme", "sombre");
        } else {
            document.body.classList.remove("sombre");
            localStorage.setItem("theme", "clair");
        }
    });
}
