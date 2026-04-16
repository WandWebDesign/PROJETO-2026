document.addEventListener('DOMContentLoaded', () => {
    renderizarHistorico();
});

/**
 * Lógica Educativa:
 * Para calcular se o cancelamento é permitido, transformamos a data de retirada (string)
 * em um objeto Date do JavaScript e comparamos com a hora atual.
 */
function podeCancelar(dataRetiradaStr, nomeProduto) {
    // 1. Identifica o prazo baseado no produto
    const horasLimite = (nomeProduto.toLowerCase().includes("pão francês")) ? 2 : 12;

    // 2. Converte a string "DD/MM/YYYY" para um objeto Date real
    // Assumimos o horário de 07:00 AM (abertura da padaria) como base para o cálculo
    const [dia, mes, ano] = dataRetiradaStr.split('/');
    const dataRetirada = new Date(ano, mes - 1, dia, 7, 0, 0); 
    
    const agora = new Date();
    
    // 3. Calcula a diferença em milissegundos e converte para horas
    const diferencaMilissegundos = dataRetirada - agora;
    const diferencaHoras = diferencaMilissegundos / (1000 * 60 * 60);

    return diferencaHoras >= horasLimite;
}

function renderizarHistorico() {
    const container = document.getElementById('container-historico');
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];

    if (historico.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:50px;">Nenhum pedido encontrado.</p>`;
        return;
    }

    container.innerHTML = '';
    
    // Inverte para mostrar os mais recentes primeiro
    [...historico].reverse().forEach((pedido, indexInvertido) => {
        // Recupera o índice real para exclusão correta
        const realIndex = historico.length - 1 - indexInvertido;

        // Verifica se TODOS os itens do pedido ainda podem ser cancelados
        // Se um item especial estiver fora do prazo, o pedido todo fica travado
        const cancelamentoPermitido = pedido.itens.every(item => {
            if (!item.dataRetirada) return true; // Itens sem agendamento (imediato) são tratados na política da loja
            return podeCancelar(item.dataRetirada, item.nome);
        });

        const div = document.createElement('div');
        div.className = 'card-pedido-finalizado';
        
        // Montamos a lista de itens dentro do card
        const itensHTML = pedido.itens.map(item => `
            <li>${item.quantidade}x ${item.nome} ${item.dataRetirada ? `(📅 ${item.dataRetirada})` : '(Retirada Imediata)'}</li>
        `).join('');

        div.innerHTML = `
            <div class="pedido-info">
                <span class="data-compra">Realizado em ${pedido.dataPedido}</span>
                <h2>Pedido #${pedido.id}</h2>
                <ul class="lista-itens-resumo">${itensHTML}</ul>
                <p>Total: <strong>R$ ${pedido.total.toLocaleString('pt-BR', {minimumFractionDigits:2})}</strong></p>
                <p style="font-size:0.8rem; color:#A89F98;">Pagamento: ${pedido.pagamento}</p>
            </div>
            <div class="acoes-historico">
                <div class="codigo-tag">${pedido.id}</div>
                
                ${cancelamentoPermitido 
                    ? `<button class="btn-cancelar-pedido" onclick="cancelarPedido(${realIndex})">Cancelar Pedido</button>`
                    : `<span class="prazo-expirado">Prazo de cancelamento encerrado</span>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// 1. Variável global para armazenar qual pedido será cancelado
let indiceDoPedidoParaApagar = null;

document.addEventListener('DOMContentLoaded', () => {
    renderizarHistorico();

    // 2. Configura o clique do botão "Sim, Cancelar" dentro do Modal Visual
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

        // Verifica se todos os itens permitem cancelamento
        const cancelamentoPermitido = pedido.itens.every(item => {
            if (!item.dataRetirada) return true; 
            return podeCancelar(item.dataRetirada, item.nome);
        });

        const div = document.createElement('div');
        div.className = 'card-pedido-finalizado';
        
        const itensHTML = pedido.itens.map(item => `
            <li>${item.quantidade}x ${item.nome} ${item.dataRetirada ? `(📅 ${item.dataRetirada})` : '(Retirada Imediata)'}</li>
        `).join('');

        div.innerHTML = `
            <div class="pedido-info">
                <span class="data-compra">Realizado em ${pedido.dataPedido}</span>
                <h2>Pedido #${pedido.id}</h2>
                <ul class="lista-itens-resumo">${itensHTML}</ul>
                <p>Total: <strong>R$ ${pedido.total.toLocaleString('pt-BR', {minimumFractionDigits:2})}</strong></p>
            </div>
            <div class="acoes-historico">
                <div class="codigo-tag">${pedido.id}</div>
                ${cancelamentoPermitido 
                    ? `<button class="btn-cancelar-pedido" onclick="cancelarPedido(${realIndex})">Cancelar Pedido</button>`
                    : `<span class="prazo-expirado">Prazo de cancelamento encerrado</span>`
                }
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. Funções para controlar o Modal Visual
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