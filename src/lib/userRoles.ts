import { supabase } from "./supabase";

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data?.role;
}