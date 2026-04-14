/* ================================================= */
/* CONFIGURAÇÃO DO BANCO DE DADOS                    */
/* ================================================= */
const DB_NAME = "PadariaDB_V5";
const DB_VERSION = 3; 
const SETORES_DO_BANCO = ["padaria", "acougue", "hortifruti", "mercado"];

// 1. Função para conectar ao banco (Mesma lógica do catálogo)
function conectarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => reject("Erro no DB");
        // O onupgradeneeded não é estritamente necessário aqui se o banco já foi criado pelo catalogo.js,
        // mas é bom ter para garantir a conexão correta.
        request.onsuccess = (event) => resolve(event.target.result);
    });
}

// 2. Função para buscar todos os produtos do banco
function buscarTodosProdutos(db) {
    const promessasDeBusca = SETORES_DO_BANCO.map(setor => {
        return new Promise((resolve) => {
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
            return [id, resto]; // Retorna no formato [id, {dados}]
        });
    });
}

/* ================================================= */
/* LÓGICA DE CRIAÇÃO DOS CARDS (HTML DINÂMICO)       */
/* ================================================= */

// 3. Função que desenha o HTML de um único produto
function criarCardHTML(id, produto) {
    // Capitaliza a primeira letra do setor (ex: padaria -> Padaria)
    const nomeSetor = produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1);
    
    // Configura os preços. Se tem oferta, mostra os dois.
    let precoPrincipal = produto.preco;
    let precoSecundario = "";

    if (produto.precoOferta) {
        precoPrincipal = produto.precoOferta;
        // Se tem oferta, o preço antigo fica menor e com um estilo diferente (você pode ajustar no CSS)
        precoSecundario = `<p id="texto-info" style="text-decoration: line-through;">R$ ${produto.preco}</p>`;
    }

    // Configura o botão de agendar se for retirável
    let botaoHTML = "";
    if (produto.tags && produto.tags.includes("retiravel")) {
        botaoHTML = `<a href="pagina-agendamento.html?id=${id}" class="botao-comprar" style="text-decoration: none;">Agendar</a>`;
    }

    // Retorna a estrutura HTML do article
    return `
        <article class="card-produtos">
            <img src="${produto.imagem}" alt="${produto.tituloproduto}">
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
    // Procura a div interna correta baseada no ID pai
    const container = document.querySelector(`#${idCarrossel} .carrossel-conjunto`);
    
    if (!container) return; // Se a seção não existir, ignora
    
    container.innerHTML = ""; // Limpa qualquer conteúdo antigo
    
    produtosFiltrados.forEach(([id, produto]) => {
        container.innerHTML += criarCardHTML(id, produto);
    });
}

/* ================================================= */
/* EXECUÇÃO PRINCIPAL DA LANDING PAGE                */
/* ================================================= */

async function carregarLandingPage() {
    try {
        const db = await conectarBanco();
        const todosProdutos = await buscarTodosProdutos(db);

        // --- FILTRAGEM E PREENCHIMENTO ---

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

// Inicia o processo quando a página carregar
document.addEventListener("DOMContentLoaded", carregarLandingPage);