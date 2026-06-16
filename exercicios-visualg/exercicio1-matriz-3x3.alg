algoritmo "Matriz_3x3_Exibicao"

var
   mat: vetor[1..3,1..3] de inteiro
   i, j: inteiro

inicio

   para i de 1 ate 3 faca
      para j de 1 ate 3 faca
         escreva("Digite o valor [", i, ",", j, "]: ")
         leia(mat[i,j])
      fimpara
   fimpara

   escreval("")
   escreval("Matriz digitada:")

   para i de 1 ate 3 faca
      para j de 1 ate 3 faca
         escreva(mat[i,j], " ")
      fimpara
      escreval("")
   fimpara

fimalgoritmo
