(() => {
    document.querySelectorAll('form[data-autosave-kind]').forEach((form) => {
        const status = form.querySelector('.answer-save-status');
        let saveQueue = Promise.resolve();
        let isSubmitting = false;

        function allAnswersSelected() {
            const requiredRadios = [...form.querySelectorAll('input[type="radio"][required]')];
            const groups = new Set(requiredRadios.map((radio) => radio.name));
            const answersComplete = [...groups].every((name) =>
                form.querySelector(`input[type="radio"][name="${name}"]:checked`)
            );
            const requiredTicket = form.querySelector('input[name="use_ticket"][required]');
            return answersComplete && (!requiredTicket || requiredTicket.checked);
        }

        function submitWhenReady() {
            if (isSubmitting || !allAnswersSelected()) return;
            isSubmitting = true;
            const action = form.dataset.autosaveKind === 'exercise' ? 'answer' : 'submit';
            const data = new FormData(form);
            data.set('action', action);
            form.querySelectorAll('input[type="radio"], input[name="use_ticket"]').forEach((input) => {
                input.disabled = true;
            });
            status.textContent = action === 'answer' ? 'A verificar resposta...' : 'A corrigir teste...';
            saveQueue.then(async () => {
                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: data,
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                        credentials: 'same-origin'
                    });
                    if (!response.ok) {
                        throw new Error(`O servidor respondeu com o estado ${response.status}.`);
                    }
                    const result = await response.json();
                    if (action === 'answer') {
                        showExerciseResult(form, result);
                    } else {
                        showTestResult(form, result);
                    }
                } catch (error) {
                    console.error('Não foi possível submeter a resposta.', error);
                    status.textContent = 'Não foi possível verificar. Tenta novamente.';
                    form.querySelectorAll('input[type="radio"], input[name="use_ticket"]').forEach((input) => {
                        input.disabled = false;
                    });
                    isSubmitting = false;
                }
            });
        }

        function showExerciseResult(answerForm, result) {
            const card = answerForm.closest('.exercise-card');
            const feedback = document.querySelector('.lesson-feedback');
            const progress = document.querySelector('.lesson-progress strong');
            feedback.textContent = result.feedback;
            progress.textContent = `${result.solved_count}/${result.total}`;
            if (!result.correct) {
                status.textContent = result.feedback;
                answerForm.querySelectorAll('input[type="radio"]').forEach((input) => {
                    input.disabled = false;
                });
                isSubmitting = false;
                return;
            }

            const cards = [...document.querySelectorAll('.exercise-card')];
            const solvedCards = result.node_done ? cards : [card];
            solvedCards.forEach((solvedCard) => {
                solvedCard.classList.add('solved');
                const index = cards.indexOf(solvedCard);
                const explanation = document.createElement('p');
                explanation.className = 'explanation visible';
                const label = document.createElement('strong');
                label.textContent = 'Por que? ';
                explanation.append(label, document.createTextNode(result.explanations[index]));
                solvedCard.querySelector('form')?.replaceWith(explanation);
            });

            if (result.node_done) {
                const footer = document.querySelector('.lesson-footer');
                const next = document.createElement('a');
                next.className = 'primary-btn';
                next.href = result.next_url;
                next.textContent = result.next_url.includes('exercicios.html')
                    ? 'Próximo nó →'
                    : 'Voltar ao caminho →';
                footer.replaceChildren(next);
            }
        }

        function showTestResult(testForm, result) {
            const page = document.querySelector('.content');
            let feedback = document.querySelector('.test-feedback');
            if (!feedback) {
                feedback = document.createElement('section');
                feedback.className = 'panel test-feedback';
                page.insertBefore(feedback, testForm);
            }
            feedback.replaceChildren(document.createElement('p'));
            feedback.firstElementChild.textContent = result.feedback;
            const attempts = document.querySelector('.test-attempts');
            if (attempts) {
                attempts.textContent = `Tentativas de hoje: ${result.attempts} · Bilhetes disponíveis: ${result.tickets}`;
            }

            if (result.passed) {
                const link = document.createElement('a');
                link.className = 'primary-btn';
                link.href = result.next_stage_url;
                link.textContent = result.next_stage_url.includes('jornada')
                    ? 'Voltar à jornada →'
                    : 'Avançar de etapa →';
                feedback.append(link);
                testForm.remove();
                return;
            }

            if (!result.can_retry) {
                const panel = document.createElement('section');
                panel.className = 'panel';
                const message = document.createElement('p');
                message.textContent = 'Não há mais tentativas disponíveis hoje. Podes obter um bilhete na loja.';
                const link = document.createElement('a');
                link.className = 'primary-btn';
                link.href = '/html/menu_html/loja.html';
                link.textContent = 'Ir à loja';
                panel.append(message, link);
                testForm.replaceWith(panel);
                return;
            }

            testForm.querySelectorAll('input[type="radio"]').forEach((input) => {
                input.checked = false;
            });
            const ticket = testForm.querySelector('input[name="use_ticket"]');
            if (ticket) {
                ticket.checked = false;
                ticket.disabled = result.tickets === 0;
            }
            testForm.querySelectorAll('input[type="radio"]').forEach((input) => {
                input.disabled = false;
            });
            testForm.querySelectorAll('.test-card').forEach((card) => {
                card.classList.remove('correct', 'incorrect');
            });
            const statusMessage = testForm.querySelector('.answer-save-status');
            statusMessage.textContent = result.needs_ticket
                ? `Tens ${result.tickets} bilhete(s). Escolhe as respostas e marca o bilhete para repetir.`
                : 'Escolhe as respostas para fazer uma nova tentativa.';
            isSubmitting = false;
        }

        form.addEventListener('change', (event) => {
            if (event.target.matches('input[name="use_ticket"]')) {
                submitWhenReady();
                return;
            }
            if (!event.target.matches('input[type="radio"]')) return;

            const data = new FormData(form);
            data.set('action', 'autosave');
            if (form.dataset.autosaveKind === 'test') {
                data.set('draft_index', event.target.name.replace('answer_', ''));
            }

            status.textContent = 'A guardar resposta...';
            saveQueue = saveQueue.then(async () => {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: data,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin'
                });
                if (!response.ok) {
                    throw new Error(`O servidor respondeu com o estado ${response.status}.`);
                }
                status.textContent = 'Resposta guardada.';
            }).catch((error) => {
                console.error('Não foi possível guardar a resposta.', error);
                status.textContent = 'Não foi possível guardar a resposta. Tenta novamente.';
            });
            submitWhenReady();
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            submitWhenReady();
        });
    });
})();
