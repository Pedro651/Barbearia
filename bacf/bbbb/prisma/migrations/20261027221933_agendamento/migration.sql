/*
  Warnings:

  - You are about to drop the `services` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_haircut_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_user_id_fkey";

-- DropTable
DROP TABLE "services";

-- CreateTable
CREATE TABLE "servicoAgendado" (
    "id" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "barbeiro" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "haircut_id" TEXT NOT NULL,

    CONSTRAINT "servicoAgendado_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "servicoAgendado" ADD CONSTRAINT "servicoAgendado_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicoAgendado" ADD CONSTRAINT "servicoAgendado_haircut_id_fkey" FOREIGN KEY ("haircut_id") REFERENCES "haircuts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
