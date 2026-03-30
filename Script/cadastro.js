document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.querySelector('.form-cadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o recarregamento padrão da página

            // Captura os valores digitados
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value.trim();
            const confirmarSenha = document.getElementById('confirmar-senha').value.trim();

            // 1. Validação: A senha tem no mínimo 8 caracteres?
            if (senha.length < 8) {
                if (typeof mostrarToast === 'function') {
                    mostrarToast('A senha deve ter no mínimo 8 caracteres.');
                } else {
                    alert('A senha deve ter no mínimo 8 caracteres.');
                }
                return; // Pára a execução
            }

            // 2. Validação: As senhas coincidem?
            if (senha !== confirmarSenha) {
                if (typeof mostrarToast === 'function') {
                    mostrarToast('As senhas não coincidem. Tente novamente.');
                } else {
                    alert('As senhas não coincidem. Tente novamente.');
                }
                return; // Pára a execução
            }

            // 3. Sucesso! Vamos criar a conta e já "logar" o usuário automaticamente
            localStorage.setItem('usuarioLogado', 'true');
            localStorage.setItem('emailUsuario', email);
            localStorage.setItem('nomeUsuario', nome); // Guarda o nome para uso futuro

            if (typeof mostrarToast === 'function') {
                mostrarToast(`Bem-vindo(a) à família, ${nome.split(' ')[0]}! Criando sua conta...`);
                
                // Redireciona para a home após 2 segundos
                setTimeout(() => {
                    window.location.href = 'padaria-landingpage.html';
                }, 2000);
            } else {
                alert('Cadastro realizado com sucesso!');
                window.location.href = 'padaria-landingpage.html';
            }
        });
    }
});
