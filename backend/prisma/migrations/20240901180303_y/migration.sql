/*
  Warnings:

  - You are about to drop the column `atToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rtToken` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "atToken",
DROP COLUMN "rtToken";
