import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    try {
        const body = await request.json() as { action?: string; withdrawalId?: string; status?: string; reason?: string; userId?: string; suspend?: boolean; key?: string; value?: number | boolean };
        let error;
        if (body.action === "withdrawal") {
            if (!body.withdrawalId || !["PROCESSING", "APPROVED", "PAID", "REJECTED", "CANCELLED"].includes(body.status ?? "")) return NextResponse.json({ error: "Action invalide" }, { status: 400 });
            ({ error } = await supabase.rpc("admin_update_withdrawal", { withdrawal_value: body.withdrawalId, next_status: body.status, reason: body.reason ?? null }));
        } else if (body.action === "user") {
            if (!body.userId || typeof body.suspend !== "boolean") return NextResponse.json({ error: "Action invalide" }, { status: 400 });
            ({ error } = await supabase.rpc("admin_set_suspension", { target_user: body.userId, suspend: body.suspend }));
        } else if (body.action === "setting") {
            if (!body.key || (typeof body.value !== "number" && typeof body.value !== "boolean")) return NextResponse.json({ error: "Paramètre invalide" }, { status: 400 });
            ({ error } = await supabase.rpc("admin_set_setting", { setting_key: body.key, setting_value: body.value }));
        } else return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
        if (error) return NextResponse.json({ error: "Action refusée" }, { status: 422 });
        return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }
}
