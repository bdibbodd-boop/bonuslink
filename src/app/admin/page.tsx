import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="mx-auto max-w-2xl px-5 py-24"><p className="eyebrow">Configuration requise</p><h1 className="mt-5 text-5xl">Configurez Supabase pour ouvrir l’administration.</h1></main>;
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/connexion");
    const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(); if (!admin) redirect("/dashboard");
    const [{ count: users }, { count: referrals }, { count: pendingWithdrawals }, { count: fraudEvents }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }), supabase.from("referrals").select("id", { count: "exact", head: true }), supabase.from("withdrawals").select("id", { count: "exact", head: true }).in("status", ["PENDING", "PROCESSING", "APPROVED"]), supabase.from("fraud_events").select("id", { count: "exact", head: true }).is("resolved_at", null),
    ]);
    return <SiteShell><main className="mx-auto max-w-7xl px-5 py-16 md:px-10"><p className="eyebrow">Administration</p><h1 className="mt-5 text-5xl">Vue opérationnelle.</h1><p className="sans mt-5 text-[#66705f]">Lecture protégée des indicateurs. Les changements sensibles nécessiteront des actions serveur auditées.</p><section className="mt-12 grid gap-4 md:grid-cols-4">{[["Utilisateurs", users], ["Referrals", referrals], ["Retraits à revoir", pendingWithdrawals], ["Fraudes ouvertes", fraudEvents]].map(([label, value]) => <div key={label} className="border border-[#d9d7cb] p-5"><p className="eyebrow">{label}</p><p className="mt-6 text-3xl">{value ?? 0}</p></div>)}</section></main></SiteShell>;
}
