import { supabase } from "./supabase";

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function isAdmin() {
  const user = await getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return !!data;
}