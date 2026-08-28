import { PublicPage } from "@/components/public-page";
import { ReferralPanel } from "@/components/referral-panel";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Parrainage" };
export default async function Page() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <PublicPage eyebrow="Parrainage" title="Faites circuler les bonnes découvertes." text="Connectez Supabase pour générer votre lien personnel." sections={[{ heading: "Un lien à vous", body: "Un code unique sera associé au profil après inscription." }]} />;
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <PublicPage eyebrow="Parrainage" title="Faites circuler les bonnes découvertes." text="Connectez-vous pour accéder à votre code personnel." sections={[{ heading: "Un lien à vous", body: "Créez un compte pour générer votre lien de parrainage." }]} />;
    const [{ data: profile }, { data: referrals }] = await Promise.all([supabase.from("profiles").select("referral_code").eq("id", user.id).single(), supabase.from("referrals").select("id, qualified_at, created_at").eq("sponsor_id", user.id).order("created_at", { ascending: false })]);
    const qualified = referrals?.filter((referral) => referral.qualified_at).length ?? 0;
    return <PublicPage eyebrow="Votre parrainage" title="Faites circuler les bonnes découvertes." text="Partagez votre lien et suivez les associations enregistrées par la plateforme."><div className="md:col-span-2"><ReferralPanel code={profile?.referral_code ?? ""} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"} /><div className="mt-10 grid grid-cols-2 gap-4 sans text-sm"><div className="border border-[#d9d7cb] p-5"><span className="eyebrow">Filleuls</span><p className="mt-4 text-3xl">{referrals?.length ?? 0}</p></div><div className="border border-[#d9d7cb] p-5"><span className="eyebrow">Qualifiés</span><p className="mt-4 text-3xl">{qualified}</p></div></div></div></PublicPage>;
}
