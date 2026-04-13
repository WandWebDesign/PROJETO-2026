/* =======================================================
   LÓGICA ADMINISTRATIVA DO CRUD (IndexedDB)
======================================================= */

const DB_NAME = "PadariaDB_V5";
let setorAdminAtual = 'padaria'; // Começa mostrando a padaria

// Inicia a tela
document.addEventListener('DOMContentLoaded', () => {
    carregarSetorAdmin(setorAdminAtual);
});

// 1. CONEXÃO COM O BANCO (Reutilizada do cliente)
function abrirBancoAdmin() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME);
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = () => reject("Erro ao acessar banco de dados.");
    });
}

// 2. LER (R do CRUD) - Carrega a grade
async function carregarSetorAdmin(setor) {
    setorAdminAtual = setor;
    document.getElementById('titulo-setor-admin').innerText = setor;
    
    // Atualiza botões laterais (CSS)
    document.querySelectorAll('.btn-circulo').forEach(btn => btn.classList.remove('ativo'));
    document.getElementById(`btn-${setor}`).classList.add('ativo');

    try {
        const db = await abrirBancoAdmin();
        if (!db.objectStoreNames.contains(setor)) return;

        const tx = db.transaction(setor, 'readonly');
        const store = tx.objectStore(setor);
        const req = store.getAll();

        req.onsuccess = () => {
            const produtos = req.result;
            desenharGradeAdmin(produtos);
        };
    } catch (erro) {
        console.error(erro);
    }
}

// Localize esta função no seu admin-logic.js
function desenharGradeAdmin(produtos) {
    const grid = document.getElementById('grid-admin-produtos');
    grid.innerHTML = '';

    if (produtos.length === 0) {
        grid.innerHTML = '<p>Nenhum produto neste setor.</p>';
        return;
    }

    produtos.forEach(prod => {
        const precoDisplay = prod.precoOferta ? prod.precoOferta : prod.preco;
        
        // --- CORREÇÃO DE CAMINHO ADICIONADA AQUI ---
        // Se a imagem começa com "./", ela foi feita para a raiz. 
        // Adicionamos "../../" para que o HTML em Admin/HTML encontre-a.
        let caminhoImagem = prod.imagem;
        if (caminhoImagem.startsWith('./')) {
            caminhoImagem = '../../' + caminhoImagem.substring(2);
        }
        // -------------------------------------------

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

// 3. EXCLUIR (D do CRUD)
async function apagarProduto(idProduto, setorProduto) {
    if (!confirm("Tem certeza que deseja APAGAR este produto permanentemente?")) return;

    try {
        const db = await abrirBancoAdmin();
        const tx = db.transaction(setorProduto, 'readwrite');
        const store = tx.objectStore(setorProduto);
        
        store.delete(idProduto);

        tx.oncomplete = () => {
            if(typeof mostrarToast === 'function') mostrarToast("Produto excluído!");
            carregarSetorAdmin(setorProduto); // Recarrega a tela
        };
    } catch (erro) {
        alert("Erro ao excluir produto.");
    }
}

// 4. MODAL E SALVAMENTO (C e U do CRUD)
function abrirModalProduto() {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').disabled = false; // Permite digitar novo ID
    document.getElementById('prod-id-original').value = ""; // Limpa referência antiga
    document.getElementById('modal-titulo').innerText = "Adicionar Novo Produto";
    
    // Trava o setor para o que estamos a ver agora
    document.getElementById('prod-setor').value = setorAdminAtual; 
    
    document.getElementById('modal-produto').style.display = 'flex';
}

function abrirModalEditar(jsonProdutoCodificado) {
    const prod = JSON.parse(decodeURIComponent(jsonProdutoCodificado));
    
    // Preenche o formulário com os dados do banco
    document.getElementById('modal-titulo').innerText = "Editar Produto";
    document.getElementById('prod-id-original').value = prod.id; 
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-id').disabled = true; // Não deixamos mudar a chave (ID)
    
    document.getElementById('prod-setor').value = prod.setor;
    document.getElementById('prod-titulo').value = prod.tituloproduto;
    document.getElementById('prod-preco').value = prod.preco;
    document.getElementById('prod-oferta').value = prod.precoOferta || "";
    document.getElementById('prod-imagem').value = prod.imagem;
    
    document.getElementById('prod-tag-retiravel').checked = prod.tags && prod.tags.includes('retiravel');
    document.getElementById('prod-tag-oferta').checked = prod.tags && prod.tags.includes('oferta');

    document.getElementById('modal-produto').style.display = 'flex';
}

function fecharModalProduto() {
    document.getElementById('modal-produto').style.display = 'none';
}

// 5. CRIAR e ATUALIZAR
async function salvarProduto() {
    // 5.1 Pegar dados do form
    const id = document.getElementById('prod-id').value.trim().toLowerCase().replace(/\s+/g, '');
    const idOriginal = document.getElementById('prod-id-original').value;
    const setor = document.getElementById('prod-setor').value;
    const titulo = document.getElementById('prod-titulo').value;
    const preco = document.getElementById('prod-preco').value;
    const oferta = document.getElementById('prod-oferta').value;
    const imagem = document.getElementById('prod-imagem').value;
    
    if(!id || !titulo || !preco || !imagem) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    // Processa as tags
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
        imagem: imagem,
        tags: tagsAtivas
    };

    try {
        const db = await abrirBancoAdmin();
        const tx = db.transaction(setor, 'readwrite');
        const store = tx.objectStore(setor);

        // Se for um novo ID (Adicionando), garantimos que ele existe.
        // Se for edição, o put() substitui o que lá está usando o mesmo ID.
        store.put(objetoProduto);

        tx.oncomplete = () => {
            fecharModalProduto();
            if(typeof mostrarToast === 'function') mostrarToast("Produto salvo com sucesso!");
            carregarSetorAdmin(setor); // Recarrega a tela do setor atual
        };
    } catch (erro) {
        alert("Erro ao salvar no banco de dados.");
    }
}

// Simples busca visual na tabela
function filtrarProdutosAdmin() {
    const termo = document.getElementById('busca-admin').value.toLowerCase();
    const cards = document.querySelectorAll('.card-admin');
    cards.forEach(card => {
        const titulo = card.querySelector('h3').innerText.toLowerCase();
        if(titulo.includes(termo)) card.style.display = 'flex';
        else card.style.display = 'none';
    });
}