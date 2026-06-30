import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
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

  if (profile?.onboarded) redirect("/dashboard");

  return (
    <OnboardingForm
      defaultName={profile?.display_name ?? user.email?.split("@")[0] ?? ""}
    />
  );
}
