"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createEmailTemplate(formData: FormData) {
  const nom = str(formData, "nom");
  const sujet = str(formData, "sujet");
  const corps = str(formData, "corps");
  if (!nom || !sujet || !corps) throw new Error("Champs obligatoires manquants");

  await prisma.emailTemplate.create({
    data: {
      nom,
      sujet,
      corps,
      categorie: str(formData, "categorie") || "general",
    },
  });

  revalidatePath("/emails");
}

export async function deleteEmailTemplate(templateId: string) {
  await prisma.emailTemplate.delete({ where: { id: templateId } });
  revalidatePath("/emails");
}

export async function logEmail(formData: FormData) {
  const sujet = str(formData, "sujet");
  const corps = str(formData, "corps");
  const destinataire = str(formData, "destinataire");
  if (!sujet || !corps || !destinataire) throw new Error("Champs obligatoires manquants");

  await prisma.emailLog.create({
    data: {
      sujet,
      corps,
      destinataire,
      clientId: str(formData, "clientId"),
      prospectId: str(formData, "prospectId"),
      statut: "envoye",
      envoyeLe: new Date(),
    },
  });

  revalidatePath("/emails");
  revalidatePath("/prospection");
  revalidatePath("/dashboard");
}
