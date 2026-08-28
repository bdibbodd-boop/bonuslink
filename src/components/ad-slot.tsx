export function AdSlot({ placement, className = "" }: { placement: "public-home" | "public-content" | "member-content"; className?: string }) {
    return <aside aria-label="Espace publicitaire" data-ad-placement={placement} className={`hidden min-h-0 ${className}`} />;
}
