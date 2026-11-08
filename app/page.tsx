
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

const categories = [
  "Tümü",
  "Fantastik",
  "Romantik",
  "Bilim Kurgu",
  "Gizem",
  "Korku",
  "Macera",
  "Dram",
  "Gerilim",
  "Gençlik",
  "Diğer",
];

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) setUserId(user.id);

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setBooks(data || []);

      setLoading(false);
    }

    loadData();
  }, []);

  const filteredBooks = useMemo(() => {
    const value = search.toLocaleLowerCase("tr-TR").trim();

    return books.filter((book) => {
      const matchesCategory =
        selectedCategory === "Tümü" ||
        (book.category || "Diğer") === selectedCategory;

      const matchesSearch =
        !value ||
        [book.title, book.author, book.description]
          .filter(Boolean)
          .some((item: string) =>
            item.toLocaleLowerCase("tr-TR").includes(value)
          );

      return matchesCategory && matchesSearch;
    });
  }, [books, search, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#080D18] text-white">

      {/* NAVİGASYON */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D18]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-4">

          <a href="/" className="text-3xl font-black tracking-tight text-blue-400">
            DeepRead<span className="text-white">.</span>
          </a>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <a href="/" className="px-3 py-2 text-blue-400">
              Keşfet
            </a>

            {userId ? (
              <>
                <a href="/profile" className="px-3 py-2 text-gray-300 hover:text-white">
                  Profilim
                </a>

                <a href="/favorites" className="px-3 py-2 text-gray-300 hover:text-white">
                  ♥ Favoriler
                </a>
              </>
            ) : (
              <a href="/login" className="px-4 py-2 text-gray-300 hover:text-white">
                Giriş yap
              </a>
            )}

            <a
              href="/publish"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition"
            >
              + Kitap yayımla
            </a>
          </nav>

        </div>
      </header>

      {/* KARŞILAMA ALANI */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/70 via-[#080D18] to-[#080D18]" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-5 py-20 md:py-28">

          <div className="max-w-3xl">

            <span className="inline-block px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-7">
              ✦ Yeni hikâyeler, yeni dünyalar
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6">
              Kendi dünyanı
              <span className="block text-blue-400">
                keşfet.
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl mb-9">
              Binlerce hikâyenin arasında kaybol, yeni yazarlar keşfet
              ve kendi hikâyeni dünyayla paylaş.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#kitaplar"
                className="px-7 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition"
              >
                Kitapları keşfet →
              </a>

              <a
                href="/publish"
                className="px-7 py-4 border border-gray-700 hover:border-blue-500 rounded-xl font-bold transition"
              >
                Hikâyeni yayımla
              </a>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-5 max-w-sm mt-16 border-t border-white/10 pt-7">
            <div>
              <p className="text-3xl font-black text-blue-400">
                {books.length}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Keşfedilecek kitap
              </p>
            </div>

            <div>
              <p className="text-3xl font-black text-blue-400">
                ∞
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Sınırsız hayal gücü
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* KİTAPLAR */}
      <section id="kitaplar" className="max-w-7xl mx-auto px-5 py-16">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-9">

          <div>
            <p className="text-blue-400 font-bold text-sm mb-3">
              DEEPREAD KÜTÜPHANESİ
            </p>

            <h2 className="text-3xl md:text-4xl font-black">
              Kitapları keşfet
            </h2>

            <p className="text-gray-400 mt-3">
              Sana hitap eden hikâyeyi bul.
            </p>
          </div>

          <div className="text-gray-500 text-sm">
            {filteredBooks.length} / {books.length} kitap listeleniyor
          </div>

        </div>

        {/* ARAMA */}
        <div className="relative mb-7">

          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500">
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kitap, yazar veya hikâye ara..."
            className="w-full bg-[#111B2D] border border-gray-800 focus:border-blue-500 outline-none rounded-2xl py-5 pl-14 pr-5 text-white transition"
          />

        </div>

        {/* KATEGORİLER */}
        <div className="mb-10">
          <p className="text-sm text-gray-400 mb-4 font-semibold">
            Kategoriler
          </p>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-[#111B2D] border-gray-800 text-gray-400 hover:border-blue-500 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* KİTAP LİSTESİ */}
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            Kitaplar yükleniyor...
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-24 text-center bg-[#111B2D] border border-gray-800 rounded-2xl">

            <div className="text-5xl mb-5">📚</div>

            <h3 className="text-xl font-bold mb-2">
              {search || selectedCategory !== "Tümü"
                ? "Kitap bulunamadı"
                : "Henüz kitap yok"}
            </h3>

            <p className="text-gray-400">
              {search || selectedCategory !== "Tümü"
                ? "Aramanı veya kategori seçimini değiştirmeyi deneyebilirsin."
                : "İlk hikâyeyi yayımlayan sen olabilirsin."}
            </p>

            {(search || selectedCategory !== "Tümü") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("Tümü");
                }}
                className="mt-5 text-blue-400 hover:text-blue-300"
              >
                Filtreleri temizle
              </button>
            )}

          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {filteredBooks.map((book) => (

              <article
                key={book.id}
                className="group bg-[#111B2D] border border-gray-800 hover:border-blue-500/60 rounded-2xl overflow-hidden transition duration-300 hover:-translate-y-1"
              >

                <a href={`/book/${book.id}`} className="block">

                  <div className="relative h-72 bg-[#17243A] overflow-hidden">

                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <span className="text-5xl mb-3">📖</span>
                        Kapak yok
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#080D18]/70 to-transparent opacity-60" />

                  </div>

                  <div className="p-5">

                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
                        {book.category || "Diğer"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition mb-2 line-clamp-1">
                      {book.title}
                    </h3>

                    <p className="text-blue-400 text-sm mb-4">
                      {book.author}
                    </p>

                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                      {book.description || "Bu hikâye için henüz bir açıklama eklenmemiş."}
                    </p>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">

                      <span className="text-sm text-gray-400">
                        Kitabı oku
                      </span>

                      <span className="text-blue-400 group-hover:translate-x-1 transition">
                        →
                      </span>

                    </div>

                  </div>

                </a>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* ALT BÖLÜM */}
      <footer className="border-t border-white/10 bg-[#060A12]">

        <div className="max-w-7xl mx-auto px-5 py-10 flex flex-col sm:flex-row justify-between gap-5">

          <div>
            <h2 className="text-2xl font-black text-blue-400">
              DeepRead.
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Oku. Yaz. Keşfet.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-gray-400">
            <a href="/" className="hover:text-blue-400">Ana sayfa</a>
            <a href="/publish" className="hover:text-blue-400">Kitap yayımla</a>
            <a href="/profile" className="hover:text-blue-400">Profilim</a>
          </div>

        </div>

        <p className="text-center text-gray-600 text-xs pb-6">
          © 2026 DeepRead. Tüm hakları saklıdır.
        </p>

      </footer>

    </main>
  );
}
