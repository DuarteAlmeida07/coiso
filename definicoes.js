(() => {
const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const selectedThemeKey = `study-quest-theme:${userId}`;
const savedTheme = localStorage.getItem(selectedThemeKey) || localStorage.getItem('study-quest-theme') || 'night';
const themeDetails = {
    aurora: { label: 'Aurora', preview: 'theme-aurora', purchase: 'Tema Aurora' },
    solar: { label: 'Solar', preview: 'theme-solar', purchase: 'Tema Solar' },
    ocean: { label: 'Oceano', preview: 'theme-ocean', purchase: 'Tema Oceano' },
    forest: { label: 'Floresta', preview: 'theme-forest', purchase: 'Tema Floresta' },
    coral: { label: 'Coral', preview: 'theme-coral', purchase: 'Tema Coral' },
    graphite: { label: 'Grafite', preview: 'theme-graphite', purchase: 'Tema Grafite' },
    sakura: { label: 'Sakura', preview: 'theme-sakura', purchase: 'Tema Sakura' },
    volcanic: { label: 'Vulcão', preview: 'theme-volcanic', purchase: 'Tema Vulcão' },
    crystal: { label: 'Cristal', preview: 'theme-crystal', purchase: 'Tema Cristal' },
    glacial: { label: 'Glacial', preview: 'theme-glacial', purchase: 'Tema Glacial' },
    eclipse: { label: 'Eclipse', preview: 'theme-eclipse', purchase: 'Tema Eclipse' },
    nebula: { label: 'Nebulosa', preview: 'theme-nebula', purchase: 'Tema Nebulosa' },
    celestial: { label: 'Celestial', preview: 'theme-celestial', purchase: 'Tema Celestial' }
};
const avatarBorderCatalog = [
    { id: 'mint-loop', label: 'Anel Menta', rarity: 'comum', color: '#34d399', accent: '#064e3b', pattern: 'solid' },
    { id: 'skyline', label: 'Linha Celeste', rarity: 'comum', color: '#38bdf8', accent: '#1e3a8a', pattern: 'double' },
    { id: 'clover', label: 'Trevo', rarity: 'comum', color: '#86efac', accent: '#166534', pattern: 'ridge' },
    { id: 'rose-gold', label: 'Rosa Dourada', rarity: 'comum', color: '#fb7185', accent: '#fcd34d', pattern: 'groove' },
    { id: 'sunbeam', label: 'Raio Solar', rarity: 'comum', color: '#fbbf24', accent: '#f97316', pattern: 'double' },
    { id: 'lilac-mist', label: 'Névoa Lilás', rarity: 'comum', color: '#c4b5fd', accent: '#7c3aed', pattern: 'dotted' },
    { id: 'tidal', label: 'Maré', rarity: 'incomum', color: '#06b6d4', accent: '#1e3a8a', pattern: 'double' },
    { id: 'coral-reef', label: 'Recife Coral', rarity: 'incomum', color: '#fb7185', accent: '#be123c', pattern: 'groove' },
    { id: 'citrus', label: 'Citrino', rarity: 'incomum', color: '#bef264', accent: '#3f6212', pattern: 'ridge' },
    { id: 'frostline', label: 'Geada', rarity: 'incomum', color: '#93c5fd', accent: '#f8fafc', pattern: 'double' },
    { id: 'ember', label: 'Brasa', rarity: 'incomum', color: '#f97316', accent: '#7f1d1d', pattern: 'dashed' },
    { id: 'aurora-ring', label: 'Anel Aurora', rarity: 'raro', color: '#2dd4bf', accent: '#8b5cf6', pattern: 'ridge' },
    { id: 'sakura-frame', label: 'Moldura Sakura', rarity: 'raro', color: '#f9a8d4', accent: '#be185d', pattern: 'dotted' },
    { id: 'nebula-gate', label: 'Portal Nebulosa', rarity: 'raro', color: '#a78bfa', accent: '#ec4899', pattern: 'double' },
    { id: 'jade-crown', label: 'Coroa Jade', rarity: 'raro', color: '#34d399', accent: '#facc15', pattern: 'groove' },
    { id: 'prismatic', label: 'Prismática', rarity: 'muito_raro', color: '#67e8f9', accent: '#f0abfc', pattern: 'outset' },
    { id: 'eclipse', label: 'Eclipse', rarity: 'muito_raro', color: '#fda4af', accent: '#facc15', pattern: 'double' },
    { id: 'starfall', label: 'Chuva Estelar', rarity: 'muito_raro', color: '#c4b5fd', accent: '#38bdf8', pattern: 'ridge' },
    { id: 'celestial-crown', label: 'Coroa Celestial', rarity: 'lendario', color: '#fde68a', accent: '#7dd3fc', pattern: 'double' },
    { id: 'phoenix-flame', label: 'Chama Fénix', rarity: 'lendario', color: '#fb7185', accent: '#facc15', pattern: 'groove' }
];
const rarityLabels = {
    comum: 'Comum', incomum: 'Incomum', raro: 'Raro', muito_raro: 'Muito raro', lendario: 'Lendário'
};
const themeNames = ['night', 'dawn', ...Object.keys(themeDetails)];
const avatarColors = {
    blue: 'linear-gradient(135deg, #22d3ee, #6366f1)',
    green: 'linear-gradient(135deg, #34d399, #0f766e)',
    sunset: 'linear-gradient(135deg, #fb7185, #f59e0b)',
    violet: 'linear-gradient(135deg, #a78bfa, #db2777)'
};
const avatarBorderInventoryKey = `study-quest-avatar-borders:${userId}`;
const selectedAvatarBorderKey = `study-quest-avatar-border:${userId}`;

function applyAvatarBorder(element, borderId) {
    element.classList.remove('avatar-border-equipped');
    ['--avatar-border-color', '--avatar-border-accent', '--avatar-border-pattern'].forEach((property) => {
        element.style.removeProperty(property);
    });

    const border = avatarBorderCatalog.find((item) => item.id === borderId);
    if (!border) {
        return;
    }

    element.style.setProperty('--avatar-border-color', border.color);
    element.style.setProperty('--avatar-border-accent', border.accent);
    element.style.setProperty('--avatar-border-pattern', border.pattern);
    element.classList.add('avatar-border-equipped');
}

window.StudyQuestCosmetics = {
    avatarBorders: avatarBorderCatalog,
    rarityLabels,
    avatarBorderInventoryKey,
    selectedAvatarBorderKey,
    applyAvatarBorder
};

function getPurchases() {
    return JSON.parse(localStorage.getItem(`study-quest-purchases:${userId}`) || '[]');
}

function renderPurchasedThemes() {
    const themeOptions = document.querySelector('.theme-options');
    if (!themeOptions) {
        return;
    }

    const purchases = getPurchases();
    Object.entries(themeDetails).forEach(([value, details]) => {
        if (themeOptions.querySelector(`input[value="${value}"]`)) {
            return;
        }

        const isOwned = purchases.includes(details.purchase);
        const label = document.createElement('label');
        label.className = `theme-option${isOwned ? '' : ' locked'}`;
        label.setAttribute('aria-disabled', String(!isOwned));

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'theme';
        input.value = value;
        input.disabled = !isOwned;

        const preview = document.createElement('span');
        preview.className = `theme-preview ${details.preview}`;

        const name = document.createElement('strong');
        name.textContent = details.label;

        const status = document.createElement('small');
        status.className = 'theme-lock-status';
        status.textContent = isOwned ? 'Desbloqueado' : 'Bloqueado';

        label.append(input, preview, name, status);
        themeOptions.appendChild(label);
    });
}

function applyAvatar() {
    const avatar = JSON.parse(localStorage.getItem('study-quest-avatar') || 'null') || { initials: 'ES', color: 'blue' };
    const selectedBorder = localStorage.getItem(selectedAvatarBorderKey);

    document.querySelectorAll('.avatar, .avatar-large').forEach((element) => {
        element.textContent = avatar.initials;
        element.style.background = avatarColors[avatar.color] || avatarColors.blue;
        applyAvatarBorder(element, selectedBorder);
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
            localStorage.setItem(selectedThemeKey, input.value);
        });
    });
});
})();
