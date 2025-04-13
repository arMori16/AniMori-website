/*
  Warnings:

  - Added the required column `Description` to the `InfoSeries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InfoSeries" ADD COLUMN     "Description" TEXT NOT NULL;
