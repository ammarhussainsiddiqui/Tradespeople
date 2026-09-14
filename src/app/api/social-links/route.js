import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserIdFromUrl(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  return parseInt(id);
}

export async function GET(req) {
  const userId = getUserIdFromUrl(req);
  if (!userId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const detail = await prisma.tradepersonDetail.findFirst({
    where: { userId },
  });

  const info = detail?.info || {};
  const socialLinks = info.socialLinks || [];

  return NextResponse.json({ links: socialLinks });
}

export async function POST(req) {
  const userId = getUserIdFromUrl(req);
  if (!userId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { name, icon, link } = await req.json();

  let detail = await prisma.tradepersonDetail.findFirst({ where: { userId } });

  let info = detail?.info || {};
  let socialLinks = info.socialLinks || [];

  const index = socialLinks.findIndex((item) => item.name === name);

  if (index !== -1) {
    socialLinks[index].link = link;
  } else {
    socialLinks.push({ name, icon, link });
  }

  info.socialLinks = socialLinks;

  if (detail) {
    await prisma.tradepersonDetail.update({
      where: { id: detail.id },
      data: { info },
    });
  } else {
    await prisma.tradepersonDetail.create({
      data: {
        userId,
        info,
      },
    });
  }

  return NextResponse.json({ message: "Saved", links: socialLinks });
}


export async function DELETE(req) {
  const userId = getUserIdFromUrl(req);
  if (!userId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { name } = await req.json();

  const detail = await prisma.tradepersonDetail.findFirst({ where: { userId } });

  let info = detail?.info || {};
  let socialLinks = info.socialLinks || [];

  socialLinks = socialLinks.filter((item) => item.name !== name);
  info.socialLinks = socialLinks;

  await prisma.tradepersonDetail.update({
    where: { id: detail.id },
    data: { info },
  });

  return NextResponse.json({ message: "Deleted", links: socialLinks });
}
