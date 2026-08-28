"use client";

import { FormEvent, useState } from "react";

type Campaign = { id: string; name: string; description: string | null; active: boolean };
export function CampaignControls({ campaigns }: { campaigns: Campaign[] }) {
    const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [message, setMessage] = useState("");
    async function save(event: FormEvent) { event.preventDefault(); setMessage(""); const response = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "campaign", name, description, active: true }) }); setMessage(response.ok ? "Campagne enregistrée" : "Échec"); if (response.ok) { setName(""); setDescription(""); } }
    async function toggle(campaign: Campaign) { const response = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "campaign", id: campaign.id, name: campaign.name, description: campaign.description, active: !campaign.active }) }); setMessage(response.ok ? "Campagne mise à jour" : "Échec"); }
    return <div className="grid gap-5"><form onSubmit={save} className="grid gap-3 border border-[#d9d7cb] p-4 sans"><label>Nom<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} /></label><button className="text-left text-xs font-bold underline">Créer une campagne</button>{message && <p role="status" className="text-xs">{message}</p>}</form><div className="divide-y divide-[#d9d7cb] border-y border-[#d9d7cb]">{campaigns.map((campaign) => <div key={campaign.id} className="flex items-center justify-between gap-4 py-3 sans text-sm"><span>{campaign.name}<small className="block text-[#66705f]">{campaign.active ? "Active" : "Inactive"}</small></span><button onClick={() => toggle(campaign)} className="text-xs font-bold underline">{campaign.active ? "Désactiver" : "Activer"}</button></div>)}</div></div>;
}
