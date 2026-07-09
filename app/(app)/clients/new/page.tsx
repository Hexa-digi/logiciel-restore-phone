import { PageHeader } from "@/components/ui/PageHeader";
import { ClientForm } from "@/components/ClientForm";
import { createClient } from "@/lib/actions/clients";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nouveau client" subtitle="Ajoutez une fiche client a votre CRM" />
      <ClientForm action={createClient} submitLabel="Creer le client" />
    </div>
  );
}
