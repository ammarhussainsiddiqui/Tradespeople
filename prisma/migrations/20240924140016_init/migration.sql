-- DropForeignKey
ALTER TABLE "Viewed_leads" DROP CONSTRAINT "Viewed_leads_JobId_fkey";

-- AddForeignKey
ALTER TABLE "Viewed_leads" ADD CONSTRAINT "Viewed_leads_JobId_fkey" FOREIGN KEY ("JobId") REFERENCES "Jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
