"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "signup" | "login" | "forgot" }) {
    const router = useRouter();
    const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [fullName, setFullName] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
    async function submit(event: FormEvent) {
        event.preventDefault(); setBusy(true); setMessage(""); const supabase = createClient();
        let error: { message: string } | null = null;
        if (mode === "signup") { const referralCode = new URLSearchParams(window.location.search).get("ref")?.toUpperCase() ?? null; const result = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, referral_code: referralCode }, emailRedirectTo: `${window.location.origin}/auth/callback` } }); error = result.error; if (!error) setMessage("Vérifiez votre email pour confirmer votre inscription."); }
        else if (mode === "login") { const result = await supabase.auth.signInWithPassword({ email, password }); error = result.error; if (!error) router.push("/dashboard"); }
        else { const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` }); error = result.error; if (!error) setMessage("Un lien de réinitialisation a été envoyé si cette adresse existe."); }
        if (error) setMessage(error.message); setBusy(false);
    }
    return <form onSubmit={submit} className="sans grid gap-4">{mode === "signup" && <label>Nom complet<input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></label>}<label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>{mode !== "forgot" && <label>Mot de passe<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>}<button disabled={busy} className="rounded-full bg-[#17211b] px-5 py-3 font-bold text-[#f4f1e8] disabled:opacity-50">{busy ? "Patientez…" : mode === "signup" ? "Créer mon compte" : mode === "login" ? "Se connecter" : "Recevoir le lien"}</button>{message && <p role="status" className="text-sm text-[#66705f]">{message}</p>}</form>;
}
