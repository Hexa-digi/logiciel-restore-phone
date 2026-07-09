"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

type LigneInput = { description: string; quantite: number; prixUnitaire: number };

async function nextNumero() {
  const year = new Date().getFullYear();
  const count = await prisma.devis.count({
    where: { numero: { startsWith: `DEV-${year}-` } },
  });
  return `DEV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createDevis(formData: FormData) {
  const titre = str(formData, "titre");
  const clientId = str(formData, "clientId");
  if (!titre || !clientId) throw new Error("Titre et client obligatoires");

  const lignesRaw = str(formData, "lignesJson");
  const lignes: LigneInput[] = lignesRaw ? JSON.parse(lignesRaw) : [];
  const dateValidite = str(formData, "dateValidite");
  const numero = await nextNumero();

  const devis = await prisma.devis.create({
    data: {
      numero,
      titre,
      clientId,
      tauxTva: Number(formData.get("tauxTva") || 20),
      notes: str(formData, "notes"),
      dateValidite: dateValidite ? new Date(dateValidite) : null,
      lignes: {
        create: lignes
          .filter((l) => l.description)
          .map((l, i) => ({
            description: l.description,
            quantite: Number(l.quantite) || 1,
            prixUnitaire: Number(l.prixUnitaire) || 0,
            ordre: i,
          })),
      },
    },
  });

  revalidatePath("/devis");
  revalidatePath("/dashboard");
  redirect(`/devis/${devis.id}`);
}

export async function updateDevisStatut(devisId: string, statut: string) {
  await prisma.devis.update({ where: { id: devisId }, data: { statut } });
  revalidatePath("/devis");
  revalidatePath(`/devis/${devisId}`);
  revalidatePath("/dashboard");
}

export async function deleteDevis(devisId: string) {
  await prisma.devis.delete({ where: { id: devisId } });
  revalidatePath("/devis");
  revalidatePath("/dashboard");
  redirect("/devis");
}
