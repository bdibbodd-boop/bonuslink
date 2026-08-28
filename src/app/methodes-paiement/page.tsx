import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_PROVIDERS } from "@/lib/payment-method";

export default async function PaymentMethodsPage() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="mx-auto max-w-2xl px-5 py-24"><p className="eyebrow">Configuration requise</p><h1 className="mt-5 text-5xl">Connectez Supabase pour gérer vos méthodes.</h1></main>;
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/connexion");
    const { data: methods } = await supabase.from("payment_methods").select("id, provider, account_reference, is_verified, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    return <SiteShell><main className="mx-auto max-w-3xl px-5 py-16 md:px-10"><p className="eyebrow">Retraits</p><h1 className="mt-5 text-5xl">Vos méthodes de paiement.</h1><p className="sans mt-6 text-[#66705f]">Les méthodes enregistrées restent en attente de vérification. Aucun fournisseur de paiement n’est connecté.</p><div className="mt-10 divide-y divide-[#d9d7cb] border-y border-[#d9d7cb]">{methods?.length ? methods.map((method) => <div key={method.id} className="flex justify-between gap-4 py-4 sans text-sm"><span>{method.provider} · {method.account_reference}</span><strong>{method.is_verified ? "Vérifiée" : "À vérifier"}</strong></div>) : <p className="py-5 sans text-sm text-[#66705f]">Aucune méthode enregistrée.</p>}</div><p className="eyebrow mt-10">Fournisseurs prévus</p><p className="sans mt-4 text-sm text-[#66705f]">{PAYMENT_PROVIDERS.join(" · ")}</p></main></SiteShell>;
}
