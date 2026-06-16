algoritmo "Soma_Matriz_3x3"

var
   mat: vetor[1..3,1..3] de inteiro
   i, j, soma: inteiro

inicio

   soma <- 0

   para i de 1 ate 3 faca
      para j de 1 ate 3 faca
         escreva("Digite o valor [", i, ",", j, "]: ")
         leia(mat[i,j])
         soma <- soma + mat[i,j]
      fimpara
   fimpara

   escreval("")
   escreval("Soma dos elementos: ", soma)

fimalgoritmo
