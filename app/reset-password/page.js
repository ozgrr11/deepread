
"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Bağlantı doğrulanıyor...");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")
      ) {
        setReady(true);
        setMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function updatePassword(e) {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("Hata: " + error.message);
    } else {
      setMessage("Şifren başarıyla değiştirildi!");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white flex items-center justify-center p-6">
      <form onSubmit={updatePassword} className="w-full max-w-md bg-[#111B2D] p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-blue-400 mb-3">
          DeepRead
        </h1>

        <h2 className="text-xl mb-6">Yeni Şifre Belirle</h2>

        {ready && (
          <>
            <input
              type="password"
              placeholder="Yeni şifren"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 mb-4 rounded-lg bg-[#080D18] border border-gray-700"
              required
            />

            <input
              type="password"
              placeholder="Yeni şifreni tekrar gir"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 mb-5 rounded-lg bg-[#080D18] border border-gray-700"
              required
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Şifreyi Değiştir"}
            </button>
          </>
        )}

        <p className="mt-4 text-sm text-gray-300">{message}</p>

        <a href="/login" className="block mt-5 text-blue-400">
          Giriş sayfasına dön
        </a>
      </form>
    </main>
  );
}
