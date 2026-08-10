"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const CATEGORIES = [
    { value: "apartment", label: "Орон сууц", icon: "🏢" },
    { value: "house", label: "Хаус", icon: "🏠" },
    { value: "land", label: "Газар", icon: "🌱" },
    { value: "office", label: "Оффис", icon: "💼" },
    { value: "camp", label: "Зуслан", icon: "🌲" },
    { value: "commercial", label: "Обьект", icon: "🏬" },
];

// ── Борлуулсан CSS тууз (зураг биш) ───────────────────────────────────────
function SoldRibbon({ type }: { type: string }) {
    const label = type === "sale" ? "Зарагдсан" : "Түрээслэгдсэн";
    const bg = type === "sale" ? "#da0000f2" : "#3b82f6";
    const color = type === "sale" ? "#000" : "#fff";
    return (
        <div style={{
            position: "absolute", top: 0, right: 0,
            width: 0, height: 0,
            borderStyle: "solid",
            borderWidth: "0 96px 96px 0",
            borderColor: `transparent ${bg} transparent transparent`,
            zIndex: 20,
        }}>
            <span style={{
                position: "absolute",
                top: 13, right: -88,
                fontSize: 15, fontWeight: 700,
                color, whiteSpace: "nowrap",
                transform: "rotate(45deg)",
                letterSpacing: "0.03em",
            }}>{label}</span>
        </div>
    );
}

// ── Property Card ──────────────────────────────────────────────────────────
function PropertyCard({ property }: { property: any }) {
    const isSold = property.status === "passive";
    const cat = CATEGORIES.find(c => c.value === property.category);
    return (
        <Link href={`/property/${property.id}`} className="block group shrink-0 w-[280px] md:w-[320px]">
            <div className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 transition duration-300 h-full ${isSold ? "opacity-75" : ""}`}>
                <div className="relative overflow-hidden h-48">
                    <img
                        src={property.image || "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800"}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Борлуулсан тууз */}
                    {isSold && <SoldRibbon type={property.listing_type} />}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-black/60 backdrop-blur text-xs px-3 py-1 rounded-full">
                            {cat?.icon} {cat?.label}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${property.listing_type === "sale" ? "bg-yellow-400 text-black" : "bg-blue-500 text-white"}`}>
                            {property.listing_type === "sale" ? "Зарна" : "Түрээс"}
                        </span>
                    </div>

                    {/* Үнэ зурган дээр */}
                    <div className="absolute bottom-3 left-3">
                        <span className="text-yellow-400 font-bold text-base drop-shadow">{property.price}</span>
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-base mb-1 line-clamp-1">{property.title}</h3>
                    <p className="text-white/50 text-xs mb-3">📍 {property.location}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-xs text-white/40">
                            {property.bedrooms && <span>🛏 {property.bedrooms}</span>}
                            {property.area && <span>📐 {property.area}м²</span>}
                            {property.floor && <span>🏢 {property.floor}р</span>}
                        </div>
                        <span className="text-xs text-yellow-400/80 font-medium group-hover:text-yellow-400 transition">
                            Дэлгэрэнгүй →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ── Horizontal Swiper ──────────────────────────────────────────────────────
function HorizontalSwiper({ items }: { items: any[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = (dir: number) => {
        ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
    };
    if (items.length === 0) return null;
    return (
        <div className="relative">
            {items.length > 3 && (
                <>
                    <button onClick={() => scroll(-1)}
                        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-lg transition">‹</button>
                    <button onClick={() => scroll(1)}
                        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-lg transition">›</button>
                </>
            )}
            <div ref={ref} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {items.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
        </div>
    );
}
function StatCounter({ items }: { items: { n: number; suffix: string; label: string }[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [counts, setCounts] = useState(items.map(() => 0));
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setStarted(true);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;
        const duration = 1500;
        const steps = 60;
        const interval = duration / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCounts(items.map(item => Math.round(item.n * eased)));
            if (step >= steps) clearInterval(timer);
        }, interval);
        return () => clearInterval(timer);
    }, [started]);

    return (
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {items.map((s, i) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                    <p className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
                        {counts[i]}{s.suffix}
                    </p>
                    <p className="text-white/50 text-xs md:text-sm">{s.label}</p>
                </div>
            ))}
        </div>
    );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="shrink-0 w-[280px] md:w-[320px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
            <div className="h-48 bg-white/10" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
                <div className="flex justify-between mt-4">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-8 bg-white/10 rounded w-1/3" />
                </div>
            </div>
        </div>
    );
}

