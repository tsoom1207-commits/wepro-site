"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function PropertyDetailClient({ id }: { id: string }) {
    const [property, setProperty] = useState<any>(null);
    const [gallery, setGallery] = useState<any[]>([]);
    const [showGallery, setShowGallery] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => { loadProperty(); }, []);

    const loadProperty = async () => {
        const { data, error } = await supabase
            .from("properties").select("*").eq("id", id).single();
        if (error) { console.error(error); return; }
        setProperty(data);
        const { data: galleryData } = await supabase
            .from("property_images").select("*").eq("property_id", data.id);
        setGallery(galleryData || []);
    };

    const openGallery = (url: string, idx: number) => {
        setSelectedImage(url);
        setSelectedIdx(idx);
        setShowGallery(true);
    };

    const navigate = (dir: number) => {
        const imgs = gallery.filter(i => i.image_url);
        const next = (selectedIdx + dir + imgs.length) % imgs.length;
        setSelectedIdx(next);
        setSelectedImage(imgs[next].image_url);
    };

    const shareLink = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: property?.title, url });
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!property) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/40">Уншиж байна...</p>
                </div>
            </div>
        );
    }

    const categoryLabel: Record<string, string> = {
        land: "🌱 Газар", apartment: "🏢 Орон сууц", house: "🏠 Хаус",
        commercial: "🏬 Обьект", camp: "🌲 Зуслан", office: "💼 Оффис", rental: "🔑 Түрээс",
    };

    const filteredGallery = gallery.filter(img => img.image_url);
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">

            {/* HERO */}
            <section className="relative h-[55vh] md:h-[70vh] overflow-hidden">
                {property.image ? (
                    <img src={property.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-6xl">🏠</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                <a href="/" className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur rounded-xl text-sm font-medium hover:bg-black/70 transition">
                    ← Буцах
                </a>
                <button onClick={shareLink}
                    className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur rounded-xl text-sm font-medium hover:bg-black/70 transition">
                    {copied ? "✅ Хуулагдлаа" : "🔗 Хуваалцах"}
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-4 md:px-10 pb-8 md:pb-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                                {property.listing_type === "sale" ? "Зарна" : "Түрээслүүлнэ"}
                            </span>
                            {property.category && (
                                <span className="px-3 py-1 bg-white/10 backdrop-blur text-xs rounded-full">
                                    {categoryLabel[property.category] || property.category}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-5xl font-bold mb-2 leading-tight">{property.title}</h1>
                        <p className="text-white/60 text-sm md:text-base">📍 {property.location}</p>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 md:px-8">

                {/* PRICE + STATS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-white/10">
                    <p className="text-3xl md:text-4xl font-bold text-yellow-400">{property.price}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-white/60">
                        {property.bedrooms && <span className="flex items-center gap-1">🛏 <b className="text-white">{property.bedrooms}</b> өрөө</span>}
                        {property.bathrooms && <span className="flex items-center gap-1">🚿 <b className="text-white">{property.bathrooms}</b> угаалгуур</span>}
                        {property.area && <span className="flex items-center gap-1">📐 <b className="text-white">{property.area}</b> м²</span>}
                        {property.floor && <span className="flex items-center gap-1">🏢 <b className="text-white">{property.floor}</b>-р давхар</span>}
                        {property.parking && <span className="flex items-center gap-1">🚗 <b className="text-white">{property.parking}</b></span>}
                    </div>
                </div>

                {/* GALLERY SWIPER */}
                {filteredGallery.length > 0 && (
                    <div className="py-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">📸 Зургийн цомог</h2>
                            <span className="text-white/40 text-sm">{filteredGallery.length} зураг</span>
                        </div>
                        <div className="relative overflow-hidden rounded-2xl mb-3 cursor-pointer"
                            onClick={() => openGallery(filteredGallery[selectedIdx]?.image_url || filteredGallery[0].image_url, selectedIdx)}>
                            <img
                                src={filteredGallery[selectedIdx]?.image_url || filteredGallery[0].image_url}
                                alt=""
                                className="w-full h-[300px] md:h-[450px] object-cover transition-all duration-300"
                            />
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-xs px-3 py-1.5 rounded-lg">
                                {selectedIdx + 1} / {filteredGallery.length}
                            </div>
                            {filteredGallery.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-xl transition">‹</button>
                                    <button onClick={(e) => { e.stopPropagation(); navigate(1); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-xl transition">›</button>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                            {filteredGallery.map((img, idx) => (
                                <div key={img.id}
                                    onClick={() => { setSelectedIdx(idx); setSelectedImage(img.image_url); }}
                                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition ${selectedIdx === idx ? "border-yellow-400 opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}>
                                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DESCRIPTION */}
                {property.description && (
                    <div className="py-8 border-t border-white/10">
                        <h2 className="text-xl font-bold mb-4">Дэлгэрэнгүй мэдээлэл</h2>
                        <p className="text-white/70 leading-7 text-sm md:text-base whitespace-pre-line">{property.description}</p>
                    </div>
                )}

                {/* SPECS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-8 border-t border-white/10">
                    {[
                        { label: "Өрөө", value: property.bedrooms, icon: "🛏" },
                        { label: "Угаалгуур", value: property.bathrooms, icon: "🚿" },
                        { label: "Талбай", value: property.area ? `${property.area} м²` : null, icon: "📐" },
                        { label: "Давхар", value: property.floor, icon: "🏢" },
                        { label: "Зогсоол", value: property.parking, icon: "🚗" },
                    ].filter(s => s.value).map(spec => (
                        <div key={spec.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                            <p className="text-2xl mb-2">{spec.icon}</p>
                            <p className="text-white/40 text-xs mb-1">{spec.label}</p>
                            <p className="font-bold text-lg">{spec.value}</p>
                        </div>
                    ))}
                </div>

                {/* CONDITIONS */}
                <div className="py-8 border-t border-white/10">
                    {property.listing_type === "sale" ? (
                        <>
                            <h2 className="text-xl font-bold mb-5">🏠 Худалдах нөхцөл</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { label: "Урьдчилгаа", value: property.down_payment },
                                    { label: "Хугацаа", value: property.installment_months ? `${property.installment_months} сар` : null },
                                    { label: "Бартер", value: property.barter !== null ? (property.barter ? "✅ Боломжтой" : "❌ Боломжгүй") : null },
                                ].filter(i => i.value).map(item => (
                                    <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                        <p className="text-white/40 text-xs mb-2">{item.label}</p>
                                        <p className="font-bold text-lg">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold mb-5">🔑 Түрээсийн нөхцөл</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { label: "Сарын түрээс", value: property.monthly_rent },
                                    { label: "Барьцаа", value: property.deposit },
                                ].filter(i => i.value).map(item => (
                                    <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                        <p className="text-white/40 text-xs mb-2">{item.label}</p>
                                        <p className="font-bold text-xl text-yellow-400">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* MAP */}
                {((property.latitude && property.longitude) || property.maps_url) && (
                    <div className="py-8 border-t border-white/10">
                        <h2 className="text-xl font-bold mb-4">📍 Байршил</h2>
                        {property.latitude && property.longitude && (
                            <div className="rounded-2xl overflow-hidden border border-white/10 mb-4">
                                <iframe
                                    src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                                    width="100%"
                                    height="320"
                                    loading="lazy"
                                    className="block"
                                />
                            </div>
                        )}
                        {property.maps_url && (
                            <a href={property.maps_url} target="_blank"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition text-sm">
                                🗺 Google Maps-д нээх
                            </a>
                        )}
                    </div>
                )}

                {/* SHARE */}
                <div className="py-8 border-t border-white/10">
                    <h2 className="text-xl font-bold mb-5">🔗 Хуваалцах</h2>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={shareLink}
                            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition">
                            {copied ? "✅ Хуулагдлаа" : "🔗 Линк хуулах"}
                        </button>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank"
                            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition">
                            Facebook
                        </a>
                        <a href={`https://m.me/?link=${encodeURIComponent(pageUrl)}`} target="_blank"
                            className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm font-medium transition">
                            💬 Messenger
                        </a>
                        <a href={`https://wa.me/?text=${encodeURIComponent(property.title + " " + pageUrl)}`} target="_blank"
                            className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition">
                            WhatsApp
                        </a>
                        <a href={`viber://forward?text=${encodeURIComponent(property.title + " " + pageUrl)}`}
                            className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition">
                            Viber
                        </a>
                    </div>
                </div>

                {/* CONTACT */}
                <div className="py-8 border-t border-white/10 mb-8">
                    <h2 className="text-xl font-bold mb-6">Холбоо барих</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <img src="/logo.jpg" alt="" className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg">TSOLMON WEPRO</h3>
                                    <p className="text-white/40 text-sm">Үл хөдлөх хөрөнгийн зөвлөх</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <a href="tel:88115673"
                                    className="flex-1 md:flex-none text-center px-5 py-3 bg-yellow-400 text-black rounded-xl font-semibold text-sm hover:bg-yellow-300 transition">
                                    📞 Залгах
                                </a>
                                <a href="https://m.me/ganbaatar.tsolmon" target="_blank"
                                    className="flex-1 md:flex-none text-center px-5 py-3 bg-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-500 transition">
                                    💬 Messenger
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STICKY MOBILE CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/10 p-4 flex gap-3 z-40">
                <a href="tel:88115673" className="flex-1 text-center py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm">📞 Залгах</a>
                <a href="https://m.me/ganbaatar.tsolmon" target="_blank" className="flex-1 text-center py-3 bg-blue-600 rounded-xl font-bold text-sm">💬 Messenger</a>
                <button onClick={shareLink} className="flex-1 text-center py-3 bg-white/10 rounded-xl font-bold text-sm">
                    {copied ? "✅" : "🔗 Share"}
                </button>
            </div>
            <div className="md:hidden h-20" />

            {/* FULLSCREEN GALLERY */}
            {showGallery && selectedImage && (
                <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center" onClick={() => setShowGallery(false)}>
                    <img src={selectedImage} alt="" className="max-w-full max-h-full object-contain px-4" onClick={e => e.stopPropagation()} />
                    <button onClick={() => setShowGallery(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition">✕</button>
                    {filteredGallery.length > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition text-xl">‹</button>
                            <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition text-xl">›</button>
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
                                {filteredGallery.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === selectedIdx ? "bg-yellow-400" : "bg-white/30"}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </main>
    );
}
