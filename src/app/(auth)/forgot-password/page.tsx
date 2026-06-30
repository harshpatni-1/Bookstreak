import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Forgot Password — BookStreak",
  description: "Reset your BookStreak password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <main className="flex-1 px-4 py-8 sm:px-6">
        <ResetPasswordForm />
      </main>
    </div>
  );
}
