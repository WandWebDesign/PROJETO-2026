/* ================================================= */
/* 1. FUNÇÕES AUXILIARES E FORMATAÇÃO                */
/* ================================================= */

function converterPrecoParaNumero(precoTexto) {
    if (!precoTexto) return 0;
    // Pega apenas o número antes da barra ou espaço e troca vírgula por ponto
    let apenasValor = precoTexto.split(' ')[0]; 
    let valorComPonto = apenasValor.replace(',', '.');
    return parseFloat(valorComPonto);
}

/* ================================================= */
/* 2. DADOS DOS PRODUTOS (COM PREÇOS)                */
/* ================================================= */

const produtos = {
    pãofrances: {
        tituloproduto: "Pão Francês",
        imagem: "./Imagens/PãoFrances.webp",
        img1: "./Imagens/PãoFrances.webp",
        img2: "./Imagens Secundarias/Pão Frances 2.jpeg", 
        img3: "./Imagens Secundarias/Pão Frances 3.jpg",
        setor: "padaria",
        preco: "15,90", 
        descricao: "Pão quentinho, feito na hora! Crocante por fora e incrivelmente macio por dentro. A nossa receita exclusiva garante o sabor tradicional da verdadeira padaria artesanal.",
    },
    coxinhadefrango: {
        tituloproduto: "Coxinha de Frango",
        imagem: "./Imagens/Coxinha de Frango .webp",
        setor: "padaria",
        preco: "8,50",
        descricao: "Delícia dourada e crocante! Massa leve de batata recheada com frango desfiado suculento e um toque especial de especiarias.",
    },
    pãodequeijo: {
        tituloproduto: "Pão de Queijo",
        imagem: "./Imagens/Pão de Queijo .webp",
        setor: "padaria",
        preco: "3,00", 
        descricao: "Irresistível aroma e sabor tradicional mineiro! Feito com polvilho selecionado e uma mistura secreta de queijos curados.",
    },
    esfirradecarne: {
        tituloproduto: "Esfirra de Carne",
        imagem: "./Imagens/Esfirra de Carne.webp",
        setor: "padaria",
        preco: "8,50",
        descricao: "Massa leve e fofinha, assada no ponto certo, com um recheio generoso de carne moída temperada com especiarias árabes.",
    },
    pãodeleite: {
        tituloproduto: "Pão de Leite",
        imagem: "./Imagens/Pão de Leite .webp",
        setor: "padaria",
        preco: "22,90",
        descricao: "Macio e delicado, o nosso pão de leite derrete na boca. Perfeito para o café da manhã com manteiga ou requeijão.",
    },
    bolodefuba: {
        tituloproduto: "Bolo de Fubá",
        imagem: "./Imagens/Bolo de fubá.webp",
        setor: "padaria",
        preco: "45,00",
        descricao: "Cheirinho a casa de avó e café passado na hora. O nosso bolo inteiro de fubá é húmido, macio e perfeito para partilhar.",
    },
    bolodemilho: {
        tituloproduto: "Bolo de Milho",
        imagem: "./Imagens/Bolo de Milho.webp",
        setor: "padaria",
        preco: "45,00",
        descricao: "Sabor de fazenda em cada pedaço! Preparado com milho natural, resultando numa textura cremosa e inesquecível.",
    },
    mussarela: {
        tituloproduto: "Mussarela Fatiada",
        imagem: "./Imagens/Mussarela.webp",
        setor: "frios",
        preco: "5,99",
        descricao: "Fresquinha e saborosa, derrete facilmente! Fatiada na espessura ideal para os seus lanches ou receitas quentes.",
    },
    mortandela: {
        tituloproduto: "Mortadela Fatiada",
        imagem: "./Imagens/Mortandela.webp",
        setor: "frios",
        preco: "4,49",
        descricao: "Tradição e sabor em cada fatia! Clássica nos lanches de padaria, excelente qualidade e aroma inconfundível.",
    },
    presunto: {
        tituloproduto: "Presunto Fatiado",
        imagem: "./Imagens/Presunto.webp",
        setor: "frios",
        preco: "5,49",
        descricao: "Fresco, leve e saboroso! Fatias finas e suculentas para acompanhar os melhores pães artesanais.",
    }
};

/* ================================================= */
/* 3. LÓGICA DE CARREGAMENTO DO PRODUTO E GALERIA    */
/* ================================================= */

const params = new URLSearchParams(window.location.search);
const produtoId = params.get("id");
const produtoSelecionado = produtos[produtoId];

let precoUnitarioAtual = 0; 

if (produtoSelecionado) {
    document.getElementById("tituloproduto").innerText = produtoSelecionado.tituloproduto;
    document.getElementById("descricao").innerText = produtoSelecionado.descricao;
    document.getElementById("produtoimagem").src = produtoSelecionado.imagem;
    
    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");

    if(img1) img1.src = produtoSelecionado.img1 || produtoSelecionado.imagem;
    if(img2) img2.src = produtoSelecionado.img2 || produtoSelecionado.imagem;
    if(img3) img3.src = produtoSelecionado.img3 || produtoSelecionado.imagem;

    const miniaturas = document.querySelectorAll('.lista-imagens img');
    miniaturas.forEach(miniatura => {
        miniatura.addEventListener('click', function() {
            const imgPrincipal = document.getElementById("produtoimagem");
            imgPrincipal.style.opacity = '0.5';
            setTimeout(() => {
                imgPrincipal.src = this.src;
                imgPrincipal.style.opacity = '1';
            }, 150);
        });
    });

    precoUnitarioAtual = converterPrecoParaNumero(produtoSelecionado.preco);
} else {
    document.getElementById("tituloproduto").innerText = "Produto não encontrado";
    document.getElementById("descricao").innerText = "Por favor, regresse ao catálogo e selecione um produto válido.";
}

/* ================================================= */
/* 4. CALCULADORA DE VALORES (QTD * PREÇO)           */
/* ================================================= */

const minusButton = document.getElementById('ret-btn');
const plusButton = document.getElementById('plus-btn');
const quantityDisplay = document.getElementById('Qtd');
const finalPriceDisplay = document.getElementById('preço-final');

let quantidadeAtual = 1;

function atualizarPrecoNaTela() {
    const valorTotal = quantidadeAtual * precoUnitarioAtual;
    const valorFormatado = valorTotal.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
    
    if (quantityDisplay) quantityDisplay.textContent = quantidadeAtual;
    if (finalPriceDisplay) finalPriceDisplay.textContent = valorFormatado;
}

if (plusButton && minusButton) {
    plusButton.addEventListener('click', () => {
        quantidadeAtual++;
        atualizarPrecoNaTela();
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
    });
}