import { supabase } from "../../../lib/supabase";
import PropertyDetailClient from "./PropertyDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const { data } = await supabase
        .from("properties")
        .select("title, location, price, image, description")
        .eq("id", id)
        .single();

    if (!data) return { title: "Зар олдсонгүй" };

    return {
        title: `${data.title} — TSOLMON WEPRO`,
        description: `${data.price} | 📍 ${data.location}${data.description ? " | " + data.description.slice(0, 100) : ""}`,
        openGraph: {
            title: `${data.title} — TSOLMON WEPRO`,
            description: `${data.price} | 📍 ${data.location}`,
            images: data.image ? [{ url: data.image, width: 1200, height: 630 }] : [],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: data.title,
            description: `${data.price} | 📍 ${data.location}`,
            images: data.image ? [data.image] : [],
        },
    };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PropertyDetailClient id={id} />;
}