import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="mx-auto max-w-2xl px-5 py-24"><p className="eyebrow">Configuration requise</p><h1 className="mt-5 text-5xl">Configurez Supabase pour ouvrir l’administration.</h1></main>;
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/connexion");
    const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(); if (!admin) redirect("/dashboard");
    const [{ data: users }, { data: withdrawals }, { data: settings }, { count: referrals }, { count: rewards }, { count: fraudEvents }, { data: logs }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, referral_code, suspended_at").order("created_at", { ascending: false }).limit(50), supabase.from("withdrawals").select("id, user_id, amount, status").in("status", ["PENDING", "PROCESSING", "APPROVED"]).order("created_at", { ascending: true }).limit(50), supabase.from("settings").select("key, value").order("key"), supabase.from("referrals").select("id", { count: "exact", head: true }), supabase.from("reward_transactions").select("id", { count: "exact", head: true }), supabase.from("fraud_events").select("id", { count: "exact", head: true }).is("resolved_at", null), supabase.from("audit_logs").select("action, entity_type, created_at").order("created_at", { ascending: false }).limit(20),
    ]);
    return <SiteShell><main className="mx-auto max-w-7xl px-5 py-16 md:px-10"><p className="eyebrow">Administration</p><h1 className="mt-5 text-5xl">Vue opérationnelle.</h1><p className="sans mt-5 text-[#66705f]">Actions protégées par rôle admin et enregistrées dans le journal d’audit.</p><AdminDashboard users={users ?? []} withdrawals={withdrawals ?? []} settings={settings ?? []} referrals={referrals ?? 0} rewards={rewards ?? 0} fraudEvents={fraudEvents ?? 0} logs={logs ?? []} /></main></SiteShell>;
}
