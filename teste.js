const testData = {
    portugues: { name: 'Português', questions: [['Qual frase usa “por que” corretamente?', ['Por que você chegou?', 'Não sei porquê ele foi.', 'Ele faltou por quê estudar.'], 0], ['Em “O livro antigo caiu”, qual palavra caracteriza o livro?', ['Livro', 'Antigo', 'Caiu'], 1], ['Qual alternativa apresenta uma opinião?', ['A água ferve a 100 graus.', 'Acredito que este livro é ótimo.', 'O Brasil fica na América do Sul.'], 1], ['Qual é o sujeito em “Os estudantes resolveram o desafio”?', ['Resolveram', 'O desafio', 'Os estudantes'], 2], ['Qual conectivo indica oposição?', ['Porque', 'Porém', 'Portanto'], 1], ['A conclusão de um texto deve...', ['Retomar a ideia principal', 'Adicionar um assunto sem relação', 'Repetir todas as palavras'], 0], ['Qual palavra é acentuada corretamente?', ['Lâmpada', 'Lampâda', 'Lampaniada'], 0], ['Qual alternativa tem linguagem formal?', ['A gente vai lá rapidinho.', 'Nós iremos à reunião.', 'Bora para a reunião.'], 1], ['Em “Embora chovesse, saímos”, “embora” indica...', ['Causa', 'Concessão', 'Finalidade'], 1], ['Qual recurso compara usando “como”?', ['Metáfora', 'Comparação', 'Ironia'], 1], ['A ideia central de um parágrafo é...', ['O detalhe menos importante', 'A informação principal', 'A última palavra'], 1], ['Inferir uma informação é...', ['Copiá-la literalmente', 'Concluí-la a partir de pistas', 'Ignorá-la'], 1]] },
    matematica: { name: 'Matemática', questions: [['Uma compra de 120 euros teve 20% de desconto. Qual o preço final?', ['96 euros', '100 euros', '104 euros'], 0], ['Qual expressão tem resultado 18?', ['3 × 5', '24 - 6', '36 ÷ 3'], 1], ['Se 3 cadernos custam 21 euros, quanto custa cada um?', ['6 euros', '7 euros', '9 euros'], 1], ['Qual número completa 2, 4, 8, 16, ...?', ['20', '24', '32'], 2], ['Um retângulo mede 5 por 3. Qual sua área?', ['8', '15', '16'], 1], ['Qual fração é equivalente a 2/4?', ['1/2', '1/3', '3/4'], 0], ['Se 2x = 18, qual é x?', ['8', '9', '10'], 1], ['Qual é a média de 6, 8 e 10?', ['7', '8', '9'], 1], ['Um ângulo reto mede...', ['45 graus', '90 graus', '180 graus'], 1], ['Qual número é divisível por 3?', ['14', '22', '27'], 2], ['Se hoje é terça-feira, que dia será daqui a 10 dias?', ['Sexta-feira', 'Sábado', 'Domingo'], 1], ['Qual razão equivale a 1 para 2?', ['2:1', '1:2', '1:3'], 1]] },
    ingles: { name: 'Inglês', questions: [['Choose the correct question:', ['Where you live?', 'Where do you live?', 'Where does you live?'], 1], ['Complete: “There ___ two books.”', ['is', 'are', 'am'], 1], ['What does “because” express?', ['Reason', 'Place', 'Time'], 0], ['Choose the past of “go”:', ['Goed', 'Went', 'Gone yesterday'], 1], ['Complete: “She has ___ apple.”', ['a', 'an', 'the one'], 1], ['What is a synonym for “quick”?', ['Fast', 'Slow', 'Late'], 0], ['Choose the polite request:', ['Give me water!', 'Could you pass the water, please?', 'Water now.'], 1], ['“Yesterday” refers to...', ['The past', 'The present', 'The future'], 0], ['Complete: “I have lived here ___ 2020.”', ['for', 'since', 'at'], 1], ['Which sentence is comparative?', ['This is big.', 'This is bigger than that.', 'This is the biggest.'], 1], ['What does “although” show?', ['Contrast', 'Addition', 'Place'], 0], ['Choose the correct response to “How are you?”', ['I am fine, thanks.', 'I am twelve years.', 'I fine are.'], 0]] },
    historia: { name: 'História', questions: [['Por que o rio Nilo era importante para o Egito?', ['Garantia terras férteis', 'Separava a Europa', 'Era uma estrada romana'], 0], ['Qual característica define uma república?', ['Governo representativo', 'Governo sempre hereditário', 'Ausência de leis'], 0], ['Para que serviam as rotas comerciais antigas?', ['Trocar produtos e ideias', 'Construir vulcões', 'Medir o tempo apenas'], 0], ['Uma mudança de longa duração é chamada de...', ['Processo histórico', 'Acidente isolado', 'Lenda'], 0], ['O que a prensa facilitou?', ['Circulação de textos', 'Navegação espacial', 'Produção de energia'], 0], ['Uma fonte primária foi produzida...', ['No período estudado', 'Sempre séculos depois', 'Apenas por historiadores'], 0], ['Por que mapas são fontes históricas?', ['Revelam visões sobre territórios', 'Não possuem informações', 'Substituem todos os relatos'], 0], ['O que é cronologia?', ['Organização dos acontecimentos no tempo', 'Estudo de moedas', 'Divisão de territórios'], 0], ['A industrialização alterou principalmente...', ['Trabalho e produção', 'A rotação da Terra', 'O alfabeto grego'], 0], ['O que significa cultura?', ['Modos de vida e significados', 'Somente obras de arte', 'Apenas leis'], 0], ['Analisar uma fonte exige observar...', ['Autor, contexto e intenção', 'Somente o tamanho', 'A cor do papel'], 0], ['Por que diferentes grupos narram a história de formas diversas?', ['Possuem experiências e perspectivas distintas', 'Porque fatos não existem', 'Porque datas são sempre iguais'], 0]] }
};

