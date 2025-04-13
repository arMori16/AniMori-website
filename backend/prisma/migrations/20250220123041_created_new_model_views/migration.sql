-- CreateTable
CREATE TABLE "Views" (
    "Id" SERIAL NOT NULL,
    "IP" TEXT,
    "UserId" INTEGER,
    "SeriesName" TEXT NOT NULL,

    CONSTRAINT "Views_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Views_IP_SeriesName_key" ON "Views"("IP", "SeriesName");

-- CreateIndex
CREATE UNIQUE INDEX "Views_UserId_SeriesName_key" ON "Views"("UserId", "SeriesName");

-- AddForeignKey
ALTER TABLE "Views" ADD CONSTRAINT "Views_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Views" ADD CONSTRAINT "Views_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
