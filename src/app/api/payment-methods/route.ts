import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPaymentProvider } from "@/lib/payment-method";

export async function GET() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    const { data, error } = await supabase.from("payment_methods").select("id, provider, account_reference, is_verified, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: "Méthodes indisponibles" }, { status: 503 });
    return NextResponse.json({ paymentMethods: data });
}

export async function POST(request: Request) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    try {
        const body = await request.json() as { provider?: unknown; accountReference?: unknown };
        if (!isPaymentProvider(body.provider) || typeof body.accountReference !== "string" || body.accountReference.trim().length < 4 || body.accountReference.trim().length > 120) return NextResponse.json({ error: "Méthode de paiement invalide" }, { status: 400 });
        const { data, error } = await supabase.from("payment_methods").insert({ user_id: user.id, provider: body.provider, account_reference: body.accountReference.trim() }).select("id, provider, account_reference, is_verified, created_at").single();
        if (error) return NextResponse.json({ error: "Méthode impossible à enregistrer" }, { status: 422 });
        return NextResponse.json({ paymentMethod: data, providerConnected: false }, { status: 201 });
    } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }
}
