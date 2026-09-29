const lessonData = {
    portugues: { name: 'Português', subtitle: 'Construa sua leitura, uma palavra de cada vez.', nodes: ['Palavras', 'Classes gramaticais', 'Sentidos', 'Verbos', 'Pontuação', 'Interpretação'], questions: [
        ['Qual é o plural de “cidadão”?', ['Cidadões', 'Cidadãos', 'Cidadães'], 1, 'A forma correta é “cidadãos”.'], ['Qual palavra é um substantivo?', ['Correr', 'Bonito', 'Cidade'], 2, '“Cidade” nomeia um lugar, por isso é um substantivo.'], ['Qual é um sinônimo de “feliz”?', ['Alegre', 'Distante', 'Pequeno'], 0, '“Alegre” tem sentido parecido com “feliz”.'], ['Em “A menina leu”, qual é o verbo?', ['A', 'menina', 'leu'], 2, '“Leu” indica uma ação e é o verbo.'], ['Qual frase está pontuada corretamente?', ['Vamos estudar?', 'Vamos estudar.', 'Vamos estudar,'], 1, 'O ponto final encerra uma frase declarativa.'], ['O que fazemos ao interpretar um texto?', ['Decoramos palavras', 'Construímos sentidos', 'Contamos letras'], 1, 'Interpretar é relacionar informações para construir sentidos.'], ['Qual palavra indica uma ação?', ['Janela', 'Cantar', 'Azul'], 1, '“Cantar” é um verbo porque indica ação.'], ['Qual é o antônimo de “alto”?', ['Baixo', 'Grande', 'Largo'], 0, '“Baixo” expressa a ideia oposta a “alto”.'], ['Que sinal termina uma pergunta?', ['Vírgula', 'Interrogação', 'Dois-pontos'], 1, 'O ponto de interrogação termina perguntas.'], ['Qual palavra está correta?', ['Exceção', 'Excessão', 'Eceção'], 0, 'A grafia correta é “exceção”.'], ['O título ajuda a identificar o...', ['Assunto', 'Tamanho', 'Autor apenas'], 0, 'O título dá uma pista sobre o assunto.'], ['Uma informação explícita aparece...', ['Escondida', 'Claramente no texto', 'Só na ilustração'], 1, 'Ela está escrita de forma clara e direta.'] ] },
    matematica: { name: 'Matemática', subtitle: 'Transforme cada problema em um próximo passo.', nodes: ['Adição', 'Multiplicação', 'Divisão', 'Equações', 'Frações', 'Desafio final'], questions: [
        ['Quanto é 7 + 8?', ['14', '15', '16'], 1, 'Somando 7 e 8 chegamos a 15.'], ['Quanto é 12 + 9?', ['19', '20', '21'], 2, '12 + 9 = 21.'], ['Quanto é 9 × 3?', ['27', '21', '18'], 0, '9 + 9 + 9 = 27.'], ['Quanto é 6 × 4?', ['20', '24', '28'], 1, 'Seis grupos de quatro formam 24.'], ['Quanto é 20 ÷ 5?', ['4', '5', '15'], 0, '20 dividido em cinco grupos iguais resulta em 4.'], ['Quanto é 36 ÷ 6?', ['5', '6', '7'], 1, 'Como 6 × 6 = 36, 36 ÷ 6 = 6.'], ['Se x + 5 = 12, qual é x?', ['5', '7', '17'], 1, 'Subtraindo 5, x = 7.'], ['Se y - 3 = 10, qual é y?', ['7', '13', '30'], 1, 'Somando 3, y = 13.'], ['Qual fração representa metade?', ['1/3', '1/2', '2/3'], 1, 'Duas partes iguais formam 1/2.'], ['Qual é maior?', ['1/4', '3/4', '2/4'], 1, 'Com o mesmo denominador, 3/4 é maior.'], ['Quanto é 100 - 37?', ['63', '67', '73'], 0, '100 - 37 = 63.'], ['Perímetro de um quadrado de lado 4?', ['8', '12', '16'], 2, 'São quatro lados: 4 + 4 + 4 + 4 = 16.'] ] },
    ingles: { name: 'Inglês', subtitle: 'Unlock new words and make your voice travel.', nodes: ['First words', 'Greetings', 'People', 'Daily life', 'Colors', 'Final quest'], questions: [
        ['Meaning of “book”?', ['Livro', 'Mesa', 'Janela'], 0, '“Book” significa livro.'], ['Meaning of “school”?', ['Casa', 'Escola', 'Rua'], 1, '“School” significa escola.'], ['Choose the greeting:', ['Good morning', 'Good sleep', 'Morning bye'], 0, '“Good morning” significa bom dia.'], ['How do you say “obrigado”?', ['Please', 'Thanks', 'Sorry'], 1, '“Thanks” significa obrigado.'], ['Plural of “child”?', ['Childs', 'Children', 'Childes'], 1, '“Children” é o plural irregular de child.'], ['Complete: “She ___ my friend.”', ['am', 'is', 'are'], 1, 'Com she usamos is.'], ['Complete: “I ___ a student.”', ['am', 'is', 'are'], 0, 'Com I usamos am.'], ['Choose the correct sentence:', ['They is happy', 'They are happy', 'They am happy'], 1, 'Com they usamos are.'], ['What color is “blue”?', ['Vermelho', 'Verde', 'Azul'], 2, '“Blue” significa azul.'], ['What color is “yellow”?', ['Amarelo', 'Roxo', 'Preto'], 0, '“Yellow” significa amarelo.'], ['Opposite of “big”?', ['Small', 'Long', 'Fast'], 0, '“Small” é o oposto de big.'], ['Opposite of “hot”?', ['Cold', 'Warm', 'Tall'], 0, '“Cold” é o oposto de hot.'] ] },
    historia: { name: 'História', subtitle: 'Viaje pelo tempo e conecte os acontecimentos.', nodes: ['Antiguidade', 'Civilizações', 'Invenções', 'Territórios', 'Fontes', 'Era moderna'], questions: [
        ['Onde surgiu a democracia antiga?', ['Atenas', 'Roma', 'Paris'], 0, 'A democracia surgiu em Atenas.'], ['Onde ficam as pirâmides de Gizé?', ['Egito', 'Grécia', 'México'], 0, 'As pirâmides ficam no Egito.'], ['Qual rio foi essencial para o Egito?', ['Nilo', 'Amazonas', 'Tejo'], 0, 'O Nilo fornecia água e terras férteis.'], ['Qual cidade é associada ao Império Romano?', ['Roma', 'Londres', 'Pequim'], 0, 'Roma foi o centro do Império Romano.'], ['Qual invenção marcou a imprensa?', ['Bússola', 'Prensa de Gutenberg', 'Telescópio'], 1, 'A prensa permitiu reproduzir livros em escala.'], ['Quem aperfeiçoou a lâmpada elétrica?', ['Thomas Edison', 'Galileu', 'Aristóteles'], 0, 'Edison aperfeiçoou um modelo comercial.'], ['Em que continente fica o Brasil?', ['África', 'Europa', 'América do Sul'], 2, 'O Brasil fica na América do Sul.'], ['O que é uma fronteira?', ['Limite territorial', 'Profissão', 'Calendário'], 0, 'Fronteira é o limite entre territórios.'], ['O que é uma fonte histórica?', ['Evidência do passado', 'Previsão', 'Regra matemática'], 0, 'Objetos e relatos podem ser fontes históricas.'], ['Uma fotografia antiga pode ser fonte...', ['Histórica', 'Apenas literária', 'Sempre científica'], 0, 'Ela registra vestígios de uma época.'], ['Onde começou a Revolução Industrial?', ['Inglaterra', 'Japão', 'Brasil'], 0, 'Ela começou na Inglaterra.'], ['O que as máquinas mudaram nas fábricas?', ['A produção', 'Os oceanos', 'O alfabeto'], 0, 'As máquinas transformaram a produção.'] ] }
};

