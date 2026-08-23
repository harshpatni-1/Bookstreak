import { AuthForm } from "../AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  let initialError: string | undefined;
  if (params?.error === "auth_callback_failed") {
    initialError = "The confirmation or login link has expired or is invalid. Please try signing in again.";
  }
  return <AuthForm mode="login" initialError={initialError} />;
}
