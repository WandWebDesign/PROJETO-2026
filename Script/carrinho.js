document.addEventListener('DOMContentLoaded', () => {
    renderizarPaginaCarrinho();
});

const formatarDinheiroCheckout = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

/* =======================================================
   HORÁRIOS PRÉ-ESTABELECIDOS (07:30 → 20:00, a cada 30min)
======================================================= */
function gerarHorarios() {
    const slots = [];
    let h = 7, m = 30;
    while (h < 20 || (h === 20 && m === 0)) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
        m += 30;
        if (m >= 60) { m -= 60; h++; }
    }
    return slots;
}

const HORARIOS_DISPONIVEIS = gerarHorarios();

/* =======================================================
   DATA MÍNIMA = AMANHÃ
======================================================= */
function getDataMinima() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    return amanha.toISOString().split('T')[0];
}

/* =======================================================
   ATUALIZA O BADGE NOS CARDS AO VIVO (sem re-renderizar)
======================================================= */
function atualizarBadgesRetirada() {
    const dataVal = document.getElementById('data-pedido-global')?.value || '';
    const horaVal = document.getElementById('hora-pedido-global')?.value || '';

    document.querySelectorAll('.badge-retirada-item').forEach(badge => {
        if (dataVal && horaVal) {
            const dataFmt = dataVal.split('-').reverse().join('/');
            badge.innerHTML = `✅ Retirada: <strong>${dataFmt}</strong> às <strong>${horaVal}</strong>`;
            badge.style.color = '#4A7C59';
        } else if (dataVal) {
            badge.innerHTML = `⏰ Data: <strong>${dataVal.split('-').reverse().join('/')}</strong> — falta escolher o horário`;
            badge.style.color = '#C8973D';
        } else {
            badge.innerHTML = `📅 Aguardando agendamento no painel ao lado`;
            badge.style.color = '#A89F98';
        }
    });

    const aviso = document.getElementById('aviso-agendamento-resumo');
    if (!aviso) return;

    if (dataVal && horaVal) {
        const dataFmt = dataVal.split('-').reverse().join('/');
        aviso.innerHTML = `✅ <strong>Retirada agendada:</strong> ${dataFmt} às ${horaVal}`;
        aviso.style.background    = '#EAF7EE';
        aviso.style.borderColor   = '#4A7C59';
        aviso.style.color         = '#4A7C59';
    } else {
        aviso.innerHTML = `⚠️ Escolha a <strong>data</strong> e o <strong>horário</strong> de retirada para todos os itens.`;
        aviso.style.background    = '#FFF8EC';
        aviso.style.borderColor   = '#C8973D';
        aviso.style.color         = '#7A5C2E';
    }
}