const stageOneTestQuestions = {
    portugues: [['Qual é o plural de “animal”?', ['Animais', 'Animals', 'Animalões'], 0], ['Em “A casa azul”, qual palavra nomeia o lugar?', ['A', 'casa', 'azul'], 1], ['Qual palavra tem sentido parecido com “rápido”?', ['Lento', 'Veloz', 'Fraco'], 1], ['Em “Nós estudamos”, qual é o verbo?', ['Nós', 'estudamos', 'A frase'], 1], ['Qual frase termina com ponto de interrogação?', ['Você vem?', 'Você vem.', 'Você vem,'], 0], ['Interpretar uma história exige observar...', ['Apenas o título', 'Pistas e informações', 'Somente o tamanho'], 1], ['Qual palavra indica uma ação?', ['Ler', 'Livro', 'Leitor'], 0], ['Qual é o antônimo de “claro”?', ['Brilhante', 'Escuro', 'Amarelo'], 1], ['Qual sinal separa itens de uma lista?', ['Vírgula', 'Interrogação', 'Parênteses'], 0], ['Qual palavra está escrita corretamente?', ['Atenção', 'Atenssão', 'Atensão'], 0], ['O título de “O passeio de Ana” indica principalmente...', ['O assunto', 'O número de páginas', 'A editora'], 0], ['Se o texto diz “João levou guarda-chuva”, o que podemos afirmar?', ['Provavelmente chovia ou poderia chover', 'João foi nadar', 'Era certamente noite'], 0]],
    matematica: [['9 + 6 =', ['14', '15', '16'], 1], ['18 + 4 =', ['20', '22', '24'], 1], ['8 × 4 =', ['24', '32', '36'], 1], ['7 × 5 =', ['30', '35', '40'], 1], ['24 ÷ 6 =', ['3', '4', '6'], 1], ['42 ÷ 7 =', ['5', '6', '7'], 1], ['Se x + 4 = 11, x =', ['6', '7', '8'], 1], ['Se y - 8 = 5, y =', ['3', '13', '15'], 1], ['Qual fração equivale a 1/2?', ['2/4', '1/3', '3/5'], 0], ['Qual fração é maior?', ['1/5', '4/5', '2/5'], 1], ['200 - 85 =', ['105', '115', '125'], 1], ['Perímetro de um quadrado de lado 5:', ['10', '15', '20'], 2]],
    ingles: [['Plural of “book”:', ['Books', 'Bookes', 'Book'], 0], ['Meaning of “teacher”:', ['Professor', 'Janela', 'Caderno'], 0], ['Synonym of “happy”:', ['Sad', 'Glad', 'Cold'], 1], ['Complete: “They ___ students.”', ['is', 'am', 'are'], 2], ['Choose the question:', ['Do you study?', 'Do you study.', 'Do you study,'], 0], ['To understand a text, look for...', ['Clues and information', 'Only the last word', 'The page color'], 0], ['Which word shows an action?', ['Run', 'Runner', 'Road'], 0], ['Opposite of “old”:', ['New', 'Tall', 'Small'], 0], ['Which punctuation ends a question?', ['.', '?', ','], 1], ['Correct spelling:', ['Beautiful', 'Beautifull', 'Beutiful'], 0], ['A title usually tells the...', ['Subject', 'Page number', 'Paper color'], 0], ['If “It is raining”, what should you take?', ['An umbrella', 'A swimsuit only', 'Sunglasses only'], 0]],
    historia: [['A democracia ateniense era praticada em:', ['Atenas', 'Egito', 'Roma'], 0], ['As pirâmides de Gizé eram monumentos do:', ['Egito Antigo', 'Império Romano', 'Japão medieval'], 0], ['As cheias do Nilo ajudavam principalmente na:', ['Agricultura', 'Navegação espacial', 'Imprensa'], 0], ['Roma foi o centro de qual império?', ['Romano', 'Asteca', 'Chinês'], 0], ['A prensa de Gutenberg facilitou:', ['A reprodução de livros', 'A construção de pirâmides', 'A medição de rios'], 0], ['Thomas Edison ficou associado ao aperfeiçoamento da:', ['Lâmpada elétrica', 'Bússola', 'Prensa'], 0], ['O Brasil está localizado na:', ['América do Sul', 'Europa', 'África'], 0], ['Uma fronteira indica:', ['Um limite entre territórios', 'Uma estação do ano', 'Uma profissão'], 0], ['Uma carta antiga pode ser uma fonte:', ['Histórica', 'Apenas matemática', 'Sem informação'], 0], ['Uma fotografia antiga ajuda a estudar:', ['Vestígios de uma época', 'Somente o futuro', 'Apenas o clima atual'], 0], ['A Revolução Industrial começou na:', ['Inglaterra', 'Grécia', 'Austrália'], 0], ['As máquinas transformaram principalmente:', ['A produção nas fábricas', 'A escrita romana', 'O curso do Nilo'], 0]]
};

