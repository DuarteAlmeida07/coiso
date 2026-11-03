(() => {
const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const dailyKey = `study-quest-daily-missions:v3:${userId}`;
const profileKey = `study-quest-profile:${userId}`;
const testScoresKey = `study-quest-test-scores:v1:${userId}`;
const tokensKey = `study-quest-tokens:${userId}`;
const dailyMissionCount = 3;
const missionCatalogVersion = 5;
const dailyBonus = { xp: 100, tokens: 250 };
const xpPerLevel = 500;
const disciplines = ['portugues', 'matematica', 'ingles', 'historia'];

const missionCatalog = [
    { id: 'nodes-three', icon: '🧩', category: 'Campanha', title: 'Concluir 3 nodes', description: 'Avança em qualquer campanha e conclui três nodes hoje.', xp: 60, tokens: 110, goal: { type: 'nodes', count: 3 } },
    { id: 'nodes-four', icon: '⚡', category: 'Campanha', title: 'Concluir 4 nodes', description: 'Conclui quatro nodes de campanha hoje.', xp: 85, tokens: 155, goal: { type: 'nodes', count: 4 } },
    { id: 'final-test', icon: '🏁', category: 'Teste final', title: 'Passar um teste final', description: 'Conclui os nodes de uma etapa e passa o teste final.', xp: 100, tokens: 180, goal: { type: 'tests', count: 1 } },
    { id: 'two-final-tests', icon: '🏆', category: 'Testes finais', title: 'Passar 2 testes finais', description: 'Passa os testes finais de duas etapas de campanha.', xp: 160, tokens: 290, goal: { type: 'tests', count: 2 } },
    { id: 'two-per-discipline', icon: '📚', category: 'Todas as disciplinas', title: 'Concluir 2 nodes de cada disciplina', description: 'Conclui dois nodes de Português, Matemática, Inglês e História.', xp: 180, tokens: 320, goal: { type: 'nodes-per-discipline', count: 2 } },
    { id: 'two-disciplines', icon: '🧭', category: 'Exploração', title: 'Estudar 2 disciplinas', description: 'Conclui pelo menos um node em duas disciplinas diferentes.', xp: 80, tokens: 145, goal: { type: 'disciplines', count: 2 } },
    { id: 'three-disciplines', icon: '🌐', category: 'Exploração', title: 'Estudar 3 disciplinas', description: 'Conclui pelo menos um node em três disciplinas diferentes.', xp: 110, tokens: 200, goal: { type: 'disciplines', count: 3 } },
    { id: 'two-same-discipline', icon: '🎯', category: 'Foco', title: 'Concluir 2 nodes na mesma disciplina', description: 'Avança dois nodes numa das campanhas disponíveis.', xp: 65, tokens: 120, goal: { type: 'discipline-nodes', count: 2 } },
    { id: 'three-stage-nodes', icon: '🛤️', category: 'Etapa', title: 'Avançar 3 nodes numa etapa', description: 'Conclui três nodes da mesma etapa de campanha.', xp: 75, tokens: 135, goal: { type: 'stage', count: 3 } },
    { id: 'complete-stage', icon: '🗺️', category: 'Etapa', title: 'Completar os 6 nodes de uma etapa', description: 'Conclui todos os nodes de uma campanha para desbloquear o teste final.', xp: 120, tokens: 220, goal: { type: 'stage', count: 6 } }
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
    if (saved && saved.date === date && saved.catalogVersion === missionCatalogVersion && Array.isArray(saved.missionIds) && saved.missionIds.length === dailyMissionCount && new Set(saved.missionIds).size === dailyMissionCount && saved.missionIds.every((id) => missionCatalog.some((mission) => mission.id === id))) {
        saved.completedIds = Array.isArray(saved.completedIds) ? saved.completedIds : [];
        saved.claimedIds = Array.isArray(saved.claimedIds) ? saved.claimedIds : [];
        saved.activity = saved.activity || {};
        saved.activity.nodes = Array.isArray(saved.activity.nodes) ? saved.activity.nodes : [];
        saved.activity.finalTests = Array.isArray(saved.activity.finalTests) ? saved.activity.finalTests : [];
        return saved;
    }

    const sameDay = saved && saved.date === date;
    const shuffled = [...missionCatalog];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    const missionIds = shuffled.slice(0, dailyMissionCount).map((mission) => mission.id);
    const state = {
        date,
        catalogVersion: missionCatalogVersion,
        missionIds,
        completedIds: sameDay && Array.isArray(saved.completedIds) ? missionIds.filter((id) => saved.completedIds.includes(id)) : [],
        claimedIds: sameDay && Array.isArray(saved.claimedIds)
            ? missionIds.filter((id) => saved.claimedIds.includes(id))
            : sameDay && Array.isArray(saved.completedIds)
                ? missionIds.filter((id) => saved.completedIds.includes(id))
                : [],
        bonusClaimed: sameDay && saved.bonusClaimed === true,
        activity: {
            nodes: sameDay && Array.isArray(saved.activity?.nodes) ? saved.activity.nodes : [],
            finalTests: sameDay && Array.isArray(saved.activity?.finalTests) ? saved.activity.finalTests : []
        }
    };
    localStorage.setItem(dailyKey, JSON.stringify(state));
    return state;
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
    if (tokens > 0) window.StudyQuestHud?.recordTokenGain(tokens);
    else window.StudyQuestHud?.refresh();
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

function getCampaignProgress(disciplineId) {
    let completedCount = 0;
    for (let level = 1; level <= 3; level += 1) {
        const key = level === 1
            ? `study-quest-campaign:${disciplineId}`
            : `study-quest-campaign:${disciplineId}:level:${level}`;
        const savedNodes = readJson(key, []);
        if (Array.isArray(savedNodes)) {
            completedCount += new Set(savedNodes.filter((nodeIndex) => Number.isInteger(nodeIndex) && nodeIndex >= 0 && nodeIndex < 6)).size;
        }
    }
    const campaignProgress = Math.round((completedCount / 18) * 100);
    const testProgress = Number(readJson(testScoresKey, {})[disciplineId]?.percent) || 0;
    return Math.min(100, campaignProgress + Math.round(testProgress * 0.2));
}

function recordTestScore(disciplineId, score, total, testId) {
    if (!disciplines.includes(disciplineId) || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return;
    const percent = Math.round((score / total) * 100);
    const scores = readJson(testScoresKey, {});
    const previousPercent = Number(scores[disciplineId]?.percent) || 0;
    if (percent <= previousPercent) return;
    scores[disciplineId] = { score, total, percent, testId, recordedAt: Date.now() };
    localStorage.setItem(testScoresKey, JSON.stringify(scores));
    renderRadarChart();
}

function renderRadarChart() {
    const container = document.querySelector('#discipline-radar');
    if (!container) return;

    const profile = getProfile();
    const axes = [
        { label: 'Português', value: getCampaignProgress('portugues') },
        { label: 'Matemática', value: getCampaignProgress('matematica') },
        { label: 'História', value: getCampaignProgress('historia') },
        { label: 'Inglês', value: getCampaignProgress('ingles') },
        { label: 'Rank', value: Math.min(100, Math.round((profile.xp / (xpPerLevel * 10)) * 100)) }
    ];
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    const centerX = 240;
    const centerY = 215;
    const radius = 132;
    const pointAt = (axisIndex, scale) => {
        const angle = -Math.PI / 2 + (axisIndex * Math.PI * 2) / axes.length;
        return {
            x: centerX + Math.cos(angle) * radius * scale,
            y: centerY + Math.sin(angle) * radius * scale
        };
    };
    const createSvgElement = (name, attributes = {}, text = '') => {
        const element = document.createElementNS(svgNamespace, name);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
        if (text) element.textContent = text;
        return element;
    };

    svg.setAttribute('viewBox', '0 0 480 430');
    svg.setAttribute('class', 'radar-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', 'radar-svg-title radar-svg-description');
    svg.append(
        createSvgElement('title', { id: 'radar-svg-title' }, 'Progresso nas disciplinas e rank'),
        createSvgElement('desc', { id: 'radar-svg-description' }, axes.map(({ label, value }) => `${label}: ${value}%`).join('. '))
    );

    [20, 40, 60, 80, 100].forEach((percentage) => {
        const points = axes.map((_, axisIndex) => {
            const point = pointAt(axisIndex, percentage / 100);
            return `${point.x},${point.y}`;
        }).join(' ');
        svg.appendChild(createSvgElement('polygon', { points, class: 'radar-grid-line' }));
    });

    axes.forEach((axis, axisIndex) => {
        const point = pointAt(axisIndex, 1);
        svg.appendChild(createSvgElement('line', {
            x1: centerX,
            y1: centerY,
            x2: point.x,
            y2: point.y,
            class: 'radar-axis-line'
        }));
    });

    const dataPoints = axes.map((axis, axisIndex) => pointAt(axisIndex, axis.value / 100));
    svg.appendChild(createSvgElement('polygon', {
        points: dataPoints.map((point) => `${point.x},${point.y}`).join(' '),
        class: 'radar-data-area'
    }));

    axes.forEach((axis, axisIndex) => {
        const point = dataPoints[axisIndex];
        const labelPoint = pointAt(axisIndex, 1.34);
        const textAnchor = labelPoint.x < centerX - 12 ? 'end' : labelPoint.x > centerX + 12 ? 'start' : 'middle';
        svg.appendChild(createSvgElement('circle', { cx: point.x, cy: point.y, r: 5, class: 'radar-data-point' }));
        svg.appendChild(createSvgElement('text', {
            x: labelPoint.x,
            y: labelPoint.y,
            'text-anchor': textAnchor,
            class: 'radar-axis-label'
        }, axis.label));
    });

    const legend = document.createElement('ul');
    legend.className = 'radar-legend';
    legend.setAttribute('aria-label', 'Valores do gráfico');
    axes.forEach(({ label, value }) => {
        const item = document.createElement('li');
        item.className = 'radar-legend-item';
        const swatch = document.createElement('span');
        swatch.className = 'radar-legend-swatch';
        swatch.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span');
        name.textContent = label;
        const score = document.createElement('strong');
        score.textContent = `${value}%`;
        item.append(swatch, name, score);
        legend.appendChild(item);
    });

    container.replaceChildren(svg, legend);
}

function getMissionProgress(mission, state) {
    const nodes = state.activity.nodes;
    const goal = mission.goal;
    let current = 0;
    let label = '';

    if (goal.type === 'nodes') {
        current = nodes.length;
        label = `${Math.min(current, goal.count)}/${goal.count} nodes`;
    } else if (goal.type === 'tests') {
        current = state.activity.finalTests.length;
        label = `${Math.min(current, goal.count)}/${goal.count} testes`;
    } else if (goal.type === 'disciplines') {
        current = new Set(nodes.map((node) => node.disciplineId)).size;
        label = `${Math.min(current, goal.count)}/${goal.count} disciplinas`;
    } else if (goal.type === 'discipline-nodes') {
        current = Math.max(0, ...disciplines.map((disciplineId) => new Set(nodes.filter((node) => node.disciplineId === disciplineId).map((node) => `${node.level}:${node.nodeIndex}`)).size));
        label = `${Math.min(current, goal.count)}/${goal.count} nodes na mesma disciplina`;
    } else if (goal.type === 'nodes-per-discipline') {
        current = disciplines.filter((disciplineId) => new Set(nodes.filter((node) => node.disciplineId === disciplineId).map((node) => `${node.level}:${node.nodeIndex}`)).size >= goal.count).length;
        label = `${current}/${disciplines.length} disciplinas`;
    } else {
        const stageCounts = nodes.reduce((counts, node) => {
            const stageId = `${node.disciplineId}:${node.level}`;
            counts[stageId] = (counts[stageId] || 0) + 1;
            return counts;
        }, {});
        current = Math.max(0, ...Object.values(stageCounts));
        label = `${Math.min(current, goal.count)}/${goal.count} nodes na mesma etapa`;
    }

    const target = goal.type === 'nodes-per-discipline' ? disciplines.length : goal.count;
    const progressValue = goal.type === 'nodes-per-discipline' ? current : Math.min(current, target);
    return { label, percent: Math.min(100, Math.round((progressValue / target) * 100)), complete: progressValue >= target };
}

function renderMissionCard(mission, state) {
    const completed = state.completedIds.includes(mission.id);
    const claimed = state.claimedIds.includes(mission.id);
    const progress = getMissionProgress(mission, state);
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
        <div class="mission-progress" aria-label="Progresso: ${progress.label}">
            <span>${completed ? 'Concluída' : progress.label}</span>
            <div class="mission-progress-bar"><span style="width: ${completed ? 100 : progress.percent}%"></span></div>
        </div>
    `;
    if (completed) {
        const claimButton = document.createElement('button');
        claimButton.className = 'primary-btn mission-claim';
        claimButton.type = 'button';
        claimButton.disabled = claimed;
        claimButton.textContent = claimed ? 'Recompensa reclamada' : `Reclamar +${mission.xp} XP · +${mission.tokens} T`;
        claimButton.addEventListener('click', () => claimMission(mission.id));
        card.appendChild(claimButton);
    }
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
    renderDailyBonus(state, document.querySelector('.mission-bonus'));
}

function renderDailyBonus(state, container) {
    if (!container) return;
    container.replaceChildren();
    if (state.bonusClaimed) {
        container.textContent = 'Bónus diário recebido';
        return;
    }
    const allMissionsClaimed = state.missionIds.every((id) => state.claimedIds.includes(id));
    if (!allMissionsClaimed) {
        container.textContent = `Reclama as 3 recompensas para desbloquear o bónus de +${dailyBonus.xp} XP · +${dailyBonus.tokens} Tokens`;
        return;
    }
    const label = document.createElement('span');
    label.textContent = `Bónus diário disponível: +${dailyBonus.xp} XP · +${dailyBonus.tokens} Tokens`;
    const button = document.createElement('button');
    button.className = 'primary-btn mission-bonus-claim';
    button.type = 'button';
    button.textContent = 'Reclamar bónus diário';
    button.addEventListener('click', claimDailyBonus);
    container.append(label, button);
}

function render() {
    const state = getDailyState();
    completeReadyMissions(state);
    const missions = getDailyMissions(state);
    document.querySelectorAll('.missions').forEach((container) => {
        container.innerHTML = '';
        missions.forEach((mission) => container.appendChild(renderMissionCard(mission, state)));
        const bonus = document.createElement('div');
        bonus.className = 'mission-bonus';
        container.appendChild(bonus);
    });
    renderTasks(state, missions);
    updateStats(state, missions);
    renderRadarChart();
}

function completeReadyMissions(state) {
    let changed = false;
    getDailyMissions(state).forEach((mission) => {
        if (state.completedIds.includes(mission.id) || !getMissionProgress(mission, state).complete) return;
        state.completedIds.push(mission.id);
        changed = true;
    });
    if (changed) localStorage.setItem(dailyKey, JSON.stringify(state));
}

function claimMission(missionId) {
    const state = getDailyState();
    completeReadyMissions(state);
    const mission = missionCatalog.find((item) => item.id === missionId);
    if (!mission || !state.completedIds.includes(missionId) || state.claimedIds.includes(missionId)) return;

    state.claimedIds.push(missionId);
    addRewards(mission.xp, mission.tokens);
    localStorage.setItem(dailyKey, JSON.stringify(state));
    render();
}

function claimDailyBonus() {
    const state = getDailyState();
    const allMissionsClaimed = state.missionIds.every((id) => state.claimedIds.includes(id));
    if (state.bonusClaimed || !allMissionsClaimed) return;
    state.bonusClaimed = true;
    addRewards(dailyBonus.xp, dailyBonus.tokens, false);
    localStorage.setItem(dailyKey, JSON.stringify(state));
    render();
}

function recordNodeCompleted(disciplineId, level, nodeIndex) {
    if (!disciplines.includes(disciplineId) || !Number.isInteger(level) || !Number.isInteger(nodeIndex)) return;
    const state = getDailyState();
    const exists = state.activity.nodes.some((node) => node.disciplineId === disciplineId && node.level === level && node.nodeIndex === nodeIndex);
    if (exists) return;
    state.activity.nodes.push({ disciplineId, level, nodeIndex });
    localStorage.setItem(dailyKey, JSON.stringify(state));
    completeReadyMissions(state);
    render();
}

function recordFinalTestPassed(disciplineId, level) {
    if (!disciplines.includes(disciplineId) || !Number.isInteger(level)) return;
    const state = getDailyState();
    const testId = `${disciplineId}:${level}`;
    if (state.activity.finalTests.includes(testId)) return;
    state.activity.finalTests.push(testId);
    localStorage.setItem(dailyKey, JSON.stringify(state));
    completeReadyMissions(state);
    render();
}

window.StudyQuestMissions = { catalog: missionCatalog, refresh: render, recordNodeCompleted, recordFinalTestPassed, recordTestScore };
document.addEventListener('DOMContentLoaded', render);
})();
