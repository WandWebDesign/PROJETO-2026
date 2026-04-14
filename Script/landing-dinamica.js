/* ================================================= */
/* CONFIGURAÇÃO DO BANCO DE DADOS                    */
/* ================================================= */
const DB_NAME = "PadariaDB_V5";
const DB_VERSION = 3; // CORREÇÃO 1: Atualizado para a versão 3!
const SETORES_DO_BANCO = ["padaria", "acougue", "hortifruti", "mercado"];

// 1. Função para conectar ao banco
function conectarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => reject("Erro no DB");
        request.onsuccess = (event) => resolve(event.target.result);
    });
}

// 2. Função para buscar todos os produtos do banco
function buscarTodosProdutos(db) {
    const promessasDeBusca = SETORES_DO_BANCO.map(setor => {
        return new Promise((resolve) => {
            if (!db.objectStoreNames.contains(setor)) {
                resolve([]);
                return;
            }
            const transaction = db.transaction([setor], "readonly");
            const store = transaction.objectStore(setor);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]); 
        });
    });

    return Promise.all(promessasDeBusca).then(resultados => {
        const todosProdutosJuntos = resultados.flat();
        return todosProdutosJuntos.map(item => {
            const { id, ...resto } = item;
            return [id, resto]; 
        });
    });
}

/* ================================================= */
/* LÓGICA DE CRIAÇÃO DOS CARDS (HTML DINÂMICO)       */
/* ================================================= */

// 3. Função que desenha o HTML de um único produto
function criarCardHTML(id, produto, idCarrossel) {
    const nomeSetor = produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1);
    
    // Configura os preços
    let precoPrincipal = produto.preco;
    let precoSecundario = "";

    if (produto.precoOferta) {
        precoPrincipal = produto.precoOferta;
        precoSecundario = `<p id="texto-info" style="text-decoration: line-through;">R$ ${produto.preco}</p>`;
    }

    // Lógica inteligente para as imagens
    let imagemSrc = "./Imagens/Logo.png"; 
    if (produto.imagens && produto.imagens.length > 0) {
        imagemSrc = produto.imagens[0]; 
    } else if (produto.imagem) {
        imagemSrc = produto.imagem; 
        if (imagemSrc.startsWith('../../')) {
            imagemSrc = './' + imagemSrc.substring(6);
        }
    }

    // Configura o botão de agendar
    let botaoHTML = "";
    
    // O botão só será criado SE o produto for retirável E a seção atual for a de "Peça e Retire"
    if (produto.tags && produto.tags.includes("retiravel") && idCarrossel === "carrossel-peça-e-retire") {
        botaoHTML = `<a href="pagina-agendamento.html?id=${id}" class="botao-comprar" style="text-decoration: none;">Agendar</a>`;
    }

    return `
        <article class="card-produtos">
            <img src="${imagemSrc}" alt="${produto.tituloproduto}">
            <h4>${produto.tituloproduto}</h4>
            <h5>${nomeSetor}</h5>
            <p id="texto-preço">R$ ${precoPrincipal}</p>
            ${precoSecundario}
            ${botaoHTML}
        </article>
    `;
}

// 4. Função para injetar os produtos no carrossel correto
function popularCarrossel(idCarrossel, produtosFiltrados) {
    const container = document.querySelector(`#${idCarrossel} .carrossel-conjunto`);
    
    if (!container) return; 
    
    container.innerHTML = ""; 
    
    produtosFiltrados.forEach(([id, produto]) => {
        // PASSAMOS O idCarrossel PARA A FUNÇÃO CRIAR O CARD SABER ONDE ESTÁ
        container.innerHTML += criarCardHTML(id, produto, idCarrossel);
    });
}

/* ================================================= */
/* EXECUÇÃO PRINCIPAL DA LANDING PAGE                */
/* ================================================= */

async function carregarLandingPage() {
    try {
        const db = await conectarBanco();
        const todosProdutos = await buscarTodosProdutos(db);

        // 1. Peça e Retire (Tag: retiravel)
        const produtosRetiraveis = todosProdutos.filter(([id, prod]) => prod.tags && prod.tags.includes("retiravel"));
        popularCarrossel("carrossel-peça-e-retire", produtosRetiraveis);

        // 2. Ofertas (Tag: oferta)
        const produtosOferta = todosProdutos.filter(([id, prod]) => prod.tags && prod.tags.includes("oferta"));
        popularCarrossel("carrossel-ofertas", produtosOferta);

        // 3. Setor: Padaria
        const produtosPadaria = todosProdutos.filter(([id, prod]) => prod.setor === "padaria");
        popularCarrossel("carrossel-padaria", produtosPadaria);

        // 4. Setor: Açougue
        const produtosAcougue = todosProdutos.filter(([id, prod]) => prod.setor === "acougue");
        popularCarrossel("carrossel-açougue", produtosAcougue);

        // 5. Setor: Hortifruti
        const produtosHortifruti = todosProdutos.filter(([id, prod]) => prod.setor === "hortifruti");
        popularCarrossel("carrossel-hortifruti", produtosHortifruti);

        // 6. Setor: Mercado
        const produtosMercado = todosProdutos.filter(([id, prod]) => prod.setor === "mercado");
        popularCarrossel("carrossel-mercado", produtosMercado);

    } catch (erro) {
        console.error("Erro ao carregar produtos na Landing Page:", erro);
    }
}

document.addEventListener("DOMContentLoaded", carregarLandingPage);