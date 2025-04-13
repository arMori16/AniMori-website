-- AlterTable
ALTER TABLE "InfoSeries" ADD COLUMN     "AlternitiveNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Rate" (
    "Id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Value" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    "SeriesName" TEXT NOT NULL,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE RESTRICT ON UPDATE CASCADE;
