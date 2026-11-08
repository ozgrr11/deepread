
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Login() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white flex items-center justify-center p-6">
      <form onSubmit={login} className="w-full max-w-md bg-[#111B2D] p-8 rounded-2xl">

        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          DeepRead
        </h1>

        <h2 className="text-xl mb-6">Hesabına giriş yap</h2>

        <input
          className="w-full p-4 mb-4 rounded-lg bg-[#080D18] border border-gray-700"
          type="email"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full p-4 mb-2 rounded-lg bg-[#080D18] border border-gray-700"
          type="password"
          placeholder="Şifren"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <a
          href="/forgot-password"
          className="block text-right text-sm text-blue-400 hover:text-blue-300 mb-5"
        >
          Şifremi Unuttum?
        </a>

        <button className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-lg font-bold">
          Giriş Yap
        </button>

        <p className="mt-4 text-sm text-gray-300">{message}</p>

        <a href="/register" className="block mt-5 text-blue-400">
          Hesabın yok mu? Kayıt ol
        </a>

      </form>
    </main>
  );
}
