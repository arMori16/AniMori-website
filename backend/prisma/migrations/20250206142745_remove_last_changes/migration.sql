/*
  Warnings:

  - You are about to drop the column `GPUInfo` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `IP` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `audioInfo` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `cores` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "GPUInfo",
DROP COLUMN "IP",
DROP COLUMN "audioInfo",
DROP COLUMN "cores",
DROP COLUMN "timezone",
DROP COLUMN "userAgent";
