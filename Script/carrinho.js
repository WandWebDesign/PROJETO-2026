document.addEventListener('DOMContentLoaded', () => {
    renderizarPaginaCarrinho();
});

const formatarDinheiroCheckout = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

function renderizarPaginaCarrinho() {
    const containerLista = document.getElementById('lista-pagina-carrinho');
    const containerResumo = document.getElementById('resumo-pagina-carrinho');
    
    let itensCarrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (itensCarrinho.length === 0) {
        document.getElementById('container-checkout').innerHTML = `
            <div class="carrinho-vazio">
                <img src="./Imagens Secundarias/Pão.svg" alt="Carrinho Vazio">
                <h2>Seu carrinho está vazio!</h2>
                <p>Que tal dar uma olhada nas nossas delícias fresquinhas?</p>
                <a href="pagina-catalogo.html?filtro=retiravel" class="btn-voltar-loja">Ver Catálogo de Produtos</a>
            </div>
        `;
        return;
    }

    containerLista.innerHTML = '';
    let valorTotal = 0;
    let totalItens = 0;

    itensCarrinho.forEach((item, index) => {
        const qtd = item.quantidade || 1; 
        const subtotal = item.preco * qtd;
        valorTotal += subtotal;
        totalItens += qtd;
        
        const infoAgendamento = item.dataRetirada 
            ? `<span class="info-agendamento">📅 Agendado para: ${item.dataRetirada}</span>` 
            : `<span class="info-agendamento" style="color: #4CAF50;">🛒 Retirada Imediata</span>`;

        const cardHTML = `
            <div class="card-produto-checkout">
                <div class="info-produto">
                    <h3>${item.nome}</h3>
                    ${infoAgendamento}
                    <span class="detalhes-valores">Valor unitário: ${formatarDinheiroCheckout(item.preco)} (x${qtd})</span>
                </div>
                <div class="acoes-produto">
                    <span class="subtotal-item">${formatarDinheiroCheckout(subtotal)}</span>
                    <button class="btn-remover-checkout" onclick="removerItemCheckout(${index})">Remover ✕</button>
                </div>
            </div>
        `;
        containerLista.innerHTML += cardHTML;
    });

// AQUI INJETAMOS AS FORMAS DE PAGAMENTO NO RESUMO DO CHECKOUT!
    containerResumo.innerHTML = `
        <h2>Resumo do Pedido</h2>
        
        <div class="linha-resumo">
            <span>Total de itens:</span>
            <span>${totalItens} un</span>
        </div>
        
        <div class="linha-resumo">
            <span>Subtotal:</span>
            <span>${formatarDinheiroCheckout(valorTotal)}</span>
        </div>

        <div class="opcoes-pagamento-checkout">
            <h3 style="font-family:'Nunito'; font-size:1.1rem; color:var(--cafe-escuro); margin-bottom:10px;">Pagar na Retirada com:</h3>
            <label class="payment-option-checkout">
                <input type="radio" name="pagamento-checkout" value="Pix" checked> Pix (QR Code)
            </label>
            <label class="payment-option-checkout">
                <input type="radio" name="pagamento-checkout" value="Cartão de Crédito"> Cartão de Crédito
            </label>
            <label class="payment-option-checkout">
                <input type="radio" name="pagamento-checkout" value="Cartão de Débito"> Cartão de Débito
            </label>
            <label class="payment-option-checkout">
                <input type="radio" name="pagamento-checkout" value="Dinheiro"> Dinheiro Espécie
            </label>
        </div>

        <div class="total-resumo">
            <span>Total:</span>
            <span>${formatarDinheiroCheckout(valorTotal)}</span>
        </div>
        
        <button class="btn-comprar-tudo" onclick="finalizarCompra(${valorTotal}, ${totalItens})">Finalizar Compra</button>
        
        <button class="btn-voltar-compras" onclick="window.location.href='padaria-landinpage.html'">Voltar às Compras</button>
        
        <button class="btn-remover-checkout" style="width:100%; margin-top:15px; text-align:center;" onclick="limparCarrinhoCompleto()">Esvaziar Carrinho</button>
    `;
}

