/*
  Warnings:

  - You are about to drop the column `ip` on the `users` table. All the data in the column will be lost.
  - Added the required column `IP` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cores` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAgent` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Rate" DROP CONSTRAINT "Rate_SeriesName_fkey";

-- DropForeignKey
ALTER TABLE "Rate" DROP CONSTRAINT "Rate_UserId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "ip",
ADD COLUMN     "GPUInfo" TEXT,
ADD COLUMN     "IP" TEXT NOT NULL,
ADD COLUMN     "audioInfo" TEXT,
ADD COLUMN     "cores" INTEGER NOT NULL,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timezone" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE CASCADE ON UPDATE CASCADE;
