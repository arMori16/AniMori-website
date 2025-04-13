-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_ParentId_fkey";

-- CreateTable
CREATE TABLE "Like" (
    "UserId" INTEGER NOT NULL,
    "CommentId" INTEGER NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("UserId","CommentId")
);

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_ParentId_fkey" FOREIGN KEY ("ParentId") REFERENCES "Comments"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_CommentId_fkey" FOREIGN KEY ("CommentId") REFERENCES "Comments"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
