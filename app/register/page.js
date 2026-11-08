
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Register() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("Kayıt oluşturuluyor...");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage("Hata: " + error.message);
      } else if (data.user) {
        setMessage(
          data.session
            ? "Kayıt başarılı! Hoş geldin."
            : "Kayıt başarılı! E-postanı kontrol et."
        );
      }
    } catch (error) {
      setMessage("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white flex items-center justify-center p-6">
      <form onSubmit={register} className="w-full max-w-md bg-[#111B2D] p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          DeepRead
        </h1>

        <h2 className="text-xl mb-6">Hesap oluştur</h2>

        <input
          className="w-full p-4 mb-4 rounded-lg bg-[#080D18] border border-gray-700"
          type="email"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full p-4 mb-5 rounded-lg bg-[#080D18] border border-gray-700"
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-4 rounded-lg font-bold"
        >
          {loading ? "Bekle..." : "Kayıt Ol"}
        </button>

        <p className="mt-4 text-sm text-gray-300">{message}</p>

        <a href="/login" className="block mt-5 text-blue-400">
          Zaten hesabın var mı? Giriş yap
        </a>
      </form>
    </main>
  );
}
