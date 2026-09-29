(() => {
const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const dailyKey = `study-quest-daily-missions:v2:${userId}`;
const profileKey = `study-quest-profile:${userId}`;
const tokensKey = `study-quest-tokens:${userId}`;
const dailyMissionCount = 3;
const dailyBonus = { xp: 100, tokens: 250 };
const xpPerLevel = 500;

const missionCatalog = [
    { id: 'read-25', icon: '📖', category: 'Leitura', title: 'Ler durante 25 minutos', description: 'Leia um capítulo ou artigo sem interrupções.', xp: 40, tokens: 80 },
    { id: 'focus-45', icon: '⏱️', category: 'Foco', title: 'Fazer uma sessão de foco', description: 'Estude durante 45 minutos com as notificações desligadas.', xp: 70, tokens: 120 },
    { id: 'review-notes', icon: '📝', category: 'Revisão', title: 'Rever as notas do dia', description: 'Revise e organize as notas de uma matéria.', xp: 35, tokens: 70 },
    { id: 'solve-10', icon: '🧠', category: 'Prática', title: 'Resolver 10 exercícios', description: 'Pratique com dez exercícios do tema que está a estudar.', xp: 60, tokens: 110 },
    { id: 'flashcards', icon: '🗂️', category: 'Memória', title: 'Criar 8 flashcards', description: 'Transforme os conceitos mais importantes em cartões de revisão.', xp: 45, tokens: 90 },
    { id: 'teach-topic', icon: '🎓', category: 'Domínio', title: 'Explicar um conceito', description: 'Explique um conceito em voz alta ou por escrito.', xp: 55, tokens: 100 },
    { id: 'study-plan', icon: '🗓️', category: 'Planeamento', title: 'Planear a próxima sessão', description: 'Defina o que vai estudar e uma meta concreta.', xp: 30, tokens: 60 },
    { id: 'watch-class', icon: '▶️', category: 'Aula', title: 'Concluir uma aula', description: 'Assista a uma aula e registe três ideias principais.', xp: 65, tokens: 115 },
    { id: 'clean-desk', icon: '🧹', category: 'Preparação', title: 'Preparar o espaço de estudo', description: 'Organize a mesa e deixe tudo pronto para aprender.', xp: 25, tokens: 50 },
    { id: 'write-summary', icon: '✍️', category: 'Síntese', title: 'Escrever um resumo', description: 'Resuma o que aprendeu em cinco frases.', xp: 50, tokens: 95 },
    { id: 'practice-language', icon: '🌍', category: 'Idiomas', title: 'Praticar um idioma', description: 'Faça quinze minutos de vocabulário ou conversação.', xp: 45, tokens: 85 },
    { id: 'morning-goal', icon: '🌅', category: 'Consistência', title: 'Definir a meta do dia', description: 'Escolha uma prioridade de estudo para hoje.', xp: 25, tokens: 50 }
];

function todayKey() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}

function readJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
}

function getDailyState() {
    const date = todayKey();
    const saved = readJson(dailyKey, null);
    if (saved && saved.date === date && Array.isArray(saved.missionIds)) {
        return saved;
    }

    const seed = `${date}:${userId}`;
    const shuffled = [...missionCatalog].sort((first, second) => hash(`${seed}:${first.id}`) - hash(`${seed}:${second.id}`));
    const state = {
        date,
        missionIds: shuffled.slice(0, dailyMissionCount).map((mission) => mission.id),
        completedIds: [],
        bonusClaimed: false
    };
    localStorage.setItem(dailyKey, JSON.stringify(state));
    return state;
}

function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        result ^= value.charCodeAt(index);
        result = Math.imul(result, 16777619);
    }
    return result >>> 0;
}

function getProfile() {
    const profile = readJson(profileKey, { xp: 0, completedTotal: 0 });
    return {
        xp: Number(profile.xp) || 0,
        completedTotal: Number(profile.completedTotal) || 0
    };
}

function saveProfile(profile) {
    localStorage.setItem(profileKey, JSON.stringify(profile));
}

function getTokens() {
    const savedTokens = localStorage.getItem(tokensKey);
    if (savedTokens === null || savedTokens === '500') {
        localStorage.setItem(tokensKey, '500000');
        return 500000;
    }
    return Number(savedTokens) || 0;
}

