"use client";

import { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = () => {
        if (
            username === "admin" &&
            password === "wepro2026"
        ) {
            localStorage.setItem("adminAuth", "true");
            window.location.href = "/admin";
        } else {
            alert("Нэвтрэх нэр эсвэл нууц үг буруу");
        }
    };

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8">

                <h1 className="text-4xl font-bold mb-8 text-center">
                    Admin Login
                </h1>

                <div className="space-y-4">

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none"
                    />

                    <button
                        onClick={login}
                        className="w-full py-4 bg-white text-black rounded-2xl font-semibold hover:bg-yellow-400 transition"
                    >
                        Нэвтрэх
                    </button>

                </div>

            </div>

        </main>
    );
}