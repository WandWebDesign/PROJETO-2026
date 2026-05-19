/* =======================================================
   LÓGICA DA PÁGINA: MEUS PEDIDOS (CLIENTE)
======================================================= */

let indiceDoPedidoParaApagar = null;
let tipoDeLimpeza = 'finalizados'; // Pode ser 'finalizados' ou 'tudo'

document.addEventListener('DOMContentLoaded', () => {
    renderizarHistorico();

    // 1. Lógica do botão "Sim, Cancelar" (Cancelamento Individual)
    const btnConfirmar = document.getElementById('btn-confirmar-cancelar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            if (indiceDoPedidoParaApagar !== null) {
                let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
                const pedidoCliente = historico[indiceDoPedidoParaApagar];
                
                pedidoCliente.status = "Cancelado";
                pedidoCliente.justificativa = "Cancelado pelo cliente";
                localStorage.setItem('historicoPedidos', JSON.stringify(historico));
                
                // Sincroniza com o Painel Admin
                let pedidosAdmin = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];
                const indexAdmin = pedidosAdmin.findIndex(p => p.id === pedidoCliente.id);
                if (indexAdmin !== -1) {
                    pedidosAdmin[indexAdmin].status = "Cancelado";
                    pedidosAdmin[indexAdmin].justificativa = "Cancelado pelo cliente";
                    localStorage.setItem('pedidosPadaria', JSON.stringify(pedidosAdmin));
                }
                
                fecharModalCancelamento();
                if (typeof mostrarToast === 'function') mostrarToast("Pedido cancelado com sucesso!");
                renderizarHistorico();
            }
        });
    }

    // 2. Lógica Dinâmica do botão "Sim, Limpar" (Modal de Limpeza)
    const btnConfirmarLimpar = document.getElementById('btn-confirmar-limpar');
    if (btnConfirmarLimpar) {
        btnConfirmarLimpar.addEventListener('click', () => {
            let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
            
            if (tipoDeLimpeza === 'tudo') {
                // Apaga tudo
                localStorage.setItem('historicoPedidos', JSON.stringify([]));
                if (typeof mostrarToast === 'function') mostrarToast("Todo o histórico foi apagado!");
            } else {
                // Apaga apenas Finalizados e Cancelados
                let novoHistorico = historico.filter(pedido => pedido.status !== "Finalizado" && pedido.status !== "Cancelado");
                localStorage.setItem('historicoPedidos', JSON.stringify(novoHistorico));
                if (typeof mostrarToast === 'function') mostrarToast("Histórico limpo com sucesso!");
            }
            
            fecharModalLimpar();
            renderizarHistorico();
            if (typeof filtrarPedidos === 'function') filtrarPedidos();
        });
    }
});

function podeCancelar(dataRetiradaStr, nomeProduto) {
    const horasLimite = (nomeProduto.toLowerCase().includes("pão francês")) ? 2 : 12;
    const [dia, mes, ano] = dataRetiradaStr.split('/');
    const dataRetirada = new Date(ano, mes - 1, dia, 7, 0, 0); 
    const agora = new Date();
    const diferencaHoras = (dataRetirada - agora) / (1000 * 60 * 60);
    return diferencaHoras >= horasLimite;
}

