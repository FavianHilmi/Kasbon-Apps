import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashoardPage from "./dashboard";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=unauthorized");
  }

  return <DashoardPage />;
}