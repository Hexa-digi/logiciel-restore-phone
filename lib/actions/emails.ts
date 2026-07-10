"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isMailConfigured, sendMail } from "@/lib/mail";

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

type SendEmailPayload = {
  destinataire: string;
  sujet: string;
  corps: string;
  clientId?: string;
  prospectId?: string;
};

export async function sendEmailNow(payload: SendEmailPayload): Promise<{ success: boolean; error?: string }> {
  const { destinataire, sujet, corps, clientId, prospectId } = payload;
  if (!destinataire || !sujet || !corps) {
    return { success: false, error: "Destinataire, sujet et message sont obligatoires." };
  }
  if (!isMailConfigured()) {
    return { success: false, error: "Aucun serveur SMTP configure (voir Parametres)." };
  }

  try {
    await sendMail({ to: destinataire, subject: sujet, text: corps });
  } catch (err) {
    await prisma.emailLog.create({
      data: {
        sujet,
        corps,
        destinataire,
        clientId: clientId || null,
        prospectId: prospectId || null,
        statut: "echec",
      },
    });
    revalidatePath("/emails");
    return { success: false, error: err instanceof Error ? err.message : "Echec de l'envoi." };
  }

  await prisma.emailLog.create({
    data: {
      sujet,
      corps,
      destinataire,
      clientId: clientId || null,
      prospectId: prospectId || null,
      statut: "envoye",
      envoyeLe: new Date(),
    },
  });

  revalidatePath("/emails");
  revalidatePath("/prospection");
  revalidatePath("/dashboard");
  return { success: true };
}
