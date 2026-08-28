import Link from "next/link";

const links = [["Comment ça marche", "/comment-ca-marche"], ["Parrainage", "/parrainage"], ["Récompenses", "/recompenses"], ["Retraits", "/retraits"]];

export function SiteShell({ children }: { children: React.ReactNode }) {
    return <><header className="sans mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10"><Link href="/" className="text-2xl font-black tracking-tight">bonus<span className="text-[#ff7657]">link</span><span className="text-sm">®</span></Link><nav className="hidden gap-6 text-sm font-bold md:flex">{links.map(([label, href]) => <Link key={href} href={href} className="transition-opacity hover:opacity-60">{label}</Link>)}</nav><Link href="/contact" className="rounded-full bg-[#17211b] px-4 py-2 text-sm font-bold text-[#f4f1e8]">Commencer</Link></header>{children}<footer className="sans border-t border-[#d9d7cb] px-5 py-10 md:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row"><p className="text-sm font-bold">bonus<span className="text-[#ff7657]">link</span> · La recommandation qui compte.</p><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#66705f]"><Link href="/faq">FAQ</Link><Link href="/a-propos">À propos</Link><Link href="/conditions">Conditions</Link><Link href="/confidentialite">Confidentialité</Link></div></div></footer></>;
}

export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
    return <section className="grain border-y border-[#d9d7cb] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-5xl"><p className="eyebrow mb-6">{eyebrow}</p><h1 className="display max-w-4xl">{title}</h1><p className="sans mt-8 max-w-xl text-lg leading-7 text-[#66705f]">{text}</p></div></section>;
}
