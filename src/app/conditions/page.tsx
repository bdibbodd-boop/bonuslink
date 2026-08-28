import { PublicPage } from "@/components/public-page";
export const metadata = { title: "Conditions" };
export default function Page() { return <PublicPage eyebrow="Document légal" title="Conditions d’utilisation." text="Cette page constitue un emplacement public pour les conditions définitives de BonusLink." sections={[{ heading: "Version de préparation", body: "Les règles contractuelles, les conditions de qualification et les modalités de retrait doivent être validées avant ouverture au public." }]} />; }
