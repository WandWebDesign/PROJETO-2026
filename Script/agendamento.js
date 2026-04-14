document.addEventListener("DOMContentLoaded", () => {

    // 1. Pega o ID do produto da URL (Ex: ?id=pãofrances)
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');

    // 2. Banco de dados de produtos
    const produtos = {
        "pãofrances":      { nome: "Pão Francês",       preco: 0.80, desc: "Pão quentinho, feito na hora! Preço por Unidade.",           img: "./Imagens/PãoFrances.webp" },
        "coxinhadefrango": { nome: "Coxinha de Frango", preco: 8.50, desc: "Salgado frito na hora. Preço por unidade.",                   img: "./Imagens/Coxinha de Frango .webp" },
        "pãodequeijo":     { nome: "Pão de Queijo",     preco: 3.00, desc: "Tradicional de Minas. Preço por unidade.",                    img: "./Imagens/Pão de Queijo .webp" },
        "esfirradecarne":  { nome: "Esfiha de Carne",   preco: 8.50, desc: "Massa macia e recheio de carne temperada. Preço por unidade.", img: "./Imagens/Esfirra de Carne.webp" },
        "mussarela":       { nome: "Mussarela Fatiada", preco: 5.99, desc: "Queijo mussarela fatiado fino. (Quantidade 1 = 100g)",         img: "./Imagens/Mussarela.webp" },
        "mortandela":      { nome: "Mortadela Fatiada", preco: 4.49, desc: "Mortadela fresca. (Quantidade 1 = 100g)",                      img: "./Imagens/Mortandela.webp" },
        "presunto":        { nome: "Presunto Fatiado",  preco: 5.49, desc: "Presunto magro fatiado. (Quantidade 1 = 100g)",                img: "./Imagens/Presunto.webp" },
        "bolodefuba":      { nome: "Bolo de Fubá",      preco: 7.50, desc: "Bolo caseiro da vovó. Preço por fatia.",                       img: "./Imagens/Bolo de fubá.webp" },
        "bolodemilho":     { nome: "Bolo de Milho",     preco: 7.50, desc: "Bolo cremoso de milho. Preço por fatia.",                      img: "./Imagens/Bolo de Milho.webp" },
        "pãodeleite":      { nome: "Pão de Leite",      preco: 1.50, desc: "Pão de leite macio e saboroso, perfeito para o café.",        img: "./Imagens/Pão de Leite .webp" }
    };

    const produtoAtual = produtos[produtoId];
    let quantidade = 1;

    // 3. Preencher a tela com as informações do produto
    if (produtoAtual) {
        document.getElementById("tituloproduto").innerText = produtoAtual.nome;
        document.getElementById("descricao").innerText = produtoAtual.desc;
        document.getElementById("produtoimagem").src = produtoAtual.img;
        atualizarPrecoFinal();
    } else {
        document.getElementById("tituloproduto").innerText = "Produto não encontrado";
    }

    // 4. Botões de + e -
    const btnMais = document.getElementById("plus-btn");
    const btnMenos = document.getElementById("ret-btn");
    const displayQuantidade = document.getElementById("Qtd");

    btnMais.addEventListener("click", () => {
        quantidade++;
        displayQuantidade.innerText = quantidade;
        atualizarPrecoFinal();
    });

    btnMenos.addEventListener("click", () => {
        if (quantidade > 1) {
            quantidade--;
            displayQuantidade.innerText = quantidade;
            atualizarPrecoFinal();
        }
    });

    // 5. Cálculo do preço total
    function atualizarPrecoFinal() {
        if (produtoAtual) {
            const total = quantidade * produtoAtual.preco;
            document.getElementById("preço-final").innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Botão "Escolher Data" → "Confirmar Agendamento"
    //    DEVE ficar aqui dentro para acessar produtoId, produtoAtual e quantidade
    // ─────────────────────────────────────────────────────────────
    const btnAgendar    = document.getElementById("btn-agendar-final");
    const containerData = document.getElementById("data-picker-container");
    const inputData     = document.getElementById("data-retirada");

    // Data mínima = amanhã
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    inputData.min = amanha.toISOString().split("T")[0];

    let etapa = "escolher-data";

    btnAgendar.addEventListener("click", () => {

        // — Passo 1: mostrar o seletor de data —
        if (etapa === "escolher-data") {
            containerData.style.display = "flex";
            btnAgendar.innerText = "Confirmar Agendamento";
            etapa = "confirmar";
            return;
        }

        // — Passo 2: confirmar e salvar no carrinho —
        if (etapa === "confirmar") {

            if (!localStorage.getItem("usuarioLogado")) {
                mostrarToast("Faça login para agendar!");
                return;
            }

            if (!inputData.value) {
                mostrarToast("Escolha uma data de retirada!");
                return;
            }

            

            // Formata dd/mm/aaaa
            const [ano, mes, dia] = inputData.value.split("-");
            const dataFormatada = `${dia}/${mes}/${ano}`;

            // Salva no carrinho
           const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
            carrinho.push({
                id:           produtoId,
                nome:         produtoAtual.nome,
                preco:        produtoAtual.preco,
                quantidade:   quantidade,
                dataRetirada: dataFormatada,
                img:          produtoAtual.img
            });
            localStorage.setItem("carrinho", JSON.stringify(carrinho));

            mostrarToast(`✅ ${produtoAtual.nome} agendado para ${dataFormatada}!`);
            atualizarInterfaceCarrinho();
            abrirCarrinho();

            // Reseta o botão
            containerData.style.display = "none";
            inputData.value = "";
            btnAgendar.innerText = "Escolher Data";
            etapa = "escolher-data";
        }
    });

}); // ← fecha o DOMContentLoaded — bloco 6 está DENTRO ✅