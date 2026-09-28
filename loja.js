const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const tokensKey = `study-quest-tokens:${userId}`;
const purchasesKey = `study-quest-purchases:${userId}`;
const defaultTokens = 500000;
const storedTokens = localStorage.getItem(tokensKey);
const tokens = storedTokens === null || storedTokens === '500' ? defaultTokens : Number(storedTokens);
if (storedTokens === null || storedTokens === '500') {
    localStorage.setItem(tokensKey, String(defaultTokens));
}
const purchases = JSON.parse(localStorage.getItem(purchasesKey) || '[]');
const balance = document.querySelector('#balance');
const headerTokens = document.querySelector('#header-tokens');
const sidebarTokens = document.querySelector('#sidebar-tokens');
const lootButton = document.querySelector('#loot-open-button');
const lootBox = document.querySelector('#loot-box');
const lootResult = document.querySelector('#loot-result');

const rarityMap = {
    comum: { label: 'Comum', chance: 60, color: '#34d399', themes: ['🌊', '🌿', '🌺', '◈'] },
    incomum: { label: 'Incomum', chance: 25, color: '#60a5fa', themes: ['🌊', '🌿', '✦', '✨'] },
    raro: { label: 'Raro', chance: 10, color: '#f472b6', themes: ['🌌', '🌠', '⚡', '☀️'] },
    lendario: { label: 'Lendário', chance: 5, color: '#fbbf24', themes: ['✧', '⬢', '★', '☄️'] }
};

function updateTokenDisplays(value) {
    const formattedValue = new Intl.NumberFormat('pt-BR').format(value);
    balance.lastChild.textContent = ` ${formattedValue}`;
    headerTokens.textContent = formattedValue;
    sidebarTokens.textContent = formattedValue;
}

function getRandomRarity() {
    const roll = Math.random() * 100;
    if (roll < rarityMap.lendario.chance) return 'lendario';
    if (roll < rarityMap.raro.chance + rarityMap.lendario.chance) return 'raro';
    if (roll < rarityMap.incomum.chance + rarityMap.raro.chance + rarityMap.lendario.chance) return 'incomum';
    return 'comum';
}

function triggerLootAnimation() {
    lootBox.classList.remove('opening');
    void lootBox.offsetWidth;
    lootBox.classList.add('opening');
    window.setTimeout(() => lootBox.classList.remove('opening'), 1100);
}

function renderLootBoxThemes(rank) {
    const icons = rarityMap[rank].themes;
    const cells = lootBox.querySelectorAll('.loot-theme-grid span');
    cells.forEach((cell, index) => {
        cell.textContent = icons[index % icons.length];
    });
}

let currentTokens = tokens;
updateTokenDisplays(currentTokens);

lootButton.addEventListener('click', () => {
    const cost = Number(lootButton.dataset.cost);

    if (currentTokens < cost) {
        lootButton.textContent = `Faltam ${cost - currentTokens} Tokens`;
        return;
    }

    currentTokens -= cost;
    const wonRank = getRandomRarity();
    const wonData = rarityMap[wonRank];
    const resultText = `Você ganhou ${wonData.label.toLowerCase()}!`;

    renderLootBoxThemes(wonRank);
    triggerLootAnimation();
    lootButton.disabled = true;
    lootButton.textContent = 'Abrindo...';

    window.setTimeout(() => {
        purchases.push(resultText);
        localStorage.setItem(tokensKey, String(currentTokens));
        localStorage.setItem(purchasesKey, JSON.stringify(purchases));
        updateTokenDisplays(currentTokens);
        lootResult.textContent = resultText;
        lootResult.style.color = wonData.color;
        lootResult.style.borderColor = `${wonData.color}55`;
        lootResult.style.background = `${wonData.color}14`;
        lootButton.textContent = 'Abrir caixa';
        lootButton.disabled = false;
    }, 900);
});

document.querySelector('#missions-button').addEventListener('click', () => {
    window.location.href = 'missoes.html';
});

document.querySelector('#featured-button').addEventListener('click', () => {
    document.querySelector('#store-items').scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('#history-button').addEventListener('click', () => {
    window.alert(purchases.length ? `Você já sorteou ${purchases.length} recompensa(s).` : 'Você ainda não sorteou nenhuma recompensa.');
});