function addRewards(xp, tokens, countCompletion = true) {
    const profile = getProfile();
    profile.xp += xp;
    if (countCompletion) {
        profile.completedTotal += 1;
    }
    saveProfile(profile);
    localStorage.setItem(tokensKey, String(getTokens() + tokens));
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function getLevelData(totalXp) {
    let level = 1;
    let currentXp = Math.max(0, totalXp);
    let requiredXp = xpPerLevel;

    while (currentXp >= requiredXp) {
        currentXp -= requiredXp;
        level += 1;
        requiredXp = xpPerLevel;
    }

    return {
        level,
        currentXp,
        requiredXp,
        progress: Math.round((currentXp / requiredXp) * 100)
    };
}

function getDailyMissions(state) {
    return state.missionIds.map((id) => missionCatalog.find((mission) => mission.id === id)).filter(Boolean);
}

function renderMissionCard(mission, state) {
    const completed = state.completedIds.includes(mission.id);
    const card = document.createElement('article');
    card.className = `mission-card panel${completed ? ' done' : ''}`;
    card.innerHTML = `
        <div class="mission-head">
            <div class="mission-type"><span aria-hidden="true">${mission.icon}</span><strong>${mission.category}</strong></div>
            <span class="mission-points">+${mission.xp} XP · +${mission.tokens} T</span>
        </div>
        <div class="task-meta">
            <span class="task-name">${mission.title}</span>
            <span class="task-time">${mission.description}</span>
        </div>
        <button class="primary-btn mission-complete" type="button"${completed ? ' disabled' : ''}>${completed ? 'Concluída' : 'Fazer agora'}</button>
    `;
    card.querySelector('.mission-complete').addEventListener('click', (event) => runMission(mission.id, event.currentTarget));
    return card;
}

function renderTasks(state, missions) {
    document.querySelectorAll('.tasks-list').forEach((list) => {
        list.innerHTML = '';
        missions.forEach((mission) => {
            const task = document.createElement('div');
            const completed = state.completedIds.includes(mission.id);
            task.className = `task-card${completed ? ' done' : ''}`;
            task.innerHTML = `
                <div class="task-main"><span class="check" aria-hidden="true">${completed ? '✓' : ''}</span><div class="task-meta"><span class="task-name">${mission.title}</span><span class="task-time">${mission.category}</span></div></div>
                <span class="task-points">+${mission.xp} XP</span>
            `;
            list.appendChild(task);
        });
    });
}

function updateStats(state, missions) {
    const profile = getProfile();
    const levelData = getLevelData(profile.xp);
    const completedToday = state.completedIds.length;
    const progress = Math.round((completedToday / dailyMissionCount) * 100);
    const stats = document.querySelectorAll('.stat-card strong');
    if (stats[0]) stats[0].textContent = formatNumber(profile.xp);
    if (stats[1]) stats[1].textContent = String(profile.completedTotal);

    document.querySelectorAll('.mini-stat strong').forEach((element, index) => {
        if (index === 0) element.textContent = document.querySelector('.hero-card h2') ? String(completedToday) : `${completedToday}/${dailyMissionCount}`;
        if (index === 2) element.textContent = `${progress}%`;
    });

    const progressHeading = document.querySelector('.hero-card h2');
    if (progressHeading) progressHeading.textContent = `${progress}%`;
    const progressBar = document.querySelector('.progress-wrap .bar span');
    if (progressBar) progressBar.style.width = `${levelData.progress}%`;
    document.querySelectorAll('.level-badge strong').forEach((element) => {
        element.textContent = `Nível ${levelData.level}`;
    });
    document.querySelectorAll('.progress-label span:last-child').forEach((element) => {
        element.textContent = `${formatNumber(levelData.currentXp)}/${formatNumber(levelData.requiredXp)} XP`;
    });
    const missionTags = document.querySelectorAll('.panel-header .tag');
    if (missionTags[0]) missionTags[0].textContent = `${completedToday}/${dailyMissionCount}`;
    const xpLabels = document.querySelectorAll('.side-card strong');
    xpLabels.forEach((element) => {
        element.textContent = formatNumber(profile.xp);
    });
    const weekly = document.querySelector('.side-panel .rank-box strong');
    if (weekly) weekly.textContent = `${completedToday}/${dailyMissionCount}`;
    const bonus = document.querySelector('.mission-bonus');
    if (bonus) bonus.textContent = state.bonusClaimed ? 'Bónus diário recebido' : `Completa as 3 e recebe +${dailyBonus.xp} XP · +${dailyBonus.tokens} Tokens`;
}

function render() {
    const state = getDailyState();
    const missions = getDailyMissions(state);
    document.querySelectorAll('.missions').forEach((container) => {
        container.innerHTML = '';
        missions.forEach((mission) => container.appendChild(renderMissionCard(mission, state)));
        const bonus = document.createElement('div');
        bonus.className = 'mission-bonus';
        bonus.textContent = state.bonusClaimed ? 'Bónus diário recebido' : `Completa as 3 e recebe +${dailyBonus.xp} XP · +${dailyBonus.tokens} Tokens`;
        container.appendChild(bonus);
    });
    renderTasks(state, missions);
    updateStats(state, missions);
}

function completeMission(missionId) {
    const state = getDailyState();
    if (state.completedIds.includes(missionId)) return;
    const mission = missionCatalog.find((item) => item.id === missionId);
    if (!mission) return;

    state.completedIds.push(missionId);
    addRewards(mission.xp, mission.tokens);
    if (state.completedIds.length === dailyMissionCount && !state.bonusClaimed) {
        state.bonusClaimed = true;
        addRewards(dailyBonus.xp, dailyBonus.tokens, false);
    }
    localStorage.setItem(dailyKey, JSON.stringify(state));
    render();
}

function runMission(missionId, button) {
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = 'A concluir...';
    window.setTimeout(() => completeMission(missionId), 450);
}

window.StudyQuestMissions = { catalog: missionCatalog, refresh: render };
document.addEventListener('DOMContentLoaded', render);
})();
