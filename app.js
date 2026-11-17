(() => {
    "use strict";

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
    const deviceIdStorageKey = "catatanOnlineDeviceId";

    function getDeviceId() {
        try {
            let deviceId = localStorage.getItem(deviceIdStorageKey);

            if (!deviceId) {
                deviceId = crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
                localStorage.setItem(deviceIdStorageKey, deviceId);
            }

            return deviceId;
        } catch (error) {
            return "";
        }
    }

    async function recordPageVisit() {
        let deviceDetails = {};

        if (navigator.userAgentData) {
            try {
                deviceDetails = await navigator.userAgentData.getHighEntropyValues([
                    "model",
                    "platform",
                    "platformVersion"
                ]);
            } catch (error) {
                // Gunakan deteksi dasar jika Client Hints tidak tersedia.
            }
        }

        fetch(monitoringEndpoint, {
            method: "POST",
            mode: "cors",
            cache: "no-store",
            credentials: "omit",
            keepalive: true,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...deviceDetails,
                deviceId: getDeviceId()
            })
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