const params = new URLSearchParams(window.location.search);
const disciplineId = params.get('disciplina') || 'portugues';
const level = Math.max(1, Math.min(3, Number(params.get('level')) || 1));
const nodeIndex = Math.max(0, Math.min(5, Number(params.get('node')) || 0));
const lesson = lessonData[disciplineId] || lessonData.portugues;
const levelNames = { 1: 'Fundamentos', 2: 'Aprofundamento', 3: 'Domínio' };
const storageKey = level === 1 ? `study-quest-campaign:${disciplineId}` : `study-quest-campaign:${disciplineId}:level:${level}`;
const completedNodes = JSON.parse(localStorage.getItem(storageKey) || '[]');
const questionSource = level === 1 ? lesson.questions : window.advancedLessonQuestions[disciplineId];
const questions = questionSource.slice(nodeIndex * 2, nodeIndex * 2 + 2);
const solved = questions.map(() => false);

document.querySelector('#exercise-eyebrow').textContent = `${lesson.name} · Etapa ${level}`;
document.querySelector('#exercise-heading').textContent = `${lesson.name} · ${levelNames[level]}`;
document.querySelector('#exercise-subtitle').textContent = level === 1 ? lesson.subtitle : `Use conexões e justificativas para avançar em ${lesson.name}.`;
document.querySelector('#node-label').textContent = `NÓ ${nodeIndex + 1} DE 6`;
document.querySelector('#node-title').textContent = lesson.nodes[nodeIndex];
document.querySelector('#back-link').href = `campanha.html?disciplina=${disciplineId}&level=${level}`;

