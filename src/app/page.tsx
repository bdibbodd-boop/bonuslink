import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function Home() {
  return (
    <SiteShell>
      <main>
        <section className="grain grid min-h-[calc(100vh-88px)] items-center gap-12 border-y border-[#d9d7cb] px-5 py-16 md:grid-cols-[1.35fr_.65fr] md:px-10">
          <div className="mx-auto max-w-7xl md:col-span-2">
            <p className="eyebrow mb-7">Une plateforme pensée pour le bouche-à-oreille</p>
            <h1 className="display max-w-5xl">Recommandez<br /><em className="text-[#ff7657]">avec impact.</em></h1>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/comment-ca-marche" className="sans rounded-full bg-[#17211b] px-6 py-3 font-bold text-[#f4f1e8]">Découvrir BonusLink ↗</Link>
              <span className="sans max-w-xs text-sm text-[#66705f]">Un espace clair pour suivre vos recommandations et vos récompenses.</span>
            </div>
          </div>
          <div className="md:col-start-2 md:row-start-2">
            <div className="bg-[#c8ef62] p-7">
              <p className="eyebrow">Le principe</p>
              <p className="mt-10 text-3xl leading-tight">Chaque recommandation utile mérite d’être reconnue.</p>
              <p className="sans mt-8 text-sm leading-6">BonusLink prépare une expérience de parrainage transparente. Les montants et conditions seront affichés selon la configuration active de la plateforme.</p>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="eyebrow">01 / Simple</p>
              <h2 className="mt-4 text-3xl">Un lien personnel</h2>
              <p className="sans mt-4 text-sm leading-6 text-[#66705f]">Partagez votre lien quand vous le souhaitez et gardez une vue claire sur son activité.</p>
            </div>
            <div>
              <p className="eyebrow">02 / Lisible</p>
              <h2 className="mt-4 text-3xl">Un solde traçable</h2>
              <p className="sans mt-4 text-sm leading-6 text-[#66705f]">Les récompenses sont conçues pour reposer sur un ledger vérifiable, pas sur un compteur opaque.</p>
            </div>
            <div>
              <p className="eyebrow">03 / Responsable</p>
              <h2 className="mt-4 text-3xl">Des retraits encadrés</h2>
              <p className="sans mt-4 text-sm leading-6 text-[#66705f]">Les moyens de paiement seront activés uniquement après connexion de fournisseurs réels.</p>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
