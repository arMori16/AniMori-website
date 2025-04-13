-- CreateTable
CREATE TABLE "Room" (
    "Id" SERIAL NOT NULL,
    "Code" TEXT NOT NULL,
    "SeriesName" TEXT NOT NULL,
    "HostId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "RoomId" INTEGER NOT NULL,
    "JoinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsHost" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_Code_key" ON "Room"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Room_HostId_key" ON "Room"("HostId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_UserId_key" ON "Participant"("UserId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_HostId_fkey" FOREIGN KEY ("HostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_SeriesName_fkey" FOREIGN KEY ("SeriesName") REFERENCES "InfoSeries"("SeriesName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_RoomId_fkey" FOREIGN KEY ("RoomId") REFERENCES "Room"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
