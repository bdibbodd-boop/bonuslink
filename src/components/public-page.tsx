import { SiteShell, PageIntro } from "@/components/site-shell";

export function PublicPage({ eyebrow, title, text, sections = [], children }: { eyebrow: string; title: string; text: string; sections?: { heading: string; body: string }[]; children?: React.ReactNode }) {
    return <SiteShell><main><PageIntro eyebrow={eyebrow} title={title} text={text} /><section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 md:px-10">{sections.map((section) => <article key={section.heading} className="border-t border-[#d9d7cb] pt-5"><h2 className="text-3xl">{section.heading}</h2><p className="sans mt-4 max-w-lg text-sm leading-7 text-[#66705f]">{section.body}</p></article>)}{children}</section></main></SiteShell>;
}