// ── Mobile Bottom Tab Bar ──────────────────────────────────────────────────
function MobileTabBar() {
    const tabs = [
        { label: "Үндсэн", icon: "🏠", href: "#" },
        { label: "Зарууд", icon: "🔍", href: "#listings" },
        { label: "Борлуулсан", icon: "✅", href: "#sold" },
        { label: "Холбоо", icon: "📞", href: "#contact" },
    ];
    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
            <div className="flex">
                {tabs.map(t => (
                    <a key={t.label} href={t.href}
                        className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-white/40 hover:text-white transition active:scale-95">
                        <span className="text-lg leading-none">{t.icon}</span>
                        <span className="text-[10px]">{t.label}</span>
                    </a>
                ))}
            </div>
        </nav>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLocation, setSearchLocation] = useState("");
    const [searchCategory, setSearchCategory] = useState("");
    const [searchType, setSearchType] = useState("");
    const [priceRange, setPriceRange] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [heroWordIndex, setHeroWordIndex] = useState(0);
    const [heroFading, setHeroFading] = useState(false);
    const [searchSubmitted, setSearchSubmitted] = useState(false);
    const listingsRef = useRef<HTMLElement>(null);

    const heroWords = ["Байраа", "Хаус", "Орон сууц", "Газар", "Обьект", "Зуслан"];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroFading(true);
            setTimeout(() => {
                setHeroWordIndex(prev => (prev + 1) % heroWords.length);
                setHeroFading(false);
            }, 400);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("properties").select("*").order("id", { ascending: false });
        if (!error) setProperties(data || []);
        setLoading(false);
    };

    const filteredProperties = properties.filter((p) => {
        const matchPrice = !priceRange ||
            (priceRange === "0-500" && p.price_number <= 500000000) ||
            (priceRange === "500-1000" && p.price_number > 500000000 && p.price_number <= 1000000000) ||
            (priceRange === "1000-3000" && p.price_number > 1000000000 && p.price_number <= 3000000000) ||
            (priceRange === "3000+" && p.price_number > 3000000000);
        return (
            p.location?.toLowerCase().includes(searchLocation.toLowerCase()) &&
            (!searchCategory || p.category === searchCategory) &&
            (!searchType || p.listing_type === searchType) &&
            matchPrice &&
            p.status === "active"
        );
    });

    const categoryFiltered = activeCategory === "all"
        ? filteredProperties
        : filteredProperties.filter(p => p.category === activeCategory);

    const soldProperties = properties.filter(p => p.status === "passive");

    // Хайх товч — listings хэсэгт шууд скролл хийх
    const handleSearch = () => {
        setSearchSubmitted(true);
        listingsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <main className="bg-[#0a0a0a] text-white min-h-screen pb-16 md:pb-0">

            {/* NAVBAR — desktop */}
            <header className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="logo" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                        <span className="font-bold text-base md:text-lg">TSOLMON WEPRO</span>
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm text-white/60">
                        <a href="#" className="hover:text-white transition">Үндсэн</a>
                        <a href="#listings" className="hover:text-white transition">Зарууд</a>
                        <a href="#sold" className="hover:text-white transition">Борлуулсан</a>
                        <a href="#contact" className="hover:text-white transition">Холбоо барих</a>
                    </nav>
                    <a href="#contact"
                        className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-xl text-sm font-semibold hover:bg-yellow-300 transition">
                        📞 Холбогдох
                    </a>
                </div>
            </header>

            {/* MOBILE BOTTOM TAB BAR */}
            <MobileTabBar />

            {/* HERO */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600"
                    alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]" />

                <div className="relative z-10 text-center px-4 md:px-8 w-full max-w-5xl mx-auto">
                    <div className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs px-4 py-1.5 rounded-full mb-6">
                        🏆 Монголын шилдэг үл хөдлөх хөрөнгийн WePro
                    </div>
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                        Мөрөөдлийн <br className="hidden md:block" />
                        <span
                            className="text-yellow-400 inline-block transition-all duration-400"
                            style={{ opacity: heroFading ? 0 : 1, transform: heroFading ? "translateY(8px)" : "translateY(0)" }}
                        >{heroWords[heroWordIndex]}</span> олоорой
                    </h1>
                    <p className="text-white/60 max-w-xl mx-auto text-sm md:text-lg mb-10">
                        Мэргэжлийн баг таны хэрэгцээнд тохирсон байрыг олоход туслахад бэлэн байна.
                    </p>

                    {/* SEARCH BOX */}
                    <div className="bg-black/90 border border-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <input type="text" placeholder="🔍 Байршил хайх..." value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="col-span-2 md:col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition text-sm placeholder:text-white/30" />
                            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-sm text-white/70">
                                <option value="">Бүх ангилал</option>
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                            </select>
                            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-sm text-white/70">
                                <option value="">Бүх үнэ</option>
                                <option value="0-500">500 сая хүртэл</option>
                                <option value="500-1000">500 сая - 1 тэрбум</option>
                                <option value="1000-3000">1 - 3 тэрбум</option>
                                <option value="3000+">3 тэрбум+</option>
                            </select>
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-sm text-white/70">
                                <option value="">Зарна / Түрээс</option>
                                <option value="sale">Зарна</option>
                                <option value="rent">Түрээслүүлнэ</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSearch}
                                className="flex-1 py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm hover:bg-yellow-300 active:scale-[0.99] transition">
                                🔍 Хайх
                            </button>
                            <a href="/map"
                                className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/15 text-white rounded-xl font-bold text-sm hover:bg-white/20 active:scale-[0.99] transition whitespace-nowrap">
                                🗺 Газрын зураг
                            </a>
                        </div>
                        {searchSubmitted && (
                            <p className="text-white/40 text-xs mt-3 text-center">
                                {categoryFiltered.length} зар олдлоо — доош харна уу
                            </p>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs animate-bounce">
                    <span>↓</span>
                </div>
            </section>
            {/* LISTINGS */}
            <section id="listings" ref={listingsRef} className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="mb-8">
                    <p className="text-yellow-400 text-xs font-medium mb-1">Санал болгож буй</p>
                    <h2 className="text-2xl md:text-4xl font-bold mb-6">Одоогийн зарууд</h2>

                    {/* Category tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                        <button onClick={() => setActiveCategory("all")}
                            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${activeCategory === "all" ? "bg-yellow-400 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                            Бүгд
                        </button>
                        {CATEGORIES.map(c => (
                            <button key={c.value} onClick={() => setActiveCategory(c.value)}
                                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${activeCategory === c.value ? "bg-yellow-400 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                                {c.icon} {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : categoryFiltered.length === 0 ? (
                    <div className="text-center py-20 text-white/30">
                        <p className="text-5xl mb-4">🏠</p>
                        <p>Одоогоор зар байхгүй байна</p>
                    </div>
                ) : (
                    <HorizontalSwiper items={categoryFiltered} />
                )}
            </section>

            {/* SOLD SECTION */}
            {soldProperties.length > 0 && (
                <section id="sold" className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-white/10">
                    <div className="mb-8">
                        <p className="text-green-400 text-xs font-medium mb-1">✅ Амжилттай</p>
                        <h2 className="text-2xl md:text-4xl font-bold">Борлуулсан зарууд</h2>
                    </div>
                    <HorizontalSwiper items={soldProperties} />
                </section>
            )}
            {/* STATS */}
            <section className="max-w-5xl mx-auto px-4 md:px-8 py-12">
                <StatCounter items={[
                    { n: properties.filter(p => p.status === "active").length, suffix: "+", label: "Идэвхтэй зар" },
                    { n: 5, suffix: "+", label: "Амжилттай борлуулалт" },
                    { n: 2, suffix: "+", label: "Хот" },
                    { n: 1, suffix: " жил", label: "Туршлага" },
                ]} />
            </section>

            {/* CONTACT */}
            <section id="contact" className="max-w-5xl mx-auto px-4 md:px-8 py-16 border-t border-white/10">
                <div className="text-center mb-10">
                    <p className="text-yellow-400 text-xs font-medium mb-2">Холбоо барих</p>
                    <h2 className="text-2xl md:text-4xl font-bold">Бидэнтэй холбогдоорой</h2>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <img src="/logo.jpg" alt="" className="w-16 h-16 rounded-full object-cover border border-white/20" />
                            <div>
                                <h3 className="font-bold text-xl">TSOLMON WEPRO</h3>
                                <p className="text-white/40 text-sm">Үл хөдлөх хөрөнгийн зөвлөх</p>
                                <p className="text-white/40 text-xs mt-1">📍 Ulaanbaatar, Mongolia</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a href="tel:88115673"
                                className="flex-1 md:flex-none text-center px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold text-sm hover:bg-yellow-300 transition">
                                📞 88115673
                            </a>
                            <a href="https://m.me/ganbaatar.tsolmon" target="_blank"
                                className="flex-1 md:flex-none text-center px-6 py-3 bg-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-500 transition">
                                💬 Messenger
                            </a>
                            <a href="https://t.me/USERNAME" target="_blank"
                                className="flex-1 md:flex-none text-center px-6 py-3 bg-sky-500 rounded-xl font-semibold text-sm hover:bg-sky-400 transition">
                                ✈ Telegram
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 mt-8">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/logo.jpg" alt="logo" className="w-10 h-10 rounded-full object-cover" />
                            <span className="font-bold">TSOLMON WEPRO</span>
                        </div>
                        <p className="text-white/40 text-sm leading-6">Монголын шилдэг үл хөдлөх хөрөнгийн зөвлөх үйлчилгээ.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-sm">Холбоос</h4>
                        <div className="flex flex-col gap-3 text-white/40 text-sm">
                            {["Үндсэн", "Зарууд", "Тухай", "Холбоо барих"].map(l => (
                                <a key={l} href="#" className="hover:text-white transition">{l}</a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-sm">Холбоо барих</h4>
                        <div className="flex flex-col gap-3 text-white/40 text-sm">
                            <p>📍 Ulaanbaatar, Mongolia</p>
                            <p>📞 +976 8811-5673</p>
                            <p>✉️ tsoom@wepro.mn</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <a href="https://www.facebook.com/tsoom.realty" target="_blank">
                            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/facebook.svg" alt="Facebook" className="w-5 h-5 invert" />
                        </a>
                        <a href="https://www.instagram.com/tsoom.realty/" target="_blank">
                            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" alt="Instagram" className="w-5 h-5 invert" />
                        </a>
                        <a href="https://www.linkedin.com/company/tsoom-realty/" target="_blank">
                            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" alt="LinkedIn" className="w-5 h-5 invert" />
                        </a>
                    </div>
                </div>
                <div className="border-t border-white/10 py-5 text-center text-white/30 text-xs">
                    © 2026 TSOLMON WEPRO REAL ESTATE. All rights reserved.
                </div>
            </footer>

        </main>
    );
}
