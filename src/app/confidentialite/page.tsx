import { PublicPage } from "@/components/public-page";
export const metadata = { title: "Confidentialité" };
export default function Page() { return <PublicPage eyebrow="Document légal" title="Votre activité mérite de la discrétion." text="Cette page constitue un emplacement public pour la politique de confidentialité définitive." sections={[{ heading: "Données prévues", body: "Le schéma prévoit des profils, événements de referral, empreintes techniques anti-fraude et journaux d’audit. Leur base légale et leur durée de conservation doivent être documentées." }]} />; }
