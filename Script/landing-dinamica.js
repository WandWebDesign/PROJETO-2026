const DB_NAME = "PadariaDB_V6";
const DB_VERSION = 3; 
const SETORES_DO_BANCO = ["padaria", "acougue", "hortifruti", "mercado"];

// 1. Conecta ao IndexedDB E CRIA AS TABELAS (O que faltava!)
function conectarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        // MÁGICA AQUI: Se for a primeira vez ou se a versão mudar, cria as pastas!
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            SETORES_DO_BANCO.forEach(setor => {
                if (!db.objectStoreNames.contains(setor)) {
                    db.createObjectStore(setor);
                    console.log(`Pasta/Tabela '${setor}' criada com sucesso!`);
                }
            });
        };

        request.onerror = () => reject("Erro no DB");
        request.onsuccess = (event) => resolve(event.target.result);
    });
}

// 2. Busca todos os produtos via Cursor
function buscarTodosProdutos(db) {
    const promessasDeBusca = SETORES_DO_BANCO.map(setor => {
        return new Promise((resolve) => {
            if (!db.objectStoreNames.contains(setor)) {
                resolve([]);
                return;
            }
            const transaction = db.transaction([setor], "readonly");
            const store = transaction.objectStore(setor);
            const request = store.openCursor();
            const produtosDoSetor = [];
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    produtosDoSetor.push([cursor.key, cursor.value]);
                    cursor.continue();
                } else {
                    resolve(produtosDoSetor);
                }
            };
            request.onerror = () => resolve([]); 
        });
    });

    return Promise.all(promessasDeBusca).then(resultados => resultados.flat());
}

// 3. AUTO-SEEDER: Povoa o banco se for o primeiro acesso
async function verificarEPreencherBanco(db, todosProdutos) {
    // Se o banco já tiver produtos, não faz nada
    if (todosProdutos.length > 0) return todosProdutos;

    // Se o banco estiver vazio, puxa os produtos do catalogo.js
    if (typeof produtosIniciais !== 'undefined') {
        console.log("Banco Vazio! Iniciando população automática...");
        
        for (const [id, produto] of Object.entries(produtosIniciais)) {
            const setor = produto.setor;
            if (db.objectStoreNames.contains(setor)) {
                const tx = db.transaction([setor], "readwrite");
                const store = tx.objectStore(setor);
                
                await new Promise((resolve) => {
                    const req = store.put(produto, id);
                    req.onsuccess = resolve;
                    req.onerror = resolve; 
                });
            }
        }
        
        console.log("Banco preenchido com sucesso com os dados do catálogo!");
        // Busca novamente agora que o banco está cheio
        return await buscarTodosProdutos(db);
    }
    
    return [];
}

// 4. Cria o HTML do Card
function criarCardHTML(id, produto, idCarrossel) {
    const nomeSetor = produto.setor ? produto.setor.charAt(0).toUpperCase() + produto.setor.slice(1) : 'Sem Setor';
    let precoPrincipal = produto.preco || "0,00";
    let precoSecundario = "";

    if (produto.precoOferta) {
        precoPrincipal = produto.precoOferta;
        precoSecundario = `<p id="texto-info" style="text-decoration: line-through;">R$ ${produto.preco}</p>`;
    }

    let imagemSrc = "./Imagens/Logo.png"; 
    let imgTemp = (produto.imagens && produto.imagens.length > 0) ? produto.imagens[0] : produto.imagem;

    if (imgTemp) {
        imagemSrc = imgTemp.startsWith('../../') ? './' + imgTemp.substring(6) : imgTemp;
    }

    let botaoHTML = "";
    if (produto.tags && produto.tags.includes("retiravel") && idCarrossel === "carrossel-peça-e-retire") {
        botaoHTML = `<a href="pagina-agendamento.html?id=${id}" class="botao-comprar" style="text-decoration: none;">Adicionar</a>`;
    }

    return `
        <article class="card-produtos">
            <img src="${imagemSrc}" alt="${produto.tituloproduto || 'Produto'}">
            <h4>${produto.tituloproduto || 'Produto'}</h4>
            <h5>${nomeSetor}</h5>
            <p id="texto-preço">R$ ${precoPrincipal}</p>
            ${precoSecundario}
            ${botaoHTML}
        </article>
    `;
}

// 5. Injeta no Carrossel
function popularCarrossel(idCarrossel, produtosFiltrados) {
    const container = document.querySelector(`#${idCarrossel} .carrossel-conjunto`);
    if (!container) return; 
    
    container.innerHTML = ""; 
    if(produtosFiltrados.length === 0) {
        container.innerHTML = `<p style="padding: 20px; color: #666;">Nenhum produto cadastrado.</p>`;
        return;
    }

    produtosFiltrados.forEach(([id, produto]) => {
        container.innerHTML += criarCardHTML(id, produto, idCarrossel);
    });
}

// 6. Execução Principal
async function carregarLandingPage() {
    try {
        const db = await conectarBanco();
        let todosProdutos = await buscarTodosProdutos(db);
        
        todosProdutos = await verificarEPreencherBanco(db, todosProdutos);

        popularCarrossel("carrossel-peça-e-retire", todosProdutos.filter(([id, p]) => p.tags && p.tags.includes("retiravel")));
        popularCarrossel("carrossel-ofertas", todosProdutos.filter(([id, p]) => p.tags && p.tags.includes("oferta")));
        popularCarrossel("carrossel-padaria", todosProdutos.filter(([id, p]) => p.setor === "padaria"));
        popularCarrossel("carrossel-açougue", todosProdutos.filter(([id, p]) => p.setor === "acougue"));
        popularCarrossel("carrossel-hortifruti", todosProdutos.filter(([id, p]) => p.setor === "hortifruti"));
        popularCarrossel("carrossel-mercado", todosProdutos.filter(([id, p]) => p.setor === "mercado"));

    } catch (erro) {
        console.error("Erro na Landing Page:", erro);
    }
}

document.addEventListener("DOMContentLoaded", carregarLandingPage);