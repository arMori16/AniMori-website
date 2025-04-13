-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_RoomId_fkey";

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_RoomId_fkey" FOREIGN KEY ("RoomId") REFERENCES "Room"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
