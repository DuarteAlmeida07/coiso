const campaigns = {
    portugues: { name: 'Português', subtitle: 'Construa sua leitura, uma palavra de cada vez.', questions: [['Qual é o plural de “cidadão”?', ['Cidadões', 'Cidadãos', 'Cidadães'], 1], ['Qual palavra é um substantivo?', ['Correr', 'Bonito', 'Cidade'], 2], ['Qual é um sinônimo de “feliz”?', ['Alegre', 'Distante', 'Pequeno'], 0], ['Em “A menina leu”, qual é o verbo?', ['A', 'menina', 'leu'], 2], ['Qual frase está pontuada corretamente?', ['Vamos estudar?', 'Vamos estudar.', 'Vamos estudar,'], 1], ['O que fazemos ao interpretar um texto?', ['Decoramos todas as palavras', 'Construímos sentidos', 'Contamos as letras'], 1]] },
    matematica: { name: 'Matemática', subtitle: 'Transforme cada problema em um próximo passo.', questions: [['Quanto é 7 + 8?', ['14', '15', '16'], 1], ['Quanto é 9 × 3?', ['27', '21', '18'], 0], ['Qual é a metade de 40?', ['10', '20', '30'], 1], ['Se x + 5 = 12, qual é x?', ['5', '7', '17'], 1], ['Qual fração representa metade?', ['1/3', '1/2', '2/3'], 1], ['Quanto é 100 - 37?', ['63', '67', '73'], 0]] },
    ingles: { name: 'Inglês', subtitle: 'Unlock new words and make your voice travel.', questions: [['What is the meaning of “book”?', ['Livro', 'Mesa', 'Janela'], 0], ['Choose the correct greeting:', ['Good night (morning)', 'Good morning', 'Good bye morning'], 1], ['What is the plural of “child”?', ['Childs', 'Children', 'Childes'], 1], ['Complete: “I ___ a student.”', ['am', 'is', 'are'], 0], ['What color is “blue”?', ['Vermelho', 'Verde', 'Azul'], 2], ['What is the opposite of “big”?', ['Small', 'Long', 'Fast'], 0]] },
    historia: { name: 'História', subtitle: 'Viaje pelo tempo e conecte os acontecimentos.', questions: [['Onde surgiu a democracia antiga?', ['Atenas', 'Roma', 'Paris'], 0], ['As pirâmides de Gizé ficam em qual país?', ['Egito', 'Grécia', 'México'], 0], ['Qual invenção marcou a imprensa moderna?', ['Bússola', 'Prensa de Gutenberg', 'Telescópio'], 1], ['Em que continente fica o Brasil?', ['África', 'Europa', 'América do Sul'], 2], ['O que é uma fonte histórica?', ['Evidência do passado', 'Uma previsão', 'Uma regra matemática'], 0], ['A Revolução Industrial começou primeiro em qual país?', ['Inglaterra', 'Japão', 'Brasil'], 0]] }
};

const params = new URLSearchParams(window.location.search);
const disciplineId = params.get('disciplina') || 'portugues';
const level = Math.max(1, Math.min(3, Number(params.get('level')) || 1));
const campaign = campaigns[disciplineId] || campaigns.portugues;
const levelMeta = {
    1: { label: 'Etapa 1 · Fundamentos', nodes: ['Entrada', 'Base', 'Prática', 'Desafio', 'Revisão', 'Síntese'] },
    2: { label: 'Etapa 2 · Aprofundamento', nodes: ['Conexões', 'Análise', 'Estratégia', 'Aplicação', 'Revisão crítica', 'Síntese avançada'] },
    3: { label: 'Etapa 3 · Domínio', nodes: ['Problema', 'Investigação', 'Hipóteses', 'Evidências', 'Argumentação', 'Domínio'] }
};
const currentLevel = levelMeta[level];
const storageKey = level === 1 ? `study-quest-campaign:${disciplineId}` : `study-quest-campaign:${disciplineId}:level:${level}`;
let completed = JSON.parse(localStorage.getItem(storageKey) || '[]').filter((index) => Number.isInteger(index));
let activeNode = null;
const nodes = [...document.querySelectorAll('.map-node')];
const map = document.querySelector('#campaign-map');
const lines = document.querySelector('#map-lines');

