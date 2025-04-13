/*
  Warnings:

  - Added the required column `Type` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LikeType" AS ENUM ('Like', 'Dislike');

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "Type" "LikeType" NOT NULL;
