/*
  Warnings:

  - The `Genre` column on the `InfoSeries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `Studio` column on the `InfoSeries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `VoiceActing` column on the `InfoSeries` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InfoSeries" DROP COLUMN "Genre",
ADD COLUMN     "Genre" TEXT[],
DROP COLUMN "Studio",
ADD COLUMN     "Studio" TEXT[],
DROP COLUMN "VoiceActing",
ADD COLUMN     "VoiceActing" TEXT[];
