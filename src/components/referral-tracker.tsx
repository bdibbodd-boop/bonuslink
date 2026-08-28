"use client";

import { useEffect } from "react";

export function ReferralTracker({ referralCode }: { referralCode: string | null }) {
    useEffect(() => { if (referralCode) void fetch("/api/referrals/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ referralCode }) }); }, [referralCode]);
    return null;
}
