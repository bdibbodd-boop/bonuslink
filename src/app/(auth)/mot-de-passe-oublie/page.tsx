import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Mot de passe oublié" };
export default function Page() { return <main className="mx-auto max-w-xl px-5 py-20"><p className="eyebrow">Accès au compte</p><h1 className="mt-5 text-5xl">Réinitialiser votre mot de passe.</h1><div className="mt-10"><AuthForm mode="forgot" /></div><p className="sans mt-6 text-sm text-[#66705f]"><Link className="underline" href="/connexion">Retour à la connexion</Link></p></main>; }
