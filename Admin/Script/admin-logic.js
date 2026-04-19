/* =======================================================
   LÓGICA ADMINISTRATIVA DO CRUD (IndexedDB)
======================================================= */

const DB_NAME = "PadariaDB_V6";
const DB_VERSION = 3;
let setorAdminAtual = 'padaria'; 
let imagensTemporarias = []; // Array global para as fotos

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se veio redirecionado da página de agendamento
    const urlParams = new URLSearchParams(window.location.search);
    const setorDesejado = urlParams.get("setor");
    
    if (setorDesejado) {
        carregarSetorAdmin(setorDesejado);
    } else {
        carregarSetorAdmin(setorAdminAtual);
    }
});

// 1. CONEXÃO COM O BANCO
function abrirBancoAdmin() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME);
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = () => reject("Erro ao acessar banco de dados.");
    });
}

// 2. LER (Carrega a grade)
// 2. LER (Carrega a grade de Produtos, Pedidos ou Vendas)
async function carregarSetorAdmin(setor) {
    setorAdminAtual = setor;
    const gridAdmin = document.getElementById('grid-admin-produtos'); 
    
    // Atualiza o título e o botão ativo na barra lateral
    document.getElementById('titulo-setor-admin').innerText = setor.charAt(0).toUpperCase() + setor.slice(1);
    document.querySelectorAll('.btn-circulo').forEach(btn => btn.classList.remove('ativo'));
    const btnAtivo = document.getElementById(`btn-${setor}`);
    if(btnAtivo) btnAtivo.classList.add('ativo');

    // --- LÓGICA DE EXIBIÇÃO DIFERENCIADA ---
    
    if (setor === 'vendas') {
        // VENDAS: Ocupa a largura total (Dashboard)
        gridAdmin.style.display = 'block'; 
        document.querySelector('.acoes-topo').style.display = 'none'; 
        document.querySelector('.busca-admin-container').style.display = 'none';
        mostrarVendasNoAdmin();
    } 
    else if (setor === 'pedidos') {
        // PEDIDOS: Volta a ser GRELHA para os cartões ficarem lado a lado
        gridAdmin.style.display = 'grid'; 
        document.querySelector('.acoes-topo').style.display = 'none'; 
        document.querySelector('.busca-admin-container').style.display = 'block';
        mostrarPedidosNoAdmin();
    } 
    else {
        // PRODUTOS (Padaria, Açougue, etc): Mantém a GRELHA de produtos
        gridAdmin.style.display = 'grid'; 
        document.querySelector('.acoes-topo').style.display = 'block';
        document.querySelector('.busca-admin-container').style.display = 'block';
        
        const db = await abrirBancoAdmin();
        const tx = db.transaction(setor, 'readonly');
        const store = tx.objectStore(setor);
        const req = store.getAll();
        req.onsuccess = () => { desenharGradeAdmin(req.result); };
    }
}
function desenharGradeAdmin(produtos) {
    const grid = document.getElementById('grid-admin-produtos');
    grid.innerHTML = '';

    if (produtos.length === 0) {
        grid.innerHTML = '<p>Nenhum produto neste setor.</p>';
        return;
    }

    produtos.forEach(prod => {
        const precoDisplay = prod.precoOferta ? prod.precoOferta : prod.preco;
        
        // Pega a primeira imagem do array (se for novo) ou a imagem única (se for antigo)
        let caminhoImagem = "";
        if (prod.imagens && prod.imagens.length > 0) {
            caminhoImagem = prod.imagens[0];
        } else if (prod.imagem) {
            caminhoImagem = prod.imagem.startsWith('./') ? '../../' + prod.imagem.substring(2) : prod.imagem;
        }

        const jsonProd = encodeURIComponent(JSON.stringify(prod));

        grid.innerHTML += `
            <div class="card-admin">
                <button class="btn-deletar-card" onclick="apagarProduto('${prod.id}', '${prod.setor}')" title="Excluir Produto">🗑️</button>
                <img src="${caminhoImagem}" alt="${prod.tituloproduto}">
                <h5>Setor: ${prod.setor}</h5>
                <h3>${prod.tituloproduto}</h3>
                <p class="preco">R$ ${precoDisplay}</p>
                <button class="btn-editar-card" onclick="abrirModalEditar('${jsonProd}')">Editar Produto</button>
            </div>
        `;
    });
}

// 3. EXCLUIR
// =======================================================
// 3. EXCLUIR (Com Modal Personalizado)
// =======================================================

// Variáveis para "lembrar" qual produto o utilizador quer apagar
let produtoParaApagarId = null;
let produtoParaApagarSetor = null;

