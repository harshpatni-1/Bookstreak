import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { getEntitlement } from "@/lib/billing/entitlement";
import { TrialBanner } from "@/components/billing/TrialBanner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, onboarded")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) redirect("/onboarding");

  // TrialBanner returns null for paying and lifetime readers, so no condition
  // is needed here — it decides its own visibility from the entitlement.
  const entitlement = await getEntitlement();

  return (
    <AppShell displayName={profile.display_name ?? "Reader"}>
      <TrialBanner entitlement={entitlement} />
      {children}
    </AppShell>
  );
}
