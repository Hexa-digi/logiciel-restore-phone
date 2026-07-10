"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createClient(formData: FormData) {
  const nom = str(formData, "nom");
  if (!nom) throw new Error("Le nom est obligatoire");

  const client = await prisma.client.create({
    data: {
      nom,
      entreprise: str(formData, "entreprise"),
      email: str(formData, "email"),
      telephone: str(formData, "telephone"),
      adresse: str(formData, "adresse"),
      siret: str(formData, "siret"),
      statut: str(formData, "statut") || "actif",
      notes: str(formData, "notes"),
      tags: str(formData, "tags"),
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  const nom = str(formData, "nom");
  if (!nom) throw new Error("Le nom est obligatoire");

  await prisma.client.update({
    where: { id: clientId },
    data: {
      nom,
      entreprise: str(formData, "entreprise"),
      email: str(formData, "email"),
      telephone: str(formData, "telephone"),
      adresse: str(formData, "adresse"),
      siret: str(formData, "siret"),
      statut: str(formData, "statut") || "actif",
      notes: str(formData, "notes"),
      tags: str(formData, "tags"),
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/clients");
  redirect("/clients");
}
