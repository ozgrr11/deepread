
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

const categories = [
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

export default function Publish() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Diğer");
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function selectCover(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen bir görsel dosyası seç.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Kapak görseli en fazla 5 MB olabilir.");
      return;
    }

    setCover(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function publishBook(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Önce giriş yapmalısın.");
        return;
      }

      let coverUrl = null;

      if (cover) {
        const extension = cover.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("book-covers")
          .upload(filePath, cover);

        if (uploadError) {
          setMessage("Kapak yüklenemedi: " + uploadError.message);
          return;
        }

        const { data } = supabase.storage
          .from("book-covers")
          .getPublicUrl(filePath);

        coverUrl = data.publicUrl;
      }

      const { error } = await supabase.from("books").insert({
        title,
        author,
        description,
        category,
        cover_url: coverUrl,
        user_id: user.id,
      });

      if (error) {
        setMessage("Hata: " + error.message);
      } else {
        setMessage("Kitabın başarıyla yayımlandı!");
        setTitle("");
        setAuthor("");
        setDescription("");
        setCategory("Diğer");
        setCover(null);
        setPreview("");
      }
    } catch (error) {
      setMessage("Bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white p-6">
      <div className="max-w-2xl mx-auto py-12">

        <a href="/" className="text-blue-400 hover:text-blue-300">
          ← Ana sayfa
        </a>

        <h1 className="text-3xl font-bold text-blue-400 mt-8 mb-2">
          DeepRead
        </h1>

        <h2 className="text-2xl font-bold mb-2">
          Kitabını yayımla
        </h2>

        <p className="text-gray-400 mb-8">
          Hikâyeni okuyucularla buluştur.
        </p>

        <form onSubmit={publishBook} className="space-y-5">

          <div>
            <label className="block mb-2 font-bold">
              Kitap adı
            </label>

            <input
              className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700 outline-none focus:border-blue-500"
              placeholder="Kitap adı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-bold">
              Yazar adı
            </label>

            <input
              className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700 outline-none focus:border-blue-500"
              placeholder="Yazar adı"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-bold">
              Kitap kategorisi
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700 outline-none focus:border-blue-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-bold">
              Kitap açıklaması
            </label>

            <textarea
              className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700 outline-none focus:border-blue-500"
              placeholder="Kitap açıklaması"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="bg-[#111B2D] border border-gray-700 rounded-xl p-5">
            <label className="block mb-3 font-bold">
              Kitap kapağı
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={selectCover}
              className="w-full text-gray-300"
            />

            {preview && (
              <img
                src={preview}
                alt="Kapak önizlemesi"
                className="mt-5 w-40 h-56 object-cover rounded-xl"
              />
            )}

            <p className="text-gray-500 text-sm mt-3">
              PNG, JPG veya WEBP. En fazla 5 MB.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold disabled:opacity-50"
          >
            {loading ? "Yayımlanıyor..." : "Kitabı yayımla"}
          </button>

        </form>

        <p className="mt-5 text-blue-400">
          {message}
        </p>

      </div>
    </main>
  );
}
