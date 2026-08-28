import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    const { data, error } = await supabase.rpc("qualify_current_user");
    if (error) return NextResponse.json({ error: "Qualification indisponible" }, { status: 503 });
    return NextResponse.json({ qualified: Boolean(data) });
}
