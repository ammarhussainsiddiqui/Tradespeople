-- AlterTable
ALTER TABLE "Jobs" ADD COLUMN     "serviceId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "trade" SET DEFAULT 'Plumbing';

-- AddForeignKey
ALTER TABLE "Jobs" ADD CONSTRAINT "Jobs_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
