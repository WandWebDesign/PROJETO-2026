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

    btnMenos.addEventListener("click", () => {
        if (quantidade > 1) { // Não deixa a quantidade ser zero
            quantidade--;
            displayQuantidade.innerText = quantidade;
            atualizarPrecoFinal();
        }
    });

    // 5. Função que faz a matemática: Quantidade X Preço
    function atualizarPrecoFinal() {
        if (produtoAtual) {
            const total = quantidade * produtoAtual.preco;
            // Formata o número para exibir como dinheiro (Ex: R$ 15,90)
            document.getElementById("preço-final").innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    }
});