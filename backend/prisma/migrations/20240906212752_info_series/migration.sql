-- CreateTable
CREATE TABLE "InfoSeries" (
    "SeriesName" TEXT NOT NULL,
    "Rate" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "ReleaseYear" TEXT NOT NULL,
    "Genre" TEXT NOT NULL,
    "Studio" TEXT NOT NULL,
    "AmountOfEpisode" INTEGER NOT NULL,
    "VoiceActing" TEXT NOT NULL,
    "VideoSource" TEXT NOT NULL,

    CONSTRAINT "InfoSeries_pkey" PRIMARY KEY ("SeriesName")
);
