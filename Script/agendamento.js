document.addEventListener("DOMContentLoaded", () => {
    // 1. Pega o ID do produto da URL (Ex: ?id=pãofrances)
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');

    // 2. Banco de dados com a NOVA LÓGICA DE PREÇOS (Unidade, 100g e Fatias)
    const produtos = {
        "pãofrances": { nome: "Pão Francês", preco: 0.80, desc: "Pão quentinho, feito na hora! Preço por Unidade.", img: "./Imagens/PãoFrances.webp" },
        "coxinhadefrango": { nome: "Coxinha de Frango", preco: 8.50, desc: "Salgado frito na hora. Preço por unidade.", img: "./Imagens/Coxinha de Frango .webp" },
        "pãodequeijo": { nome: "Pão de Queijo", preco: 3.00, desc: "Tradicional de Minas. Preço por unidade.", img: "./Imagens/Pão de Queijo .webp" },
        "esfirradecarne": { nome: "Esfiha de Carne", preco: 8.50, desc: "Massa macia e recheio de carne temperada. Preço por unidade.", img: "./Imagens/Esfirra de Carne.webp" },
        
        // Produtos Frios (Preço a cada 100g)
        "mussarela": { nome: "Mussarela Fatiada", preco: 5.99, desc: "Queijo mussarela fatiado fino. (Quantidade 1 = 100g)", img: "./Imagens/Mussarela.webp" },
        "mortandela": { nome: "Mortadela Fatiada", preco: 4.49, desc: "Mortadela fresca. (Quantidade 1 = 100g)", img: "./Imagens/Mortandela.webp" },
        "presunto": { nome: "Presunto Fatiado", preco: 5.49, desc: "Presunto magro fatiado. (Quantidade 1 = 100g)", img: "./Imagens/Presunto.webp" },
        
        // Bolos (Preço por fatia)
        "bolodefuba": { nome: "Bolo de Fubá", preco: 7.50, desc: "Bolo caseiro da vovó. Preço por fatia.", img: "./Imagens/Bolo de fubá.webp" },
        "bolodemilho": { nome: "Bolo de Milho", preco: 7.50, desc: "Bolo cremoso de milho. Preço por fatia.", img: "./Imagens/Bolo de Milho.webp" }
    };

    const produtoAtual = produtos[produtoId];
    let quantidade = 1;

    // 3. Preencher a tela com as informações do produto correto
    if (produtoAtual) {
        document.getElementById("tituloproduto").innerText = produtoAtual.nome;
        document.getElementById("descricao").innerText = produtoAtual.desc;
        document.getElementById("produtoimagem").src = produtoAtual.img;
        atualizarPrecoFinal();
    } else {
        document.getElementById("tituloproduto").innerText = "Produto não encontrado";
    }

    // 4. Lógica dos Botões de + e -
    const btnMais = document.getElementById("plus-btn");
    const btnMenos = document.getElementById("ret-btn");
    const displayQuantidade = document.getElementById("Qtd");

    btnMais.addEventListener("click", () => {
        quantidade++;
        displayQuantidade.innerText = quantidade;
        atualizarPrecoFinal();
    });

    minusButton.addEventListener('click', () => {
        if (quantidadeAtual > 1) {
            quantidadeAtual--;
            atualizarPrecoNaTela();
        }
    });

    atualizarPrecoNaTela();
}

/* ================================================= */
/* 5. FLUXO DE AGENDAMENTO E VALIDAÇÃO DE LOGIN      */
/* ================================================= */

const btnAgendar = document.getElementById('btn-agendar-final');
const dataContainer = document.getElementById('data-picker-container');
const dataInput = document.getElementById('data-retirada');

document.addEventListener('DOMContentLoaded', () => {
    if(dataInput) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        dataInput.min = `${ano}-${mes}-${dia}`;
    }
});

if (btnAgendar) {
    btnAgendar.addEventListener('click', () => {
        if (!produtoSelecionado) return; 

        // --- VALIDAÇÃO DE LOGIN ---
        const estaLogado = localStorage.getItem('usuarioLogado');

        if (!estaLogado) {
            if(typeof mostrarToast === 'function') {
                mostrarToast('Atenção! Você precisa estar logado para agendar um produto.');
            } else {
                alert('Você precisa estar logado para agendar um produto.');
            }

            setTimeout(() => {
                window.location.href = 'padaria-login.html';
            }, 2000);
            return; 
        }

        // --- SE LOGADO, CONTINUA O PROCESSO ---
        const dataVisivel = dataContainer.style.display === 'block';

        if (dataVisivel) {
            // ETAPA 2: VALIDAR DATA E ENVIAR AO CARRINHO
            if (!dataInput.value) {
                if(typeof mostrarToast === 'function') mostrarToast('Por favor, escolha a data de retirada.');
                else alert('Por favor, escolha a data de retirada.');
                return;
            }
            
            const dataEscolhida = new Date(dataInput.value + "T00:00:00"); 
            const dataDeHoje = new Date();
            dataDeHoje.setHours(0, 0, 0, 0); 

            if (dataEscolhida < dataDeHoje) {
                if(typeof mostrarToast === 'function') mostrarToast('Ops! Não é possível agendar para dias que já passaram.');
                else alert('Ops! Não é possível agendar para dias que já passaram.');
                dataInput.value = ''; 
                return; 
            }

            const dataFormatada = dataInput.value.split('-').reverse().join('/');
            const nomeProduto = document.getElementById('tituloproduto').innerText;

            let carrinhoGlobal = JSON.parse(localStorage.getItem('carrinho')) || [];
            carrinhoGlobal.push({ 
                nome: nomeProduto, 
                preco: precoUnitarioAtual,
                quantidade: quantidadeAtual,
                dataRetirada: dataFormatada 
            });
            
            localStorage.setItem('carrinho', JSON.stringify(carrinhoGlobal));
            
            if(typeof atualizarInterfaceCarrinho === 'function') {
                atualizarInterfaceCarrinho();
                abrirCarrinho();
            }

            // Reseta para um novo agendamento
            dataContainer.style.display = 'none';
            btnAgendar.innerText = 'Escolher Data';
            dataInput.value = '';
            quantidadeAtual = 1;
            atualizarPrecoNaTela();

        } else {
            // ETAPA 1: MOSTRAR SELETOR DE DATA
            dataContainer.style.display = 'block';
            btnAgendar.innerText = 'Adicionar ao Carrinho';
        }
    }
});

