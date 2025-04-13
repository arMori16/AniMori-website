/*
  Warnings:

  - A unique constraint covering the columns `[UserName]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UserName` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "UserName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Participant_UserName_key" ON "Participant"("UserName");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_UserName_fkey" FOREIGN KEY ("UserName") REFERENCES "users"("firstName") ON DELETE RESTRICT ON UPDATE CASCADE;
