/*
  Warnings:

  - A unique constraint covering the columns `[UserId,SeriesName]` on the table `Rate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rate_UserId_SeriesName_key" ON "Rate"("UserId", "SeriesName");
