package aula4_POO;

public class Produto {


    private int codigo;
    private String nome;
    private double preco;
    private int quantidade;


public void setNome(String nome) {
    this.nome = nome;
}

public String getNome() {
    return this.nome;
}

public int getCodigo() {
    return this.codigo;
}

public void setCodigo(int codigo) {
    this.codigo = codigo;
}

public double getPreco() {
    return this.preco;
}

public void setPreco(double preco) {
    this.preco = preco;
}

 public int getQuantidade() {
    return this.quantidade;
}

public void setQuantidade(int quantidade) {
    this.quantidade = quantidade;
}

public double calcularValorTotal() {
    return this.preco * this.quantidade;
}
}