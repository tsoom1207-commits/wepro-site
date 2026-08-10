"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function MapPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from("properties")
                .select("*")
                .eq("status", "active");
            setProperties((data || []).filter(p => p.latitude && p.longitude));
            setLoading(false);
        };
        load();
    }, []);

    const filtered = filter === "all" ? properties : properties.filter(p => p.listing_type === filter);

    return (
        <main className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                    <a href="/" className="text-white/50 hover:text-white transition text-sm">← Буцах</a>
                    <span className="text-white/20">|</span>
                    <h1 className="font-bold text-base md:text-lg">🗺 Газрын зураг</h1>
                </div>
                <div className="flex gap-2">
                    {[
                        { value: "all", label: "Бүгд" },
                        { value: "sale", label: "Зарна" },
                        { value: "rent", label: "Түрээс" },
                    ].map(f => (
                        <button key={f.value} onClick={() => setFilter(f.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filter === f.value ? "bg-yellow-400 text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* COUNT */}
            <div className="px-4 md:px-8 py-2 text-white/40 text-xs">
                {loading ? "Уншиж байна..." : `${filtered.length} байршил харагдаж байна`}
            </div>

            {/* MAP */}
            <div className="flex-1" style={{ minHeight: "calc(100vh - 100px)" }}>
                {!loading && <MapView properties={filtered} />}
            </div>
        </main>
    );
}
