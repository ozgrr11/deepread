
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function AuthorPage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      const { data: bookData } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setProfile(profileData);
      setBooks(bookData || []);
      setLoading(false);
    }

    if (id) loadProfile();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080D18] text-white p-8">
        Yükleniyor...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#080D18] text-white p-8">
        Yazar bulunamadı.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white p-8">
      <div className="max-w-3xl mx-auto py-12">

        <a href="/" className="text-blue-400">
          ← Ana sayfa
        </a>

        {/* PROFİL BANNER */}
        <div className="mt-8 relative">

          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt="Profil bannerı"
              className="w-full h-56 object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full h-56 rounded-2xl bg-gradient-to-r from-blue-950 via-[#142B50] to-[#080D18]" />
          )}

          {/* PROFİL FOTOĞRAFI */}
          <div className="absolute -bottom-12 left-8">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profil fotoğrafı"
                className="w-28 h-28 rounded-full object-cover border-4 border-[#080D18]"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#1D3558] border-4 border-[#080D18] flex items-center justify-center text-4xl font-bold text-blue-300">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* YAZAR BİLGİLERİ */}
        <div className="bg-[#111B2D] p-8 pt-16 rounded-2xl mt-4">

          <h1 className="text-3xl font-bold text-blue-300">
            {profile.username}
          </h1>

          <p className="text-gray-300 mt-4 whitespace-pre-wrap">
            {profile.bio || "Henüz biyografi eklenmemiş."}
          </p>

        </div>

        {/* KİTAPLAR */}
        <h2 className="text-2xl font-bold mt-10 mb-5">
          Yayımladığı kitaplar
        </h2>

        {books.length === 0 ? (
          <p className="text-gray-400">
            Henüz kitap yayımlamamış.
          </p>
        ) : (
          <div className="grid gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-[#111B2D] p-6 rounded-xl"
              >
                <h3 className="text-xl font-bold text-blue-300">
                  {book.title}
                </h3>

                <p className="text-gray-400 mt-2">
                  {book.description}
                </p>

                <a
                  href={`/book/${book.id}`}
                  className="text-blue-400 block mt-4"
                >
                  Kitabı oku →
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
