const copyButtons = document.querySelectorAll("[data-copy]");
const copyStatus = document.querySelector(".copy-status");

async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = value;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.appendChild(temporaryInput);
    temporaryInput.select();

    const copied = document.execCommand("copy");
    temporaryInput.remove();

    if (!copied) {
        throw new Error("Penyalinan tidak didukung oleh browser ini.");
    }
}

copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const value = button.dataset.copy;
        const label = button.dataset.label;

        try {
            await copyText(value);
            copyStatus.textContent = `${label} berhasil disalin.`;
            button.setAttribute("aria-label", `${label} berhasil disalin`);
            button.title = `${label} berhasil disalin`;
        } catch (error) {
            copyStatus.textContent = `Gagal menyalin ${label.toLowerCase()}.`;
            button.setAttribute("aria-label", `Gagal menyalin ${label.toLowerCase()}`);
            button.title = `Gagal menyalin ${label.toLowerCase()}`;
        }
    });
});
