-- AlterTable
ALTER TABLE "InfoSeries" ALTER COLUMN "ReleaseYear" DROP NOT NULL,
ALTER COLUMN "AmountOfEpisode" DROP NOT NULL,
ALTER COLUMN "Genre" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "Studio" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "VoiceActing" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "Description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LastViewedSeries" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "SeriesName" TEXT NOT NULL,
    "Episode" INTEGER NOT NULL,
    "LastViewed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TimeStopped" INTEGER NOT NULL,

    CONSTRAINT "LastViewedSeries_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LastViewedSeries_UserId_SeriesName_key" ON "LastViewedSeries"("UserId", "SeriesName");

-- AddForeignKey
ALTER TABLE "LastViewedSeries" ADD CONSTRAINT "LastViewedSeries_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastViewedSeries" ADD CONSTRAINT "LastViewedSeries_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE CASCADE ON UPDATE CASCADE;
