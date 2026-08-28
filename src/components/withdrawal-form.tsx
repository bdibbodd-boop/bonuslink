"use client";

import { FormEvent, useState } from "react";

type Method = { id: string; provider: string; account_reference: string; is_verified: boolean };
export function WithdrawalForm({ methods }: { methods: Method[] }) {
    const [amount, setAmount] = useState(15000); const [paymentMethodId, setPaymentMethodId] = useState(methods.find((method) => method.is_verified)?.id ?? ""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
    async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); const response = await fetch("/api/withdrawals", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ amount, paymentMethodId }) }); const result = await response.json() as { error?: string; withdrawalId?: string }; setMessage(response.ok ? `Demande enregistrée : ${result.withdrawalId}` : result.error ?? "Retrait refusé"); setBusy(false); }
    const verified = methods.filter((method) => method.is_verified);
    return <form onSubmit={submit} className="sans grid gap-4 border border-[#d9d7cb] bg-[#fffdf6] p-5"><label>Montant en FCFA<input required type="number" min="15000" step="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label><label>Méthode vérifiée<select required value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)}><option value="">Sélectionner</option>{verified.map((method) => <option key={method.id} value={method.id}>{method.provider} · {method.account_reference}</option>)}</select></label><button disabled={busy || !verified.length} className="rounded-full bg-[#17211b] px-5 py-3 font-bold text-[#f4f1e8] disabled:opacity-50">{busy ? "Traitement…" : "Demander le retrait"}</button>{!verified.length && <p className="text-sm text-[#66705f]">Ajoutez une méthode puis attendez sa vérification.</p>}{message && <p role="status" className="text-sm text-[#66705f]">{message}</p>}</form>;
}