const params = new URLSearchParams(window.location.search);
const disciplineId = params.get('disciplina') || 'portugues';
const level = Math.max(1, Math.min(3, Number(params.get('level')) || 1));
const lesson = testData[disciplineId] || testData.portugues;
const questionsPerTest = 8;
const maximumAttempts = 2;
const requiredScore = Math.ceil(questionsPerTest * 0.8);
const today = getTodayKey();
const testId = `${today}:${disciplineId}:${level}`;
const sessionKey = 'study-quest-session';
const loggedUser = JSON.parse(sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey) || 'null');
const userId = loggedUser && loggedUser.email ? loggedUser.email.trim().toLowerCase() : 'guest';
const attemptsKey = `study-quest-test-attempts:v1:${userId}`;
const testTicketsKey = `study-quest-test-tickets:${userId}`;
const nodeKey = level === 1 ? `study-quest-campaign:${disciplineId}` : `study-quest-campaign:${disciplineId}:level:${level}`;
const previousTestKey = `study-quest-test:${disciplineId}:level:${level - 1}`;
const testList = document.querySelector('#test-list');
const finishButton = document.querySelector('#finish-test');
const retryButton = document.querySelector('#retry-test');
const repeatTicketButton = document.querySelector('#repeat-with-ticket');
const nextLink = document.querySelector('#next-level');
const feedback = document.querySelector('#test-feedback');
const attemptMessage = document.querySelector('#test-attempts');
const completedNodes = readCompletedNodes();
const questionPool = level === 1
    ? stageOneTestQuestions[disciplineId]
    : window.advancedLessonQuestions?.[disciplineId];
const questions = makeDailyQuestions(questionPool || []);
const answers = Array(questions.length).fill(null);
const allAttempts = readAttempts();
const dailyState = allAttempts[testId] || { attempts: [], replayReady: false };
dailyState.attempts = Array.isArray(dailyState.attempts) ? dailyState.attempts : [];
dailyState.replayReady = dailyState.replayReady === true;
const previousPassed = level === 1 || localStorage.getItem(previousTestKey) === 'passed';
const stageUnlocked = completedNodes.length === 6 && previousPassed;

