import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Connexion" };
export default function Page() { return <main className="mx-auto max-w-xl px-5 py-20"><p className="eyebrow">Espace membre</p><h1 className="mt-5 text-5xl">Bienvenue à nouveau.</h1><div className="mt-10"><AuthForm mode="login" /></div><p className="sans mt-6 text-sm text-[#66705f]"><Link className="underline" href="/mot-de-passe-oublie">Mot de passe oublié ?</Link> · <Link className="underline" href="/inscription">Créer un compte</Link></p></main>; }
