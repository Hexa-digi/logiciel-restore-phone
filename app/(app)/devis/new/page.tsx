import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { DevisForm } from "@/components/DevisForm";

export default async function NewDevisPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const clients = await prisma.client.findMany({ orderBy: { nom: "asc" } });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nouveau devis" subtitle="Composez votre devis ligne par ligne" />
      <DevisForm clients={clients} defaultClientId={searchParams?.clientId} />
    </div>
  );
}
