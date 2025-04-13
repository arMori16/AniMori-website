/*
  Warnings:

  - A unique constraint covering the columns `[SeriesViewName]` on the table `InfoSeries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `SeriesViewName` to the `LastViewedSeries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LastViewedSeries" ADD COLUMN     "SeriesViewName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InfoSeries_SeriesViewName_key" ON "InfoSeries"("SeriesViewName");

-- AddForeignKey
ALTER TABLE "LastViewedSeries" ADD CONSTRAINT "LastViewedSeries_SeriesViewName_fkey" FOREIGN KEY ("SeriesViewName") REFERENCES "InfoSeries"("SeriesViewName") ON DELETE CASCADE ON UPDATE CASCADE;
