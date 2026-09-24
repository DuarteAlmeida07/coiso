const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser ? loggedUser.email : 'guest';
const tokensKey = `study-quest-tokens:${userId}`;
const purchasesKey = `study-quest-purchases:${userId}`;
const defaultTokens = 500;
const tokens = Number(localStorage.getItem(tokensKey) || defaultTokens);
const purchases = JSON.parse(localStorage.getItem(purchasesKey) || '[]');
const balance = document.querySelector('#balance');
const headerTokens = document.querySelector('#header-tokens');
const sidebarTokens = document.querySelector('#sidebar-tokens');

function updateTokenDisplays(value) {
    balance.lastChild.textContent = ` ${value}`;
    headerTokens.textContent = value;
    sidebarTokens.textContent = value;
}

function updatePurchaseButton(button) {
    const item = button.dataset.item;
    if (purchases.includes(item)) {
        button.textContent = 'Comprado';
        button.disabled = true;
        button.setAttribute('aria-label', `${item} comprado`);
    }
}

let currentTokens = tokens;
updateTokenDisplays(currentTokens);
document.querySelectorAll('.redeem-button').forEach(updatePurchaseButton);

document.querySelectorAll('.redeem-button').forEach((button) => {
    button.addEventListener('click', () => {
        const cost = Number(button.dataset.cost);
        const item = button.dataset.item;

        if (currentTokens < cost) {
            button.textContent = `Faltam ${cost - currentTokens} Tokens`;
            return;
        }

        currentTokens -= cost;
        purchases.push(item);
        localStorage.setItem(tokensKey, currentTokens);
        localStorage.setItem(purchasesKey, JSON.stringify(purchases));
        updateTokenDisplays(currentTokens);
        updatePurchaseButton(button);
    });
});

document.querySelector('#missions-button').addEventListener('click', () => {
    window.location.href = 'missoes.html';
});

document.querySelector('#featured-button').addEventListener('click', () => {
    document.querySelector('#store-items').scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('#history-button').addEventListener('click', () => {
    window.alert(purchases.length ? `Você já comprou ${purchases.length} item(ns).` : 'Você ainda não comprou nenhum cosmético.');
});
