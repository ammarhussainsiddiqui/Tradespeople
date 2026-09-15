import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { forbidden, getRequestUser, unauthorized } from "../../../lib/auth/session";

const prisma = new PrismaClient();

function getUserIdFromUrl(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  return parseInt(id);
}

// Changes are limited to the logged-in tradesperson's own links.
async function authorizeOwner(req) {
  const userId = getUserIdFromUrl(req);
  if (!userId) return { error: NextResponse.json({ error: "Missing id" }, { status: 400 }) };

  const user = await getRequestUser(req);
  if (!user) return { error: unauthorized() };
  if (user.id !== userId) return { error: forbidden() };

  return { userId };
}

// Social links are shown on public profiles, so reading them stays open.
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
  const { userId, error } = await authorizeOwner(req);
  if (error) return error;

  const { name, icon, link } = await req.json();

  // Only web links, so a saved link can't be a javascript: URL
  if (typeof link !== "string" || !/^https?:\/\/\S+$/i.test(link)) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

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
  const { userId, error } = await authorizeOwner(req);
  if (error) return error;

  const { name } = await req.json();

  const detail = await prisma.tradepersonDetail.findFirst({ where: { userId } });
  if (!detail) return NextResponse.json({ message: "Deleted", links: [] });

  let info = detail.info || {};
  let socialLinks = info.socialLinks || [];

  socialLinks = socialLinks.filter((item) => item.name !== name);
  info.socialLinks = socialLinks;

  await prisma.tradepersonDetail.update({
    where: { id: detail.id },
    data: { info },
  });

  return NextResponse.json({ message: "Deleted", links: socialLinks });
}
