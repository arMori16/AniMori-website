-- CreateEnum
CREATE TYPE "SeriesStatus" AS ENUM ('Watching', 'Planned', 'Completed', 'OnHold', 'Dropped');

-- CreateTable
CREATE TABLE "UserList" (
    "UserId" INTEGER NOT NULL,
    "SeriesName" TEXT NOT NULL,
    "SeriesViewName" TEXT NOT NULL,
    "Status" "SeriesStatus",
    "Favorite" BOOLEAN
);

-- CreateIndex
CREATE UNIQUE INDEX "UserList_UserId_SeriesName_key" ON "UserList"("UserId", "SeriesName");

-- CreateIndex
CREATE UNIQUE INDEX "UserList_UserId_Status_key" ON "UserList"("UserId", "Status");

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_SeriesViewName_fkey" FOREIGN KEY ("SeriesViewName") REFERENCES "InfoSeries"("SeriesViewName") ON DELETE CASCADE ON UPDATE CASCADE;
