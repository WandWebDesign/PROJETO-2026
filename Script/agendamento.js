document.addEventListener("DOMContentLoaded", () => {
    // 1. Pega o ID do produto na URL (Ex: ?id=bolodemilho)
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');

    // 2. Banco de dados completo para garantir que a foto nunca quebre
    const produtos = {
        "pãofrances": { nome: "Pão Francês", preco: 0.80, desc: "Pão quentinho, feito na hora! (Preço por Unidade)", img: "./Imagens/PãoFrances.webp" },
        "coxinhadefrango": { nome: "Coxinha de Frango", preco: 8.50, desc: "Salgado frito na hora. (Preço por Unidade)", img: "./Imagens/Coxinha de Frango .webp" },
        "pãodequeijo": { nome: "Pão de Queijo", preco: 3.00, desc: "Tradicional de Minas. (Preço por Unidade)", img: "./Imagens/Pão de Queijo .webp" },
        "esfirradecarne": { nome: "Esfirra de Carne", preco: 8.50, desc: "Massa macia e recheio de carne. (Preço por Unidade)", img: "./Imagens/Esfirra de Carne.webp" },
        "pãodeleite": { nome: "Pão de Leite", preco: 1.50, desc: "Pão de leite macio. (Preço por Unidade)", img: "./Imagens/Pão de Leite .webp" },
        "mistoquente": { nome: "Misto Quente", preco: 7.00, desc: "Misto quente feito na hora.", img: "./Imagens/MistoQuente.jpg" },
        "sonhodecreme": { nome: "Sonho de Creme", preco: 7.50, desc: "Sonho recheado e polvilhado.", img: "./Imagens/Sonho de Creme.webp" },
        "tortadefrango": { nome: "Torta de Frango", preco: 8.90, desc: "Torta caseira bem recheada.", img: "./Imagens/TortaDefrango.webp" },
        
        "bolodefuba": { nome: "Bolo de Fubá", preco: 7.50, desc: "Bolo caseiro da vovó. (Preço por Fatia)", img: "./Imagens/Bolo de fubá.webp" },
        "bolodemilho": { nome: "Bolo de Milho", preco: 7.50, desc: "Bolo cremoso de milho. (Preço por Fatia)", img: "./Imagens/Bolo de Milho.webp" },
        
        "mussarela": { nome: "Mussarela", preco: 5.99, desc: "Mussarela fatiada (Preço a cada 100g)", img: "./Imagens/Mussarela.webp" },
        "mortandela": { nome: "Mortadela", preco: 4.49, desc: "Mortadela fatiada (Preço a cada 100g)", img: "./Imagens/Mortandela.webp" },
        "presunto": { nome: "Presunto Fatiado", preco: 5.49, desc: "Presunto magro fatiado (Preço a cada 100g)", img: "./Imagens/Presunto.webp" }
    };

    const produtoAtual = produtos[produtoId];
    let quantidade = 1;

    // 3. Coloca os dados na tela
    if (produtoAtual) {
        document.getElementById("tituloproduto").innerText = produtoAtual.nome;
        document.getElementById("produtoimagem").src = produtoAtual.img;
        document.getElementById("descricao").innerText = produtoAtual.desc;
        atualizarPrecoFinal();
    } else {
        document.getElementById("tituloproduto").innerText = "Produto não encontrado";
        // Caso não ache, coloca uma imagem genérica
        document.getElementById("produtoimagem").src = "./Imagens/Logo.png"; 
    }

    // 4. Matemática do carrinho (+ e -)
    const btnMais = document.getElementById("plus-btn");
    const btnMenos = document.getElementById("ret-btn");
    const displayQuantidade = document.getElementById("Qtd");

    if (btnMais && btnMenos) {
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
    }

    function atualizarPrecoFinal() {
        if (produtoAtual) {
            const total = quantidade * produtoAtual.preco;
            document.getElementById("preço-final").innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    }

    // 5. Botão de Confirmar Agendamento (Valida Data e Hora)
    const btnAgendar = document.getElementById("btn-agendar-final");
    
    if (btnAgendar) {
        btnAgendar.addEventListener("click", () => {
            const dataInput = document.getElementById("data-retirada").value;
            const horaInput = document.getElementById("hora-retirada").value;

            if (!dataInput || !horaInput) {
                alert("⚠️ Por favor, preencha a DATA e o HORÁRIO para continuar.");
                return;
            }

            // Exibe mensagem de sucesso
            alert(`✅ Adicionado com Sucesso!\nData: ${dataInput.split('-').reverse().join('/')}\nHorário: ${horaInput}`);
        });
    }
});