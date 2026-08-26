"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthForm({
  mode,
  initialError,
}: {
  mode: "login" | "signup";
  initialError?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      setMessage(null);

      const supabase = createClient();
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("provider is not enabled") || msg.includes("unsupported provider") || msg.includes("validation_failed")) {
          setError(
            "Google sign-in is not enabled yet in your Supabase authentication settings. Please sign in with your email."
          );
        } else {
          setError("Google sign-in is currently unavailable. Please try again or use email sign in.");
        }
        setGoogleLoading(false);
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError("Unable to connect to Google sign-in. Please try again or use email sign in.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          const msg = signInError.message.toLowerCase();
          if (
            msg.includes("invalid login credentials") ||
            msg.includes("invalid_grant") ||
            msg.includes("user not found")
          ) {
            setError(
              "Incorrect email or password. If you don't have an account yet, please create one below."
            );
          } else if (msg.includes("email not confirmed")) {
            setError(
              "Your email is not verified yet. Please check your inbox or spam folder for the verification link."
            );
          } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
            setError("Too many sign-in attempts. Please wait a minute and try again.");
          } else {
            setError("Unable to sign in. Please check your details and try again.");
          }
          setLoading(false);
          return;
        }

        // Successfully signed in - check if onboarding is needed
        if (data?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarded")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!profile || !profile.onboarded) {
            window.location.href = "/onboarding";
            return;
          }
        }
        window.location.href = "/dashboard";
      } else {
        // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
          },
        });

        if (signUpError) {
          const msg = signUpError.message.toLowerCase();
          if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user_already_exists")) {
            setError("An account with this email already exists. Please sign in instead.");
          } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
            setError("Too many signup attempts. Please wait a minute and try again.");
          } else if (msg.includes("valid email") || msg.includes("invalid email")) {
            setError("Please enter a valid email address.");
          } else {
            setError("Could not create account. Please try again or sign in.");
          }
          setLoading(false);
          return;
        }

        if (!data.session) {
          setMessage(
            "Account created! Please check your email to confirm your account (or log in directly if email verification is turned off in your project)."
          );
          setLoading(false);
        } else {
          window.location.href = "/onboarding";
        }
      }
    } catch (err: any) {
      setError(
        "Connection error: Could not reach the server. Please check your internet connection and try again."
      );
      setLoading(false);
    }
  };


  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-3xl border-2 border-hairline bg-surface p-8 shadow-sm">
      <div className="text-center">
        <span className="text-4xl" aria-hidden="true">
          📖
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-fg">
          {mode === "login" ? "Welcome back" : "Start your reading streak"}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          {mode === "login"
            ? "Sign in to keep your streak alive."
            : "Create an account in 20 seconds. 14 days free."}
        </p>
      </div>

      {/* Google OAuth Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="tap flex w-full items-center justify-center gap-3 rounded-xl border-2 border-hairline bg-surface-2 py-3 text-sm font-semibold text-fg transition hover:bg-surface-3 disabled:opacity-60"
        >
          <GoogleIcon className="h-5 w-5 shrink-0" />
          <span>{googleLoading ? "Connecting to Google…" : "Continue with Google"}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-hairline" />
        <span className="absolute bg-surface px-3 text-xs uppercase tracking-wider text-fg-subtle">
          or with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-fg" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="mt-1.5 w-full rounded-xl border-2 border-hairline bg-surface px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-fg" htmlFor="password">
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-accent hover:underline"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full rounded-xl border-2 border-hairline bg-surface px-3.5 py-2.5 pr-12 text-sm text-fg outline-none transition focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="tap absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-fg-subtle hover:text-fg"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="tap w-full rounded-xl bg-accent py-3 font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "login"
            ? "Sign in with email"
            : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        {mode === "login" ? (
          <>
            New to BookStreak?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}


