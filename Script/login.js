document.querySelector('.form-login').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (email !== '' && senha !== '') {
        // SIMULAÇÃO DE LOGIN:
        // Salvamos no navegador que o usuário está logado
        localStorage.setItem('usuarioLogado', 'true');
        localStorage.setItem('emailUsuario', email); // Opcional: salvar o email para mostrar no menu

        if (typeof mostrarToast === 'function') {
            mostrarToast('Login realizado com sucesso! Aguarde...');
            
            setTimeout(() => {
                window.location.href = 'padaria-landinpage.html';
            }, 1500); 
            
        } else {
            window.location.href = 'padaria-landinpage.html';
        }
    } else {
        if (typeof mostrarToast === 'function') {
            mostrarToast('Ops! Por favor, preencha seu e-mail e senha.');
        } else {
            alert('Por favor, preencha todos os campos antes de entrar.');
        }
    }
});