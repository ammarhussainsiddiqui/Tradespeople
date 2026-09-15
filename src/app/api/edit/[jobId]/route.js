import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { forbidden, getRequestUser, unauthorized } from "../../../../lib/auth/session"

const prisma = new PrismaClient()

const TRADESPERSON_ROLE = 2

export async function GET(request, { params }) {
  const jobId = Number.parseInt(params.jobId)

  const user = await getRequestUser(request)
  if (!user) return unauthorized()

  try {
    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      include: { service: true },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Homeowners can only read their own jobs; tradespeople can read leads
    if (job.userId !== user.id && user.role !== TRADESPERSON_ROLE) return forbidden()

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const jobId = Number.parseInt(params.jobId)

  const user = await getRequestUser(request)
  if (!user) return unauthorized()

  const data = await request.json()

  try {
    const existing = await prisma.jobs.findUnique({
      where: { id: jobId },
      select: { userId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Only the homeowner who posted the job can edit it
    if (existing.userId !== user.id) return forbidden()

    const updatedJob = await prisma.jobs.update({
      where: { id: jobId },
      data: {
        postcode: data.postcode,
        job: data.job,
        isCompleted: data.isCompleted,
        statusId: data.statusId,
      },
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

