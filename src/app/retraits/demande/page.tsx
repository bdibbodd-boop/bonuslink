import { redirect } from "next/navigation";
import { WithdrawalForm } from "@/components/withdrawal-form";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";

export default async function WithdrawalRequestPage() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="mx-auto max-w-2xl px-5 py-24"><p className="eyebrow">Configuration requise</p><h1 className="mt-5 text-5xl">Connectez Supabase pour demander un retrait.</h1></main>;
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/connexion");
    const { data: methods } = await supabase.from("payment_methods").select("id, provider, account_reference, is_verified").eq("user_id", user.id).order("created_at", { ascending: false });
    return <SiteShell><main className="mx-auto max-w-2xl px-5 py-16 md:px-10"><p className="eyebrow">Retraits</p><h1 className="mt-5 text-5xl">Demander un retrait.</h1><p className="sans mt-6 text-[#66705f]">Le serveur vérifie le seuil, le solde, la méthode et les demandes en cours. Aucun paiement n’est envoyé automatiquement.</p><div className="mt-10"><WithdrawalForm methods={methods ?? []} /></div></main></SiteShell>;
}
