/* =======================================================
   LÓGICA DA PÁGINA DE AGENDAMENTO (Simplificada)
   - Escolha de quantidade e adição direta ao carrinho
   - O agendamento de data/hora é feito na página de checkout
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
            if (!db.objectStoreNames.contains(setor)) continue;
            
            const tx = db.transaction([setor], "readonly");
            const store = tx.objectStore(setor);
            
            const produtoEncontrado = await new Promise((resolve) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });

            if (produtoEncontrado) {
                return produtoEncontrado;
            }
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar no IndexedDB:", error);
        return null;
    }
}

// 4. Transformar o Preço em Número
function extrairNumeroPreco(textoPreco) {
    if (!textoPreco) return 0;
    const valor = textoPreco.toString().split('/')[0].trim().replace(',', '.');
    return parseFloat(valor);
}

// 5. Renderizar a Tela
async function carregarTela() {
    produtoAtual = await buscarProduto(idProduto);

    if (!produtoAtual) {
        document.getElementById('tituloproduto').innerText = "Produto não encontrado.";
        return;
    }

    document.getElementById('tituloproduto').innerText = produtoAtual.tituloproduto;
    document.getElementById('descricao').innerText = `Excelente escolha da nossa categoria de ${produtoAtual.setor}. Produto fresco preparado especialmente para você!`;
    
    atualizarPrecoTotal();

    const imgPrincipal = document.getElementById('produtoimagem');
    const containerMiniaturas = document.getElementById('container-miniaturas');
    
    let listaImagensBrutas = [];
    
    if (produtoAtual.imagens && Array.isArray(produtoAtual.imagens) && produtoAtual.imagens.length > 0) {
        listaImagensBrutas = produtoAtual.imagens; 
    } else if (produtoAtual.imagem) {
        listaImagensBrutas = [produtoAtual.imagem];
    }

    let listaImagensCorrigidas = listaImagensBrutas.map(imgTemp => {
        if (imgTemp && imgTemp.startsWith('../../')) {
            return './' + imgTemp.substring(6);
        }
        return imgTemp;
    });

    if (listaImagensCorrigidas.length > 0) {
        if (imgPrincipal) imgPrincipal.src = listaImagensCorrigidas[0];
        
        if(containerMiniaturas) {
            containerMiniaturas.innerHTML = '';
            listaImagensCorrigidas.forEach((fotoSrc) => {
                const imgMini = document.createElement('img');
                imgMini.src = fotoSrc;
                imgMini.alt = "Miniatura do produto";
                imgMini.style.cursor = 'pointer';
                imgMini.style.width = '70px';
                imgMini.style.height = '70px';
                imgMini.style.objectFit = 'cover';
                imgMini.style.borderRadius = '8px';
                imgMini.style.border = '2px solid transparent';
                imgMini.style.transition = '0.3s';
                
                imgMini.onclick = function() {
                    Array.from(containerMiniaturas.children).forEach(m => m.style.borderColor = 'transparent');
                    this.style.borderColor = 'var(--dourado-suave)';
                    if (imgPrincipal) imgPrincipal.src = this.src;
                };

                containerMiniaturas.appendChild(imgMini);
            });
            if(containerMiniaturas.firstChild) {
                containerMiniaturas.firstChild.style.borderColor = 'var(--dourado-suave)';
            }
        }
    } else {
        if (imgPrincipal) imgPrincipal.src = "./Imagens/Logo.png";
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

// 7. BOTÃO ADICIONAR AO CARRINHO (direto, sem data)
const btnAdicionar = document.getElementById("btn-adicionar-carrinho");

btnAdicionar.addEventListener("click", () => {
    const nomeClienteLogado = localStorage.getItem("usuarioLogado");

    if (!nomeClienteLogado) {
        mostrarToast("Por favor, faça login para adicionar itens ao carrinho!");
        return;
    }

    if (!produtoAtual) {
        mostrarToast("Erro: produto não carregado.");
        return;
    }

    const precoAtual = produtoAtual.precoOferta ? produtoAtual.precoOferta : produtoAtual.preco;
    
    const itemParaCarrinho = {
        id: produtoAtual.id || Math.floor(1000 + Math.random() * 9000),
        nome: produtoAtual.tituloproduto,
        preco: extrairNumeroPreco(precoAtual),
        quantidade: quantidade,
        dataRetirada: null,  // Será definido na página de checkout
        horaRetirada: null   // Será definido na página de checkout
    };

    let carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinhoAtual.push(itemParaCarrinho);
    localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));

    mostrarToast(`✅ ${produtoAtual.tituloproduto} adicionado! Agende a retirada no carrinho.`);

    abrirCarrinho(); 
});

// Inicializa a tela ao carregar
document.addEventListener("DOMContentLoaded", carregarTela);