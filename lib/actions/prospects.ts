"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createProspect(formData: FormData) {
  const nom = str(formData, "nom");
  if (!nom) throw new Error("Le nom est obligatoire");
  const prochaineRelance = str(formData, "prochaineRelance");

  await prisma.prospect.create({
    data: {
      nom,
      entreprise: str(formData, "entreprise"),
      email: str(formData, "email"),
      telephone: str(formData, "telephone"),
      source: str(formData, "source"),
      notes: str(formData, "notes"),
      etape: str(formData, "etape") || "nouveau",
      scoreInteret: Number(formData.get("scoreInteret") || 0),
      prochaineRelance: prochaineRelance ? new Date(prochaineRelance) : null,
    },
  });

  revalidatePath("/prospection");
  revalidatePath("/dashboard");
}

export async function updateProspectEtape(prospectId: string, etape: string) {
  await prisma.prospect.update({ where: { id: prospectId }, data: { etape } });
  revalidatePath("/prospection");
  revalidatePath("/dashboard");
}

export async function convertProspectToClient(prospectId: string) {
  const prospect = await prisma.prospect.findUniqueOrThrow({ where: { id: prospectId } });

  const client = await prisma.client.create({
    data: {
      nom: prospect.nom,
      entreprise: prospect.entreprise,
      email: prospect.email,
      telephone: prospect.telephone,
      statut: "actif",
      notes: prospect.notes,
    },
  });

  await prisma.prospect.update({
    where: { id: prospectId },
    data: { etape: "gagne", clientId: client.id },
  });

  revalidatePath("/prospection");
  revalidatePath("/clients");
  revalidatePath("/dashboard");
}

export async function deleteProspect(prospectId: string) {
  await prisma.prospect.delete({ where: { id: prospectId } });
  revalidatePath("/prospection");
  revalidatePath("/dashboard");
}
