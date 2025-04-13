/*
  Warnings:

  - A unique constraint covering the columns `[firstName]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UserName` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "UserName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_firstName_key" ON "users"("firstName");

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_UserName_fkey" FOREIGN KEY ("UserName") REFERENCES "users"("firstName") ON DELETE RESTRICT ON UPDATE CASCADE;
