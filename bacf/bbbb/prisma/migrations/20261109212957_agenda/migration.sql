/*
  Warnings:

  - You are about to drop the column `barbeiro` on the `servicoAgendado` table. All the data in the column will be lost.
  - You are about to drop the column `servico` on the `servicoAgendado` table. All the data in the column will be lost.
  - Added the required column `barbeiroId` to the `servicoAgendado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicoId` to the `servicoAgendado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "servicoAgendado" DROP COLUMN "barbeiro",
DROP COLUMN "servico",
ADD COLUMN     "barbeiroId" TEXT NOT NULL,
ADD COLUMN     "servicoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Servico" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barbeiro" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Barbeiro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "servicoAgendado" ADD CONSTRAINT "servicoAgendado_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicoAgendado" ADD CONSTRAINT "servicoAgendado_barbeiroId_fkey" FOREIGN KEY ("barbeiroId") REFERENCES "Barbeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
