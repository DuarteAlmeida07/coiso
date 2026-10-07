(() => {
const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const tokensKey = `study-quest-tokens:${userId}`;
const purchasesKey = `study-quest-purchases:${userId}`;
const testTicketsKey = `study-quest-test-tickets:${userId}`;
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
let testTickets = Math.max(0, Number(localStorage.getItem(testTicketsKey)) || 0);
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
const testTicketInventory = document.querySelector('#test-ticket-inventory');
const revealBackdrop = document.querySelector('#loot-reveal-backdrop');
const revealCard = document.querySelector('#loot-reveal-card');
const revealArt = document.querySelector('#loot-reveal-art');
const revealIcon = document.querySelector('#loot-reveal-icon');
const revealTitle = document.querySelector('#loot-reveal-title');
const revealRarity = document.querySelector('#loot-reveal-rarity');
const revealMessage = document.querySelector('#loot-reveal-message');

const rarityMap = {
    comum: { label: 'Comum', chance: 54.5, color: '#34d399', duplicateTokens: 10, rewards: ['ocean', 'forest'] },
    incomum: { label: 'Incomum', chance: 25, color: '#60a5fa', duplicateTokens: 50, rewards: ['solar', 'coral', 'graphite'] },
    raro: { label: 'Raro', chance: 12, color: '#f472b6', duplicateTokens: 150, rewards: ['aurora', 'sakura', 'volcanic'] },
    muito_raro: { label: 'Muito raro', chance: 5, color: '#c084fc', duplicateTokens: 300, rewards: ['crystal', 'glacial', 'eclipse'] },
    lendario: { label: 'Lendário', chance: 3, color: '#fbbf24', duplicateTokens: 500, rewards: ['nebula', 'celestial'] },
    mitico: { label: 'Mítico', chance: 0.5, color: '#f87171', duplicateTokens: 1000, rewards: ['teste'] },
};
const borderInventory = JSON.parse(localStorage.getItem(borderInventoryKey) || '[]');
const borderRarityMap = Object.fromEntries(Object.entries(rarityMap).map(([rank, data]) => [rank, {
    ...data,
    rewards: [
        ...cosmetics.avatarBorders.filter((border) => border.rarity === rank).map((border) => border.id),
        ...(rank === 'mitico' ? ['teste'] : [])
    ]
}]));

const themeLabels = {
    aurora: 'Aurora', solar: 'Solar', ocean: 'Oceano', forest: 'Floresta', coral: 'Coral',
    graphite: 'Grafite', sakura: 'Sakura', volcanic: 'Vulcão', crystal: 'Cristal',
    glacial: 'Glacial', eclipse: 'Eclipse', nebula: 'Nebulosa', celestial: 'Celestial', teste: 'Teste',
};
const themeIcons = {
    aurora: '🌌', solar: '☀️', ocean: '🌊', forest: '🌿', coral: '🌺',
    graphite: '◈', sakura: '🌸', volcanic: '🌋', crystal: '💎', glacial: '❄️',
    eclipse: '🌘', nebula: '✨', celestial: '☄️', teste: '🧪',
};

function updateTestTicketInventory() {
    if (testTicketInventory) testTicketInventory.textContent = `Testes para repetição: ${testTickets}`;
}

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
    if (rewardId === 'teste') {
        revealArt.className = 'loot-reveal-art test-ticket-reveal';
        revealArt.setAttribute('aria-label', 'Bilhete que permite repetir uma avaliação');
        revealIcon.textContent = themeIcons.teste;
    } else if (isBorder) {
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
                <span class="rarity-percent">${new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 }).format(data.chance)}%</span>
            </div>
            <ul>${data.rewards.map((theme) => {
                const isTicket = theme === 'teste';
                const isOwned = !isTicket && purchases.includes(`Tema ${themeLabels[theme]}`);
                const status = isTicket
                    ? `<span class="loot-prize-status">Tens ${testTickets}</span>`
                    : isOwned ? '<span class="loot-prize-status">Já tens</span>' : '';
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
                <span class="rarity-percent">${new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 }).format(data.chance)}%</span>
            </div>
            <ul>${data.rewards.map((borderId) => {
                const isTicket = borderId === 'teste';
                const border = isTicket ? null : cosmetics.avatarBorders.find((item) => item.id === borderId);
                const isOwned = !isTicket && borderInventory.includes(borderId);
                const label = isTicket ? themeLabels.teste : border.label;
                const status = isTicket ? `Tens ${testTickets}` : isOwned ? 'Já tens' : 'Disponível';
                return `<li class="${isOwned ? 'owned' : 'unowned'}"><span class="loot-prize-name">${label}</span><span class="loot-prize-status">${status}</span></li>`;
            }).join('')}</ul>
        </section>
    `).join('');
}

function updateTokenDisplays(value) {
    const formattedValue = new Intl.NumberFormat('pt-pt').format(value);
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
updateTestTicketInventory();
lootPriceValue.textContent = new Intl.NumberFormat('pt-pt').format(Number(lootButton.dataset.cost));
borderLootPriceValue.textContent = new Intl.NumberFormat('pt-pt').format(Number(borderLootButton.dataset.cost));
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
    const isTestTicket = theme === 'teste';
    const purchase = `Tema ${themeLabels[theme]}`;
    const isDuplicate = !isTestTicket && purchases.includes(purchase);
    const resultText = isTestTicket
        ? `Ganhaste 1 teste (${wonData.label})! Podes repetir uma avaliação.`
        : isDuplicate
            ? `Já tinhas o tema ${themeLabels[theme]} (${wonData.label})! Recebeste ${wonData.duplicateTokens} Tokens.`
            : `Recebeste o tema ${themeLabels[theme]} (${wonData.label})!`;
    if (isTestTicket) {
        testTickets += 1;
    } else if (isDuplicate) {
        currentTokens += wonData.duplicateTokens;
    }

    renderLootBoxRarity(lootBox, rank);
    triggerLootAnimation(lootBox);
    lootButton.disabled = true;
    lootButton.textContent = 'Abrindo...';

    window.setTimeout(() => {
        if (!isTestTicket) purchases.push(purchase);
        localStorage.setItem(tokensKey, String(currentTokens));
        localStorage.setItem(purchasesKey, JSON.stringify(purchases));
        if (isTestTicket) localStorage.setItem(testTicketsKey, String(testTickets));
        renderPossiblePrizes();
        updateTokenDisplays(currentTokens);
        updateTestTicketInventory();
        if (isDuplicate) window.StudyQuestHud?.recordTokenGain(wonData.duplicateTokens);
        lootResult.textContent = resultText;
        lootResult.style.color = wonData.color;
        lootResult.style.borderColor = `${wonData.color}55`;
        lootResult.style.background = `${wonData.color}14`;
        lootButton.textContent = 'Abrir caixa';
        lootButton.disabled = false;
        showRewardReveal(isTestTicket ? themeLabels.teste : `Tema ${themeLabels[theme]}`, rank, isTestTicket
            ? 'O teste foi adicionado ao inventário. Usa-o para repetir uma avaliação.'
            : isDuplicate ? `Já tinhas este tema. Recebeste ${wonData.duplicateTokens} Tokens.` : 'O tema foi adicionado à tua conta.', theme);
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
    const isTestTicket = borderId === 'teste';
    const border = isTestTicket ? null : cosmetics.avatarBorders.find((item) => item.id === borderId);
    const isDuplicate = !isTestTicket && borderInventory.includes(borderId);
    if (isTestTicket) {
        testTickets += 1;
    } else if (isDuplicate) {
        currentTokens += wonData.duplicateTokens;
    } else if (border) {
        borderInventory.push(borderId);
        localStorage.setItem(borderInventoryKey, JSON.stringify(borderInventory));
    }

    renderLootBoxRarity(borderLootBox, rank);
    triggerLootAnimation(borderLootBox);
    borderLootButton.disabled = true;
    borderLootButton.textContent = 'Abrindo...';

    window.setTimeout(() => {
        localStorage.setItem(tokensKey, String(currentTokens));
        if (isTestTicket) localStorage.setItem(testTicketsKey, String(testTickets));
        renderPossibleBorders();
        renderPossiblePrizes();
        updateTokenDisplays(currentTokens);
        updateTestTicketInventory();
        if (isDuplicate) window.StudyQuestHud?.recordTokenGain(wonData.duplicateTokens);
        borderLootResult.textContent = isDuplicate
            ? `Já tinhas a moldura ${border.label} (${wonData.label})! Recebeste ${wonData.duplicateTokens} Tokens.`
            : isTestTicket ? `Ganhaste 1 teste (${wonData.label})! Podes repetir uma avaliação.` : `Recebeste a moldura ${border.label} (${wonData.label})!`;
        borderLootResult.style.color = wonData.color;
        borderLootResult.style.borderColor = `${wonData.color}55`;
        borderLootResult.style.background = `${wonData.color}14`;
        borderLootButton.textContent = 'Abrir caixa de molduras';
        borderLootButton.disabled = false;
        showRewardReveal(isTestTicket ? themeLabels.teste : `Moldura ${border.label}`, rank, isTestTicket
            ? 'O teste foi adicionado ao inventário. Usa-o para repetir uma avaliação.'
            : isDuplicate ? `Já tinhas esta moldura. Recebeste ${wonData.duplicateTokens} Tokens.` : 'A moldura foi adicionada ao teu inventário.', borderId, !isTestTicket);
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
