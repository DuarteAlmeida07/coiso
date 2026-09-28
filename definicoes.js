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
    { id: 'mint-loop', label: 'Musgo Antigo', rarity: 'comum', color: '#7d9b56', accent: '#d0a65a', pattern: 'ridge', finish: 'moss', image: '/imagens/bordas%20de%20avatar/border-mint-loop.svg' },
    { id: 'skyline', label: 'Prata Lunar', rarity: 'comum', color: '#c0d0d7', accent: '#607d8b', pattern: 'double', finish: 'steel', image: '/imagens/bordas%20de%20avatar/border-skyline.svg' },
    { id: 'clover', label: 'Bosque Vivo', rarity: 'comum', color: '#63874d', accent: '#bd9b55', pattern: 'ridge', finish: 'roots', image: '/imagens/bordas%20de%20avatar/border-clover.svg' },
    { id: 'rose-gold', label: 'Filigrana de Bronze', rarity: 'comum', color: '#b97859', accent: '#f1cf83', pattern: 'groove', finish: 'bronze', image: '/imagens/bordas%20de%20avatar/border-rose-gold.svg' },
    { id: 'sunbeam', label: 'Runas de Âmbar', rarity: 'comum', color: '#d9a441', accent: '#fff0a6', pattern: 'double', finish: 'runes', image: '/imagens/bordas%20de%20avatar/border-sunbeam.svg' },
    { id: 'lilac-mist', label: 'Pedra da Lua', rarity: 'comum', color: '#a6a6d6', accent: '#e5d8ff', pattern: 'dotted', finish: 'moonstone', image: '/imagens/bordas%20de%20avatar/border-lilac-mist.svg' },
    { id: 'tidal', label: 'Neon da Chuva', rarity: 'incomum', color: '#00e5d4', accent: '#ff38c7', pattern: 'double', finish: 'neon', image: '/imagens/bordas%20de%20avatar/border-tidal.svg' },
    { id: 'coral-reef', label: 'Jardim de Espinhos', rarity: 'incomum', color: '#a84c52', accent: '#78a66a', pattern: 'groove', finish: 'thorn', image: '/imagens/bordas%20de%20avatar/border-coral-reef.svg' },
    { id: 'citrus', label: 'Jade Selvagem', rarity: 'incomum', color: '#93ad50', accent: '#d8c06a', pattern: 'ridge', finish: 'jade', image: '/imagens/bordas%20de%20avatar/border-citrus.svg' },
    { id: 'frostline', label: 'Aço Glacial', rarity: 'incomum', color: '#a9c7d8', accent: '#f1fbff', pattern: 'double', finish: 'frost', image: '/imagens/bordas%20de%20avatar/border-frostline.svg' },
    { id: 'ember', label: 'Ferro de Brasa', rarity: 'incomum', color: '#9c3b2c', accent: '#ff9c3c', pattern: 'dashed', finish: 'ember', image: '/imagens/bordas%20de%20avatar/border-ember.svg' },
    { id: 'aurora-ring', label: 'Serpente Esmeralda', rarity: 'raro', color: '#268e78', accent: '#dbca70', pattern: 'ridge', finish: 'serpent', image: '/imagens/bordas%20de%20avatar/border-aurora-ring.svg' },
    { id: 'sakura-frame', label: 'Sakura em Flor', rarity: 'raro', color: '#d784a7', accent: '#7a365c', pattern: 'dotted', finish: 'sakura', image: '/imagens/bordas%20de%20avatar/border-sakura-frame.svg' },
    { id: 'nebula-gate', label: 'Circuito Violeta', rarity: 'raro', color: '#7665c4', accent: '#ff3ca6', pattern: 'double', finish: 'cyber', image: '/imagens/bordas%20de%20avatar/border-nebula-gate.svg' },
    { id: 'jade-crown', label: 'Copa de Carvalho', rarity: 'raro', color: '#557d4c', accent: '#d7b95f', pattern: 'groove', finish: 'oak', image: '/imagens/bordas%20de%20avatar/border-jade-crown.svg' },
    { id: 'prismatic', label: 'Portal de Plasma', rarity: 'muito_raro', color: '#36bfc6', accent: '#e28bdb', pattern: 'outset', finish: 'plasma', image: '/imagens/bordas%20de%20avatar/border-prismatic.svg' },
    { id: 'eclipse', label: 'Juramento do Eclipse', rarity: 'muito_raro', color: '#873d48', accent: '#e4bd64', pattern: 'double', finish: 'eclipse', image: '/imagens/bordas%20de%20avatar/border-eclipse.svg' },
    { id: 'starfall', label: 'Constelação Safira', rarity: 'muito_raro', color: '#767ab8', accent: '#79d8df', pattern: 'ridge', finish: 'starlight', image: '/imagens/bordas%20de%20avatar/border-starfall.svg' },
    { id: 'celestial-crown', label: 'Árvore Ancestral', rarity: 'lendario', color: '#b18a3e', accent: '#e5d68a', pattern: 'double', finish: 'ancient', image: '/imagens/bordas%20de%20avatar/border-celestial-crown.svg' },
    { id: 'phoenix-flame', label: 'Dragão de Brasa', rarity: 'lendario', color: '#b64e36', accent: '#f6ca58', pattern: 'groove', finish: 'dragon', image: '/imagens/bordas%20de%20avatar/border-phoenix-flame.svg' }
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
    delete element.dataset.avatarFinish;
    ['--avatar-border-color', '--avatar-border-accent', '--avatar-border-pattern', '--avatar-border-image'].forEach((property) => {
        element.style.removeProperty(property);
    });

    const border = avatarBorderCatalog.find((item) => item.id === borderId);
    if (!border) {
        return;
    }

    element.style.setProperty('--avatar-border-color', border.color);
    element.style.setProperty('--avatar-border-accent', border.accent);
    element.style.setProperty('--avatar-border-pattern', border.pattern);
    element.style.setProperty('--avatar-border-image', `url("${border.image}")`);
    element.dataset.avatarFinish = border.finish;
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
        element.style.setProperty('--avatar-fill', avatarColors[avatar.color] || avatarColors.blue);
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
