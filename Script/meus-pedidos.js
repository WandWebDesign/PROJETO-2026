/* =======================================================
   LÓGICA DA PÁGINA: MEUS PEDIDOS (CLIENTE)
======================================================= */

let indiceDoPedidoParaApagar = null;

document.addEventListener('DOMContentLoaded', () => {
    renderizarHistorico();

    // Configura o clique do botão "Sim, Cancelar" dentro do Modal Visual
    const btnConfirmar = document.getElementById('btn-confirmar-cancelar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            if (indiceDoPedidoParaApagar !== null) {
                let historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
                
                // Remove o item do histórico
                historico.splice(indiceDoPedidoParaApagar, 1);
                localStorage.setItem('historicoPedidos', JSON.stringify(historico));
                
                fecharModalCancelamento();
                if (typeof mostrarToast === 'function') {
                    mostrarToast("Pedido cancelado com sucesso!");
                }
                renderizarHistorico();
            }
        });
    }
});

/**
 * Lógica para calcular se o cancelamento é permitido baseado no tempo e tipo de produto.
 */
function podeCancelar(dataRetiradaStr, nomeProduto) {
    // Regra: Pão Francês = 2h, Outros (Especiais) = 12h
    const horasLimite = (nomeProduto.toLowerCase().includes("pão francês")) ? 2 : 12;

    // Converte DD/MM/YYYY para objeto Date (assumindo 07:00 como hora base de abertura)
    const [dia, mes, ano] = dataRetiradaStr.split('/');
    const dataRetirada = new Date(ano, mes - 1, dia, 7, 0, 0); 
    
    const agora = new Date();
    const diferencaHoras = (dataRetirada - agora) / (1000 * 60 * 60);

    return diferencaHoras >= horasLimite;
}

/**
 * Renderiza os pedidos na tela e verifica o Status (Pendente, Produção, Finalizado)
 */
function renderizarHistorico() {
    const container = document.getElementById('container-historico');
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];

    if (!container) return;
    if (historico.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:50px;">Nenhum pedido encontrado no histórico.</p>`;
        return;
    }

    container.innerHTML = '';
    
    // Mostra os mais recentes primeiro sem alterar o array original
    [...historico].reverse().forEach((pedido, indexInvertido) => {
        const realIndex = historico.length - 1 - indexInvertido;

        // 1. LEITURA DO STATUS (Com valor padrão "Pendente" para pedidos antigos)
        const statusAtual = pedido.status || "Pendente";
        
        // 2. DEFINIÇÃO DE CORES DA TAG DE STATUS
        const coresStatus = {
            "Pendente": "#D9534F",    // Vermelho
            "Em produção": "#F0AD4E", // Dourado/Laranja
            "Finalizado": "#5CB85C"   // Verde
        };
        const corTag = coresStatus[statusAtual] || "#A89F98";

        // 3. AVISO DE PEDIDO FINALIZADO
        const avisoFinalizado = statusAtual === "Finalizado" 
            ? `<div style="background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: 800; text-align: center; border: 1px solid #c8e6c9;">✅ Seu pedido está pronto para retirada! Apresente o código no balcão.</div>` 
            : '';

        // 4. LÓGICA DE CANCELAMENTO APRIMORADA
        // Agora o cliente só pode cancelar se o pedido for "Pendente" E estiver no prazo de horas.
        const dentroDoPrazo = pedido.itens.every(item => {
            if (!item.dataRetirada) return true; 
            return podeCancelar(item.dataRetirada, item.nome);
        });
        const cancelamentoPermitido = dentroDoPrazo && statusAtual === "Pendente";

        const div = document.createElement('div');
        div.className = 'card-pedido-finalizado';
        // Adiciona uma bordinha colorida no card combinando com o status
        div.style.borderTop = `5px solid ${corTag}`;
        
        const itensHTML = pedido.itens.map(item => `
            <li>${item.quantidade}x ${item.nome} ${item.dataRetirada ? `(📅 ${item.dataRetirada})` : '(Retirada Imediata)'}</li>
        `).join('');

        // Define a mensagem do botão se não puder cancelar
        let textoBloqueio = "Prazo encerrado";
        if(statusAtual !== "Pendente") textoBloqueio = "Pedido já em andamento";

        div.innerHTML = `
            <div class="pedido-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span class="data-compra">Realizado em ${pedido.dataPedido}</span>
                    <span style="background-color: ${corTag}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase;">${statusAtual}</span>
                </div>
                
                <h2>Pedido #${pedido.id}</h2>
                ${avisoFinalizado}
                <ul class="lista-itens-resumo">${itensHTML}</ul>
                <p>Total: <strong>R$ ${pedido.total.toLocaleString('pt-BR', {minimumFractionDigits:2})}</strong></p>
                <p style="font-size:0.8rem; color:#A89F98; margin-top: 5px;">Pagamento na retirada: ${pedido.pagamento || 'Não informado'}</p>
            </div>
            
            <div class="acoes-historico">
                <div class="codigo-tag">${pedido.id}</div>
                ${cancelamentoPermitido 
                    ? `<button class="btn-cancelar-pedido" onclick="cancelarPedido(${realIndex})">Cancelar Pedido</button>`
                    : `<span class="prazo-expirado">${textoBloqueio}</span>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// Funções para controlar o Modal Visual
function cancelarPedido(index) {
    indiceDoPedidoParaApagar = index;
    const modal = document.getElementById('modal-cancelamento');
    if (modal) {
        modal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
    }
}

function fecharModalCancelamento() {
    const modal = document.getElementById('modal-cancelamento');
    if (modal) {
        modal.style.display = 'none'; 
        document.body.style.overflow = 'auto'; 
    }
    indiceDoPedidoParaApagar = null;
}