import { supabase, unwrap } from "./_shared";

export async function signIn(email: string, password: string) {
  return unwrap(await supabase.auth.signInWithPassword({ email, password }));
}
/** Returns hasSession=false when email confirmation is required. */
export async function signUp(email: string, password: string) {
  const data = unwrap(
    await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/login` } }),
  );
  return { hasSession: !!data.session };
}
export async function signOut() {
  await supabase.auth.signOut();
}
export async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
export function onAuthChange(cb: (event: string) => void) {
  const { data } = supabase.auth.onAuthStateChange((event) => cb(event));
  return () => data.subscription.unsubscribe();
}
