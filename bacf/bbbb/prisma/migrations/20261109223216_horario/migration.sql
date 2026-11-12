/*
  Warnings:

  - Added the required column `horarioId` to the `servicoAgendado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "servicoAgendado" ADD COLUMN     "horarioId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Horario" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Horario_date_hour_key" ON "Horario"("date", "hour");

-- AddForeignKey
ALTER TABLE "servicoAgendado" ADD CONSTRAINT "servicoAgendado_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "Horario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
