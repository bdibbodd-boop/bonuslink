import { PublicPage } from "@/components/public-page";
export const metadata = { title: "Contact" };
export default function Page() { return <PublicPage eyebrow="Contact" title="Parlons de votre recommandation." text="Le formulaire de contact sera connecté à un service de messagerie dans une prochaine étape." sections={[{ heading: "Support", body: "Aucune adresse de support n’est publiée tant qu’un canal opérationnel n’est pas configuré." }, { heading: "Partenariats", body: "Les demandes de partenariat pourront être reçues après mise en place d’un traitement serveur sécurisé." }]} />; }