/* =======================================================
   RENDER PRINCIPAL DA PÁGINA DE CHECKOUT
======================================================= */
function renderizarPaginaCarrinho() {
    const containerLista  = document.getElementById('lista-pagina-carrinho');
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

    /* ---- Coluna esquerda: cards dos itens ---- */
    containerLista.innerHTML = '';
    let valorTotal = 0;
    let totalItens = 0;

    itensCarrinho.forEach((item, index) => {
        const qtd      = item.quantidade || 1;
        const subtotal = item.preco * qtd;
        valorTotal += subtotal;
        totalItens += qtd;

        containerLista.innerHTML += `
            <div class="card-produto-checkout">
                <div class="info-produto">
                    <h3>${item.nome}</h3>
                    <span class="detalhes-valores">
                        Valor unitário: ${formatarDinheiroCheckout(item.preco)} (x${qtd})
                    </span>
                    <span class="badge-retirada-item" style="
                        display: block;
                        margin-top: 8px;
                        font-size: 0.88rem;
                        font-weight: 700;
                        font-family: 'Nunito', sans-serif;
                        color: #A89F98;
                    ">📅 Aguardando agendamento no painel ao lado</span>
                </div>
                <div class="acoes-produto">
                    <span class="subtotal-item">${formatarDinheiroCheckout(subtotal)}</span>
                    <button class="btn-remover-checkout" onclick="removerItemCheckout(${index})">Remover ✕</button>
                </div>
            </div>
        `;
    });

    /* ---- Opções de horário como <option> ---- */
    const opcoesHorario = HORARIOS_DISPONIVEIS
        .map(h => `<option value="${h}">${h}</option>`)
        .join('');

    /* ---- Coluna direita: agendamento + pagamento + totais ---- */
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

        <!-- ===== BLOCO DE AGENDAMENTO ÚNICO PARA TODOS OS ITENS ===== -->
        <div style="
            margin: 18px 0;
            padding: 16px;
            background: #FFF8EC;
            border: 2px solid #C8973D;
            border-radius: 12px;
        ">
            <h3 style="
                font-family: 'Nunito', sans-serif;
                font-size: 1rem;
                font-weight: 800;
                color: #4A3B32;
                margin: 0 0 4px;
            ">📅 Agendamento de Retirada</h3>
            <p style="
                font-size: 0.82rem;
                color: #7A6A5A;
                margin: 0 0 14px;
                font-family: 'Nunito', sans-serif;
            ">Todos os itens deste pedido serão retirados juntos.</p>

            <label style="
                display: block;
                font-size: 0.85rem;
                font-weight: 800;
                color: #4A3B32;
                margin-bottom: 5px;
                font-family: 'Nunito', sans-serif;
            ">Data de Retirada</label>
            <input
                type="date"
                id="data-pedido-global"
                min="${getDataMinima()}"
                onchange="atualizarBadgesRetirada()"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1.5px solid #D4C5A9;
                    font-family: 'Nunito', sans-serif;
                    font-size: 0.95rem;
                    color: #4A3B32;
                    background: white;
                    margin-bottom: 12px;
                    cursor: pointer;
                "
            >

            <label style="
                display: block;
                font-size: 0.85rem;
                font-weight: 800;
                color: #4A3B32;
                margin-bottom: 5px;
                font-family: 'Nunito', sans-serif;
            ">Horário de Retirada</label>
            <select
                id="hora-pedido-global"
                onchange="atualizarBadgesRetirada()"
                style="
                    width: 100%;
                    box-sizing: border-box;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1.5px solid #D4C5A9;
                    font-family: 'Nunito', sans-serif;
                    font-size: 0.95rem;
                    color: #4A3B32;
                    background: white;
                    cursor: pointer;
                "
            >
                <option value="" disabled selected>— Escolha um horário —</option>
                ${opcoesHorario}
            </select>

            <div id="aviso-agendamento-resumo" style="
                margin-top: 12px;
                padding: 10px 12px;
                background: #FFF8EC;
                border-left: 4px solid #C8973D;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 700;
                color: #7A5C2E;
                font-family: 'Nunito', sans-serif;
                transition: all 0.3s ease;
            ">⚠️ Escolha a <strong>data</strong> e o <strong>horário</strong> de retirada para todos os itens.</div>
        </div>
        <!-- ============================================================ -->

        <!-- FORMAS DE PAGAMENTO -->
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

    // Atualiza badges caso a página seja re-renderizada com dados já existentes
    atualizarBadgesRetirada();
}

/* =======================================================
   REMOÇÃO COM MODAL PERSONALIZADO
======================================================= */
let indiceRemocaoAtual = null;
let limparTudo = false;

