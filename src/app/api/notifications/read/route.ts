import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    const body = await request.json() as { notificationId?: string };
    if (!body.notificationId || !/^[0-9a-f-]{36}$/i.test(body.notificationId)) return NextResponse.json({ error: "Notification invalide" }, { status: 400 });
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", body.notificationId).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
    return NextResponse.json({ read: true });
}
