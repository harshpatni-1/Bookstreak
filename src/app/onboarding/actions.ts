"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/schemas";

export type OnboardState = { error?: string } | undefined;

export async function completeOnboarding(
  _prev: OnboardState,
  formData: FormData
): Promise<OnboardState> {
  const parsed = onboardingSchema.safeParse({
    display_name: formData.get("display_name"),
    timezone: formData.get("timezone"),
    yearly_goal_books: formData.get("yearly_goal_books"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // upsert (not update): the profiles row is normally created by the
  // handle_new_user trigger, but if that hasn't run a plain update would
  // silently match zero rows and the name would never be stored.
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...parsed.data, onboarded: true }, { onConflict: "id" });
  if (error) return { error: error.message };

  redirect("/dashboard");
}