// Esta função agora apenas ABRIRÁ o nosso pop-up bonitinho
function apagarProduto(idProduto, setorProduto) {
    // Guarda as informações na memória
    produtoParaApagarId = idProduto;
    produtoParaApagarSetor = setorProduto;
    
    // Mostra o pop-up
    document.getElementById('modal-excluir').style.display = 'flex';
}

// Se o utilizador desistir
function fecharModalExcluir() {
    document.getElementById('modal-excluir').style.display = 'none';
    produtoParaApagarId = null;
    produtoParaApagarSetor = null;
}

// Se o utilizador clicar no botão vermelho "Sim, Excluir"
async function confirmarExclusao() {
    // Segurança: Se não há produto gravado na memória, não faz nada
    if (!produtoParaApagarId || !produtoParaApagarSetor) return;

    try {
        const db = await abrirBancoAdmin();
        const tx = db.transaction(produtoParaApagarSetor, 'readwrite');
        const store = tx.objectStore(produtoParaApagarSetor);
        
        // Exclui do banco de dados
        store.delete(produtoParaApagarId);

        tx.oncomplete = () => {
            fecharModalExcluir(); // Fecha o pop-up
            if(typeof mostrarToast === 'function') mostrarToast("Produto excluído com sucesso!");
            carregarSetorAdmin(produtoParaApagarSetor); // Recarrega a grelha
        };
    } catch (erro) {
        alert("Erro ao excluir produto.");
    }
}

// 4. MODAL E LÓGICA DE UPLOAD
function gerenciarUploadImagens(input) {
    const arquivos = Array.from(input.files);

    if (imagensTemporarias.length + arquivos.length > 6) {
        alert("Erro: O limite máximo é de 6 imagens por produto.");
        return;
    }

    arquivos.forEach(arquivo => {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            imagensTemporarias.push(e.target.result);
            renderizarPreviews();
        };
        leitor.readAsDataURL(arquivo);
    });
    input.value = ""; // Reseta o input para permitir selecionar a mesma foto depois se quiser
}

function renderizarPreviews() {
    const grid = document.getElementById('grid-previsualizacao');
    grid.innerHTML = "";

    if (imagensTemporarias.length === 0) {
        grid.innerHTML = '<p class="msg-vazia">Nenhuma foto selecionada (Mínimo 4 necessárias)</p>';
        return;
    }

    imagensTemporarias.forEach((foto, index) => {
        const div = document.createElement('div');
        div.className = 'foto-preview';
        div.innerHTML = `
            <img src="${foto}">
            <button type="button" class="btn-remover-foto" onclick="removerFotoTemporaria(${index})">×</button>
        `;
        grid.appendChild(div);
    });
}

function removerFotoTemporaria(index) {
    imagensTemporarias.splice(index, 1);
    renderizarPreviews();
}

function abrirModalProduto() {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').disabled = false; 
    document.getElementById('prod-id-original').value = ""; 
    document.getElementById('modal-titulo').innerText = "Adicionar Novo Produto";
    document.getElementById('prod-setor').value = setorAdminAtual; 
    
    // Zera as imagens
    imagensTemporarias = [];
    renderizarPreviews();

    document.getElementById('modal-produto').style.display = 'flex';
}

function abrirModalEditar(jsonProdutoCodificado) {
    const prod = JSON.parse(decodeURIComponent(jsonProdutoCodificado));
    
    document.getElementById('modal-titulo').innerText = "Editar Produto";
    document.getElementById('prod-id-original').value = prod.id; 
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-id').disabled = true; 
    
    document.getElementById('prod-setor').value = prod.setor;
    document.getElementById('prod-titulo').value = prod.tituloproduto;
    document.getElementById('prod-preco').value = prod.preco;
    document.getElementById('prod-oferta').value = prod.precoOferta || "";
    
    // CARREGA AS IMAGENS PARA A EDIÇÃO (Compatibilidade com produtos antigos e novos)
    imagensTemporarias = [];
    if (prod.imagens && Array.isArray(prod.imagens)) {
        imagensTemporarias = [...prod.imagens];
    } else if (prod.imagem) {
        let caminhoAntigo = prod.imagem.startsWith('./') ? '../../' + prod.imagem.substring(2) : prod.imagem;
        imagensTemporarias.push(caminhoAntigo);
    }
    renderizarPreviews();

    document.getElementById('prod-tag-retiravel').checked = prod.tags && prod.tags.includes('retiravel');
    document.getElementById('prod-tag-oferta').checked = prod.tags && prod.tags.includes('oferta');

    document.getElementById('modal-produto').style.display = 'flex';
}

