import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashReferralValue } from "@/lib/referral";

export async function POST(request: Request) {
    try {
        const body = await request.json() as { referralCode?: string };
        const referralCode = body.referralCode?.trim().toUpperCase();
        if (!referralCode || !/^[A-Z0-9]{6,20}$/.test(referralCode)) return NextResponse.json({ error: "Code referral invalide" }, { status: 400 });
        const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const userAgent = request.headers.get("user-agent") ?? "unknown";
        const visitorKey = hashReferralValue(`${forwarded}:${userAgent}`);
        const ipHash = hashReferralValue(forwarded);
        const userAgentHash = hashReferralValue(userAgent);
        const supabase = await createClient();
        const { data, error } = await supabase.rpc("track_referral_visit", { referral_code_value: referralCode, visitor_key_value: visitorKey, ip_hash_value: ipHash, user_agent_hash_value: userAgentHash });
        if (error) return NextResponse.json({ error: "Tracking indisponible" }, { status: 503 });
        return NextResponse.json({ tracked: Boolean(data) });
    } catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }
}
