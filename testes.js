const disciplineCatalog = [
    { id: 'portugues', name: 'Português', description: 'Leitura, escrita e interpretação.', image: 'imagens/disciplinas/portugues.svg' },
    { id: 'matematica', name: 'Matemática', description: 'Números, problemas e raciocínio.', image: 'imagens/disciplinas/matematica.svg' },
    { id: 'ingles', name: 'Inglês', description: 'Vocabulário e comunicação.', image: 'imagens/disciplinas/ingles.svg' },
    { id: 'historia', name: 'História', description: 'Povos, fontes e acontecimentos.', image: 'imagens/disciplinas/historia.svg' }
];
const stageNames = ['Fundamentos', 'Aprofundamento', 'Domínio'];
const loggedUser = JSON.parse(sessionStorage.getItem('study-quest-session') || localStorage.getItem('study-quest-session') || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const attemptsKey = `study-quest-test-attempts:v1:${userId}`;
const testTicketsKey = `study-quest-test-tickets:${userId}`;
const testTicketCounter = document.querySelector('#test-ticket-counter');
const testTicketCount = document.querySelector('#test-ticket-count');
const date = getTodayKey();
const params = new URLSearchParams(window.location.search);
const selectedId = params.get('disciplina');
const selectedDiscipline = disciplineCatalog.find((discipline) => discipline.id === selectedId);
const disciplineGrid = document.querySelector('#discipline-grid');
const stageList = document.querySelector('#test-stage-list');

function updateTestTicketCount() {
    const count = Math.max(0, Number(localStorage.getItem(testTicketsKey)) || 0);
    testTicketCount.textContent = String(count);
    testTicketCounter.setAttribute('aria-label', `${count} repetições de teste disponíveis`);
}

updateTestTicketCount();
window.addEventListener('storage', (event) => {
    if (event.key === testTicketsKey) updateTestTicketCount();
});

function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function readAttempts() {
    try {
        const saved = JSON.parse(localStorage.getItem(attemptsKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
    } catch {
        return {};
    }
}

function getStageNodes(disciplineId, level) {
    const key = level === 1
        ? `study-quest-campaign:${disciplineId}`
        : `study-quest-campaign:${disciplineId}:level:${level}`;
    try {
        const nodes = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(nodes) ? new Set(nodes.filter((node) => Number.isInteger(node) && node >= 0 && node < 6)).size : 0;
    } catch {
        return 0;
    }
}

function makeDisciplineCard(discipline) {
    const card = document.createElement('a');
    card.className = 'discipline-card';
    card.href = `Testes.html?disciplina=${discipline.id}`;
    const image = document.createElement('img');
    image.src = discipline.image;
    image.alt = `Ilustração de ${discipline.name}`;
    const details = document.createElement('div');
    const kicker = document.createElement('span');
    kicker.className = 'discipline-kicker';
    kicker.textContent = 'Avaliação diária';
    const title = document.createElement('h3');
    title.textContent = discipline.name;
    const description = document.createElement('p');
    description.textContent = discipline.description;
    details.append(kicker, title, description);
    const arrow = document.createElement('span');
    arrow.className = 'card-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    card.append(image, details, arrow);
    return card;
}

function makeStageCard(discipline, level, attempts) {
    const card = document.createElement('article');
    card.className = 'test-stage-card';
    const heading = document.createElement('div');
    heading.className = 'test-stage-heading';
    const title = document.createElement('h2');
    title.textContent = `Etapa ${level} · ${stageNames[level - 1]}`;
    const difficulty = document.createElement('span');
    difficulty.className = 'test-stage-difficulty';
    difficulty.textContent = level === 1 ? 'Aplicação' : level === 2 ? 'Avançado' : 'Domínio';
    heading.append(title, difficulty);

    const progress = getStageNodes(discipline.id, level);
    const status = document.createElement('p');
    status.className = 'test-stage-status';
    const previousPassed = level === 1 || localStorage.getItem(`study-quest-test:${discipline.id}:level:${level - 1}`) === 'passed';
    const testId = `${date}:${discipline.id}:${level}`;
    const dailyAttempts = Array.isArray(attempts[testId]?.attempts) ? attempts[testId].attempts : [];
    const dailyState = attempts[testId] || {};
    const latestAttempt = dailyAttempts.at(-1);
    const regularAttempts = dailyAttempts.filter((attempt) => attempt.ticketReplay !== true).length;
    const passedToday = dailyAttempts.some((attempt) => attempt.passed);
    const ticketCount = Math.max(0, Number(localStorage.getItem(`study-quest-test-tickets:${userId}`)) || 0);

    if (progress < 6) {
        status.textContent = `Conteúdo estudado: ${progress}/6 exercícios concluídos.`;
    } else if (!previousPassed) {
        status.textContent = 'Passe o teste da etapa anterior para desbloquear esta avaliação.';
    } else if (latestAttempt?.passed) {
        status.textContent = `Aprovado hoje: ${latestAttempt.score}/${latestAttempt.total}.${ticketCount ? ` Tens ${ticketCount} teste(s) para repetir.` : ' As perguntas mudam amanhã.'}`;
    } else if (regularAttempts >= 2 && !dailyState.replayReady) {
        status.textContent = `Tentativas de hoje concluídas. Última nota: ${latestAttempt.score}/${latestAttempt.total}.`;
    } else if (regularAttempts === 1 && !dailyState.replayReady) {
        status.textContent = `Recuperação disponível: ${latestAttempt.score}/${latestAttempt.total}. Uma tentativa restante hoje.`;
    } else {
        status.textContent = '8 perguntas sobre os conteúdos concluídos. Uma recuperação se a nota for baixa.';
    }

    const canStart = progress === 6 && previousPassed && (dailyState.replayReady || (!passedToday && regularAttempts < 2) || ticketCount > 0);
    const action = document.createElement(canStart ? 'a' : 'button');
    action.className = 'primary-btn test-stage-action';
    if (action instanceof HTMLAnchorElement) {
        action.href = `teste.html?disciplina=${discipline.id}&level=${level}`;
        action.textContent = dailyState.replayReady ? 'Continuar repetição' : latestAttempt?.passed || regularAttempts >= 2 ? 'Abrir para repetir' : regularAttempts === 1 ? 'Fazer recuperação' : 'Iniciar teste';
    } else {
        action.type = 'button';
        action.disabled = true;
        action.textContent = latestAttempt?.passed ? 'Teste concluído hoje' : progress < 6 ? 'Conclua a etapa' : 'Indisponível';
    }
    card.append(heading, status, action);
    return card;
}

function render() {
    document.querySelector('#tests-date').textContent = `DESAFIOS DE ${date}`;
    if (!selectedDiscipline) {
        disciplineGrid.replaceChildren(...disciplineCatalog.map(makeDisciplineCard));
        return;
    }

    document.querySelector('#tests-title').textContent = `Testes · ${selectedDiscipline.name}`;
    document.querySelector('#tests-subtitle').textContent = 'Escolha uma etapa que já concluiu para fazer a avaliação diária.';
    document.querySelector('#tests-prompt').textContent = `Desafios de ${selectedDiscipline.name}`;
    document.querySelector('#tests-back').href = 'Testes.html';
    document.querySelector('#tests-back').textContent = '← Disciplinas';
    disciplineGrid.classList.add('hidden');
    stageList.classList.remove('hidden');
    const attempts = readAttempts();
    stageList.replaceChildren(...stageNames.map((_, index) => makeStageCard(selectedDiscipline, index + 1, attempts)));
}

render();
