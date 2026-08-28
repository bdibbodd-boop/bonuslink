import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Inscription" };
export default function Page() { return <main className="mx-auto max-w-xl px-5 py-20"><p className="eyebrow">Rejoindre BonusLink</p><h1 className="mt-5 text-5xl">Votre recommandation commence ici.</h1><div className="mt-10"><AuthForm mode="signup" /></div><p className="sans mt-6 text-sm text-[#66705f]"><Link className="underline" href="/connexion">J’ai déjà un compte</Link></p></main>; }
