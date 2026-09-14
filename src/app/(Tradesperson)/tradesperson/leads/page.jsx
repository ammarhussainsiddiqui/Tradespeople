import { PrismaClient } from '@prisma/client';
import Page from './LeadsPage';
const prisma = new PrismaClient(); // Prisma client instance


export async function generateMetadata({ searchParams }) {
  const { jobid } = searchParams; // Extract `jobid` from URL search parameters

  // If no jobId is present, return nothing for metadata
  if (!jobid) {
    return {}; // Do not return any metadata
  }

  // If jobid exists, fetch the job data to generate dynamic metadata
  let jobData;
  try {
    jobData = await prisma.jobs.findUnique({
      where: { id: parseInt(jobid) },
      include: {
        user: true,
        jobStatus: true,
        service: {
          include: {
            mainTrade: true,
          },
        },
      },
    });
    if (!jobData) {
    }

    // Generate dynamic metadata based on job data
    return {
      title: `${jobData?.service?.type || 'Service Type'} | ${jobData?.job?.headline || 'Job Headline'}`,
      description: jobData?.job?.description || 'Job details',
      openGraph: {
        title: `${jobData?.service?.type} | ${jobData?.job?.headline}`,
        description: jobData?.job?.description || 'Job details',
        url: `${process.env.NEXT_BASE_URL}/tradesperson/leads?jobid=${jobid}`,
        images: [
          {
            url: `${process.env.NEXT_BASE_URL}/images/jobmeta.webp`,
            width: 1200,
            height: 630,
            alt: `Job Image`,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${jobData?.service?.type} | ${jobData?.job?.headline}`,
        description: jobData?.job?.description || 'Job details',
        images: [`${process.env.NEXT_BASE_URL}/images/jobmeta.png`],
      },
    };
  } catch (error) {
  }
}

export default async function LeadsPage() {
  return (
    <div>
      <Page />
    </div>
  );
}
