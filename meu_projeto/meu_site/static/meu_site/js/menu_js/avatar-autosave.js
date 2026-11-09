(() => {
    const form = document.querySelector('#avatar-form');
    if (!form) return;

    const preview = document.querySelector('.avatar-large');
    const previewInitials = document.querySelector('#avatar-preview-initials');
    const previewName = document.querySelector('#avatar-preview-name');
    const colorPicker = form.querySelector('input[name="color"]');
    const colorValue = document.querySelector('#avatar-color-value');
    const status = document.querySelector('.avatar-save-status');
    let saveTimeout;
    let isSaving = false;
    let hasPendingSave = false;

    function updatePreview() {
        const name = form.elements.name.value.trim() || 'Estudante';
        const initials = form.elements.initials.value.trim().slice(0, 3).toUpperCase() || 'ES';
        const color = colorPicker.value;

        previewInitials.textContent = initials;
        previewName.textContent = name;
        preview.style.setProperty('--avatar-fill', `linear-gradient(135deg, ${color}, ${color})`);
        form.querySelectorAll('.avatar-border-swatch').forEach((swatch) => {
            swatch.style.setProperty('--avatar-color', color);
        });
        colorValue.value = color;
        colorValue.textContent = color;
    }

    function scheduleSave() {
        window.clearTimeout(saveTimeout);
        status.textContent = 'Alterações por guardar.';
        saveTimeout = window.setTimeout(saveAvatar, 400);
    }

    async function saveAvatar() {
        if (isSaving) {
            hasPendingSave = true;
            return;
        }

        isSaving = true;
        hasPendingSave = false;
        status.textContent = 'A guardar avatar...';
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin'
            });
            if (!response.ok) {
                throw new Error(`O servidor respondeu com o estado ${response.status}.`);
            }
            status.textContent = 'Avatar guardado.';
        } catch (error) {
            console.error('Não foi possível guardar o avatar.', error);
            status.textContent = 'Não foi possível guardar. Tenta novamente.';
        } finally {
            isSaving = false;
            if (hasPendingSave) saveAvatar();
        }
    }

    form.addEventListener('input', (event) => {
        if (event.target.matches('input[name="name"], input[name="initials"], input[name="color"]')) {
            updatePreview();
            scheduleSave();
        }
    });
    form.addEventListener('change', (event) => {
        if (event.target.matches('input[name="border"]')) scheduleSave();
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        updatePreview();
        scheduleSave();
    });

    updatePreview();
})();
