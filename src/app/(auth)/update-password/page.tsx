import { UpdatePasswordForm } from "./UpdatePasswordForm";

export const metadata = {
  title: "Update Password — BookStreak",
  description: "Set a new password for BookStreak",
};

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <main className="flex-1 px-4 py-8 sm:px-6">
        <UpdatePasswordForm />
      </main>
    </div>
  );
}