function fecharModalProduto() {
    document.getElementById('modal-produto').style.display = 'none';
}

// 5. CRIAR e ATUALIZAR (Unificado)
async function salvarProduto() {
    const id = document.getElementById('prod-id').value.trim().toLowerCase().replace(/\s+/g, '');
    const setor = document.getElementById('prod-setor').value;
    const titulo = document.getElementById('prod-titulo').value;
    const preco = document.getElementById('prod-preco').value;
    const oferta = document.getElementById('prod-oferta').value;
    
    if(!id || !titulo || !preco) {
        alert("Preencha todos os campos de texto obrigatórios!");
        return;
    }

    if (imagensTemporarias.length < 4) {
        alert("Atenção: Você precisa adicionar pelo menos 4 imagens para o produto.");
        return;
    }

    let tagsAtivas = [];
    if(document.getElementById('prod-tag-retiravel').checked) tagsAtivas.push('retiravel');
    if(document.getElementById('prod-tag-oferta').checked) tagsAtivas.push('oferta');
    if(tagsAtivas.length === 0) tagsAtivas = null;

    const objetoProduto = {
        id: id,
        setor: setor,
        tituloproduto: titulo,
        preco: preco,
        precoOferta: oferta || null,
        imagens: imagensTemporarias, // Salva todas as fotos no array
        imagem: imagensTemporarias[0], // Compatibilidade: a loja principal ainda lê '.imagem'
        tags: tagsAtivas
    };

    try {
        const db = await abrirBancoAdmin();
        const tx = db.transaction(setor, 'readwrite');
        const store = tx.objectStore(setor);

        store.put(objetoProduto);

        tx.oncomplete = () => {
            fecharModalProduto();
            if(typeof mostrarToast === 'function') mostrarToast("Produto salvo com sucesso!");
            carregarSetorAdmin(setor); 
        };
    } catch (erro) {
        alert("Erro ao salvar no banco de dados.");
    }
}

