"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createRdv(formData: FormData) {
  const titre = str(formData, "titre");
  const debut = str(formData, "debut");
  if (!titre || !debut) throw new Error("Titre et date de debut obligatoires");
  const fin = str(formData, "fin");

  await prisma.rdv.create({
    data: {
      titre,
      lieu: str(formData, "lieu"),
      notes: str(formData, "notes"),
      clientId: str(formData, "clientId"),
      debut: new Date(debut),
      fin: fin ? new Date(fin) : null,
    },
  });

  revalidatePath("/rdv");
  revalidatePath("/dashboard");
}

export async function deleteRdv(rdvId: string) {
  await prisma.rdv.delete({ where: { id: rdvId } });
  revalidatePath("/rdv");
  revalidatePath("/dashboard");
}
