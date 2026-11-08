
"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function FavoritesPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadFavorites() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Favorilerini görmek için giriş yapmalısın.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("book_id, books(*)")
        .eq("user_id", user.id);

      if (error) {
        setMessage("Favoriler yüklenemedi: " + error.message);
      } else {
        setBooks(
          (data || [])
            .map((item) => item.books)
            .filter(Boolean)
        );
      }

      setLoading(false);
    }

    loadFavorites();
  }, []);

  async function removeFavorite(bookId) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("book_id", bookId);

    if (error) {
      setMessage("Favori silinemedi: " + error.message);
      return;
    }

    setBooks((previous) =>
      previous.filter((book) => book.id !== bookId)
    );
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white p-8">
      <div className="max-w-5xl mx-auto py-10">

        <a href="/" className="text-blue-400">
          ← Ana sayfa
        </a>

        <h1 className="text-3xl font-bold mt-8 mb-3">
          ♥ Favorilerim
        </h1>

        <p className="text-gray-400 mb-8">
          Kaydettiğin kitaplar burada.
        </p>

        {loading ? (
          <p>Favoriler yükleniyor...</p>
        ) : message ? (
          <p className="text-red-400">{message}</p>
        ) : books.length === 0 ? (
          <div className="bg-[#111B2D] p-8 rounded-2xl text-center">
            <p className="text-gray-400">
              Henüz favorilerine kitap eklememişsin.
            </p>
            <a href="/" className="text-blue-400 block mt-4">
              Kitapları keşfet →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-[#111B2D] rounded-2xl border border-gray-800 overflow-hidden"
              >
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-[#17243A] flex items-center justify-center text-gray-500">
                    Kapak yok
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold text-blue-300">
                    {book.title}
                  </h2>

                  <p className="text-gray-400 mt-2">
                    {book.author}
                  </p>

                  <a
                    href={`/book/${book.id}`}
                    className="block text-blue-400 mt-5"
                  >
                    Kitabı oku →
                  </a>

                  <button
                    onClick={() => removeFavorite(book.id)}
                    className="mt-4 text-red-400 hover:text-red-300"
                  >
                    ♥ Favorilerimden çıkar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
