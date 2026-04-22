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

document.getElementById('ret-btn').addEventListener('click', () => {
    if (quantidade > 1) {
        quantidade--;
        atualizarPrecoTotal();
    }
});

// 7. LÓGICA DO BOTÃO DE AGENDAR (CARRINHO)
const btnAgendar    = document.getElementById("btn-agendar-final");
const containerData = document.getElementById("data-picker-container");
const inputData     = document.getElementById("data-retirada");

// Configurar a data mínima para amanhã
const amanha = new Date();
amanha.setDate(amanha.getDate() + 1);
if(inputData) inputData.min = amanha.toISOString().split("T")[0];

let etapa = "escolher-data";

btnAgendar.addEventListener("click", () => {
    if (etapa === "escolher-data") {
        containerData.style.display = "flex";
        btnAgendar.innerText = "Confirmar Agendamento";
        etapa = "confirmar";
        return;
    }

    if (etapa === "confirmar") {
        const nomeClienteLogado = localStorage.getItem("usuarioLogado");
        
        if (!nomeClienteLogado) {
            if(typeof mostrarToast === 'function') mostrarToast("Faça login para agendar!");
            else alert("Faça login para agendar!");
            return;
        }

        if (!inputData.value) {
            if(typeof mostrarToast === 'function') mostrarToast("Escolha uma data de retirada!");
            else alert("Escolha uma data de retirada!");
            return;
        }

        // Formata a data (dd/mm/aaaa)
        const [ano, mes, dia] = inputData.value.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;

        const precoString = produtoAtual.precoOferta ? produtoAtual.precoOferta : produtoAtual.preco;
        const precoUnitario = extrairNumeroPreco(precoString);
        const valorTotalProduto = precoUnitario * quantidade;

        // 1. CRIAR O OBJETO DO PEDIDO
        const novoPedido = {
            id: Math.floor(1000 + Math.random() * 9000), // Gera um ID ex: #4052
            cliente: nomeClienteLogado,
            data: new Date().toLocaleDateString('pt-BR'),
            dataRetirada: dataFormatada,
            valor: valorTotalProduto,
            status: "Pendente",
            itens: [{
                nome: produtoAtual.tituloproduto,
                quantidade: quantidade,
                preco: precoUnitario
            }]
        };

        // 2. SALVAR NO BANCO DE PEDIDOS (localStorage)
        const pedidosAtuais = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];
        pedidosAtuais.push(novoPedido);
        localStorage.setItem('pedidosPadaria', JSON.stringify(pedidosAtuais));

        if(typeof mostrarToast === 'function') mostrarToast(`✅ Pedido #${novoPedido.id} enviado com sucesso!`);

        // Reseta o formulário
        containerData.style.display = "none";
        inputData.value = "";
        btnAgendar.innerText = "Escolher Data";
        etapa = "escolher-data";

        // 3. REDIRECIONAR PARA O ADMIN COM PARÂMETRO NA URL
        setTimeout(() => {
            // O parâmetro '?setor=pedidos' avisa o admin-logic.js para abrir a aba correta
            window.location.href = 'index-admin.html?setor=pedidos';
        }, 1200);
    }
});

// Inicializa tudo quando a página carregar
document.addEventListener("DOMContentLoaded", carregarTela);

// ENTRADA DE DADOS - PEDIDOS
// Exemplo de função para finalizar o pedido
function finalizarPedido(dadosCliente, itensSelecionados) {
    // 1. Criar o objeto do pedido
    const novoPedido = {
        id: Math.floor(1000 + Math.random() * 9000), // Gera um ID aleatório
        cliente: dadosCliente.nome,
        data: new Date().toLocaleDateString('pt-BR'),
        valor: calcularTotal(itensSelecionados),
        status: "Pendente",
        itens: itensSelecionados
    };

    // 2. Buscar pedidos existentes ou criar lista vazia
    const pedidosAtuais = JSON.parse(localStorage.getItem('pedidosPadaria')) || [];

    // 3. Adicionar o novo pedido à lista
    pedidosAtuais.push(novoPedido);

    // 4. Salvar de volta no localStorage
    localStorage.setItem('pedidosPadaria', JSON.stringify(pedidosAtuais));

    // 5. Redirecionar para o admin (como você solicitou)
    window.location.href = 'index-admin.html';
}