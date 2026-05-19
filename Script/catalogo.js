// =======================================================
// 1. CAPTURA DE PARÂMETROS DA URL
// =======================================================
const urlParams = new URLSearchParams(window.location.search);
// Lemos tanto ?setor= quanto ?filtro= para dar suporte a todos os seus links
const setorDaUrl = urlParams.get("setor");
const filtroDaUrl = urlParams.get("filtro");

const produtosIniciais = {
    //Padaria//
    pãofrances: {
        tituloproduto: "Pão Francês",
        imagem: "./Imagens/PãoFrances.webp",
        preco: "0,80 / Un",
        precoOferta: "0,70 / Un",
        setor: "padaria",
        categoria: "padaria",
        tags: ["oferta", "retiravel"]
    },
    pãodequeijo: {
        tituloproduto: "Pão de Queijo",
        imagem: "./Imagens/Pão de Queijo .webp",
        preco: "3,00 / Un",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: ["retiravel"]
    },
    coxinhadefrango: {
        tituloproduto: "Coxinha de Frango",
        imagem: "./Imagens/Coxinha de Frango .webp",
        preco: "8,50 / Un",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: ["retiravel"]
    },
    pãodeleite: {
        tituloproduto: "Pão de Leite",
        imagem: "./Imagens/Pão de Leite .webp",
        preco: "1,50 / Un",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: ["retiravel"]
    },
    esfirradecarne: {
        tituloproduto: "Esfirra de Carne",
        imagem: "./Imagens/Esfirra de Carne.webp",
        preco: "8,50 / Un",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: ["retiravel"]
    },
    bolodefuba: {
        tituloproduto: "Bolo de Fubá",
        imagem: "./Imagens/Bolo de fubá.webp",
        preco: "7,50 / Fatia",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: ["retiravel"]
    },
    bolodemilho: {
        tituloproduto: "Bolo de Milho",
        imagem: "./Imagens/Bolo de Milho.webp",
        preco: "7,50 / Fatia",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: ["retiravel"]
    },
    mistoquente: {
        tituloproduto: "Misto Quente",
        imagem: "./Imagens/MistoQuente.jpg",
        preco: "7,00 / Un",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: null
    },
    sonhodecreme: {
        tituloproduto: "Sonho de Creme",
        imagem: "./Imagens/Sonho de Creme.webp",
        preco: "7,50 / Un",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: null
    },
    tortadefrango: {
        tituloproduto: "Torta de Frango",
        imagem: "./Imagens/TortaDefrango.webp",
        preco: "8,90 / Fatia",
        precoOferta: null,
        setor: "padaria",
        categoria: "padaria",
        tags: null
    },
    //Açougue/Frios//
    mussarela: {
        tituloproduto: "Mussarela",
        imagem: "./Imagens/Mussarela.webp",
        preco: "5,99 / 100g",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: ["retiravel"]
    },
    mortandela: {
        tituloproduto: "Mortadela",
        imagem: "./Imagens/Mortandela.webp",
        preco: "4,49 / 100g",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: ["retiravel"]
    },
    presunto: {
        tituloproduto: "Presunto Fatiado",
        imagem: "./Imagens/Presunto.webp",
        preco: "5,49 / 100g",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: ["retiravel"]
    },
    coxasobrecoxa: {
        tituloproduto: "Coxa e Sobrecoxa de Frango",
        imagem: "./Imagens/Coxa de Frango.webp",
        preco: "14,99 / Kg",
        precoOferta: "10,99 / Kg",
        setor: "acougue",
        categoria: "frios",
        tags: ["oferta"]
    },
    linguiçatoscana: {
        tituloproduto: "Linguiça Toscana Sadia",
        imagem: "./Imagens/Linguiça Toscada Sadia.webp",
        preco: "29,90 / Kg",
        precoOferta: "23,90 / Kg",
        setor: "acougue",
        categoria: "frios",
        tags: ["oferta"]
    },
    acembovino: {
        tituloproduto: "Acém Bovino Moído",
        imagem: "./Imagens/Acém Bovino.webp",
        preco: "32,90 / Kg",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: null
    },
    patinhobovino: {
        tituloproduto: "Patinho Bovino em Bife",
        imagem: "./Imagens/Patinho Bife.webp",
        preco: "42,90 / Kg",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: null
    },
    cotrafile: {
        tituloproduto: "ContraFilé",
        imagem: "./Imagens/Contrafile.webp",
        preco: "54,90 / Kg",
        precoOferta: "49,90",
        setor: "acougue",
        categoria: "frios",
        tags: ["oferta"]
    },
    bistecasuina: {
        tituloproduto: "Bisteca Suína",
        imagem: "./Imagens/Bisteca Suina.webp",
        preco: "24,90 / Kg",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: null
    },
    baconempedaço: {
        tituloproduto: "Bacon em Pedaço",
        imagem: "./Imagens/Bacon.webp",
        preco: "44,90 / Kg",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: null
    },
    salsicha: {
        tituloproduto: "Salsicha (Perdigão)",
        imagem: "./Imagens/Salsicha perdigão.webp",
        preco: "17,90 / Kg",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: null
    },
    lombosuino: {
        tituloproduto: "Lombo Suíno",
        imagem: "./Imagens/Lombo Suino.jpg",
        preco: "29,90 / Kg",
        precoOferta: null,
        setor: "acougue",
        categoria: "frios",
        tags: null
    },
    //Hortifruti//
    batatalavada: {
        tituloproduto: "Batata Lavada",
        imagem: "./Imagens/Batata Lavada.webp",
        preco: "3,99 / Kg",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    cenoura: {
        tituloproduto: "Cenoura",
        imagem: "./Imagens/Cenoura.webp",
        preco: "6,99 / Kg",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    cebola: {
        tituloproduto: "Cebola",
        imagem: "./Imagens/Cebola.webp",
        preco: "7,99 / Kg",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    tomatedébora: {
        tituloproduto: "Tomate Débora",
        imagem: "./Imagens/Tomate Débora.webp",
        preco: "8,99 / Kg",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    alfacecrespa: {
        tituloproduto: "Alface Crespa",
        imagem: "./Imagens/Alface Crespa.webp",
        preco: "3,99 / Un",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    alho: {
        tituloproduto: "Alho",
        imagem: "./Imagens/Alho.webp",
        preco: "3,50 / 100g",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    bananananica: {
        tituloproduto: "Banana Nanica",
        imagem: "./Imagens/Banana Nanica.webp",
        preco: "5,49 / Kg",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    maçagala: {
        tituloproduto: "Maçã Gala",
        imagem: "./Imagens/Maça Gala.webp",
        preco: "11,90 / Kg",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    laranjapera: {
        tituloproduto: "Laranja Pera",
        imagem: "./Imagens/Laranja.webp",
        preco: "4,99 / Kg",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    ovosbrancos: {
        tituloproduto: "Ovos Brancos",
        imagem: "./Imagens/Ovos Brancos.webp",
        preco: "12,99 / Dúzia",
        precoOferta: null,
        setor: "hortifruti",
        categoria: "hortifruti",
        tags: null
    },
    //Mercado//
    arrozagulha: {
        tituloproduto: "Arroz Agulhinha Tipo 1 Camil (5Kg)",
        imagem: "./Imagens/Arroz Camil.webp",
        preco: "24,90 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "mercearia",
        tags: null
    },
    feijaocarioca: {
        tituloproduto: "Feijão Carioca (1Kg)",
        imagem: "./Imagens/Feijão Carioca.webp",
        preco: "9,99 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "mercearia",
        tags: null
    },
    açucarrefinado: {
        tituloproduto: "Açúcar Refinado (1Kg)",
        imagem: "./Imagens/Açucar Refinado.webp",
        preco: "5,49 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "mercearia",
        tags: null
    },
    cafeempotradicional: {
        tituloproduto: "Café em Pó Tradicional (500g)",
        imagem: "./Imagens/Café Tradicional jpg.jpg",
        preco: "18,90 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "bebidas",
        tags: null
    },
    leiteintegral: {
        tituloproduto: "Leite Integral (1L)",
        imagem: "./Imagens/Leite Integral.webp",
        preco: "5,99 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "laticinios",
        tags: null
    },
    biscoitorecheado: {
        tituloproduto: "Biscoito Recheado (Pacote)",
        imagem: "./Imagens/Biscoito Recheado .webp",
        preco: "3,99 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "doces",
        tags: null
    },
    macaraoespaquete: {
        tituloproduto: "Macarrão Espaguete (500g)",
        imagem: "./Imagens/Macarrão.webp",
        preco: "4,79 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "mercearia",
        tags: null
    },
    detergeliquido: {
        tituloproduto: "Detergente Líquido Ypê (500ml)",
        imagem: "./Imagens/Detergente.webp",
        preco: "2,99 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "limpeza",
        tags: null
    },
    raçaoparacaes: {
        tituloproduto: "Ração para Cães Adultos (1Kg)",
        imagem: "./Imagens/Ração para cachorro.jpeg",
        preco: "21,90 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "pets",
        tags: null
    },
    aguasanitaria: {
        tituloproduto: "Água Sanitária (1L)",
        imagem: "./Imagens/Candida.webp",
        preco: "4,79 / Un",
        precoOferta: null,
        setor: "mercado",
        categoria: "limpeza",
        tags: null
    }
};

const containerProdutos = document.getElementById("container-produtos");
const tituloSetor = document.getElementById("titulo-setor");
const barraBusca = document.getElementById("barra-busca");
const botoesFiltro = document.querySelectorAll(".btn-filtro");

let categoriaAtual = "todos";
const listaCompleta = Object.entries(produtosIniciais);

function removerAcentos(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Map de Tradução dos nomes das Categorias/Filtros
function nomeCategoria(categoria) {
    const nomes = {
        todos: "CATÁLOGO COMPLETO",
        padaria: "PADARIA",
        acougue: "AÇOUGUE",
        hortifruti: "HORTIFRUTI",
        mercado: "MERCADO",
        frios: "FRIOS",
        oferta: "🔥EM OFERTA",
        retiravel: "🛒 PEÇA E RETIRE", // Suporte visual para o botão Peça e Retire
        limpeza: "LIMPEZA",
        mercearia: "MERCEARIA",
        laticinios: "LATICÍNIOS",
        bebidas: "BEBIDAS",
    };
    return nomes[categoria] || categoria.toUpperCase();
}

// Renderizador do HTML dos cards
// Renderizador do HTML dos cards
function renderizarProdutos(lista) {
    containerProdutos.innerHTML = "";
    
    if (lista.length === 0) {
        containerProdutos.innerHTML = `<p style="padding: 20px; color: #666; font-weight: bold;">Nenhum produto encontrado.</p>`;
        return;
    }

    lista.forEach(([id, produto]) => {
        // Lógica de Preço
        let precoHTML = "";
        if (produto.precoOferta) {
            precoHTML = `
                <div class="card-precos">
                    <p class="preco-normal">R$ ${produto.precoOferta}</p>
                    <p class="preco-antigo">R$ ${produto.preco}</p>
                </div>`;
        } else {
            precoHTML = `<div class="card-precos"><p class="preco-normal">R$ ${produto.preco}</p></div>`;
        }

        // Lógica de Imagem
        let imagemSrc = produto.imagem || "./Imagens/Logo.png";
        if (imagemSrc.startsWith('../../')) {
            imagemSrc = './' + imagemSrc.substring(6);
        }

        // ✅ CORREÇÃO: Decide o wrapper e o botão com base na tag "retiravel"
        const ehRetiravel = produto.tags && produto.tags.includes("retiravel");

        let cardInternoHTML = "";
        let botaoHTML = "";

        if (ehRetiravel) {
            // Produto clicável: card leva para o agendamento
            cardInternoHTML = `
                <a href="pagina-agendamento.html?id=${id}" class="card-produto">
                    <img src="${imagemSrc}" alt="${produto.tituloproduto}">
                    <h3>${produto.tituloproduto}</h3>
                </a>`;
            botaoHTML = `<a href="pagina-agendamento.html?id=${id}" class="btn-agendar">Adicionar</a>`;
        } else {
            // Produto apenas visualizável: sem link, com visual de "indisponível para retirada"
            cardInternoHTML = `
                <div class="card-produto card-visualizavel">
                    <img src="${imagemSrc}" alt="${produto.tituloproduto}">
                    <h3>${produto.tituloproduto}</h3>
                </div>`;
            botaoHTML = `<span class="btn-indisponivel">Disponível na loja</span>`;
        }

        containerProdutos.innerHTML += `
            <div class="card-container">
                ${cardInternoHTML}
                ${precoHTML}
                ${botaoHTML}
            </div>
        `;
    });
}
// LÓGICA DO FILTRO COMPACTA E INTELIGENTE
function aplicarFiltros() {
    const termoBusca = removerAcentos(barraBusca.value.toLowerCase().trim());

    const produtosFiltrados = listaCompleta.filter(([id, produto]) => {
        const nomeProduto = removerAcentos(produto.tituloproduto.toLowerCase());
        const passouNaBusca = nomeProduto.includes(termoBusca);

        let passouNaCategoria = false;
        
        if (categoriaAtual === "todos") {
            passouNaCategoria = true;
        } else if (categoriaAtual === "oferta") {
            // Filtra pela TAG 'oferta'
            passouNaCategoria = produto.tags && produto.tags.includes("oferta");
        } else if (categoriaAtual === "retiravel") {
            // Filtra pela TAG 'retiravel' (PEÇA E RETIRE)
            passouNaCategoria = produto.tags && produto.tags.includes("retiravel");
        } else {
            // Filtra por Setor ou Categoria estrutural normal
            passouNaCategoria = (produto.setor === categoriaAtual || produto.categoria === categoriaAtual);
        }
        

        return passouNaBusca && passouNaCategoria;
    });

    tituloSetor.innerText = nomeCategoria(categoriaAtual);
    renderizarProdutos(produtosFiltrados);
}

function selecionarCategoria(categoria) {
    categoriaAtual = categoria;
    botoesFiltro.forEach(botao => {
        botao.classList.toggle("ativo", botao.dataset.categoria === categoriaAtual);
    });
    aplicarFiltros();
}

// Eventos dos botões laterais/filtros da própria página de Catálogo
botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        selecionarCategoria(botao.dataset.categoria);
    });
});

if(barraBusca) {
    barraBusca.addEventListener("input", aplicarFiltros);
}

// =======================================================
// INTERCEPTADOR DE INICIALIZAÇÃO DA PÁGINA (A MÁGICA AQUI)
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    // Verifica se veio um parâmetro pela URL (?setor=... ou ?filtro=...)
    const filtroParametro = setorDaUrl || filtroDaUrl;

    if (filtroParametro) {
        categoriaAtual = filtroParametro.toLowerCase();
    } else {
        categoriaAtual = "todos";
    }

    // Ativa a classe visual no botão correspondente caso ele exista na barra lateral
    botoesFiltro.forEach(botao => {
        botao.classList.toggle("ativo", botao.dataset.categoria === categoriaAtual);
    });

    // Roda os filtros imediatamente para exibir os produtos corretos na tela
    aplicarFiltros();
});