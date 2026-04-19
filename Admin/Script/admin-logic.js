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
async function carregarSetorAdmin(setor) {
    setorAdminAtual = setor;
    document.getElementById('titulo-setor-admin').innerText = setor.charAt(0).toUpperCase() + setor.slice(1);
    
    document.querySelectorAll('.btn-circulo').forEach(btn => btn.classList.remove('ativo'));
    const btnAtivo = document.getElementById(`btn-${setor}`);
    if(btnAtivo) btnAtivo.classList.add('ativo');

    // Se clicar em pedidos, usamos a lógica do localStorage
    if (setor === 'pedidos') {
        document.querySelector('.acoes-topo').style.display = 'none'; // Esconde botão de "Novo Produto"
        mostrarPedidosNoAdmin();
    } else {
        document.querySelector('.acoes-topo').style.display = 'block';
        // Lógica normal que você já tem para carregar produtos do banco...
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

// 6. BUSCA VISUAL
function filtrarProdutosAdmin() {
    const termo = document.getElementById('busca-admin').value.toLowerCase();
    const cards = document.querySelectorAll('.card-admin');
    cards.forEach(card => {
        const titulo = card.querySelector('h3').innerText.toLowerCase();
        if(titulo.includes(termo)) card.style.display = 'flex';
        else card.style.display = 'none';
    });
}

// ENTRADA DE DADOS - PEDIDOS
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
});

function carregarPedidos() {
    // Alvo correto: a mesma grade usada para os produtos
    const gridAdmin = document.getElementById('grid-admin-produtos'); 
    const pedidos = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];

    gridAdmin.innerHTML = '';

    if (pedidos.length === 0) {
        gridAdmin.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-weight: bold; font-size: 1.2rem; color: var(--cafe-claro); padding: 40px;">Nenhum pedido recebido ainda. 🥖</p>';
        return;
    }

    pedidos.forEach(pedido => {
        // Define a cor baseada no status
        let corStatus = "var(--dourado-suave)";
        if(pedido.status === "Concluído") corStatus = "var(--cafe-escuro)";
        else if(pedido.status === "Pendente") corStatus = "var(--vermelho-alerta)";

        const card = `
            <div class="card-admin" style="${pedido.status === 'Concluído' ? 'opacity: 0.7;' : ''}">
                <button class="btn-deletar-card" onclick="removerPedido(${pedido.id})" title="Cancelar Pedido">✖</button>
                <h5>${pedido.cliente} • Retirada: ${pedido.dataRetirada || pedido.data}</h5>
                <h3>Pedido #${pedido.id}</h3>
                <div class="preco">R$ ${pedido.valor.toFixed(2).replace('.', ',')}</div>
                <p style="color: ${corStatus}; font-weight: 800; margin-bottom: 15px;">${pedido.status}</p>
                
                <button class="btn-editar-card" onclick="alert('Itens do pedido:\\n${pedido.itens.map(i => i.quantidade + 'x ' + i.nome).join('\\n')}')">Ver Detalhes</button>
            </div>
        `;
        gridAdmin.innerHTML += card;
    });
}

// Função para deletar um pedido
function removerPedido(id) {
    let pedidos = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];
    pedidos = pedidos.filter(p => p.id !== id);
    localStorage.setItem('pedidosPadaria', JSON.stringify(pedidos));
    carregarPedidos(); // Atualiza a tela
}

function mostrarPedidosNoAdmin() {
    const gridAdmin = document.getElementById('grid-admin-produtos');
    const pedidos = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];

    gridAdmin.innerHTML = '';

    if (pedidos.length === 0) {
        gridAdmin.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px;">Nenhum pedido novo por enquanto. ☕</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const card = `
            <div class="card-admin">
                <button class="btn-deletar-card" onclick="removerPedido(${pedido.id})">✖</button>
                <h5>Cliente: ${pedido.cliente}</h5>
                <p>Retirada: <strong>${pedido.dataRetirada}</strong></p>
                <h3>${pedido.quantidade}x ${pedido.produto}</h3>
                <div class="preco">Total: R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}</div>
                <p style="color: #D4AF37; font-weight: bold; margin-top: 10px;">Status: ${pedido.status}</p>
            </div>
        `;
        gridAdmin.innerHTML += card;
    });
}

// Função para você excluir pedidos da lista
function removerPedido(id) {
    if(confirm("Deseja remover este pedido da lista?")) {
        let pedidos = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];
        pedidos = pedidos.filter(p => p.id !== id);
        localStorage.setItem('pedidosPadaria', JSON.stringify(pedidos));
        mostrarPedidosNoAdmin();
    }
}
