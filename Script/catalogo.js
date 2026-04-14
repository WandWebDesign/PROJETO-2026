/* ================================================= */
/* 1. DADOS INICIAIS (SEED) E CONFIGURAÇÃO           */
/* ================================================= */

const urlParams = new URLSearchParams(window.location.search);
const setorAtual = urlParams.get("setor");   
const filtroAtual = urlParams.get("filtro"); 

const SETORES_DO_BANCO =["padaria", "acougue", "hortifruti", "mercado"];

// Lista de produtos com as tags corretas e LOGICA DE PREÇOS ATUALIZADA (Unidade, Fatias e 100g)
const produtosIniciais = {
    // --- PADARIA ---
    pãofrances: {
        tituloproduto: "Pão Francês",
        imagem: "./Imagens/PãoFrances.webp", 
        preco: "0,80 / Un",
        precoOferta: "0,70 / Un",
        setor: "padaria", 
        tags: ["oferta", "retiravel"],
    },
    pãodequeijo: {
        tituloproduto: "Pão de Queijo",
        imagem: "./Imagens/Pão de Queijo .webp", 
        preco: "3,00 / Un",
        precoOferta: null,
        setor: "padaria", 
        tags: ["retiravel"] 
    },
    coxinhadefrango: {
        tituloproduto: "Coxinha de Frango",
        imagem: "./Imagens/Coxinha de Frango .webp",
        preco: "8,50 / Un",
        precoOferta: null,
        setor: "padaria", 
        tags: ["retiravel"] 
    },
    pãodeleite: {
        tituloproduto: "Pão de Leite",
        imagem: "./Imagens/Pão de Leite .webp", 
        preco: "1,50 / Un",
        precoOferta: null,
        setor: "padaria", 
        tags: ["retiravel"]
    },
    esfirradecarne: {
        tituloproduto: "Esfirra de Carne",
        imagem: "./Imagens/Esfirra de Carne.webp",
        preco: "8,50 / Un",
        precoOferta: null,
        setor: "padaria", 
        tags: ["retiravel"]
    },
    bolodefuba: {
        tituloproduto: "Bolo de Fubá",
        imagem: "./Imagens/Bolo de fubá.webp",
        preco: "7,50 / Fatia",
        precoOferta: null,
        setor: "padaria", 
        tags: ["retiravel"] 
    },
    bolodemilho: {
        tituloproduto: "Bolo de Milho",
        imagem: "./Imagens/Bolo de Milho.webp", 
        preco: "7,50 / Fatia",
        precoOferta: null,
        setor: "padaria", 
        tags: ["retiravel"]
    },
    mistoquente: {
        tituloproduto: "Misto Quente",
        imagem: "./Imagens/MistoQuente.jpg",
        preco: "7,00 / Un",
        precoOferta: null,
        setor: "padaria", 
        tags: null
    },
     sonhodecreme: {
        tituloproduto: "Sonho de Creme",
        imagem: "./Imagens/Sonho de Creme.webp",
        preco: "7,50 / Un",
        precoOferta: null,
        setor: "padaria", 
        tags: null
    },
    tortadefrango: {
        tituloproduto: "Torta de Frango",
        imagem: "./Imagens/TortaDefrango.webp",
        preco: "8,90 / Fatia",
        precoOferta: null,
        setor: "padaria", 
        tags: null
    },

    // --- AÇOUGUE / FRIOS ---
    mussarela: {
        tituloproduto: "Mussarela",
        imagem: "./Imagens/Mussarela.webp",
        preco: "5,99 / 100g",
        precoOferta: null,
        setor: "acougue", 
        tags: ["retiravel"]
    },
    mortandela: { 
        tituloproduto: "Mortadela",
        imagem: "./Imagens/Mortandela.webp", 
        preco: "4,49 / 100g", 
        precoOferta: null,
        setor: "acougue", 
        tags: ["retiravel"]
    },
    presunto: {
        tituloproduto: "Presunto Fatiado",
        imagem: "./Imagens/Presunto.webp", 
        preco: "5,49 / 100g",
        precoOferta: null,
        setor: "acougue", 
        tags: ["retiravel"] 
    },
    coxasobrecoxa: {
        tituloproduto: "Coxa e Sobrecoxa de Frango",
        imagem: "./Imagens/Coxa de Frango.webp",
        preco: "14,99 / Kg",
        precoOferta: "10,99 / Kg",
        setor: "acougue", 
        tags: ["oferta"]
    },
    linguiçatoscana: {
        tituloproduto: "Linguiça Toscana Sadia",
        imagem: "./Imagens/Linguiça Toscada Sadia.webp",
        preco: "29,90 / Kg",
        precoOferta: "23,90 / Kg",
        setor: "acougue", 
        tags: ["oferta"]
    },
    acembovino: {
        tituloproduto: "Acém Bovino Moído",
        imagem: "./Imagens/Acém Bovino.webp",
        preco: "32,90 / Kg",
        precoOferta: null,
        setor: "acougue", 
        tags: null
    },
    patinhobovino: {
        tituloproduto: "Patinho Bovino em Bife",
        imagem: "./Imagens/Patinho Bife.webp",
        preco: "42,90 / Kg",
        precoOferta: null,
        setor: "acougue", 
        tags: null
    },
    cotrafile: {
        tituloproduto: "ContraFilé",
        imagem: "./Imagens/Contrafile.webp",
        preco: "54,90 / Kg",
        precoOferta: "49,90",
        setor: "acougue", 
        tags: ["oferta"]
    },
    bistecasuina: {
        tituloproduto: "Bisteca Suína",
        imagem: "./Imagens/Bisteca Suina.webp",
        preco: "24,90 / Kg",
        precoOferta: null,
        setor: "acougue", 
        tags: null
    },
    baconempedaço: {
        tituloproduto: "Bacon em Pedaço",
        imagem: "./Imagens/Bacon.webp",
        preco: "44,90 / Kg",
        precoOferta: null,
        setor: "acougue", 
        tags: null
    },
    salsicha: {
        tituloproduto: "Salsicha (Perdigão)",
        imagem: "./Imagens/Salsicha perdigão.webp",
        preco: "17,90 / Kg",
        precoOferta: null,
        setor: "acougue", 
        tags: null
    },
    lombosuino: {
        tituloproduto: "Lombo Suíno",
        imagem: "./Imagens/Lombo Suino.jpg",
        preco: "29,90 / Kg",
        precoOferta: null,
        setor: "acougue", 
        tags: null
    },

    // --- HORTIFRUTI ---
    batatalavada: {
        tituloproduto: "Batata Lavada",
        imagem: "./Imagens/Batata Lavada.webp",
        preco: "3,99 / Kg",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    cenoura: {
        tituloproduto: "Cenoura",
        imagem: "./Imagens/Cenoura.webp",
        preco: "6,99 / Kg",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    cebola: {
        tituloproduto: "Cebola",
        imagem: "./Imagens/Cebola.webp",
        preco: "7,99 / Kg",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    tomatedébora: {
        tituloproduto: "Tomate Débora",
        imagem: "./Imagens/Tomate Débora.webp",
        preco: "8,99 / Kg",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    alfacecrespa: {
        tituloproduto: "Alface Crespa",
        imagem: "./Imagens/Alface Crespa.webp",
        preco: "3,99 / Un",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    alho: {
        tituloproduto: "Alho",
        imagem: "./Imagens/Alho.webp",
        preco: "3,50 / 100g",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    bananananica: {
        tituloproduto: "Banana Nanica",
        imagem: "./Imagens/Banana Nanica.webp",
        preco: "5,49 / Kg",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    maçagala: {
        tituloproduto: "Maçã Gala",
        imagem: "./Imagens/Maça Gala.webp",
        preco: "11,90 / Kg",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
     laranjapera: {
        tituloproduto: "Laranja Pera",
        imagem: "./Imagens/Laranja.webp",
        preco: "4,99 / Kg",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },
    ovosbrancos: {
        tituloproduto: "Ovos Brancos",
        imagem: "./Imagens/Ovos Brancos.webp",
        preco: "12,99 / Dúzia",
        precoOferta: null,
        setor: "hortifruti", 
        tags: null
    },

    // --- MERCADO ---
    arrozagulha: {
        tituloproduto: "Arroz Agulhinha Tipo 1 Camil (5Kg)",
        imagem: "./Imagens/Arroz Camil.webp",
        preco: "24,90 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    feijaocarioca: {
        tituloproduto: "Feijão Carioca (1Kg)",
        imagem: "./Imagens/Feijão Carioca.webp",
        preco: "9,99 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    açucarrefinado: {
        tituloproduto: "Açúcar Refinado (1Kg)",
        imagem: "./Imagens/Açucar Refinado.webp",
        preco: "5,49 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    cafeempotradicional: {
        tituloproduto: "Café em Pó Tradicional (500g)",
        imagem: "./Imagens/Café Tradicional jpg.jpg",
        preco: "18,90 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    leiteintegral: {
        tituloproduto: "Leite Integral (1L)",
        imagem: "./Imagens/Leite Integral.webp",
        preco: "5,99 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    biscoitorecheado: {
        tituloproduto: "Biscoito Recheado (Pacote)",
        imagem: "./Imagens/Biscoito Recheado .webp",
        preco: "3,99 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    macaraoespaquete: {
        tituloproduto: "Macarrão Espaguete (500g)",
        imagem: "./Imagens/Macarrão.webp",
        preco: "4,79 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
     detergenteliquido: {
        tituloproduto: "Detergente Líquido Ypê (500ml)",
        imagem: "./Imagens/Detergente.webp",
        preco: "2,99 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    raçaoparacaes: {
        tituloproduto: "Ração para Cães Adultos (1Kg)",
        imagem: "./Imagens/Ração para cachorro.jpeg",
        preco: "21,90 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    },
    aguasanitaria: {
        tituloproduto: "Água Sanitária (1L)",
        imagem: "./Imagens/Candida.webp",
        preco: "4,79 / Un",
        precoOferta: null,
        setor: "mercado", 
        tags: null
    }
};

/* ================================================= */
/* 2. LÓGICA DO INDEXED DB                           */
/* ================================================= */

// AQUI ESTÁ A MÁGICA: Mudei o nome para V6 para ele forçar a atualização!
const DB_NAME = "PadariaDB_V6";
const DB_VERSION = 2; 

function conectarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Erro ao abrir o banco:", event);
            reject("Erro no DB");
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            SETORES_DO_BANCO.forEach(nomeSetor => {
                if (!db.objectStoreNames.contains(nomeSetor)) {
                    db.createObjectStore(nomeSetor, { keyPath: "id" });
                }
            });

            const transaction = event.target.transaction;

            Object.entries(produtosIniciais).forEach(([chave, produto]) => {
                const setorDoProduto = produto.setor;

                if (SETORES_DO_BANCO.includes(setorDoProduto)) {
                    const store = transaction.objectStore(setorDoProduto);
                    store.add({ id: chave, ...produto });
                }
            });
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

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

    return Promise.all(promessasDeBusca).then(resultadosPorSetor => {
        const todosProdutosJuntos = resultadosPorSetor.flat();

        return todosProdutosJuntos.map(item => {
            const { id, ...resto } = item;
            return [id, resto];
        });
    });
}

/* ================================================= */
/* 3. ELEMENTOS E FUNÇÕES DE TELA                    */
/* ================================================= */

const containerProdutos = document.getElementById("container-produtos");
const tituloSetor = document.getElementById("titulo-setor");
const barraBusca = document.getElementById("barra-busca");

let produtosFiltradosInicialmente =[];

function capitalizar(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function removerAcentos(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// === FUNÇÃO TOTALMENTE CORRIGIDA ===
function renderizarProdutos(listaDeProdutos) {
    containerProdutos.innerHTML = ""; 

    if (listaDeProdutos.length === 0) {
        if (barraBusca && barraBusca.value !== "") {
            containerProdutos.innerHTML = "<p style='font-size:1.2rem; margin-top:20px;'>Nenhum produto encontrado com esse nome.</p>";
        } else {
            containerProdutos.innerHTML = "<p style='font-size:1.2rem; margin-top:20px;'>Nenhum produto encontrado nesta categoria.</p>";
        }
        return;
    }

    listaDeProdutos.forEach(([id, produto]) => {
        let precoHTML = "";
        
        if (produto.precoOferta) {
            precoHTML = `
                <div class="card-precos">
                    <span class="preco-oferta">R$ ${produto.precoOferta}</span>
                    <span class="preco-antigo">R$ ${produto.preco}</span>
                </div>`;
        } else if (produto.preco) {
            precoHTML = `
                <div class="card-precos" style="margin-top: auto;">
                    <span class="preco-normal">R$ ${produto.preco}</span>
                </div>`;
        }
        
        let conteudoDoCard = "";
        let botaoHTML = ""; 

        // Se o produto FOR agendável: A imagem inteira clica e tem o botão
        if (produto.tags && produto.tags.includes("retiravel")) {
            conteudoDoCard = `
                <a href="pagina-agendamento.html?id=${id}" class="card-produto">
                    <img src="${produto.imagem}" alt="${produto.tituloproduto}">
                    <h3>${produto.tituloproduto}</h3>
                    ${precoHTML} 
                </a>
            `;
            botaoHTML = `<a href="pagina-agendamento.html?id=${id}" class="btn-agendar">Agendar</a>`;
        } 
        // Se o produto NÃO FOR agendável: É apenas uma Div estática sem link!
        else {
            conteudoDoCard = `
                <div class="card-produto" style="cursor: default;">
                    <img src="${produto.imagem}" alt="${produto.tituloproduto}">
                    <h3>${produto.tituloproduto}</h3>
                    ${precoHTML} 
                </div>
            `;
        }

        // Constrói o cartão misturando o conteúdo apropriado
        const cardCompletoHTML = `
            <div class="card-container">
                ${conteudoDoCard}
                ${botaoHTML} 
            </div>
        `;
        containerProdutos.innerHTML += cardCompletoHTML;
    });
}

/* ================================================= */
/* 4. EXECUÇÃO PRINCIPAL                             */
/* ================================================= */

async function iniciarApp() {
    try {
        const db = await conectarBanco();
        const listaCompleta = await buscarTodosProdutos(db);

        if (setorAtual || filtroAtual) {
            let tituloPagina = "";
            if (setorAtual) tituloPagina = capitalizar(setorAtual);
            if (filtroAtual) {
                const filtroCapitalizado = capitalizar(filtroAtual);
                tituloPagina = tituloPagina ? `${tituloPagina} (${filtroCapitalizado})` : filtroCapitalizado;
            }
            tituloSetor.innerText = tituloPagina;

            produtosFiltradosInicialmente = listaCompleta.filter(([id, produto]) => {
                let setorMatch = true;
                if (setorAtual) setorMatch = (produto.setor === setorAtual);

                let filtroMatch = true;
                if (filtroAtual) filtroMatch = (produto.tags && produto.tags.includes(filtroAtual));

                return setorMatch && filtroMatch;
            });

            renderizarProdutos(produtosFiltradosInicialmente);

            if (barraBusca) {
                barraBusca.addEventListener("input", () => {
                    const termoBusca = removerAcentos(barraBusca.value.toLowerCase());
                    const produtosFiltradosPelaBusca = produtosFiltradosInicialmente.filter(([id, produto]) => {
                        const tituloNormalizado = removerAcentos(produto.tituloproduto.toLowerCase());
                        return tituloNormalizado.includes(termoBusca);
                    });
                    renderizarProdutos(produtosFiltradosPelaBusca);
                });
            }

        } else {
            tituloSetor.innerText = "Nenhum filtro aplicado";
            containerProdutos.innerHTML = "<p>Por favor, selecione um setor ou filtro no menu.</p>";
            if (barraBusca) barraBusca.style.display = 'none';
        }

    } catch (erro) {
        console.error("Erro fatal na aplicação:", erro);
    }
}

iniciarApp();