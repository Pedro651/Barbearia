/*
  Warnings:

  - Added the required column `user_id` to the `Barbeiro` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Barbeiro" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Barbeiro" ADD CONSTRAINT "Barbeiro_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
