/*
  Warnings:

  - A unique constraint covering the columns `[UserId,SeriesName,Episode]` on the table `LastViewedSeries` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LastViewedSeries_UserId_SeriesName_Episode_key" ON "LastViewedSeries"("UserId", "SeriesName", "Episode");