// 6. BUSCA VISUAL ATUALIZADA (Inteligente para Produtos e Pedidos)
function filtrarProdutosAdmin() {
    // Pega o que o usuário digitou, transforma em minúsculas e tira os espaços em branco extras
    const termo = document.getElementById('busca-admin').value.toLowerCase().trim();

    // Cenário A: O Admin está na aba de Pedidos
    if (setorAdminAtual === 'pedidos') {
        const cardsPedidos = document.querySelectorAll('.card-pedido-admin');
        
        cardsPedidos.forEach(card => {
            // Captura o código do pedido (ex: "#123456") e o nome do cliente
            const codigo = card.querySelector('.pedido-header h3').innerText.toLowerCase();
            const cliente = card.querySelector('.pedido-cliente h5').innerText.toLowerCase();
            
            // Verifica se o termo digitado bate com o código OU com o nome do cliente
            if(codigo.includes(termo) || cliente.includes(termo)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    } 
    // Cenário B: O Admin está nas abas de Produtos (Padaria, Açougue...)
    else {
        const cardsProdutos = document.querySelectorAll('.card-admin');
        
        cardsProdutos.forEach(card => {
            const titulo = card.querySelector('h3').innerText.toLowerCase();
            
            if(titulo.includes(termo)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// =======================================================
// ENTRADA DE DADOS - PEDIDOS (Atualizado para o novo Carrinho)
// =======================================================

// 1. Renderiza os pedidos com o seletor de Status
// =======================================================
// LÓGICA DE FORMATAÇÃO DE UNIDADES (Kg/g vs Unidades)
// =======================================================
function formatarQuantidadeProduto(nomeProduto, quantidadeEscolhida) {
    const nomeLimpo = nomeProduto.toLowerCase();
    
    // Lista de palavras que indicam que o produto é vendido a cada 100g
    const palavrasPeso = ['mortadela', 'presunto', 'mussarela', 'queijo', 'salame', 'peito de peru', 'apresuntado', 'frios', '100g'];
    
    // Verifica se alguma dessas palavras existe no nome do produto
    const vendidoPorPeso = palavrasPeso.some(palavra => nomeLimpo.includes(palavra));
    
    if (vendidoPorPeso) {
        const totalGramas = quantidadeEscolhida * 100;
        
        if (totalGramas >= 1000) {
            // Se passou de 1000g, divide por 1000 para virar Kg (Ex: 1500 / 1000 = 1,5 kg)
            let kilos = totalGramas / 1000;
            return kilos.toString().replace('.', ',') + ' kg';
        } else {
            return totalGramas + ' g';
        }
    }
    
    // Se não for um produto de peso, o padrão é unidade
    return quantidadeEscolhida + ' un';
}

// =======================================================
// RENDERIZAÇÃO DOS PEDIDOS COM O NOVO DESIGN
// =======================================================
function mostrarPedidosNoAdmin() {
    const gridAdmin = document.getElementById('grid-admin-produtos');
    const pedidos = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];

    gridAdmin.innerHTML = '';

    if (pedidos.length === 0) {
        gridAdmin.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px; font-size: 1.2rem; font-weight: bold; color: var(--cafe-claro);">Nenhum pedido novo. ☕</p>';
        return;
    }

    pedidos.forEach(pedido => {
        // Cores temáticas para o cabeçalho
        const cores = {
            "Pendente": "#D9534F",    // Vermelho 
            "Em produção": "#F0AD4E", // Laranja/Dourado
            "Finalizado": "#5CB85C"   // Verde
        };
        const corCabecalho = cores[pedido.status] || '#A89F98';

        // 1. Gera a lista de produtos formatada
        let listaProdutosHTML = '';
        pedido.itens.forEach(item => {
            // Aqui usamos nossa nova função inteligente!
            const qtdFormatada = formatarQuantidadeProduto(item.nome, item.quantidade);
            
            const infoData = item.dataRetirada 
                ? `<span style="font-size: 0.75rem; color: #5CB85C; display: block; font-weight: 800; margin-top: 3px;">📅 Agendado: ${item.dataRetirada}</span>` 
                : `<span style="font-size: 0.75rem; color: var(--cafe-claro); display: block; margin-top: 3px;">🛒 Retirada Imediata</span>`;

            listaProdutosHTML += `
                <li>
                    <div style="flex: 1; padding-right: 10px;">
                        <span style="font-weight: 800; color: var(--cafe-escuro);">${item.nome}</span>
                        ${infoData}
                    </div>
                    <strong>${qtdFormatada}</strong>
                </li>
            `;
        });

        // 2. Monta a nova "Comanda"
        const card = `
            <div class="card-pedido-admin" style="${pedido.status === 'Concluído' ? 'opacity: 0.7;' : ''}">
                
                <div class="pedido-header" style="background-color: ${corCabecalho};">
                    <div>
                        <h3>#${pedido.id}</h3>
                        <span class="data">${pedido.dataPedido}</span>
                    </div>
                    <button class="btn-remover-pedido" onclick="removerPedido(${pedido.id})" title="Apagar Pedido">✖</button>
                </div>

                <div class="pedido-body">
                    <div class="pedido-cliente">
                        <div class="icone-user">👤</div>
                        <h5>${pedido.cliente}</h5>
                    </div>
                    
                    <ul class="pedido-itens">
                        ${listaProdutosHTML}
                    </ul>

                    <div class="pedido-total">
                        Total: R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}
                    </div>
                </div>
                
                <div class="pedido-footer">
                    <label>Status da Produção:</label>
                    <select onchange="alterarStatusPedido(${pedido.id}, this.value)">
                        <option value="Pendente" ${pedido.status === 'Pendente' ? 'selected' : ''}>⏳ Pendente</option>
                        <option value="Em produção" ${pedido.status === 'Em produção' ? 'selected' : ''}>👨‍🍳 Em produção</option>
                        <option value="Finalizado" ${pedido.status === 'Finalizado' ? 'selected' : ''}>✅ Finalizado</option>
                    </select>
                </div>
            </div>
        `;
        
        gridAdmin.innerHTML += card;
    });
}

// 2. Função que sincroniza o status entre Admin e Cliente
function alterarStatusPedido(idPedido, novoStatus) {
    // A. Atualizar na lista do Admin
    let pedidosAdmin = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];
    const indexAdmin = pedidosAdmin.findIndex(p => p.id === idPedido);
    
    if (indexAdmin !== -1) {
        pedidosAdmin[indexAdmin].status = novoStatus;
        localStorage.setItem('pedidosPadaria', JSON.stringify(pedidosAdmin));
    }

    // B. Atualizar no Histórico do Cliente (para ele ver na página dele)
    let historicoClientes = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const indexCliente = historicoClientes.findIndex(p => p.id === idPedido);
    
    if (indexCliente !== -1) {
        historicoClientes[indexCliente].status = novoStatus;
        localStorage.setItem('historicoPedidos', JSON.stringify(historicoClientes));
    }

    if(typeof mostrarToast === 'function') mostrarToast(`Pedido #${idPedido} agora está ${novoStatus}!`);
    mostrarPedidosNoAdmin(); // Recarrega a visualização
}

// Função única e segura para excluir pedidos
function removerPedido(id) {
    if(confirm("Tem certeza que deseja apagar este pedido do painel?")) {
        let pedidos = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];
        // Filtra para manter apenas os pedidos que NÃO tem o id selecionado
        pedidos = pedidos.filter(p => p.id !== id);
        
        // Salva no banco e recarrega a tela
        localStorage.setItem('pedidosPadaria', JSON.stringify(pedidos));
        mostrarPedidosNoAdmin();
    }
}

// =======================================================
// LÓGICA DA DASHBOARD DE VENDAS EM TEMPO REAL
// =======================================================
// =======================================================
// LÓGICA DA DASHBOARD DE VENDAS EM TEMPO REAL
// =======================================================
function mostrarVendasNoAdmin() {
    const gridAdmin = document.getElementById('grid-admin-produtos');
    const pedidos = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];

    // Variáveis de cálculo
    let faturamentoTotal = 0;
    let totalPedidosConcluidos = 0;
    let contagemProdutos = {};

    // 1. O motor de cálculo: Vasculha todos os pedidos reais do banco local
    pedidos.forEach(pedido => {
        // Conta apenas pedidos Finalizados ou Em produção para métricas financeiras
        if (pedido.status !== "Pendente") {
            faturamentoTotal += pedido.valorTotal;
            totalPedidosConcluidos++;

            // Conta os produtos mais vendidos
            pedido.itens.forEach(item => {
                if (!contagemProdutos[item.nome]) {
                    contagemProdutos[item.nome] = { qtd: 0, tipo: formatarQuantidadeProduto(item.nome, 1).replace(/[0-9]/g, '').trim() };
                }
                contagemProdutos[item.nome].qtd += item.quantidade;
            });
        }
    });

    // 2. Calcula Ticket Médio
    let ticketMedio = totalPedidosConcluidos > 0 ? (faturamentoTotal / totalPedidosConcluidos) : 0;

    // 3. Ordena o ranking dos Top 5 Produtos mais vendidos
    const produtosRanking = Object.entries(contagemProdutos)
        .sort((a, b) => b[1].qtd - a[1].qtd)
        .slice(0, 5); // Pega só os 5 primeiros

    let htmlRanking = '';
    produtosRanking.forEach(prod => {
        const nomeProd = prod[0];
        const dadosProd = prod[1];
        // Usa nossa função antiga para formatar kg, g ou un.
        const qtdVisual = formatarQuantidadeProduto(nomeProd, dadosProd.qtd);
        
        htmlRanking += `
            <tr>
                <td class="item-nome" style="font-size: 1.1rem; padding: 15px 0;">${nomeProd}</td>
                <td class="item-qtd" style="font-size: 1.1rem; padding: 15px 0;">${qtdVisual}</td>
            </tr>
        `;
    });

    if(htmlRanking === '') {
        htmlRanking = '<tr><td colspan="2" style="text-align:center; color:var(--cafe-claro); padding: 30px;">Nenhuma venda registrada ainda.</td></tr>';
    }

    // 4. Monta a Tela (Design Corrigido: Sem paddings duplos e largura total)
    gridAdmin.innerHTML = `
        <div style="margin-bottom: 25px;">
            <p style="color: var(--cafe-claro); font-size: 1rem;">Os dados abaixo consideram apenas pedidos <strong style="color: var(--cafe-escuro);">Finalizados</strong> ou <strong style="color: var(--cafe-escuro);">Em Produção</strong>.</p>
        </div>

        <section class="dashboard-vendas" style="padding: 0; margin-bottom: 40px;">
            <div class="metric-card">
                <h4>Faturamento Confirmado</h4>
                <div class="valor">R$ ${faturamentoTotal.toFixed(2).replace('.', ',')}</div>
            </div>
            
            <div class="metric-card" style="border-left-color: var(--cafe-escuro);">
                <h4>Pedidos Recebidos</h4>
                <div class="valor">${totalPedidosConcluidos}</div>
            </div>
            
            <div class="metric-card" style="border-left-color: #5cb85c;">
                <h4>Ticket Médio</h4>
                <div class="valor">R$ ${ticketMedio.toFixed(2).replace('.', ',')}</div>
            </div>
        </section>

        <section style="width: 100%;">
            <div class="card-admin" style="width: 100%; padding: 30px;">
                <h3 style="margin-bottom: 15px; border-bottom: 2px solid var(--creme-fundo); padding-bottom: 15px; font-size: 1.3rem;">🏆 Top 5 Produtos Mais Vendidos</h3>
                <table class="ranking-tabela">
                    ${htmlRanking}
                </table>
            </div>
        </section>
    `;
}