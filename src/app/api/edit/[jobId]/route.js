import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  const jobId = Number.parseInt(params.jobId)

  try {
    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      include: { service: true },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const jobId = Number.parseInt(params.jobId)
  const data = await request.json()

  try {
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

