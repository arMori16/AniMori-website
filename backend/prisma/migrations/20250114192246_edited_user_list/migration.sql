/*
  Warnings:

  - A unique constraint covering the columns `[UserId,SeriesName,Status]` on the table `UserList` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserList_UserId_Status_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserList_UserId_SeriesName_Status_key" ON "UserList"("UserId", "SeriesName", "Status");
