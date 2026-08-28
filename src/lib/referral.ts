import { createHmac } from "node:crypto";

export function hashReferralValue(value: string) {
    const salt = process.env.REFERRAL_TRACKING_SALT;
    if (!salt) throw new Error("REFERRAL_TRACKING_SALT is not configured");
    return createHmac("sha256", salt).update(value).digest("hex");
}