document.querySelector('#test-label').textContent = `DESAFIO DE ${today}`;
document.querySelector('#test-eyebrow').textContent = `${lesson.name} · Etapa ${level}`;
document.querySelector('#test-title').textContent = `Teste de ${level === 1 ? 'Fundamentos' : level === 2 ? 'Aprofundamento' : 'Domínio'}`;
document.querySelector('#test-heading').textContent = `Avaliação de ${lesson.name}`;
document.querySelector('#test-subtitle').textContent = 'Perguntas diárias sobre os conteúdos concluídos nesta etapa.';
document.querySelector('#back-link').href = `Testes.html?disciplina=${disciplineId}`;
document.querySelector('#test-score').textContent = `0/${questionsPerTest}`;

if (!stageUnlocked) {
    feedback.textContent = completedNodes.length < 6
        ? `Conclua os 6 exercícios da etapa para desbloquear o teste (${completedNodes.length}/6).`
        : 'Passe o teste da etapa anterior para desbloquear esta avaliação.';
    finishButton.disabled = true;
} else if (!dailyState.replayReady && (!hasRegularAttempt() || dailyState.attempts.at(-1)?.passed)) {
    const latestAttempt = dailyState.attempts.at(-1);
    showLockedResult(latestAttempt, latestAttempt?.passed
        ? 'Aprovado hoje. Podes usar um bilhete para repetir esta avaliação.'
        : 'As duas tentativas gratuitas foram usadas. Podes usar um bilhete para repetir.');
} else if (questions.length !== questionsPerTest) {
    feedback.textContent = 'Não foi possível carregar as perguntas desta disciplina.';
    finishButton.disabled = true;
} else {
    attemptMessage.textContent = dailyState.replayReady
        ? 'Repetição extra desbloqueada com um bilhete.'
        : `Tentativa gratuita ${countRegularAttempts() + 1} de ${maximumAttempts}`;
    renderTest();
}

function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function readCompletedNodes() {
    try {
        const nodes = JSON.parse(localStorage.getItem(nodeKey) || '[]');
        return Array.isArray(nodes) ? [...new Set(nodes.filter((node) => Number.isInteger(node) && node >= 0 && node < 6))] : [];
    } catch {
        return [];
    }
}

function readAttempts() {
    try {
        const saved = JSON.parse(localStorage.getItem(attemptsKey) || '{}');
        return saved && typeof saved === 'object' ? saved : {};
    } catch {
        return {};
    }
}

function getTestTicketCount() {
    return Math.max(0, Number(localStorage.getItem(testTicketsKey)) || 0);
}

function countRegularAttempts() {
    return dailyState.attempts.filter((attempt) => attempt.ticketReplay !== true).length;
}

function hasRegularAttempt() {
    return countRegularAttempts() < maximumAttempts && !dailyState.attempts.some((attempt) => attempt.passed);
}

function offerTicketReplay() {
    const ticketCount = getTestTicketCount();
    if (!ticketCount) return;
    repeatTicketButton.textContent = `Usar 1 teste (${ticketCount} disponível(is)) para repetir`;
    repeatTicketButton.classList.remove('hidden');
}

