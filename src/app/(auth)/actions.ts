"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/lib/validation/schemas";

export type AuthState = { error?: string; message?: string } | undefined;

function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }
  return envUrl ? envUrl.replace(/\/$/, "") : "http://localhost:3000";
}

export async function demoSignIn(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("bs-demo-session", "active", { path: "/", maxAge: 86400 * 30 });
  redirect("/dashboard");
}

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
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        return {
          error: "Email not confirmed yet. Please check your inbox/spam folder for the verification link, or disable email confirmation in your Supabase dashboard.",
        };
      }
      if (msg.includes("invalid login credentials") || msg.includes("invalid_grant")) {
        return { error: "Invalid email or password. Please check your credentials." };
      }
      return { error: error.message };
    }
  } catch (err: any) {
    if (err?.message?.includes("Supabase is not configured")) {
      return {
        error: "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing in your deployment environment.",
      };
    }
    if (err?.message?.includes("fetch failed") || err?.message?.includes("ENOTFOUND")) {
      return {
        error: "Cannot connect to Supabase. Please verify that NEXT_PUBLIC_SUPABASE_URL is correct and your Supabase project is active.",
      };
    }
    return { error: err.message ?? "Authentication failed. Please check credentials." };
  }

  redirect("/dashboard");
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email");
  if (!email || typeof email !== "string") return { error: "Invalid email address" };

  try {
    const supabase = await createClient();
    const siteUrl = getSiteUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
    });

    if (error) return { error: error.message };
    return { message: "Check your email for a password reset link." };
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
    const siteUrl = getSiteUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
      },
    });
    if (error) return { error: error.message };

    // When email confirmation is enabled in Supabase, user has no active session until verified
    if (!data.session) {
      return {
        message: "Account created! Please check your inbox to confirm your email, or sign in if confirmation is disabled.",
      };
    }
  } catch (err: any) {
    if (err?.message?.includes("Supabase is not configured")) {
      return {
        error: "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing in your deployment environment.",
      };
    }
    if (err?.message?.includes("fetch failed") || err?.message?.includes("ENOTFOUND")) {
      return {
        error: "Cannot connect to Supabase. Please verify that NEXT_PUBLIC_SUPABASE_URL is correct in your environment variables.",
      };
    }
    return { error: err.message ?? "Failed to sign up." };
  }

  redirect("/onboarding");
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("bs-demo-session");
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore sign out errors and redirect to login
  }
  redirect("/login");
}
