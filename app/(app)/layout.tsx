import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar companyName={user.companyName || "Mon entreprise"} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar userName={user.name || user.email} />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 md:pb-8 lg:px-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
