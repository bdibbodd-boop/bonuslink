import { redirect } from "next/navigation";
import { NotificationList } from "@/components/notification-list";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="mx-auto max-w-2xl px-5 py-24"><p className="eyebrow">Configuration requise</p><h1 className="mt-5 text-5xl">Connectez Supabase pour voir vos notifications.</h1></main>;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/connexion");
    const { data: notifications } = await supabase.from("notifications").select("id, title, body, read_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    return <SiteShell><main className="mx-auto max-w-3xl px-5 py-16 md:px-10"><p className="eyebrow">Espace membre</p><h1 className="mt-5 text-5xl">Vos notifications.</h1><div className="mt-10"><NotificationList initialNotifications={notifications ?? []} /></div></main></SiteShell>;
}
