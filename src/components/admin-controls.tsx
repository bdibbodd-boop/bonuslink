"use client";

import { FormEvent, useState } from "react";

export function AdminControls({ userId, suspended }: { userId: string; suspended: boolean }) {
    const [message, setMessage] = useState("");
    async function toggle() { const response = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "user", userId, suspend: !suspended }) }); setMessage(response.ok ? "Enregistré" : "Échec"); }
    return <button onClick={toggle} className="text-xs font-bold underline">{message || (suspended ? "Réactiver" : "Suspendre")}</button>;
}

export function AdminWithdrawalControl({ withdrawalId, status }: { withdrawalId: string; status: string }) {
    const [message, setMessage] = useState("");
    async function update(nextStatus: string) { const response = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "withdrawal", withdrawalId, status: nextStatus }) }); setMessage(response.ok ? "Enregistré" : "Échec"); }
    const next = status === "PENDING" ? ["PROCESSING", "APPROVED", "REJECTED"] : status === "PROCESSING" ? ["APPROVED", "REJECTED"] : status === "APPROVED" ? ["PAID", "REJECTED"] : [];
    return <span className="flex flex-wrap gap-3 text-xs font-bold">{message || next.map((item) => <button key={item} onClick={() => update(item)} className="underline">{item}</button>)}</span>;
}

export function AdminSettingForm({ settingKey, value }: { settingKey: string; value: number | boolean }) {
    const [current, setCurrent] = useState(String(value)); const [message, setMessage] = useState("");
    async function submit(event: FormEvent) { event.preventDefault(); const parsed = typeof value === "boolean" ? current === "true" : Number(current); const response = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "setting", key: settingKey, value: parsed }) }); setMessage(response.ok ? "Enregistré" : "Échec"); }
    return <form onSubmit={submit} className="flex items-center gap-3"><input aria-label={settingKey} value={current} onChange={(event) => setCurrent(event.target.value)} className="w-32" /><button className="text-xs font-bold underline">{message || "Modifier"}</button></form>;
}