/* =======================================================
   NOVA LÓGICA DE REMOÇÃO COM MODAL PERSONALIZADO
======================================================= */
let indiceRemocaoAtual = null; // Guarda o item que o usuário clicou
let limparTudo = false; // Define se vamos apagar tudo ou só um item

function removerItemCheckout(index) {
    indiceRemocaoAtual = index;
    limparTudo = false;
    
    // Altera os textos do modal para o cenário de um item
    document.getElementById('titulo-modal-remocao').innerText = '⚠️ Remover Item?';
    document.getElementById('texto-modal-remocao').innerText = 'Tem certeza que deseja retirar este item do seu pedido?';
    
    // Abre o Modal Visual
    document.getElementById('modal-remover-item').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Trava o scroll do fundo
}

function limparCarrinhoCompleto() {
    limparTudo = true;
    
    // Altera os textos do modal para o cenário drástico
    document.getElementById('titulo-modal-remocao').innerText = '⚠️ Esvaziar Carrinho?';
    document.getElementById('texto-modal-remocao').innerText = 'Tem certeza que deseja apagar TODOS os itens do seu pedido?';
    
    // Abre o Modal Visual
    document.getElementById('modal-remover-item').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function fecharModalRemocao() {
    document.getElementById('modal-remover-item').style.display = 'none';
    document.body.style.overflow = 'auto'; // Volta a permitir rolagem
    indiceRemocaoAtual = null;
    limparTudo = false;
}

function confirmarRemocao() {
    let itensCarrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Se for para limpar tudo
    if (limparTudo) {
        localStorage.removeItem('carrinho');
        if(typeof mostrarToast === 'function') mostrarToast('Carrinho esvaziado com sucesso!');
    } 
    // Se for para remover apenas 1 item
    else if (indiceRemocaoAtual !== null) {
        itensCarrinho.splice(indiceRemocaoAtual, 1);
        localStorage.setItem('carrinho', JSON.stringify(itensCarrinho));
        if(typeof mostrarToast === 'function') mostrarToast('Item removido!');
    }
    
    fecharModalRemocao();
    renderizarPaginaCarrinho();
    
    // Sincroniza com o número do carrinho no cabeçalho
    if(typeof atualizarInterfaceCarrinho === 'function') {
        atualizarInterfaceCarrinho();
    }
}

// O NOVO FLUXO DE RECIBO AO FINALIZAR
function finalizarCompra(valorTotal, totalItens) {
    const estaLogado = localStorage.getItem('usuarioLogado');

    if (!estaLogado) {
        mostrarToast('Você precisa estar logado para finalizar o pedido!');
        setTimeout(() => { window.location.href = 'padaria-login.html'; }, 1500);
        return;
    }

    const formaPagamento = document.querySelector('input[name="pagamento-checkout"]:checked');
    if (!formaPagamento) {
        mostrarToast("Por favor, selecione uma forma de pagamento.");
        return;
    }

    const pagamentoEscolhido = formaPagamento.value;
    const codigo = Math.floor(100000 + Math.random() * 900000);
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    // --- NOVA LÓGICA: SALVAR NO HISTÓRICO ---
    const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
    const novoPedidoFinalizado = {
        id: codigo,
        dataPedido: dataHoje,
        itens: carrinhoAtual,
        total: valorTotal,
        qtdItens: totalItens,
        pagamento: pagamentoEscolhido
    };

    // Pega o histórico antigo e adiciona o novo
    let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    historico.push(novoPedidoFinalizado);
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));

    // Preenche o Modal
    document.getElementById('display-codigo').innerText = codigo;
    document.getElementById('modal-qtd').innerText = totalItens + " un";
    document.getElementById('modal-total').innerText = formatarDinheiroCheckout(valorTotal);
    document.getElementById('modal-pagamento').innerText = pagamentoEscolhido;

    document.getElementById('modal-confirmacao').style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}

function fecharModalCompra() {
    document.getElementById('modal-confirmacao').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Limpa apenas o carrinho (o histórico já está salvo!)
    localStorage.removeItem('carrinho');
    
    // Redireciona para a nova página de Histórico para o usuário ver seu ticket salvo
    window.location.href = "meus-pedidos.html";
}