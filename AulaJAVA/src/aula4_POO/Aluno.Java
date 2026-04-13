package aula4_POO;

public class Aluno {


    public int RA;
    private String Nome;
    public int Idade;
    public double Nota;

    public void setRA(int RA){
        this.RA = RA;
    }


public int getRA(){
    return this.RA;
}

public void setNome(String Nome){
    this.Nome = Nome;
}

public String getNome(){
    String texto = "Nome: "+ this.Nome;
    return texto;
}

public void setIdade(int idade){
    this.Idade = idade;
}

public int getIdade(){
    return this.Idade;
}

public void setNota(double nota){
    if (nota >= 0 && nota <= 10) {
        this.Nota = nota;
    }
}

public double getNota(){
    return this.Nota;
}

public String verificaSituacao() {
    if (this.Nota >= 7.0) {
        return "Aprovado";
    } else {
        return "Reprovado";
    }
}
} //