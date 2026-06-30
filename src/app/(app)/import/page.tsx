import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImportClient } from "./ImportClient";

export const metadata = { title: "Import your books — BookStreak" };

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bring your books with you</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Already track reading somewhere else? Move every book over in one go — no typing.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
