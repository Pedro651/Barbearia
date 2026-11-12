/*
  Warnings:

  - You are about to drop the `haircuts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "haircuts" DROP CONSTRAINT "haircuts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "servicoAgendado" DROP CONSTRAINT "servicoAgendado_haircut_id_fkey";

-- DropTable
DROP TABLE "haircuts";