if (nodeIndex > 0 && !completedNodes.includes(nodeIndex - 1)) {
    document.querySelector('#lesson-feedback').textContent = 'Este nó ainda está bloqueado. Volte ao caminho e complete o anterior.';
} else {
    renderExercises();
}

function renderExercises() {
    const list = document.querySelector('#exercise-list');
    questions.forEach(([question, answers, correct, explanation], questionIndex) => {
        const card = document.createElement('article');
        card.className = 'exercise-card';
        card.innerHTML = `<h3><span>EXERCÍCIO ${questionIndex + 1}</span> de 2</h3><p class="question">${question}</p><div class="options"></div><p class="explanation"><strong>Por que?</strong> ${explanation}</p>`;
        const options = card.querySelector('.options');
        answers.forEach((answer, answerIndex) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.type = 'button';
            button.textContent = answer;
            button.addEventListener('click', () => answerQuestion(card, questionIndex, answerIndex, correct));
            options.appendChild(button);
        });
        list.appendChild(card);
    });
}

function answerQuestion(card, questionIndex, answerIndex, correctIndex) {
    if (solved[questionIndex]) return;
    const buttons = [...card.querySelectorAll('.option-btn')];
    if (answerIndex !== correctIndex) {
        buttons[answerIndex].classList.add('incorrect');
        document.querySelector('#lesson-feedback').textContent = 'Ainda não. Tente outra opção.';
        return;
    }
    solved[questionIndex] = true;
    buttons.forEach((button) => { button.disabled = true; });
    buttons[correctIndex].classList.add('correct');
    card.classList.add('solved');
    card.querySelector('.explanation').classList.add('visible');
    const amountSolved = solved.filter(Boolean).length;
    document.querySelector('#lesson-progress').textContent = `${amountSolved}/2`;
    if (amountSolved !== questions.length) return;
    const nextCompleted = [...new Set([...completedNodes, nodeIndex])].sort((a, b) => a - b);
    localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
    document.querySelector('#lesson-feedback').textContent = 'Nó concluído! As explicações ficaram disponíveis acima.';
    const next = document.querySelector('#next-node');
    next.classList.remove('hidden');
    next.textContent = nodeIndex === 5 ? 'Voltar ao caminho →' : 'Próximo nó →';
    next.href = `campanha.html?disciplina=${disciplineId}&level=${level}`;
}