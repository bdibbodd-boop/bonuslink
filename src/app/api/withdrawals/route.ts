import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    try {
        const body = await request.json() as { amount?: number; paymentMethodId?: string };
        const amount = body.amount;
        if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0 || typeof body.paymentMethodId !== "string") return NextResponse.json({ error: "Données de retrait invalides" }, { status: 400 });
        const { data, error } = await supabase.rpc("request_withdrawal", { amount_value: amount, payment_method_value: body.paymentMethodId });
        if (error) return NextResponse.json({ error: "Retrait refusé" }, { status: 422 });
        return NextResponse.json({ withdrawalId: data }, { status: 201 });
    } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }
}