function renderizarHistorico() {
    const container = document.getElementById('container-historico');
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];

    if (!container) return;
    if (historico.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:50px; color:#A89F98; font-weight:bold;">Seu histórico de pedidos está vazio.</p>`;
        return;
    }

    container.innerHTML = '';
    
    [...historico].reverse().forEach((pedido, indexInvertido) => {
        const realIndex = historico.length - 1 - indexInvertido;
        const statusAtual = pedido.status || "Pendente";
        
        const coresStatus = {
            "Pendente": "#D9534F",
            "Em produção": "#F0AD4E",
            "Finalizado": "#5CB85C",
            "Cancelado": "#777777"
        };
        const corTag = coresStatus[statusAtual] || "#A89F98";

        const avisoFinalizado = statusAtual === "Finalizado" 
            ? `<div style="background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: 800; text-align: center; border: 1px solid #c8e6c9;">✅ Seu pedido está pronto para retirada! Apresente o código no balcão.</div>` 
            : '';

        // EXIBIÇÃO DA JUSTIFICATIVA PARA O CLIENTE
        const justificativaHTML = pedido.justificativa 
            ? `<div style="background: #FFF5F5; color: #C53030; padding: 10px; border-radius: 8px; margin: 10px 0; font-weight: 700; border: 1px solid #FEB2B2; font-size: 0.9rem;">🚫 Motivo do Cancelamento: ${pedido.justificativa}</div>`
            : '';

        const dentroDoPrazo = pedido.itens.every(item => {
            if (!item.dataRetirada) return true; 
            return podeCancelar(item.dataRetirada, item.nome);
        });
        const cancelamentoPermitido = dentroDoPrazo && statusAtual === "Pendente";

        const div = document.createElement('div');
        div.className = 'card-pedido-finalizado';
        div.style.borderTop = `5px solid ${corTag}`;
        // Deixa pedidos cancelados levemente opacos
        if (statusAtual === "Cancelado") div.style.opacity = "0.7";
        
        const itensHTML = pedido.itens.map(item => `
            <li>${item.quantidade}x ${item.nome} ${item.dataRetirada ? `(📅 ${item.dataRetirada})` : '(Retirada Imediata)'}</li>
        `).join('');

        let textoBloqueio = "Prazo encerrado";
        if(statusAtual === "Em produção") textoBloqueio = "Pedido já em andamento";
        if(statusAtual === "Cancelado") textoBloqueio = "Pedido Cancelado";

        div.innerHTML = `
            <div class="pedido-info">
                <div style="margin-bottom: 15px;">
                    <span class="data-compra">Realizado em ${pedido.dataPedido}</span>
                </div>
                
                <h2>Pedido #${pedido.id}</h2>
                ${avisoFinalizado}
                ${justificativaHTML} <ul class="lista-itens-resumo">${itensHTML}</ul>
                <p>Total: <strong>R$ ${pedido.total.toLocaleString('pt-BR', {minimumFractionDigits:2})}</strong></p>
            </div>
            
            <div class="acoes-historico" style="display: flex; flex-direction: column; align-items: center; gap: 12px; min-width: 180px;">
                <span style="background-color: ${corTag}; color: white; padding: 6px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; width: 100%; text-align: center; box-sizing: border-box;">
                    ${statusAtual}
                </span>
                
                <div class="codigo-tag" style="width: 100%; box-sizing: border-box; text-align: center; margin: 0;">
                    ${pedido.id}
                </div>
                
                ${cancelamentoPermitido 
                    ? `<button class="btn-cancelar-pedido" onclick="cancelarPedido(${realIndex})" style="margin-top: 0;">Cancelar Pedido</button>`
                    : `<span class="prazo-expirado" style="margin-top: 0;">${textoBloqueio}</span>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

function cancelarPedido(index) {
    indiceDoPedidoParaApagar = index;
    const modal = document.getElementById('modal-cancelamento');
    if (modal) modal.style.display = 'flex'; 
}

function fecharModalCancelamento() {
    const modal = document.getElementById('modal-cancelamento');
    if (modal) modal.style.display = 'none'; 
    indiceDoPedidoParaApagar = null;
}

function fecharModalLimpar() {
    const modal = document.getElementById('modal-limpar-historico');
    if (modal) modal.style.display = 'none';
}

function filtrarPedidos() {
    const statusSelecionado = document.getElementById('filtro-status').value.toLowerCase();
    const cardsPedidos = document.querySelectorAll('.card-pedido-finalizado');

    cardsPedidos.forEach(card => {
        const textoCard = card.innerText.toLowerCase();
        if (statusSelecionado === 'todos') {
            card.style.display = ''; 
        } else if (textoCard.includes(statusSelecionado)) {
            card.style.display = ''; 
        } else {
            card.style.display = 'none'; 
        }
    });
}

// =======================================================
// NOVAS FUNÇÕES DE LIMPEZA (DUAS OPÇÕES)
// =======================================================

function limparTodosFinalizados() {
    let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const finalizados = historico.filter(pedido => pedido.status === "Finalizado" || pedido.status === "Cancelado");
    
    if (finalizados.length === 0) {
        alert("Não há pedidos concluídos ou cancelados para limpar!");
        return;
    }
    
    tipoDeLimpeza = 'finalizados';
    
    const modal = document.getElementById('modal-limpar-historico');
    const textoModal = document.getElementById('texto-modal-limpar');
    if (modal && textoModal) {
        textoModal.innerText = `Deseja remover ${finalizados.length} pedido(s) finalizado(s)/cancelado(s) da sua tela?`;
        modal.style.display = 'flex';
    }
}

function limparTodoHistorico() {
    let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    
    if (historico.length === 0) {
        alert("O seu histórico já está vazio!");
        return;
    }

    tipoDeLimpeza = 'tudo';

    const modal = document.getElementById('modal-limpar-historico');
    const textoModal = document.getElementById('texto-modal-limpar');
    if (modal && textoModal) {
        textoModal.innerText = `⚠️ ATENÇÃO: Isso apagará TODOS os ${historico.length} pedidos da sua tela, incluindo os pendentes. Tem certeza?`;
        modal.style.display = 'flex';
    }
}