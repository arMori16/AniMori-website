-- CreateTable
CREATE TABLE "Carousel" (
    "SeriesName" TEXT NOT NULL,
    "SeriesViewName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Carousel_SeriesName_key" ON "Carousel"("SeriesName");

-- CreateIndex
CREATE UNIQUE INDEX "Carousel_SeriesViewName_key" ON "Carousel"("SeriesViewName");

-- AddForeignKey
ALTER TABLE "Carousel" ADD CONSTRAINT "Carousel_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carousel" ADD CONSTRAINT "Carousel_SeriesViewName_fkey" FOREIGN KEY ("SeriesViewName") REFERENCES "InfoSeries"("SeriesViewName") ON DELETE RESTRICT ON UPDATE CASCADE;
