"use client";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

const resetForm = (setters: Record<string, (v: any) => void>) => {
    setters.setTitle(""); setters.setLocation(""); setters.setPrice("");
    setters.setPriceNumber(""); setters.setListingType("sale");
    setters.setDescription(""); setters.setMapsUrl("");
    setters.setMonthlyRent(""); setters.setDeposit("");
    setters.setDownPayment(""); setters.setInstallmentMonths("");
    setters.setBarter(false); setters.setBedrooms("");
    setters.setBathrooms(""); setters.setArea("");
    setters.setFloor(""); setters.setParking("");
    setters.setCategory(""); setters.setStatus("active");
    setters.setPreview(""); setters.setImageFile(null);
    setters.setGalleryFiles(null); setters.setEditingId(null);
    setters.setLatitude(""); setters.setLongitude("");
};

export default function AdminPage() {
    const [preview, setPreview] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [priceNumber, setPriceNumber] = useState("");
    const [listingType, setListingType] = useState("sale");
    const [description, setDescription] = useState("");
    const [mapsUrl, setMapsUrl] = useState("");
    const [authorized, setAuthorized] = useState(false);
    const [monthlyRent, setMonthlyRent] = useState("");
    const [deposit, setDeposit] = useState("");
    const [downPayment, setDownPayment] = useState("");
    const [installmentMonths, setInstallmentMonths] = useState("");
    const [barter, setBarter] = useState(false);
    const [bedrooms, setBedrooms] = useState("");
    const [bathrooms, setBathrooms] = useState("");
    const [area, setArea] = useState("");
    const [floor, setFloor] = useState("");
    const [parking, setParking] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("active");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [saving, setSaving] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const setters = {
        setTitle, setLocation, setPrice, setPriceNumber, setListingType,
        setDescription, setMapsUrl, setMonthlyRent, setDeposit,
        setDownPayment, setInstallmentMonths, setBarter, setBedrooms,
        setBathrooms, setArea, setFloor, setParking, setCategory,
        setStatus, setPreview, setImageFile, setGalleryFiles, setEditingId,
        setLatitude, setLongitude,
    };

    useEffect(() => {
        const auth = localStorage.getItem("adminAuth");
        if (auth === "true") {
            setAuthorized(true);
        } else {
            window.location.href = "/admin/login";
        }
    }, []);

    const loadProperties = async () => {
        const { data, error } = await supabase
            .from("properties")
            .select("*")
            .order("id", { ascending: false });
        if (error) { console.error(error); return; }
        setProperties(data || []);
    };

    useEffect(() => {
        if (authorized) loadProperties();
    }, [authorized]);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const toNum = (v: string) => v ? Number(v) : null;

    const buildPayload = (imageUrl?: string) => ({
        title: title || null,
        location: location || null,
        price: price || null,
        price_number: toNum(priceNumber),
        ...(imageUrl !== undefined ? { image: imageUrl } : {}),
        listing_type: listingType,
        description: description || null,
        maps_url: mapsUrl || null,
        monthly_rent: monthlyRent || null,
        deposit: deposit || null,
        down_payment: downPayment || null,
        installment_months: toNum(installmentMonths),
        barter,
        bedrooms: toNum(bedrooms),
        bathrooms: toNum(bathrooms),
        area: area || null,
        floor: toNum(floor),
        parking: parking || null,
        category: category || null,
        status,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
    });

    const addProperty = async () => {
        setSaving(true);
        let imageUrl = "";

        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from("properties").upload(fileName, imageFile);
            if (uploadError) { alert(uploadError.message); setSaving(false); return; }
            const { data } = supabase.storage.from("properties").getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }

        const { data, error } = await supabase
            .from("properties")
            .insert([buildPayload(imageUrl)])
            .select().single();

        if (error) { alert(error.message); setSaving(false); return; }

        if (galleryFiles && data) {
            for (const file of Array.from(galleryFiles)) {
                const fileName = `${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("properties").upload(fileName, file);
                if (uploadError) continue;
                const { data: publicData } = supabase.storage
                    .from("properties").getPublicUrl(fileName);
                await supabase.from("property_images").insert([{
                    property_id: data.id,
                    image_url: publicData.publicUrl,
                }]);
            }
        }

        await loadProperties();
        resetForm(setters);
        setSaving(false);
    };

    const deleteProperty = async (id: number) => {
        if (!confirm("Устгах уу?")) return;
        const { error } = await supabase.from("properties").delete().eq("id", id);
        if (error) { alert(error.message); return; }
        await loadProperties();
    };

    const updateProperty = async () => {
        if (!editingId) return;
        setSaving(true);

        let imageUrl: string | undefined = undefined;

        // Үндсэн зураг
        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from("properties").upload(fileName, imageFile);
            if (uploadError) { alert(uploadError.message); setSaving(false); return; }
            const { data } = supabase.storage.from("properties").getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }

        // Мэдээлэл update
        const { error } = await supabase
            .from("properties")
            .update(buildPayload(imageUrl))
            .eq("id", editingId);

        if (error) { alert(error.message); setSaving(false); return; }

        // Gallery зурагнууд
        if (galleryFiles) {
            // Хуучин gallery зургуудыг устга
            await supabase
                .from("property_images")
                .delete()
                .eq("property_id", editingId);

            // Шинэ зургуудыг нэм
            for (const file of Array.from(galleryFiles)) {
                const fileName = `${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("properties").upload(fileName, file);
                if (uploadError) continue;
                const { data: publicData } = supabase.storage
                    .from("properties").getPublicUrl(fileName);
                await supabase.from("property_images").insert([{
                    property_id: editingId,
                    image_url: publicData.publicUrl,
                }]);
            }
        }

        await loadProperties();
        resetForm(setters);
        setSaving(false);
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "passive" : "active";
        const { error } = await supabase
            .from("properties").update({ status: newStatus }).eq("id", id);
        if (error) { alert(error.message); return; }
        loadProperties();
    };

    const editProperty = (property: any) => {
        setEditingId(property.id);
        setTitle(property.title || "");
        setLocation(property.location || "");
        setPrice(property.price || "");
        setCategory(property.category || "");
        setBedrooms(property.bedrooms?.toString() || "");
        setBathrooms(property.bathrooms?.toString() || "");
        setArea(property.area || "");
        setFloor(property.floor?.toString() || "");
        setParking(property.parking || "");
        setDescription(property.description || "");
        setMapsUrl(property.maps_url || "");
        setListingType(property.listing_type || "sale");
        setMonthlyRent(property.monthly_rent || "");
        setDeposit(property.deposit || "");
        setDownPayment(property.down_payment || "");
        setInstallmentMonths(property.installment_months?.toString() || "");
        setBarter(property.barter || false);
        setStatus(property.status || "active");
        setPriceNumber(property.price_number?.toString() || "");
        setPreview(property.image || "");
        setLatitude(property.latitude?.toString() || "");
        setLongitude(property.longitude?.toString() || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!authorized) return null;

    const inputCls = "bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 transition text-white placeholder:text-white/30 w-full";
    const labelCls = "text-white/50 text-sm mb-1 block";

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">

            {/* SIDEBAR - desktop */}
            <aside className="w-[240px] shrink-0 border-r border-white/10 p-6 hidden md:flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-10">
                    <img src="/logo.jpg" alt="logo" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h2 className="font-bold leading-none">TSOLMON</h2>
                        <p className="text-white/40 text-xs">Admin Panel</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    {["Dashboard", "Properties", "Add Property", "Settings"].map((item, i) => (
                        <button key={item}
                            className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition ${i === 0 ? "bg-yellow-400 text-black" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                            {item}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto">
                    <button
                        onClick={() => { localStorage.removeItem("adminAuth"); window.location.href = "/admin/login"; }}
                        className="w-full px-4 py-3 rounded-xl text-left text-sm text-red-400 hover:bg-red-500/10 transition">
                        Гарах
                    </button>
                </div>
            </aside>

            {/* MOBILE TOPBAR */}
            <div className="md:hidden sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="logo" className="w-9 h-9 rounded-full object-cover" />
                    <span className="font-bold text-sm">TSOLMON Admin</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                    {mobileMenuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* MOBILE MENU */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#111] border-b border-white/10 px-4 py-3 flex flex-col gap-1">
                    {["Dashboard", "Properties", "Add Property", "Settings"].map((item, i) => (
                        <button key={item} onClick={() => setMobileMenuOpen(false)}
                            className={`px-4 py-3 rounded-xl text-left text-sm ${i === 0 ? "bg-yellow-400 text-black font-bold" : "text-white/60"}`}>
                            {item}
                        </button>
                    ))}
                    <button onClick={() => { localStorage.removeItem("adminAuth"); window.location.href = "/admin/login"; }}
                        className="px-4 py-3 rounded-xl text-left text-sm text-red-400">
                        Гарах
                    </button>
                </div>
            )}

            {/* MAIN CONTENT */}
            <section className="flex-1 p-4 md:p-8 overflow-x-hidden">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-yellow-400 text-xs font-medium mb-1">Dashboard</p>
                        <h1 className="text-2xl md:text-4xl font-bold">Property Management</h1>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
                    {[
                        { label: "Нийт", value: properties.length },
                        { label: "Идэвхтэй", value: properties.filter(p => p.status === "active").length },
                        { label: "Дууссан", value: properties.filter(p => p.status !== "active").length },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                            <p className="text-white/40 text-xs mb-2">{stat.label}</p>
                            <h2 className="text-3xl md:text-4xl font-bold">{stat.value}</h2>
                        </div>
                    ))}
                </div>

                {/* FORM */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-8 mb-8">
                    <h2 className="text-xl font-bold mb-6">
                        {editingId ? "✏️ Засах" : "➕ Шинэ зар нэмэх"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Гарчиг</label>
                            <input type="text" placeholder="Жишээ: 3 өрөө орон сууц" value={title}
                                onChange={(e) => setTitle(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Ангилал</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                                <option value="">Сонгох</option>
                                <option value="land">🌱 Газар</option>
                                <option value="apartment">🏢 Орон сууц</option>
                                <option value="house">🏠 Хаус</option>
                                <option value="commercial">🏬 Обьект</option>
                                <option value="camp">🌲 Зуслан</option>
                                <option value="office">💼 Оффис</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Байршил</label>
                            <input type="text" placeholder="Дүүрэг, хороо..." value={location}
                                onChange={(e) => setLocation(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Үнэ (текст)</label>
                            <input type="text" placeholder="Жишээ: 250 сая" value={price}
                                onChange={(e) => setPrice(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Үнэ (тоо)</label>
                            <input type="number" placeholder="250000000" value={priceNumber}
                                onChange={(e) => setPriceNumber(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Төрөл</label>
                            <select value={listingType} onChange={(e) => setListingType(e.target.value)} className={inputCls}>
                                <option value="sale">Зарна</option>
                                <option value="rent">Түрээслүүлнэ</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Өрөө</label>
                            <input type="number" placeholder="3" value={bedrooms}
                                onChange={(e) => setBedrooms(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Угаалгын өрөө</label>
                            <input type="number" placeholder="1" value={bathrooms}
                                onChange={(e) => setBathrooms(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Талбай (м²)</label>
                            <input type="text" placeholder="80" value={area}
                                onChange={(e) => setArea(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Давхар</label>
                            <input type="number" placeholder="5" value={floor}
                                onChange={(e) => setFloor(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Авто зогсоол</label>
                            <input type="text" placeholder="2 машин" value={parking}
                                onChange={(e) => setParking(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Google Maps URL</label>
                            <input type="text" placeholder="https://maps.google.com/..." value={mapsUrl}
                                onChange={(e) => setMapsUrl(e.target.value)} className={inputCls} />
                        </div>

                        {/* COORDINATES */}
                        <div>
                            <label className={labelCls}>Latitude (өргөрөг)</label>
                            <input type="text" placeholder="47.9184" value={latitude}
                                onChange={(e) => setLatitude(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Longitude (уртраг)</label>
                            <input type="text" placeholder="106.9177" value={longitude}
                                onChange={(e) => setLongitude(e.target.value)} className={inputCls} />
                        </div>
                        {latitude && longitude && (
                            <div className="md:col-span-2">
                                <label className={labelCls}>Газрын зургийн preview</label>
                                <iframe
                                    src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                                    width="100%" height="200"
                                    className="rounded-xl border border-white/10"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        {/* STATUS SWITCH */}
                        <div className="flex items-center gap-4">
                            <label className={labelCls + " mb-0"}>Статус</label>
                            <button
                                onClick={() => setStatus(status === "active" ? "passive" : "active")}
                                className={`relative w-14 h-7 rounded-full transition-colors ${status === "active" ? "bg-green-500" : "bg-white/20"}`}>
                                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${status === "active" ? "left-7" : "left-0.5"}`} />
                            </button>
                            <span className={`text-sm font-medium ${status === "active" ? "text-green-400" : "text-white/40"}`}>
                                {status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                            </span>
                        </div>

                        {/* BARTER */}
                        {listingType === "sale" && (
                            <div className="flex items-center gap-4">
                                <label className={labelCls + " mb-0"}>Бартер</label>
                                <button
                                    onClick={() => setBarter(!barter)}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${barter ? "bg-yellow-500" : "bg-white/20"}`}>
                                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${barter ? "left-7" : "left-0.5"}`} />
                                </button>
                                <span className={`text-sm font-medium ${barter ? "text-yellow-400" : "text-white/40"}`}>
                                    {barter ? "Боломжтой" : "Боломжгүй"}
                                </span>
                            </div>
                        )}

                        {listingType === "sale" && (
                            <>
                                <div>
                                    <label className={labelCls}>Урьдчилгаа (%)</label>
                                    <input type="text" placeholder="30" value={downPayment}
                                        onChange={(e) => setDownPayment(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Хугацаа (сар)</label>
                                    <input type="number" placeholder="120" value={installmentMonths}
                                        onChange={(e) => setInstallmentMonths(e.target.value)} className={inputCls} />
                                </div>
                            </>
                        )}

                        {listingType === "rent" && (
                            <>
                                <div>
                                    <label className={labelCls}>Сарын түрээс</label>
                                    <input type="text" placeholder="800,000₮" value={monthlyRent}
                                        onChange={(e) => setMonthlyRent(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Барьцаа</label>
                                    <input type="text" placeholder="1,600,000₮" value={deposit}
                                        onChange={(e) => setDeposit(e.target.value)} className={inputCls} />
                                </div>
                            </>
                        )}

                        {/* IMAGE */}
                        <div className="md:col-span-2">
                            <label className={labelCls}>Үндсэн зураг</label>
                            <div className="border border-dashed border-white/20 rounded-xl p-6 bg-black/20">
                                <input type="file" accept="image/*" onChange={handleImage} className="mb-3" />
                                {preview && (
                                    <img src={preview} alt="" className="mt-3 w-full max-h-[250px] object-cover rounded-xl" />
                                )}
                            </div>
                        </div>

                        {/* GALLERY */}
                        <div className="md:col-span-2">
                            <label className={labelCls}>Галерей зурагнууд</label>
                            <input type="file" multiple accept="image/*"
                                onChange={(e) => setGalleryFiles(e.target.files)}
                                className={inputCls} />
                        </div>

                        {/* DESCRIPTION */}
                        <div className="md:col-span-2">
                            <label className={labelCls}>Тайлбар</label>
                            <textarea placeholder="Орон сууцны тухай дэлгэрэнгүй мэдээлэл..." value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={inputCls + " h-32 resize-none"} />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={editingId ? updateProperty : addProperty}
                            disabled={saving}
                            className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition disabled:opacity-50">
                            {saving ? "Хадгалж байна..." : editingId ? "Шинэчлэх" : "Хадгалах"}
                        </button>
                        {editingId && (
                            <button onClick={() => resetForm(setters)}
                                className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition">
                                Цуцлах
                            </button>
                        )}
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-4 py-4 border-b border-white/10">
                        <h3 className="font-semibold">Бүх зарууд ({properties.length})</h3>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-white/40 text-sm border-b border-white/10">
                                    <th className="text-left px-4 py-3 font-medium">Гарчиг</th>
                                    <th className="text-left px-4 py-3 font-medium">Байршил</th>
                                    <th className="text-left px-4 py-3 font-medium">Үнэ</th>
                                    <th className="text-left px-4 py-3 font-medium">Статус</th>
                                    <th className="text-left px-4 py-3 font-medium">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((property) => (
                                    <tr key={property.id} className="border-b border-white/5 hover:bg-white/3 transition">
                                        <td className="px-4 py-4 font-medium">{property.title}</td>
                                        <td className="px-4 py-4 text-white/50 text-sm">{property.location}</td>
                                        <td className="px-4 py-4 text-yellow-400 font-semibold text-sm">{property.price}</td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => toggleStatus(property.id, property.status)}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${property.status === "active" ? "bg-green-500" : "bg-white/20"}`}>
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${property.status === "active" ? "left-6" : "left-0.5"}`} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => editProperty(property)}
                                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
                                                    Засах
                                                </button>
                                                <button onClick={() => deleteProperty(property.id)}
                                                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-sm transition">
                                                    Устгах
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-white/5">
                        {properties.map((property) => (
                            <div key={property.id} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-sm">{property.title}</p>
                                        <p className="text-white/40 text-xs">{property.location}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(property.id, property.status)}
                                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${property.status === "active" ? "bg-green-500" : "bg-white/20"}`}>
                                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${property.status === "active" ? "left-5" : "left-0.5"}`} />
                                    </button>
                                </div>
                                <p className="text-yellow-400 text-sm font-semibold mb-3">{property.price}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => editProperty(property)}
                                        className="flex-1 py-2 bg-white/10 rounded-lg text-sm">Засах</button>
                                    <button onClick={() => deleteProperty(property.id)}
                                        className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">Устгах</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {properties.length === 0 && (
                        <div className="text-center py-16 text-white/30">
                            <p className="text-4xl mb-3">🏠</p>
                            <p>Зар байхгүй байна</p>
                        </div>
                    )}
                </div>

            </section>
        </main>
    );
}
