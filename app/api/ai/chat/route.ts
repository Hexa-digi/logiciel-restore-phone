import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAnthropicClient, NEXUS_SYSTEM_PROMPT } from "@/lib/ai";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function buildCrmContext() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const [nbClients, tachesDuJour, tachesEnRetard, prochainsRdv, devisEnAttente, prospectsActifs] = await Promise.all([
    prisma.client.count(),
    prisma.tache.findMany({
      where: { statut: { not: "terminee" }, dateEcheance: { gte: startOfDay, lt: endOfDay } },
      select: { titre: true, priorite: true },
    }),
    prisma.tache.count({ where: { statut: { not: "terminee" }, dateEcheance: { lt: startOfDay } } }),
    prisma.rdv.findMany({
      where: { debut: { gte: now } },
      orderBy: { debut: "asc" },
      take: 5,
      select: { titre: true, debut: true },
    }),
    prisma.devis.findMany({
      where: { statut: "envoye" },
      select: { numero: true, titre: true },
      take: 10,
    }),
    prisma.prospect.count({ where: { etape: { notIn: ["gagne", "perdu"] } } }),
  ]);

  return `Contexte CRM actuel (a utiliser si pertinent, ne pas reciter mecaniquement) :
- Nombre total de clients : ${nbClients}
- Taches du jour : ${tachesDuJour.map((t) => `${t.titre} (${t.priorite})`).join("; ") || "aucune"}
- Taches en retard : ${tachesEnRetard}
- Prochains rendez-vous : ${prochainsRdv.map((r) => `${r.titre} le ${r.debut.toLocaleString("fr-FR")}`).join("; ") || "aucun"}
- Devis en attente de reponse : ${devisEnAttente.map((d) => `${d.numero} (${d.titre})`).join("; ") || "aucun"}
- Prospects actifs en pipeline : ${prospectsActifs}
Date et heure actuelles : ${now.toLocaleString("fr-FR")}`;
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return new Response(
      "L'assistant IA n'est pas configure. Ajoutez votre cle ANTHROPIC_API_KEY dans les parametres du serveur.",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    await prisma.chatMessage.create({ data: { role: "user", contenu: lastUserMessage.content } });
  }

  const context = await buildCrmContext();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let full = "";
      try {
        const anthropicStream = anthropic.messages.stream({
          model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
          max_tokens: 1024,
          system: `${NEXUS_SYSTEM_PROMPT}\n\n${context}`,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        anthropicStream.on("text", (delta) => {
          full += delta;
          controller.enqueue(encoder.encode(delta));
        });

        await anthropicStream.finalMessage();
        await prisma.chatMessage.create({ data: { role: "assistant", contenu: full } });
      } catch (err) {
        const msg = "\n\n[Erreur assistant IA : " + (err instanceof Error ? err.message : "inconnue") + "]";
        controller.enqueue(encoder.encode(msg));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
