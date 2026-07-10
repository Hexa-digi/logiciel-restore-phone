import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { AssistantChat } from "@/components/AssistantChat";

export default async function AssistantPage() {
  const history = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: 40,
  });

  return (
    <div>
      <PageHeader title="Assistant IA" subtitle="Votre copilote pour les taches du quotidien" />
      <AssistantChat
        initialMessages={history.map((h) => ({ role: h.role as "user" | "assistant", content: h.contenu }))}
      />
    </div>
  );
}
