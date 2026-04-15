/* =======================================================
   LÓGICA DA PÁGINA DE AGENDAMENTO (Unificada com o Banco)
======================================================= */

const DB_NAME = "PadariaDB_V6";
const DB_VERSION = 3;
const SETORES_DO_BANCO = ["padaria", "acougue", "hortifruti", "mercado"];

let produtoAtual = null; 
let quantidade = 1;      

// 1. Pegar o ID do produto pela URL
const urlParams = new URLSearchParams(window.location.search);
const idProduto = urlParams.get("id");

// 2. Conectar ao Banco
function conectarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = () => reject("Erro ao abrir banco de dados.");
    });
}

// 3. Procurar o Produto no IndexedDB
async function buscarProduto(id) {
    if (!id) return null;
    try {
        const db = await conectarBanco();
        for (let setor of SETORES_DO_BANCO) {
            const produto = await new Promise((resolve) => {
                if (!db.objectStoreNames.contains(setor)) return resolve(null);
                const tx = db.transaction(setor, "readonly");
                const store = tx.objectStore(setor);
                const req = store.get(id);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
            if (produto) return produto; 
        }
        return null; 
    } catch (erro) {
        console.error("Erro na busca:", erro);
        return null;
    }
}

// 4. Transformar o Preço em Número
function extrairNumeroPreco(textoPreco) {
    if (!textoPreco) return 0;
    const valor = textoPreco.toString().split('/')[0].trim().replace(',', '.');
    return parseFloat(valor);
}

// 5. RENDERIZAR A TELA (Mágica das Imagens)
async function carregarTela() {
    produtoAtual = await buscarProduto(idProduto);

    if (!produtoAtual) {
        document.getElementById('tituloproduto').innerText = "Produto não encontrado.";
        return;
    }

    // --- Textos Básicos ---
    document.getElementById('tituloproduto').innerText = produtoAtual.tituloproduto;
    document.getElementById('descricao').innerText = `Excelente escolha da nossa categoria de ${produtoAtual.setor}. Produto fresco preparado especialmente para você!`;
    
    atualizarPrecoTotal();

    // --- Lógica da Galeria de Imagens ---
    const imgPrincipal = document.getElementById('produtoimagem');
    const containerMiniaturas = document.getElementById('container-miniaturas');
    
    let listaImagens = [];
    if (produtoAtual.imagens && produtoAtual.imagens.length > 0) {
        listaImagens = produtoAtual.imagens; // Novo formato (4 a 6 fotos)
    } else if (produtoAtual.imagem) {
        // Formato antigo fallback
        let imgOld = produtoAtual.imagem;
        if(imgOld.startsWith('../../')) imgOld = './' + imgOld.substring(6);
        else if(imgOld.startsWith('./')) imgOld = '.' + imgOld; 
        listaImagens = [imgOld];
    }

    if (listaImagens.length > 0) {
        imgPrincipal.src = listaImagens[0];
        if(containerMiniaturas) {
            containerMiniaturas.innerHTML = '';
            listaImagens.forEach((fotoSrc) => {
                const imgMini = document.createElement('img');
                imgMini.src = fotoSrc;
                imgMini.alt = "Miniatura do produto";
                
                // Estilo das miniaturas
                imgMini.style.cursor = 'pointer';
                imgMini.style.width = '70px';
                imgMini.style.height = '70px';
                imgMini.style.objectFit = 'cover';
                imgMini.style.borderRadius = '8px';
                imgMini.style.border = '2px solid transparent';
                imgMini.style.transition = '0.3s';
                
                // Evento para trocar a foto principal
                imgMini.onclick = function() {
                    Array.from(containerMiniaturas.children).forEach(m => m.style.borderColor = 'transparent');
                    this.style.borderColor = 'var(--dourado-suave)';
                    imgPrincipal.src = this.src;
                };

                containerMiniaturas.appendChild(imgMini);
            });
            // Marca a primeira como ativa visualmente
            if(containerMiniaturas.firstChild) {
                containerMiniaturas.firstChild.style.borderColor = 'var(--dourado-suave)';
            }
        }
    } else {
        imgPrincipal.src = "./Imagens/Logo.png";
    }
}

// 6. Controles de Quantidade
function atualizarPrecoTotal() {
    const precoString = produtoAtual.precoOferta ? produtoAtual.precoOferta : produtoAtual.preco;
    const precoUnitario = extrairNumeroPreco(precoString);
    const total = precoUnitario * quantidade;

    document.getElementById('preço-final').innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('Qtd').innerText = quantidade;
}

document.getElementById('plus-btn').addEventListener('click', () => {
    quantidade++;
    atualizarPrecoTotal();
});

document.getElementById('ret-btn').addEventListener('click', () => {
    if (quantidade > 1) {
        quantidade--;
        atualizarPrecoTotal();
    }
});

// 7. LÓGICA DO BOTÃO DE AGENDAR (CARRINHO)
const btnAgendar    = document.getElementById("btn-agendar-final");
const containerData = document.getElementById("data-picker-container");
const inputData     = document.getElementById("data-retirada");

// Configurar a data mínima para amanhã
const amanha = new Date();
amanha.setDate(amanha.getDate() + 1);
if(inputData) inputData.min = amanha.toISOString().split("T")[0];

let etapa = "escolher-data";

btnAgendar.addEventListener("click", () => {
    if (etapa === "escolher-data") {
        containerData.style.display = "flex";
        btnAgendar.innerText = "Confirmar Agendamento";
        etapa = "confirmar";
        return;
    }

    if (etapa === "confirmar") {
        if (!localStorage.getItem("usuarioLogado")) {
            if(typeof mostrarToast === 'function') mostrarToast("Faça login para agendar!");
            else alert("Faça login para agendar!");
            return;
        }

        if (!inputData.value) {
            if(typeof mostrarToast === 'function') mostrarToast("Escolha uma data de retirada!");
            else alert("Escolha uma data de retirada!");
            return;
        }

        // Formata dd/mm/aaaa
        const [ano, mes, dia] = inputData.value.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;

        // Define a foto que vai para o carrinho
        let imagemCarrinho = "./Imagens/Logo.png";
        if (produtoAtual.imagens && produtoAtual.imagens.length > 0) imagemCarrinho = produtoAtual.imagens[0];
        else if (produtoAtual.imagem) imagemCarrinho = produtoAtual.imagem;

        // Salva no carrinho (localStorage)
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        const precoString = produtoAtual.precoOferta ? produtoAtual.precoOferta : produtoAtual.preco;
        
        carrinho.push({
            id:           idProduto,
            nome:         produtoAtual.tituloproduto,
            preco:        extrairNumeroPreco(precoString),
            quantidade:   quantidade,
            dataRetirada: dataFormatada,
            img:          imagemCarrinho
        });
        
        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        if(typeof mostrarToast === 'function') mostrarToast(`✅ ${produtoAtual.tituloproduto} adicionado ao carrinho!`);
        
        // Atualiza e abre o carrinho lateral
        if(typeof atualizarInterfaceCarrinho === 'function') atualizarInterfaceCarrinho();
        if(typeof abrirCarrinho === 'function') abrirCarrinho();

        // Reseta o botão e o input
        containerData.style.display = "none";
        inputData.value = "";
        btnAgendar.innerText = "Escolher Data";
        etapa = "escolher-data";
    }
});

// Inicializa tudo quando a página carregar
document.addEventListener("DOMContentLoaded", carregarTela);

// ENTRADA DE DADOS - PEDIDOS
// Exemplo de função para finalizar o pedido
function finalizarPedido(dadosCliente, itensSelecionados) {
    // 1. Criar o objeto do pedido
    const novoPedido = {
        id: Math.floor(1000 + Math.random() * 9000), // Gera um ID aleatório
        cliente: dadosCliente.nome,
        data: new Date().toLocaleDateString('pt-BR'),
        valor: calcularTotal(itensSelecionados),
        status: "Pendente",
        itens: itensSelecionados
    };

    // 2. Buscar pedidos existentes ou criar lista vazia
    const pedidosAtuais = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];

    // 3. Adicionar o novo pedido à lista
    pedidosAtuais.push(novoPedido);

    // 4. Salvar de volta no localStorage
    localStorage.setItem('pedidosPadaria', JSON.stringify(pedidosAtuais));

    // 5. Redirecionar para o admin (como você solicitou)
    window.location.href = 'index-admin.html';
}