/* =======================================================
   LÓGICA DA PÁGINA DE AGENDAMENTO (Produto Único)
======================================================= */

const DB_NAME = "PadariaDB_V5";
const DB_VERSION = 3;
const SETORES_DO_BANCO = ["padaria", "acougue", "hortifruti", "mercado"];

let produtoAtual = null; // Vai guardar os dados do produto encontrado
let quantidade = 1;      // Quantidade selecionada

// 1. Pegar o ID do produto pela URL (ex: pagina-agendamento.html?id=bolodefuba)
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

// 3. Procurar o Produto em todos os setores
async function buscarProduto(id) {
    if (!id) return null;

    try {
        const db = await conectarBanco();
        for (let setor of SETORES_DO_BANCO) {
            const produto = await new Promise((resolve) => {
                const tx = db.transaction(setor, "readonly");
                const store = tx.objectStore(setor);
                const req = store.get(id);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });

            if (produto) return produto; // Se encontrou, devolve logo
        }
        return null; // Não encontrou em nenhum setor
    } catch (erro) {
        console.error(erro);
        return null;
    }
}

// 4. Transformar o Preço (Ex: "15,90 / Kg" -> 15.90) para matemática
function extrairNumeroPreco(textoPreco) {
    if (!textoPreco) return 0;
    // Pega só a parte do número antes da barra, tira vírgula e põe ponto
    const valor = textoPreco.split('/')[0].trim().replace(',', '.');
    return parseFloat(valor);
}

// 5. Renderizar os dados na tela (E a Mágica das Imagens!)
async function carregarTela() {
    produtoAtual = await buscarProduto(idProduto);

    if (!produtoAtual) {
        document.getElementById('tituloproduto').innerText = "Produto não encontrado.";
        return;
    }

    // --- TEXTOS E PREÇOS ---
    document.getElementById('tituloproduto').innerText = produtoAtual.tituloproduto;
    document.getElementById('descricao').innerText = `Excelente escolha da nossa categoria de ${produtoAtual.setor}. Produto fresco e de alta qualidade preparado especialmente para você.`;
    
    atualizarPrecoTotal();

    // --- LÓGICA DA GALERIA DE IMAGENS ---
    const imgPrincipal = document.getElementById('produtoimagem');
    const containerMiniaturas = document.getElementById('container-miniaturas');
    
    // Define a lista de imagens (Suporta o array novo ou o formato velho)
    let listaImagens = [];
    if (produtoAtual.imagens && produtoAtual.imagens.length > 0) {
        listaImagens = produtoAtual.imagens; // Novo formato do admin (4 a 6 fotos)
    } else if (produtoAtual.imagem) {
        // Correção de caminho caso seja um produto velho do catalogo.js
        let imgOld = produtoAtual.imagem;
        if(imgOld.startsWith('./')) imgOld = '.' + imgOld; // ajusta path relativo se necessário
        listaImagens = [imgOld];
    }

    // Se tivermos imagens, preenchemos o HTML
    if (listaImagens.length > 0) {
        // Coloca a primeira foto no quadro principal
        imgPrincipal.src = listaImagens[0];

        // Limpa o contentor de miniaturas
        containerMiniaturas.innerHTML = '';

        // Cria uma miniatura para CADA imagem do array
        listaImagens.forEach((fotoBase64) => {
            const imgMini = document.createElement('img');
            imgMini.src = fotoBase64;
            imgMini.alt = "Miniatura do produto";
            
            // Um pouco de estilo para ficar com cara de clicável
            imgMini.style.cursor = 'pointer';
            imgMini.style.width = '70px';
            imgMini.style.height = '70px';
            imgMini.style.objectFit = 'cover';
            imgMini.style.borderRadius = '8px';
            imgMini.style.border = '2px solid transparent';
            
            // O EVENTO DE CLIQUE: Ao clicar na miniatura, a foto principal muda!
            imgMini.onclick = function() {
                // Remove a borda das outras miniaturas para destacar a ativa (opcional)
                Array.from(containerMiniaturas.children).forEach(m => m.style.borderColor = 'transparent');
                this.style.borderColor = 'var(--dourado-suave)'; // Ou cor da sua paleta
                
                // Muda a foto grande
                imgPrincipal.src = this.src;
            };

            containerMiniaturas.appendChild(imgMini);
        });
    } else {
        // Imagem genérica se não houver foto
        imgPrincipal.src = "./Imagens/Logo.png";
    }
}

// 6. Controles de Quantidade
function atualizarPrecoTotal() {
    const precoString = produtoAtual.precoOferta ? produtoAtual.precoOferta : produtoAtual.preco;
    const precoUnitario = extrairNumeroPreco(precoString);
    const total = precoUnitario * quantidade;

    // Formata de volta para Moeda BR (Ex: R$ 31,80)
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

// Inicializa o processo
document.addEventListener("DOMContentLoaded", carregarTela);