document.querySelector('#campaign-eyebrow').textContent = `${campaign.name} · ${currentLevel.label}`;
document.querySelector('#campaign-title').textContent = `${campaign.name} · ${level === 1 ? 'Fundamentos' : level === 2 ? 'Aprofundamento' : 'Domínio'}`;
document.querySelector('#campaign-subtitle').textContent = level === 1 ? campaign.subtitle : `Aumente a complexidade e aprofunde os seus conhecimentos em ${campaign.name}.`;
document.querySelector('#exercise-panel .primary-btn').href = `exercicios.html?disciplina=${disciplineId}&level=${level}&node=0`;

function drawLines() {
    lines.innerHTML = '';
    const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
    const mapRect = map.getBoundingClientRect();
    connections.forEach(([fromIndex, toIndex], lineIndex) => {
        const from = nodes[fromIndex].querySelector('button').getBoundingClientRect();
        const to = nodes[toIndex].querySelector('button').getBoundingClientRect();
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.left + from.width / 2 - mapRect.left);
        line.setAttribute('y1', from.top + from.height / 2 - mapRect.top);
        line.setAttribute('x2', to.left + to.width / 2 - mapRect.left);
        line.setAttribute('y2', to.top + to.height / 2 - mapRect.top);
        line.classList.add('map-line');
        if (completed.includes(lineIndex) && completed.includes(lineIndex + 1)) line.classList.add('complete');
        lines.appendChild(line);
    });
}

function renderMap() {
    nodes.forEach((node, index) => {
        node.querySelector('strong').textContent = currentLevel.nodes[index];
        node.classList.toggle('complete', completed.includes(index));
        node.classList.toggle('locked', index > 0 && !completed.includes(index - 1));
        node.querySelector('button').setAttribute('aria-label', completed.includes(index) ? `Exercício ${index + 1} concluído` : `Abrir exercício ${index + 1}`);
    });
    const total = campaign.questions.length;
    const percent = Math.round((completed.length / total) * 100);
    document.querySelector('#progress-text').textContent = `${completed.length} de ${total}`;
    document.querySelector('#progress-bar').style.width = `${percent}%`;
    document.querySelector('#map-status').textContent = percent === 100 ? 'Teste final desbloqueado!' : `${percent}% concluído`;
    const finalTest = document.querySelector('#final-test-link');
    finalTest.href = `teste.html?disciplina=${disciplineId}&level=${level}`;
    finalTest.classList.toggle('hidden', percent !== 100);
    drawLines();
}

function openExercise(index) {
    if (index > 0 && !completed.includes(index - 1)) {
        document.querySelector('#exercise-feedback').textContent = 'Complete o nó anterior para desbloquear este desafio.';
        return;
    }
    activeNode = index;
    const [question, answers] = campaign.questions[index];
    document.querySelector('#exercise-label').textContent = `EXERCÍCIO ${index + 1} DE ${campaign.questions.length}`;
    document.querySelector('#exercise-title').textContent = completed.includes(index) ? 'Exercício concluído' : `Desafio ${index + 1}`;
    document.querySelector('#exercise-question').textContent = question;
    document.querySelector('#exercise-feedback').textContent = completed.includes(index) ? 'Muito bem. Escolha o próximo nó.' : '';
    const answerList = document.querySelector('#answer-list');
    answerList.innerHTML = '';
    answers.forEach((answer, answerIndex) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.type = 'button';
        button.textContent = answer;
        button.disabled = completed.includes(index);
        button.addEventListener('click', () => answerQuestion(button, answerIndex));
        answerList.appendChild(button);
    });
}

function answerQuestion(button, answerIndex) {
    const correctAnswer = campaign.questions[activeNode][2];
    if (answerIndex !== correctAnswer) {
        button.classList.add('wrong');
        document.querySelector('#exercise-feedback').textContent = 'Ainda não. Tente outra resposta.';
        return;
    }
    completed = [...new Set([...completed, activeNode])].sort((a, b) => a - b);
    localStorage.setItem(storageKey, JSON.stringify(completed));
    document.querySelector('#exercise-feedback').textContent = 'Resposta certa! O próximo nó foi desbloqueado.';
    document.querySelectorAll('.answer-btn').forEach((answerButton) => { answerButton.disabled = true; });
    button.classList.add('correct');
    renderMap();
}

nodes.forEach((node, index) => node.querySelector('button').addEventListener('click', () => {
    if (index > 0 && !completed.includes(index - 1)) {
        document.querySelector('#map-status').textContent = 'Complete o nó anterior para desbloquear este caminho.';
        return;
    }
    window.location.href = `exercicios.html?disciplina=${disciplineId}&level=${level}&node=${index}`;
}));
window.addEventListener('resize', drawLines);
renderMap();