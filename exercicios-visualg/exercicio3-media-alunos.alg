algoritmo "Media_Alunos"

var
   notas: vetor[1..4,1..2] de real
   i, j: inteiro
   media: real

inicio

   para i de 1 ate 4 faca
      para j de 1 ate 2 faca
         escreva("Aluno ", i, " - Nota ", j, ": ")
         leia(notas[i,j])
      fimpara
   fimpara

   escreval("")

   para i de 1 ate 4 faca
      media <- 0

      para j de 1 ate 2 faca
         media <- media + notas[i,j]
      fimpara

      media <- media / 2

      escreval("Media do aluno ", i, ": ", media)
   fimpara

fimalgoritmo