function seededRandom(seedText) {
    let seed = 2166136261;
    for (const character of seedText) {
        seed ^= character.charCodeAt(0);
        seed = Math.imul(seed, 16777619);
    }
    return () => {
        seed += 0x6D2B79F5;
        let value = seed;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffle(items, random) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

function makeDailyQuestions(pool) {
    const random = seededRandom(testId);
    return shuffle(pool, random).slice(0, questionsPerTest).map(([question, options, correctIndex]) => {
        const shuffledOptions = shuffle(options.map((text, index) => ({ text, correct: index === correctIndex })), random);
        return [question, shuffledOptions.map((option) => option.text), shuffledOptions.findIndex((option) => option.correct)];
    });
}

function showLockedResult(result, message) {
    feedback.textContent = result ? `${message} Nota de hoje: ${result.score}/${result.total}.` : message;
    attemptMessage.textContent = `Tentativas gratuitas: ${countRegularAttempts()}/${maximumAttempts} · Total: ${dailyState.attempts.length}`;
    if (result) document.querySelector('#test-score').textContent = `${result.score}/${result.total}`;
    finishButton.classList.add('hidden');
    if (result?.passed) showNextStep();
    else {
        nextLink.href = `campanha.html?disciplina=${disciplineId}&level=${level}`;
        nextLink.textContent = 'Rever esta etapa →';
        nextLink.classList.remove('hidden');
    }
    offerTicketReplay();
}

function renderTest() {
    questions.forEach(([question, options], questionIndex) => {
        const card = document.createElement('article');
        card.className = 'test-card';
        const heading = document.createElement('h3');
        heading.textContent = `Questão ${questionIndex + 1} de ${questionsPerTest}`;
        const prompt = document.createElement('p');
        prompt.textContent = question;
        const optionList = document.createElement('div');
        optionList.className = 'test-options';
        options.forEach((option, optionIndex) => {
            const button = document.createElement('button');
            button.className = 'test-option';
            button.type = 'button';
            button.textContent = option;
            button.addEventListener('click', () => selectAnswer(questionIndex, optionIndex, button));
            optionList.appendChild(button);
        });
        card.append(heading, prompt, optionList);
        testList.appendChild(card);
    });
}

function selectAnswer(questionIndex, optionIndex, button) {
    answers[questionIndex] = optionIndex;
    button.parentElement.querySelectorAll('.test-option').forEach((option) => option.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#test-score').textContent = `${answers.filter((answer) => answer !== null).length}/${questionsPerTest}`;
}

function showNextStep() {
    if (level < 3) {
        nextLink.textContent = `Abrir etapa ${level + 1} →`;
        nextLink.href = `campanha.html?disciplina=${disciplineId}&level=${level + 1}`;
    } else {
        nextLink.textContent = 'Voltar à Jornada →';
        nextLink.href = 'jornada.html';
    }
    nextLink.classList.remove('hidden');
}

finishButton.addEventListener('click', () => {
    if (answers.some((answer) => answer === null)) {
        feedback.textContent = `Responda às ${questionsPerTest} perguntas antes de corrigir o teste.`;
        return;
    }
    const score = answers.reduce((total, answer, index) => total + (answer === questions[index][2] ? 1 : 0), 0);
    const passed = score >= requiredScore;
    const ticketReplay = dailyState.replayReady;
    const attempt = { score, total: questionsPerTest, passed, ticketReplay, submittedAt: Date.now() };
    dailyState.replayReady = false;
    dailyState.attempts.push(attempt);
    allAttempts[testId] = dailyState;
    localStorage.setItem(attemptsKey, JSON.stringify(allAttempts));
    window.StudyQuestMissions?.recordTestScore(disciplineId, score, questionsPerTest, `${today}:${level}`);

    document.querySelectorAll('.test-card').forEach((card, index) => {
        card.querySelectorAll('.test-option').forEach((option, optionIndex) => {
            option.disabled = true;
            if (optionIndex === questions[index][2]) option.classList.add('correct');
            if (optionIndex === answers[index] && optionIndex !== questions[index][2]) option.classList.add('incorrect');
        });
    });
    document.querySelector('#test-score').textContent = `${score}/${questionsPerTest}`;
    attemptMessage.textContent = `Tentativas gratuitas: ${countRegularAttempts()}/${maximumAttempts} · Total: ${dailyState.attempts.length}`;
    finishButton.classList.add('hidden');

    if (passed) {
        localStorage.setItem(`study-quest-test:${disciplineId}:level:${level}`, 'passed');
        window.StudyQuestMissions?.recordFinalTestPassed(disciplineId, level);
        feedback.textContent = `Aprovado com ${score}/${questionsPerTest}! A próxima etapa foi desbloqueada.`;
        showNextStep();
        offerTicketReplay();
        return;
    }

    feedback.textContent = `Nota ${score}/${questionsPerTest}. É preciso acertar ${requiredScore} para passar.`;
    if (hasRegularAttempt()) {
        feedback.textContent += ' Tem mais uma tentativa hoje.';
        retryButton.classList.remove('hidden');
        retryButton.addEventListener('click', () => window.location.reload(), { once: true });
    } else {
        feedback.textContent += ' Reveja o conteúdo e volte amanhã.';
        nextLink.href = `campanha.html?disciplina=${disciplineId}&level=${level}`;
        nextLink.textContent = 'Rever esta etapa →';
        nextLink.classList.remove('hidden');
    }
    offerTicketReplay();
});

repeatTicketButton.addEventListener('click', () => {
    const ticketCount = getTestTicketCount();
    if (!ticketCount) return;
    localStorage.setItem(testTicketsKey, String(ticketCount - 1));
    dailyState.replayReady = true;
    allAttempts[testId] = dailyState;
    localStorage.setItem(attemptsKey, JSON.stringify(allAttempts));
    window.location.reload();
});