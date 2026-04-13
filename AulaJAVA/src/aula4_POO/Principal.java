package aula4_POO;

public class Principal {
	
	public static void main (String[] args) {
        Aluno objThiago = new Aluno();
		objThiago.setNome("Thiago");
		objThiago.setIdade(52);
		objThiago.setRA(123456);
		objThiago.setNota(7.5);
		
		System.out.println(objThiago.getNome());
		System.out.println(objThiago.getRA());
		System.out.println(objThiago.getNota());
		System.out.println(objThiago.verificaSituacao());
		
		Aluno objStevan = new Aluno();
		objStevan.setNome("Stevan");
		
		System.out.println(objStevan.getNome());
		System.out.println(objStevan.verificaSituacao());
		
		System.out.println("--------------------");


        Produto prod1 = new Produto();
        prod1.setNome("Coca-cola");
        prod1.setPreco(20);
        prod1.setQuantidade(5);

        System.out.printf("Produto: %s Total de compras %.2f", prod1.getNome(), prod1.calcularValorTotal());

    }
}