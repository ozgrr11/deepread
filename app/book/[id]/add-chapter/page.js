
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";

export default function AddChapter() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function addChapter(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Önce giriş yapmalısın.");
        return;
      }

      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("user_id")
        .eq("id", id)
        .single();

      if (bookError || !book || book.user_id !== user.id) {
        setMessage("Bu kitaba bölüm ekleme yetkin yok.");
        return;
      }

      const { data: lastChapter } = await supabase
        .from("chapters")
        .select("chapter_number")
        .eq("book_id", id)
        .order("chapter_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextNumber = (lastChapter?.chapter_number || 0) + 1;

      const { error } = await supabase.from("chapters").insert({
        book_id: id,
        title,
        content,
        chapter_number: nextNumber,
      });

      if (error) {
        setMessage("Hata: " + error.message);
      } else {
        router.push(`/book/${id}`);
      }
    } catch (error) {
      setMessage("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white p-6">
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">
          Bölüm ekle
        </h1>

        <form onSubmit={addChapter} className="space-y-5">
          <input
            className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700"
            placeholder="Bölüm başlığı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700"
            placeholder="Bölümünü buraya yaz..."
            rows={15}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full p-4 rounded-xl bg-blue-600 font-bold disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Bölümü yayımla"}
          </button>
        </form>

        <p className="mt-5 text-red-400">{message}</p>
      </div>
    </main>
  );
}
