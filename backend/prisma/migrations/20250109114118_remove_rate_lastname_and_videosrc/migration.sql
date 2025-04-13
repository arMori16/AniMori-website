/*
  Warnings:

  - You are about to drop the column `Rate` on the `InfoSeries` table. All the data in the column will be lost.
  - You are about to drop the column `VideoSource` on the `InfoSeries` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InfoSeries" DROP COLUMN "Rate",
DROP COLUMN "VideoSource";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastName";
