-- CreateTable
CREATE TABLE "Comments" (
    "Id" SERIAL NOT NULL,
    "SeriesName" TEXT NOT NULL,
    "ParentId" INTEGER,
    "UserId" INTEGER NOT NULL,
    "CommentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_ParentId_fkey" FOREIGN KEY ("ParentId") REFERENCES "Comments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
