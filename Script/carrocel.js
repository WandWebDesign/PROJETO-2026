/* =======================================================
   CARROSSEL DE PRODUTOS (Vitrine Elegante)
======================================================= */

// Função que cria a interatividade para cada carrossel da página
function inicializarCarrossel(seletorCarrossel) {
    // Busca a seção específica (ex: #carrossel-padaria)
    const carrossel = document.querySelector(seletorCarrossel);

    // Proteção: Se não achar o carrossel, a função para aqui e evita erros
    if (!carrossel) return;

    // Encontra os elementos internos deste carrossel
    const conjunto = carrossel.querySelector('.carrossel-conjunto');
    const btnAntes = carrossel.querySelector('.botao-antes');
    const btnDepois = carrossel.querySelector('.botao-depois');

    // Se faltar a lista de itens ou os botões, não faz nada
    if (!conjunto || !btnAntes || !btnDepois) return;

    // Ação do botão "Avançar" (>)
    btnDepois.addEventListener('click', () => {
        // Pega a largura exata da área visível no momento
        const rolagem = conjunto.clientWidth; 
        
        // Manda o container rolar para a direita suavemente
        conjunto.scrollBy({ left: rolagem, behavior: 'smooth' });
    });

    // Ação do botão "Voltar" (<)
    btnAntes.addEventListener('click', () => {
        const rolagem = conjunto.clientWidth;
        
        // Manda o container rolar para a esquerda (valor negativo)
        conjunto.scrollBy({ left: -rolagem, behavior: 'smooth' });
    });
}

// Quando o navegador terminar de ler todo o HTML, ele "liga" os carrosséis
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrossel('#carrossel-peça-e-retire');
    inicializarCarrossel('#carrossel-ofertas');
    inicializarCarrossel('#carrossel-padaria');
    inicializarCarrossel('#carrossel-açougue');
    inicializarCarrossel('#carrossel-hortifruti');
    inicializarCarrossel('#carrossel-mercado');
});