/*
  Warnings:

  - Added the required column `SeriesViewName` to the `InfoSeries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InfoSeries" ADD COLUMN     "SeriesViewName" TEXT NOT NULL;
