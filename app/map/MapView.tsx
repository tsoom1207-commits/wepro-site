"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CATEGORY_ICONS: Record<string, string> = {
    apartment: "🏢", house: "🏠", land: "🌱",
    commercial: "🏬", camp: "🌲", office: "💼",
};

const CATEGORY_LABELS: Record<string, string> = {
    apartment: "Орон сууц", house: "Хаус", land: "Газар",
    commercial: "Обьект", camp: "Зуслан", office: "Оффис",
};

function makeIcon(type: string) {
    const color = type === "sale" ? "#facc15" : "#3b82f6";
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
            <path d="M18 0C8 0 0 8 0 18c0 12 18 26 18 26S36 30 36 18C36 8 28 0 18 0z" fill="${color}"/>
            <circle cx="18" cy="18" r="8" fill="#0a0a0a"/>
            <circle cx="18" cy="18" r="5" fill="${color}"/>
        </svg>`;
    return L.divIcon({
        html: svg,
        className: "",
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -44],
    });
}

export default function MapView({ properties }: { properties: any[] }) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Улаанбаатарыг төв болгоно
        const map = L.map(containerRef.current, {
            center: [47.9184, 106.9177],
            zoom: 12,
            zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Хуучин marker-уудыг устга
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        if (properties.length === 0) return;

        const bounds: [number, number][] = [];

        properties.forEach(p => {
            const lat = parseFloat(p.latitude);
            const lng = parseFloat(p.longitude);
            if (isNaN(lat) || isNaN(lng)) return;

            const icon = p.category ? makeIcon(p.listing_type) : makeIcon(p.listing_type);
            const catIcon = CATEGORY_ICONS[p.category] || "🏠";
            const catLabel = CATEGORY_LABELS[p.category] || "";
            const typeLabel = p.listing_type === "sale" ? "Зарна" : "Түрээс";
            const typeColor = p.listing_type === "sale" ? "#facc15" : "#3b82f6";

            const popup = L.popup({ maxWidth: 260, className: "property-popup" }).setContent(`
                <div style="font-family:sans-serif; min-width:220px;">
                    ${p.image ? `<img src="${p.image}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px;" />` : ""}
                    <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
                        <span style="background:${typeColor};color:${p.listing_type === "sale" ? "#000" : "#fff"};padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">${typeLabel}</span>
                        <span style="background:#ffffff15;padding:2px 10px;border-radius:20px;font-size:11px;">${catIcon} ${catLabel}</span>
                    </div>
                    <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#111;">${p.title || "Зар"}</p>
                    <p style="font-size:12px;color:#666;margin:0 0 6px;">📍 ${p.location || ""}</p>
                    <p style="font-size:16px;font-weight:800;color:#d97706;margin:0 0 10px;">${p.price || ""}</p>
                    <a href="/property/${p.id}" style="display:block;text-align:center;background:#facc15;color:#000;padding:8px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;">Дэлгэрэнгүй →</a>
                </div>
            `);

            const marker = L.marker([lat, lng], { icon: makeIcon(p.listing_type) })
                .bindPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
            bounds.push([lat, lng]);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
    }, [properties]);

    return (
        <>
            <style>{`
                .leaflet-popup-content-wrapper {
                    border-radius: 12px !important;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.3) !important;
                    padding: 0 !important;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 12px !important;
                }
                .leaflet-popup-tip-container { display: none; }
                .leaflet-container { background: #1a1a2e; }
            `}</style>
            <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "calc(100vh - 100px)" }} />
        </>
    );
}
