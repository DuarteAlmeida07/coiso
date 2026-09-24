const avatarKey = 'study-quest-avatar';
const defaultAvatar = { name: 'Estudante', initials: 'ES', color: 'blue' };
const avatarColorGradients = {
    blue: 'linear-gradient(135deg, #22d3ee, #6366f1)',
    green: 'linear-gradient(135deg, #34d399, #0f766e)',
    sunset: 'linear-gradient(135deg, #fb7185, #f59e0b)',
    violet: 'linear-gradient(135deg, #a78bfa, #db2777)'
};
const avatar = JSON.parse(localStorage.getItem(avatarKey) || 'null') || defaultAvatar;
const nameInput = document.querySelector('#avatar-name');
const initialsInput = document.querySelector('#avatar-initials');
const preview = document.querySelector('#avatar-preview');
const previewName = document.querySelector('#avatar-preview-name');
const colorInputs = document.querySelectorAll('input[name="avatar-color"]');
const form = document.querySelector('#avatar-form');
const status = document.querySelector('#avatar-status');

function updatePreview() {
    preview.textContent = initialsInput.value.trim().slice(0, 3).toUpperCase() || 'ES';
    previewName.textContent = nameInput.value.trim() || 'Estudante';
    const selectedColor = document.querySelector('input[name="avatar-color"]:checked');
    preview.style.background = avatarColorGradients[selectedColor.value];
}

nameInput.value = avatar.name;
initialsInput.value = avatar.initials;
document.querySelector(`input[value="${avatar.color}"]`).checked = true;
updatePreview();

nameInput.addEventListener('input', updatePreview);
initialsInput.addEventListener('input', updatePreview);
colorInputs.forEach((input) => input.addEventListener('change', updatePreview));

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedColor = document.querySelector('input[name="avatar-color"]:checked').value;
    const newAvatar = {
        name: nameInput.value.trim() || 'Estudante',
        initials: initialsInput.value.trim().slice(0, 3).toUpperCase() || 'ES',
        color: selectedColor
    };
    localStorage.setItem(avatarKey, JSON.stringify(newAvatar));
    status.textContent = 'Avatar atualizado com sucesso.';
    window.setTimeout(() => {
        status.textContent = '';
    }, 3000);
});
