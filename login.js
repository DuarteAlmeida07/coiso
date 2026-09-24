const accountsKey = 'study-quest-accounts';
const sessionKey = 'study-quest-session';
const tabs = document.querySelectorAll('.tab-btn');
const forms = {
    'login-form': document.getElementById('login-form'),
    'register-form': document.getElementById('register-form')
};

function switchForm(targetId) {
    Object.entries(forms).forEach(([id, form]) => {
        form.classList.toggle('hidden', id !== targetId);
    });

    tabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.target === targetId);
    });
}

function showMessage(form, message, isError = false) {
    const status = form.querySelector('.status');
    status.textContent = message;
    status.classList.toggle('error', isError);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAccounts() {
    const accounts = JSON.parse(localStorage.getItem(accountsKey) || '{}');
    const oldAccount = JSON.parse(localStorage.getItem('study-quest-account') || 'null');
    if (oldAccount && oldAccount.email && !accounts[oldAccount.email]) {
        accounts[oldAccount.email] = oldAccount;
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
    }
    return accounts;
}

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        switchForm(tab.dataset.target);
    });
});

forms['login-form'].addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const remember = forms['login-form'].querySelector('input[type="checkbox"]').checked;
    const account = getAccounts()[email];

    if (!email || !password) {
        showMessage(forms['login-form'], 'Preencha e-mail e senha para continuar.', true);
        return;
    }

    if (!isValidEmail(email)) {
        showMessage(forms['login-form'], 'Digite um e-mail válido.', true);
        return;
    }

    if (!account || account.email !== email || account.password !== password) {
        showMessage(forms['login-form'], 'E-mail ou senha incorretos.', true);
        return;
    }

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(sessionKey, JSON.stringify({
        name: account.name,
        email: account.email
    }));
    showMessage(forms['login-form'], 'Login realizado com sucesso!');
    window.setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
});

forms['register-form'].addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const lastname = document.getElementById('register-lastname').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const terms = forms['register-form'].querySelector('input[type="checkbox"]').checked;

    if (!name || !lastname || !email || !password || !confirm) {
        showMessage(forms['register-form'], 'Preencha todos os campos.', true);
        return;
    }

    if (!isValidEmail(email)) {
        showMessage(forms['register-form'], 'Digite um e-mail válido.', true);
        return;
    }

    if (password.length < 6) {
        showMessage(forms['register-form'], 'A senha deve ter pelo menos 6 caracteres.', true);
        return;
    }

    if (password !== confirm) {
        showMessage(forms['register-form'], 'As senhas não coincidem.', true);
        return;
    }

    if (!terms) {
        showMessage(forms['register-form'], 'Aceite os termos para criar a conta.', true);
        return;
    }

    const accounts = getAccounts();
    if (accounts[email]) {
        showMessage(forms['register-form'], 'Já existe uma conta com este e-mail.', true);
        return;
    }

    accounts[email] = {
        name: `${name} ${lastname}`,
        email,
        password
    };
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
    forms['register-form'].reset();
    document.getElementById('login-email').value = email;
    showMessage(forms['login-form'], 'Conta criada. Entre com os seus dados.');
    switchForm('login-form');
});
