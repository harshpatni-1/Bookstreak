import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types";
import { ShelfBoard } from "./ShelfBoard";

export const dynamic = "force-dynamic";

export default async function ShelfPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", user!.id)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  return <ShelfBoard initialBooks={(books ?? []) as Book[]} />;
}
