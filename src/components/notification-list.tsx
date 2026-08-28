"use client";

import { useState } from "react";

type Notification = { id: string; title: string; body: string; read_at: string | null; created_at: string };

export function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState(initialNotifications);
    async function markAsRead(id: string) {
        const response = await fetch("/api/notifications/read", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
        if (response.ok) setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read_at: new Date().toISOString() } : notification));
    }
    if (!notifications.length) return <p className="sans py-5 text-sm text-[#66705f]">Aucune notification.</p>;
    return <div className="divide-y divide-[#d9d7cb] border-y border-[#d9d7cb]">{notifications.map((notification) => <div key={notification.id} className={`flex items-start justify-between gap-5 py-4 sans text-sm ${notification.read_at ? "opacity-60" : ""}`}><div><p className="font-bold">{notification.title}</p><p className="mt-1 text-[#66705f]">{notification.body}</p></div>{!notification.read_at && <button onClick={() => markAsRead(notification.id)} className="shrink-0 text-xs font-bold underline">Marquer lu</button>}</div>)}</div>;
}
