"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function updateCompanyProfile(formData: FormData) {
  const user = await requireUser();
  if (!user) throw new Error("Non authentifie");

  const companyName = String(formData.get("companyName") || "").trim();
  const name = String(formData.get("name") || "").trim();

  await prisma.user.update({
    where: { id: user.id },
    data: { companyName: companyName || null, name: name || null },
  });

  revalidatePath("/parametres");
}

export async function createNewsSource(formData: FormData) {
  const nom = String(formData.get("nom") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const categorie = String(formData.get("categorie") || "tech");
  if (!nom || !url) throw new Error("Nom et URL obligatoires");

  await prisma.newsSource.create({ data: { nom, url, categorie } });
  revalidatePath("/parametres");
  revalidatePath("/actus");
}

export async function toggleNewsSource(sourceId: string, actif: boolean) {
  await prisma.newsSource.update({ where: { id: sourceId }, data: { actif } });
  revalidatePath("/parametres");
  revalidatePath("/actus");
}

export async function deleteNewsSource(sourceId: string) {
  await prisma.newsSource.delete({ where: { id: sourceId } });
  revalidatePath("/parametres");
  revalidatePath("/actus");
}
