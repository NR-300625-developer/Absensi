(() => {
    "use strict";

    const RELOAD_AFTER_INACTIVE_MS = 5 * 60 * 1000;
    let hiddenSince = null;

    function markPageHidden() {
        if (hiddenSince === null) {
            hiddenSince = Date.now();
        }
    }

    function reloadAfterLongPause() {
        if (hiddenSince === null) {
            return;
        }

        const inactiveDuration = Date.now() - hiddenSince;
        hiddenSince = null;

        if (inactiveDuration >= RELOAD_AFTER_INACTIVE_MS) {
            window.location.reload();
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            markPageHidden();
            return;
        }

        reloadAfterLongPause();
    });

    window.addEventListener("pagehide", markPageHidden);
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            reloadAfterLongPause();
        }
    });

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const temporaryField = document.createElement("textarea");
        temporaryField.value = text;
        temporaryField.setAttribute("readonly", "");
        temporaryField.style.position = "fixed";
        temporaryField.style.opacity = "0";
        temporaryField.style.pointerEvents = "none";

        document.body.appendChild(temporaryField);
        temporaryField.select();

        const copied = document.execCommand("copy");
        temporaryField.remove();

        if (!copied) {
            throw new Error("Penyalinan tidak berhasil.");
        }
    }


    const monitoringEndpoint =
        "https://nr-developer-monitoring.ainul6093.workers.dev/visit";

    function recordPageVisit() {
        fetch(monitoringEndpoint, {
            method: "POST",
            mode: "cors",
            cache: "no-store",
            credentials: "omit",
            keepalive: true
        }).catch(() => {
            // Catatan Online tetap dapat digunakan jika monitoring sedang tidak tersedia.
        });
    }

    recordPageVisit();

    document.querySelectorAll("[data-copy-target]").forEach((button) => {
        const defaultLabel = button.textContent.trim();
        let resetTimer;

        button.addEventListener("click", async () => {
            const target = document.getElementById(button.dataset.copyTarget);

            if (!target) {
                return;
            }

            clearTimeout(resetTimer);

            try {
                await copyText(target.textContent.trim());
                button.textContent = "Tersalin";
                button.setAttribute("aria-label", "Berhasil disalin");
            } catch (error) {
                button.textContent = "Gagal";
                button.setAttribute("aria-label", "Gagal menyalin");
            }

            resetTimer = window.setTimeout(() => {
                button.textContent = defaultLabel;
                button.removeAttribute("aria-label");
            }, 1400);
        });
    });
})();
