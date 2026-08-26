import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { getEntitlement } from "@/lib/billing/entitlement";
import { DisplayPrefs } from "@/components/ThemeToggle";
import { SettingsForm } from "./SettingsForm";
import { ExportButton } from "./ExportButton";

export const metadata: Metadata = { title: "Settings — BookStreak" };

export const dynamic = "force-dynamic";

/** One labelled card per topic, so the page can be scanned rather than read. */
function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="rounded-3xl border-2 border-hairline bg-surface p-5"
    >
      <h2 id={`${id}-heading`} className="text-lg font-bold text-fg">
        {title}
      </h2>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, ent] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    getEntitlement(),
  ]);

  // Plain-language summary of billing state. No jargon like "entitlement" or
  // "period end" — just what the reader has and what happens next.
  const plan = {
    trialing: `Free trial — ${ent.trialDaysLeft ?? 0} ${
      (ent.trialDaysLeft ?? 0) === 1 ? "day" : "days"
    } left`,
    trial_ending: `Free trial — ends in ${ent.trialDaysLeft ?? 0} ${
      (ent.trialDaysLeft ?? 0) === 1 ? "day" : "days"
    }`,
    active: "Monthly plan — active",
    lifetime: "Lifetime access — paid once, yours forever",
    past_due: "Payment didn't go through",
    expired: "Free trial has ended",
  }[ent.state];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">Settings</h1>
        <p className="mt-1 text-fg-muted">
          Your name, how the app looks, and your data.
        </p>
      </div>

      <Section
        id="profile"
        title="Your name"
        description="This is the name shown on your dashboard and streak cards."
      >
        <SettingsForm
          displayName={profile?.display_name ?? user.email?.split("@")[0] ?? ""}
        />
      </Section>

      <Section
        id="display"
        title="Display"
        description="Make text bigger, switch to dark mode, or increase contrast. Changes apply straight away and are remembered on this device."
      >
        <DisplayPrefs />
      </Section>

      <Section
        id="export"
        title="Your data"
        description="Download everything you've logged as a spreadsheet file. It opens in Excel, Numbers, or Google Sheets. This always works, including after a trial ends."
      >
        <ExportButton />
      </Section>

      <Section
        id="billing"
        title="Plan and payment"
        description={plan}
      >
        <Link
          href="/settings/billing"
          className="tap inline-flex items-center justify-center rounded-xl border-2 border-hairline px-5 py-2.5 text-sm font-semibold text-fg-muted transition hover:bg-surface-2"
        >
          View plan details
        </Link>
      </Section>

      <Section
        id="account"
        title="Account"
        description={`Signed in as ${user.email ?? profile?.display_name ?? "Reader"}`}
      >
        <form action={signOut}>
          <button
            type="submit"
            className="tap inline-flex items-center justify-center rounded-xl border-2 border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
          >
            Sign out of BookStreak
          </button>
        </form>
      </Section>
    </div>
  );
}

