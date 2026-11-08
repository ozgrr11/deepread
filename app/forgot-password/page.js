
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetLink(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage("Hata: " + error.message);
    } else {
      setMessage("Sıfırlama bağlantısı e-posta adresine gönderildi. Gelen kutunu kontrol et.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white flex items-center justify-center p-6">
      <form onSubmit={sendResetLink} className="w-full max-w-md bg-[#111B2D] p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-blue-400 mb-3">DeepRead</h1>
        <h2 className="text-xl mb-3">Şifremi Unuttum</h2>

        <p className="text-gray-400 mb-5">
          Hesabına bağlı e-posta adresini gir.
        </p>

        <input
          type="email"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-5 rounded-lg bg-[#080D18] border border-gray-700"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
        </button>

        <p className="mt-4 text-sm text-gray-300">{message}</p>

        <a href="/login" className="block mt-5 text-blue-400">
          Giriş sayfasına dön
        </a>
      </form>
    </main>
  );
}
