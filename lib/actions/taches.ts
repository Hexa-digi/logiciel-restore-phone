"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createTache(formData: FormData) {
  const titre = str(formData, "titre");
  if (!titre) throw new Error("Le titre est obligatoire");
  const dateEcheance = str(formData, "dateEcheance");

  await prisma.tache.create({
    data: {
      titre,
      description: str(formData, "description"),
      priorite: str(formData, "priorite") || "normale",
      clientId: str(formData, "clientId"),
      dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
    },
  });

  revalidatePath("/taches");
  revalidatePath("/dashboard");
}

export async function updateTacheStatut(tacheId: string, statut: string) {
  await prisma.tache.update({ where: { id: tacheId }, data: { statut } });
  revalidatePath("/taches");
  revalidatePath("/dashboard");
}

export async function deleteTache(tacheId: string) {
  await prisma.tache.delete({ where: { id: tacheId } });
  revalidatePath("/taches");
  revalidatePath("/dashboard");
}
