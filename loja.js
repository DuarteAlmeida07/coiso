(() => {
const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const tokensKey = `study-quest-tokens:${userId}`;
const purchasesKey = `study-quest-purchases:${userId}`;
const cosmetics = window.StudyQuestCosmetics;
const borderInventoryKey = cosmetics.avatarBorderInventoryKey;
const selectedBorderKey = cosmetics.selectedAvatarBorderKey;
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
const borderLootButton = document.querySelector('#border-loot-open-button');
const borderLootBox = document.querySelector('#border-loot-box');
const borderLootResult = document.querySelector('#border-loot-result');
const borderPrizeList = document.querySelector('#border-prize-list');
const borderLootPriceValue = document.querySelector('#border-loot-price-value');
const lootResult = document.querySelector('#loot-result');
const lootPrizeList = document.querySelector('#loot-prize-list');
const lootPriceValue = document.querySelector('#loot-price-value');
const revealBackdrop = document.querySelector('#loot-reveal-backdrop');
const revealCard = document.querySelector('#loot-reveal-card');
const revealArt = document.querySelector('#loot-reveal-art');
const revealIcon = document.querySelector('#loot-reveal-icon');
const revealTitle = document.querySelector('#loot-reveal-title');
const revealRarity = document.querySelector('#loot-reveal-rarity');
const revealMessage = document.querySelector('#loot-reveal-message');

const rarityMap = {
    comum: { label: 'Comum', chance: 55, color: '#34d399', duplicateTokens: 10, rewards: ['ocean', 'forest'] },
    incomum: { label: 'Incomum', chance: 25, color: '#60a5fa', duplicateTokens: 50, rewards: ['solar', 'coral', 'graphite'] },
    raro: { label: 'Raro', chance: 12, color: '#f472b6', duplicateTokens: 150, rewards: ['aurora', 'sakura', 'volcanic'] },
    muito_raro: { label: 'Muito raro', chance: 5, color: '#c084fc', duplicateTokens: 300, rewards: ['crystal', 'glacial', 'eclipse'] },
    lendario: { label: 'Lendário', chance: 3, color: '#fbbf24', duplicateTokens: 500, rewards: ['nebula', 'celestial'] }
};
const borderInventory = JSON.parse(localStorage.getItem(borderInventoryKey) || '[]');
const borderRarityMap = Object.fromEntries(Object.entries(rarityMap).map(([rank, data]) => [rank, {
    ...data,
    rewards: cosmetics.avatarBorders.filter((border) => border.rarity === rank).map((border) => border.id)
}]));

const themeLabels = {
    aurora: 'Aurora', solar: 'Solar', ocean: 'Oceano', forest: 'Floresta', coral: 'Coral',
    graphite: 'Grafite', sakura: 'Sakura', volcanic: 'Vulcão', crystal: 'Cristal',
    glacial: 'Glacial', eclipse: 'Eclipse', nebula: 'Nebulosa', celestial: 'Celestial'
};
const themeIcons = {
    aurora: '🌌', solar: '☀️', ocean: '🌊', forest: '🌿', coral: '🌺',
    graphite: '◈', sakura: '🌸', volcanic: '🌋', crystal: '💎', glacial: '❄️',
    eclipse: '🌘', nebula: '✨', celestial: '☄️'
};

function closeRewardReveal() {
    revealBackdrop.hidden = true;
    document.body.classList.remove('loot-reveal-open');
    lootButton.focus();
}

function showRewardReveal(title, rank, message, rewardId, isBorder = false) {
    const rarity = rarityMap[rank];
    revealTitle.textContent = title;
    revealRarity.textContent = rarity.label;
    revealRarity.className = `rarity-badge ${rank}`;
    revealMessage.textContent = message;
    cosmetics.applyAvatarBorder(revealArt, '');
    if (isBorder) {
        const border = cosmetics.avatarBorders.find((item) => item.id === rewardId);
        revealArt.className = 'loot-reveal-art border-reveal-art';
        cosmetics.applyAvatarBorder(revealArt, rewardId);
        revealArt.setAttribute('aria-label', `Pré-visualização da moldura ${border.label}`);
        revealIcon.textContent = 'ES';
    } else {
        revealArt.className = `loot-reveal-art theme-${rewardId}`;
        revealArt.setAttribute('aria-label', `Imagem do tema ${themeLabels[rewardId]}`);
        revealIcon.textContent = themeIcons[rewardId];
    }
    revealCard.style.setProperty('--reveal-color', rarity.color);
    revealBackdrop.hidden = false;
    document.body.classList.add('loot-reveal-open');
    document.querySelector('#loot-reveal-close').focus();
}

function renderPossiblePrizes() {
    lootPrizeList.innerHTML = Object.entries(rarityMap).map(([rank, data]) => `
        <section class="loot-prize-tier">
            <div class="loot-prize-heading">
                <span class="rarity-badge ${rank}">${data.label}</span>
                <span class="rarity-percent">${data.chance}%</span>
            </div>
            <ul>${data.rewards.map((theme) => {
                const isOwned = purchases.includes(`Tema ${themeLabels[theme]}`);
                const status = isOwned ? '<span class="loot-prize-status">Já tens</span>' : '';
                return `<li class="${isOwned ? 'owned' : 'unowned'}"><span class="loot-prize-name">${themeLabels[theme]}</span>${status}</li>`;
            }).join('')}</ul>
        </section>
    `).join('');
}

function renderPossibleBorders() {
    borderPrizeList.innerHTML = Object.entries(borderRarityMap).map(([rank, data]) => `
        <section class="loot-prize-tier">
            <div class="loot-prize-heading">
                <span class="rarity-badge ${rank}">${data.label}</span>
                <span class="rarity-percent">${data.chance}%</span>
            </div>
            <ul>${data.rewards.map((borderId) => {
                const border = cosmetics.avatarBorders.find((item) => item.id === borderId);
                const isOwned = borderInventory.includes(borderId);
                return `<li class="${isOwned ? 'owned' : 'unowned'}"><span class="loot-prize-name">${border.label}</span><span class="loot-prize-status">${isOwned ? 'Já tens' : 'Disponível'}</span></li>`;
            }).join('')}</ul>
        </section>
    `).join('');
}

function updateTokenDisplays(value) {
    const formattedValue = new Intl.NumberFormat('pt-BR').format(value);
    balance.lastChild.textContent = ` ${formattedValue}`;
    headerTokens.textContent = formattedValue;
    sidebarTokens.textContent = formattedValue;
    window.StudyQuestHud?.refresh();
}

function getRandomReward(rewardPool) {
    let roll = Math.random() * 100;

    for (const [rank, data] of Object.entries(rewardPool)) {
        roll -= data.chance;
        if (roll < 0) {
            const item = data.rewards[Math.floor(Math.random() * data.rewards.length)];
            return { rank, data, item };
        }
    }

    return null;
}

function triggerLootAnimation(box) {
    box.classList.remove('opening');
    void box.offsetWidth;
    box.classList.add('opening');
    window.setTimeout(() => box.classList.remove('opening'), 1100);
}

function renderLootBoxRarity(box, rank) {
    box.style.setProperty('--loot-rarity-color', rarityMap[rank].color);
}

let currentTokens = tokens;
updateTokenDisplays(currentTokens);
lootPriceValue.textContent = new Intl.NumberFormat('pt-BR').format(Number(lootButton.dataset.cost));
borderLootPriceValue.textContent = new Intl.NumberFormat('pt-BR').format(Number(borderLootButton.dataset.cost));
renderPossiblePrizes();
renderPossibleBorders();

lootButton.addEventListener('click', () => {
    const cost = Number(lootButton.dataset.cost);

    if (currentTokens < cost) {
        lootButton.textContent = `Faltam ${cost - currentTokens} Tokens`;
        return;
    }

    const reward = getRandomReward(rarityMap);
    if (!reward) {
        lootButton.disabled = true;
        lootButton.textContent = 'Todos os temas desbloqueados';
        return;
    }

    currentTokens -= cost;
    const { rank, data: wonData, item: theme } = reward;
    const purchase = `Tema ${themeLabels[theme]}`;
    const isDuplicate = purchases.includes(purchase);
    const resultText = isDuplicate
        ? `Já tinhas o tema ${themeLabels[theme]} (${wonData.label})! Recebeste ${wonData.duplicateTokens} Tokens.`
        : `Recebeste o tema ${themeLabels[theme]} (${wonData.label})!`;
    if (isDuplicate) {
        currentTokens += wonData.duplicateTokens;
    }

    renderLootBoxRarity(lootBox, rank);
    triggerLootAnimation(lootBox);
    lootButton.disabled = true;
    lootButton.textContent = 'Abrindo...';

    window.setTimeout(() => {
        purchases.push(purchase);
        localStorage.setItem(tokensKey, String(currentTokens));
        localStorage.setItem(purchasesKey, JSON.stringify(purchases));
        renderPossiblePrizes();
        updateTokenDisplays(currentTokens);
        if (isDuplicate) window.StudyQuestHud?.recordTokenGain(wonData.duplicateTokens);
        lootResult.textContent = resultText;
        lootResult.style.color = wonData.color;
        lootResult.style.borderColor = `${wonData.color}55`;
        lootResult.style.background = `${wonData.color}14`;
        lootButton.textContent = 'Abrir caixa';
        lootButton.disabled = false;
        showRewardReveal(`Tema ${themeLabels[theme]}`, rank, isDuplicate
            ? `Já tinhas este tema. Recebeste ${wonData.duplicateTokens} Tokens.`
            : 'O tema foi adicionado à tua conta.', theme);
    }, 900);
});

borderLootButton.addEventListener('click', () => {
    const cost = Number(borderLootButton.dataset.cost);
    if (currentTokens < cost) {
        borderLootButton.textContent = `Faltam ${cost - currentTokens} Tokens`;
        return;
    }

    const reward = getRandomReward(borderRarityMap);
    if (!reward) {
        return;
    }

    currentTokens -= cost;
    const { rank, data: wonData, item: borderId } = reward;
    const border = cosmetics.avatarBorders.find((item) => item.id === borderId);
    const isDuplicate = borderInventory.includes(borderId);
    if (isDuplicate) {
        currentTokens += wonData.duplicateTokens;
    } else {
        borderInventory.push(borderId);
        localStorage.setItem(borderInventoryKey, JSON.stringify(borderInventory));
    }

    renderLootBoxRarity(borderLootBox, rank);
    triggerLootAnimation(borderLootBox);
    borderLootButton.disabled = true;
    borderLootButton.textContent = 'Abrindo...';

    window.setTimeout(() => {
        localStorage.setItem(tokensKey, String(currentTokens));
        renderPossibleBorders();
        updateTokenDisplays(currentTokens);
        if (isDuplicate) window.StudyQuestHud?.recordTokenGain(wonData.duplicateTokens);
        borderLootResult.textContent = isDuplicate
            ? `Já tinhas a moldura ${border.label} (${wonData.label})! Recebeste ${wonData.duplicateTokens} Tokens.`
            : `Recebeste a moldura ${border.label} (${wonData.label})!`;
        borderLootResult.style.color = wonData.color;
        borderLootResult.style.borderColor = `${wonData.color}55`;
        borderLootResult.style.background = `${wonData.color}14`;
        borderLootButton.textContent = 'Abrir caixa de molduras';
        borderLootButton.disabled = false;
        showRewardReveal(`Moldura ${border.label}`, rank, isDuplicate
            ? `Já tinhas esta moldura. Recebeste ${wonData.duplicateTokens} Tokens.`
            : 'A moldura foi adicionada ao teu inventário.', borderId, true);
    }, 900);
});

document.querySelector('#loot-reveal-close').addEventListener('click', closeRewardReveal);
document.querySelector('#loot-reveal-confirm').addEventListener('click', closeRewardReveal);
revealBackdrop.addEventListener('click', (event) => {
    if (event.target === revealBackdrop) {
        closeRewardReveal();
    }
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !revealBackdrop.hidden) {
        closeRewardReveal();
    }
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
})();
