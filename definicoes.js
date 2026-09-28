const savedTheme = localStorage.getItem('study-quest-theme') || 'night';
const themeDetails = {
    aurora: { label: 'Aurora', preview: 'theme-aurora', purchase: 'Tema Aurora' },
    solar: { label: 'Solar', preview: 'theme-solar', purchase: 'Tema Solar' },
    ocean: { label: 'Oceano', preview: 'theme-ocean', purchase: 'Tema Oceano' },
    forest: { label: 'Floresta', preview: 'theme-forest', purchase: 'Tema Floresta' },
    coral: { label: 'Coral', preview: 'theme-coral', purchase: 'Tema Coral' },
    graphite: { label: 'Grafite', preview: 'theme-graphite', purchase: 'Tema Grafite' }
};
const themeNames = ['night', 'dawn', ...Object.keys(themeDetails)];
const avatarColors = {
    blue: 'linear-gradient(135deg, #22d3ee, #6366f1)',
    green: 'linear-gradient(135deg, #34d399, #0f766e)',
    sunset: 'linear-gradient(135deg, #fb7185, #f59e0b)',
    violet: 'linear-gradient(135deg, #a78bfa, #db2777)'
};

function getPurchases() {
    const sessionKey = 'study-quest-session';
    const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
    const userId = loggedUser ? loggedUser.email : 'guest';
    return JSON.parse(localStorage.getItem(`study-quest-purchases:${userId}`) || '[]');
}

function renderPurchasedThemes() {
    const themeOptions = document.querySelector('.theme-options');
    if (!themeOptions) {
        return;
    }

    const purchases = getPurchases();
    Object.entries(themeDetails).forEach(([value, details]) => {
        if (!purchases.includes(details.purchase) || themeOptions.querySelector(`input[value="${value}"]`)) {
            return;
        }

        const label = document.createElement('label');
        label.className = 'theme-option';
        label.innerHTML = `
            <input type="radio" name="theme" value="${value}" />
            <span class="theme-preview ${details.preview}"></span>
            <strong>${details.label}</strong>
        `;
        themeOptions.appendChild(label);
    });
}

function applyAvatar() {
    const avatar = JSON.parse(localStorage.getItem('study-quest-avatar') || 'null');
    if (!avatar) {
        return;
    }

    document.querySelectorAll('.avatar').forEach((element) => {
        element.textContent = avatar.initials;
        element.style.background = avatarColors[avatar.color] || avatarColors.blue;
    });
}

function applyTheme(theme) {
    const themeClasses = themeNames.map((name) => `theme-${name}`);
    document.documentElement.classList.remove(...themeClasses);
    document.documentElement.classList.toggle(`theme-${theme}`, theme !== 'night');
    document.body?.classList.remove(...themeClasses);
    if (theme !== 'night') {
        document.body?.classList.add(`theme-${theme}`);
    }
    document.querySelectorAll('input[name="theme"]').forEach((input) => {
        input.checked = input.value === theme;
    });
}

applyTheme(savedTheme);
applyAvatar();

document.addEventListener('DOMContentLoaded', () => {
    renderPurchasedThemes();
    applyTheme(savedTheme);
    applyAvatar();

    document.querySelectorAll('input[name="theme"]').forEach((input) => {
        input.addEventListener('change', () => {
            applyTheme(input.value);
            localStorage.setItem('study-quest-theme', input.value);
        });
    });
});
