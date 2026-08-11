"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/lib/validation/schemas";

export type AuthState = { error?: string } | undefined;

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  } catch (err: any) {
    return { error: err.message ?? "Authentication failed. Please check server setup." };
  }

  redirect("/dashboard");
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email");
  if (!email || typeof email !== "string") return { error: "Invalid email" };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/update-password`,
    });

    if (error) return { error: error.message };
    return { error: "Check your email for a password reset link." };
  } catch (err: any) {
    return { error: err.message ?? "Failed to send reset link." };
  }
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get("password");
  if (!password || typeof password !== "string" || password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
  } catch (err: any) {
    return { error: err.message ?? "Failed to update password." };
  }

  redirect("/dashboard");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (!data.session) {
      return { error: "Check your inbox to confirm your email, then sign in." };
    }
  } catch (err: any) {
    return { error: err.message ?? "Failed to sign up." };
  }

  redirect("/onboarding");
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore sign out errors and redirect to login
  }
  redirect("/login");
}