function removerItemCheckout(index) {
    indiceRemocaoAtual = index;
    limparTudo = false;
    document.getElementById('titulo-modal-remocao').innerText = '⚠️ Remover Item?';
    document.getElementById('texto-modal-remocao').innerText  = 'Tem certeza que deseja retirar este item do seu pedido?';
    document.getElementById('modal-remover-item').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function limparCarrinhoCompleto() {
    limparTudo = true;
    document.getElementById('titulo-modal-remocao').innerText = '⚠️ Esvaziar Carrinho?';
    document.getElementById('texto-modal-remocao').innerText  = 'Tem certeza que deseja apagar TODOS os itens do seu pedido?';
    document.getElementById('modal-remover-item').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function fecharModalRemocao() {
    document.getElementById('modal-remover-item').style.display = 'none';
    document.body.style.overflow = 'auto';
    indiceRemocaoAtual = null;
    limparTudo = false;
}

function confirmarRemocao() {
    let itensCarrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (limparTudo) {
        localStorage.removeItem('carrinho');
        if (typeof mostrarToast === 'function') mostrarToast('Carrinho esvaziado com sucesso!');
    } else if (indiceRemocaoAtual !== null) {
        itensCarrinho.splice(indiceRemocaoAtual, 1);
        localStorage.setItem('carrinho', JSON.stringify(itensCarrinho));
        if (typeof mostrarToast === 'function') mostrarToast('Item removido!');
    }

    fecharModalRemocao();
    renderizarPaginaCarrinho();
    if (typeof atualizarInterfaceCarrinho === 'function') atualizarInterfaceCarrinho();
}

/* =======================================================
   FINALIZAR COMPRA — aplica data/hora única em todos os itens
======================================================= */
function finalizarCompra(valorTotal, totalItens) {
    const estaLogado = localStorage.getItem('usuarioLogado');

    if (!estaLogado) {
        mostrarToast('Você precisa estar logado para finalizar o pedido!');
        setTimeout(() => { window.location.href = 'padaria-login.html'; }, 1500);
        return;
    }

    const formaPagamento = document.querySelector('input[name="pagamento-checkout"]:checked');
    if (!formaPagamento) {
        mostrarToast('Por favor, selecione uma forma de pagamento.');
        return;
    }

    const dataInput = document.getElementById('data-pedido-global');
    const horaInput = document.getElementById('hora-pedido-global');

    if (!dataInput?.value) {
        mostrarToast('⚠️ Escolha uma data para a retirada!');
        dataInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!horaInput?.value) {
        mostrarToast('⚠️ Escolha um horário para a retirada!');
        horaInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const dataFormatada    = dataInput.value.split('-').reverse().join('/');
    const horaEscolhida    = horaInput.value;
    const pagamentoEscolhido = formaPagamento.value;

    // Aplica a mesma data e hora em TODOS os itens antes de salvar
    let carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinhoAtual = carrinhoAtual.map(item => ({
        ...item,
        dataRetirada: dataFormatada,
        horaRetirada: horaEscolhida
    }));
    localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));

    const codigo   = Math.floor(100000 + Math.random() * 900000);
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    // Salvar no histórico do cliente
    const novoPedidoFinalizado = {
        id: codigo,
        dataPedido: dataHoje,
        itens: carrinhoAtual,
        total: valorTotal,
        qtdItens: totalItens,
        pagamento: pagamentoEscolhido,
        dataRetirada: dataFormatada,
        horaRetirada: horaEscolhida
    };

    let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    historico.push(novoPedidoFinalizado);
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));

    // Enviar para o painel Admin
    const novoPedidoAdmin = {
        id: codigo,
        cliente: estaLogado,
        dataPedido: dataHoje,
        itens: carrinhoAtual,
        valorTotal: valorTotal,
        status: 'Pendente',
        pagamento: pagamentoEscolhido,
        dataRetirada: dataFormatada,
        horaRetirada: horaEscolhida
    };

    const pedidosAdmin = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];
    pedidosAdmin.push(novoPedidoAdmin);
    localStorage.setItem('pedidosPadaria', JSON.stringify(pedidosAdmin));

    // Modal de confirmação
    document.getElementById('display-codigo').innerText  = codigo;
    document.getElementById('modal-qtd').innerText       = totalItens + ' un';
    document.getElementById('modal-total').innerText     = formatarDinheiroCheckout(valorTotal);
    document.getElementById('modal-pagamento').innerText = pagamentoEscolhido;

    document.getElementById('modal-confirmacao').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function fecharModalCompra() {
    document.getElementById('modal-confirmacao').style.display = 'none';
    document.body.style.overflow = 'auto';
    localStorage.removeItem('carrinho');
    window.location.href = 'meus-pedidos.html';
}