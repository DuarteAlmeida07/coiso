const trails = [
    { id: 'portugues', name: 'Português' },
    { id: 'matematica', name: 'Matemática' },
    { id: 'ingles', name: 'Inglês' },
    { id: 'historia', name: 'História' }
];

function readArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function getTrailProgress(trail) {
    const nodes = new Set();
    const attemptsByLevel = [];
    let passedTests = 0;

    for (let level = 1; level <= 3; level += 1) {
        const campaignKey = level === 1
            ? `study-quest-campaign:${trail.id}`
            : `study-quest-campaign:${trail.id}:level:${level}`;
        readArray(campaignKey).forEach((nodeIndex) => {
            if (Number.isInteger(nodeIndex) && nodeIndex >= 0 && nodeIndex < 6) {
                nodes.add(`${level}:${nodeIndex}`);
            }
        });

        const resultsKey = `study-quest-test-results:${trail.id}:level:${level}`;
        attemptsByLevel.push(readArray(resultsKey).filter((result) => (
            result
            &&
            Number.isFinite(result.score)
            && Number.isFinite(result.total)
            && result.total > 0
            && result.score >= 0
            && result.score <= result.total
        )));

        if (localStorage.getItem(`study-quest-test:${trail.id}:level:${level}`) === 'passed') {
            passedTests += 1;
        }
    }

    return {
        completedNodes: nodes.size,
        percent: Math.round((nodes.size / 18) * 100),
        passedTests,
        attemptsByLevel
    };
}

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
}

function renderTrail(trail, progress) {
    const item = makeElement('article', 'trail-progress-item');
    const heading = makeElement('div', 'trail-progress-heading');
    heading.append(
        makeElement('h4', '', trail.name),
        makeElement('span', 'trail-progress-percent', `${progress.percent}%`)
    );

    const bar = makeElement('div', 'trail-progress-bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', `Progresso de ${trail.name}`);
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(progress.percent));
    const fill = document.createElement('span');
    fill.style.width = `${progress.percent}%`;
    bar.appendChild(fill);

    const meta = makeElement('div', 'trail-progress-meta');
    meta.append(
        makeElement('span', '', `${progress.completedNodes}/18 módulos concluídos`),
        makeElement('span', '', `Testes finais aprovados: ${progress.passedTests}/3`)
    );

    const averages = makeElement('div', 'trail-test-averages');
    averages.setAttribute('aria-label', `Médias dos testes finais de ${trail.name}`);
    progress.attemptsByLevel.forEach((attempts, index) => {
        const averageCard = makeElement('div', 'trail-test-average');
        averageCard.appendChild(makeElement('span', '', `Etapa ${index + 1}`));
        if (attempts.length) {
            const average = attempts.reduce((sum, result) => sum + (result.score / result.total) * 12, 0) / attempts.length;
            const formattedAverage = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }).format(average);
            averageCard.appendChild(makeElement('strong', '', `${formattedAverage}/12`));
            averageCard.appendChild(makeElement('small', '', `${attempts.length} ${attempts.length === 1 ? 'tentativa' : 'tentativas'}`));
        } else {
            averageCard.appendChild(makeElement('strong', '', 'Sem nota'));
            averageCard.appendChild(makeElement('small', '', '0 tentativas'));
        }
        averages.appendChild(averageCard);
    });

    item.append(heading, bar, meta, averages);
    return item;
}

function renderJourneyProgress() {
    const list = document.querySelector('.leaderboard');
    if (!list) return;

    const progressByTrail = trails.map((trail) => ({ trail, progress: getTrailProgress(trail) }));
    const completedNodes = progressByTrail.reduce((total, entry) => total + entry.progress.completedNodes, 0);
    const passedTests = progressByTrail.reduce((total, entry) => total + entry.progress.passedTests, 0);
    const activeTrails = progressByTrail.filter((entry) => (
        entry.progress.completedNodes > 0 || entry.progress.passedTests > 0
    )).length;
    const overallPercent = Math.round((completedNodes / (trails.length * 18)) * 100);

    list.classList.add('trail-progress-list');
    list.replaceChildren(...progressByTrail.map(({ trail, progress }) => renderTrail(trail, progress)));

    const heroHeading = document.querySelector('.hero-card h2');
    if (heroHeading) heroHeading.textContent = `${overallPercent}%`;
    const heroDescription = document.querySelector('.hero-card > p');
    if (heroDescription) {
        const testSummary = passedTests === 1 ? '1 teste final aprovado' : `${passedTests} testes finais aprovados`;
        heroDescription.textContent = `${completedNodes} de ${trails.length * 18} módulos concluídos e ${testSummary} no total das ${trails.length} trilhas.`;
    }

    const miniStats = document.querySelectorAll('.mini-stat strong');
    if (miniStats[0]) miniStats[0].textContent = String(activeTrails);
    if (miniStats[1]) miniStats[1].textContent = String(completedNodes);
    if (miniStats[2]) miniStats[2].textContent = `${overallPercent}%`;

    const totalProgress = document.querySelector('.progress-wrap .progress-label span:last-child');
    if (totalProgress) totalProgress.textContent = `${overallPercent}%`;
    const totalProgressBar = document.querySelector('.progress-wrap .bar span');
    if (totalProgressBar) totalProgressBar.style.width = `${overallPercent}%`;

    const trailCount = document.querySelectorAll('.panel-header .tag')[1];
    if (trailCount) trailCount.textContent = `${trails.length} trilhas`;
}

document.addEventListener('DOMContentLoaded', renderJourneyProgress);