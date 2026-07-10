import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClientForm } from "@/components/ClientForm";
import { updateClient } from "@/lib/actions/clients";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  const updateWithId = updateClient.bind(null, client.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Modifier ${client.nom}`} />
      <ClientForm client={client} action={updateWithId} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
