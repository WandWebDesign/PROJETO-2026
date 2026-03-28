/* =======================================================
   BARRA DE CATEGORIAS INTELIGENTE (Auto-Hide)
======================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const categoryMenu = document.querySelector(".menu-categorias");

    // Se estiver em uma página sem a barra (ex: tela de login), ignora
    if (!categoryMenu) return;

    let ultimaPosicaoScroll = 0;

    // Fica "escutando" a rolagem da tela
    window.addEventListener("scroll", () => {
        // Descobre em que altura da página o usuário está
        let posicaoAtual = window.pageYOffset || document.documentElement.scrollTop;

        // Se rolou para baixo, esconde o menu
        if (posicaoAtual > ultimaPosicaoScroll && posicaoAtual > 100) {
            categoryMenu.classList.add("hidden-scroll");
        } 
        // Se rolou para cima, mostra o menu novamente
        else {
            categoryMenu.classList.remove("hidden-scroll");
        }
        
        // Salva a posição atual para comparar na próxima rolagem
        // O Math.max evita que valores fiquem negativos no celular (efeito borracha do iPhone)
        ultimaPosicaoScroll = Math.max(0, posicaoAtual);
    });
});