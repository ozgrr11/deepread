
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

function BookPageContent() {
  const params = useParams();
  const id = params?.id;

  const supabase = useMemo(() => createClient(), []);

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("book_id", id)
      .order("created_at", { ascending: false });

    if (!data) return;

    const userIds = [...new Set(data.map((item) => item.user_id))];

    let profiles = [];

    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      profiles = profileData || [];
    }

    const finalComments = data.map((comment) => {
      const profile = profiles.find(
        (item) => item.id === comment.user_id
      );

      return {
        ...comment,
        username: profile?.username || "İsimsiz kullanıcı",
        avatar_url: profile?.avatar_url || "",
      };
    });

    setComments(finalComments);
  }

  async function loadRatings(currentUser) {
    const { data, error } = await supabase
      .from("ratings")
      .select("user_id, rating")
      .eq("book_id", id);

    if (error) {
      setMessage("Puanlar yüklenemedi: " + error.message);
      return;
    }

    setRatings(data || []);

    if (currentUser) {
      const ownRating = (data || []).find(
        (item) => item.user_id === currentUser.id
      );

      setMyRating(ownRating?.rating || 0);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;
      setUser(user);

      const { data: bookData } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      const { data: chapterData } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", id)
        .order("chapter_number");

      if (cancelled) return;

      setBook(bookData);
      setChapters(chapterData || []);

      if (user) {
        const { data: favoriteData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("book_id", id)
          .maybeSingle();

        if (cancelled) return;
        setIsFavorite(!!favoriteData);
      }

      await loadComments();
      if (cancelled) return;

      await loadRatings(user);
      if (cancelled) return;

      setLoading(false);
    }

    if (id) {
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  async function saveRating(value) {
    if (!user) {
      setMessage("Puan vermek için giriş yapmalısın.");
      return;
    }

    setSavingRating(true);
    setMessage("");

    const { error } = await supabase
      .from("ratings")
      .upsert(
        {
          user_id: user.id,
          book_id: id,
          rating: value,
        },
        {
          onConflict: "user_id,book_id",
        }
      );

    if (error) {
      setMessage("Puan kaydedilemedi: " + error.message);
    } else {
      setMyRating(value);
      await loadRatings(user);
      setMessage("Puanın kaydedildi!");
    }

    setSavingRating(false);
  }

  async function toggleFavorite() {
    if (!user) {
      setMessage("Favorilere eklemek için giriş yapmalısın.");
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", id);

      if (error) {
        setMessage("Favoriden çıkarılamadı: " + error.message);
        return;
      }

      setIsFavorite(false);
      setMessage("Favorilerinden çıkarıldı.");
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          book_id: id,
        });

      if (error) {
        setMessage("Favoriye eklenemedi: " + error.message);
        return;
      }

      setIsFavorite(true);
      setMessage("Favorilerine eklendi!");
    }
  }

  async function addComment(e) {
    e.preventDefault();

    if (!user) {
      setMessage("Yorum yapmak için giriş yapmalısın.");
      return;
    }

    if (!commentText.trim()) return;

    setSending(true);
    setMessage("");

    const { error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        book_id: id,
        content: commentText.trim(),
      });

    if (error) {
      setMessage("Yorum gönderilemedi: " + error.message);
    } else {
      setCommentText("");
      await loadComments();
      setMessage("Yorumun yayımlandı!");
    }

    setSending(false);
  }

  async function deleteComment(commentId) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) {
      setMessage("Yorum silinemedi: " + error.message);
      return;
    }

    setComments((previous) =>
      previous.filter((item) => item.id !== commentId)
    );
  }

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((total, item) => total + item.rating, 0) /
          ratings.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080D18] text-white p-8">
        Kitap yükleniyor...
      </main>
    );
  }

  if (!book) {
    return (
      <main className="min-h-screen bg-[#080D18] text-white p-8">
        Kitap bulunamadı.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white">
      <div className="max-w-5xl mx-auto p-6 py-10">
        <a href="/" className="text-blue-400">
          ← Ana sayfa
        </a>

        <section className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 mt-10 items-start">
          <div>
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full max-w-[260px] h-[370px] object-cover rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full max-w-[260px] h-[370px] bg-[#111B2D] rounded-2xl flex items-center justify-center text-gray-500">
                Kapak yok
              </div>
            )}
          </div>

          <div className="py-2">
            <p className="text-blue-400 font-semibold mb-3">
              DEEPREAD KİTAPLIĞI
            </p>

            <h1 className="text-4xl font-bold mb-4">
              {book.title}
            </h1>

            <p className="text-gray-400 text-lg mb-6">
              Yazar: {book.author}
            </p>

            <div className="bg-[#111B2D] border border-gray-800 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-3">
                Kitap hakkında
              </h2>

              <p className="text-gray-300 leading-7 whitespace-pre-wrap">
                {book.description || "Henüz açıklama eklenmemiş."}
              </p>
            </div>

            <p className="text-gray-400">
              {chapters.length} bölüm
            </p>

            {/* PUANLAMA */}
            <div className="bg-[#111B2D] border border-gray-800 rounded-2xl p-5 mt-6">
              <h2 className="font-bold text-lg mb-3">
                Okur puanı
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-yellow-400">
                  {averageRating}
                </span>

                <div>
                  <div className="text-yellow-400 text-xl">
                    {"★".repeat(Math.round(Number(averageRating)))}
                    {"☆".repeat(5 - Math.round(Number(averageRating)))}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {ratings.length} değerlendirme
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-3">
                {myRating
                  ? `Senin puanın: ${myRating}/5 (Değiştirebilirsin)`
                  : "Bu kitaba kaç yıldız verirsin?"}
              </p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={savingRating}
                    onClick={() => saveRating(star)}
                    className={`text-3xl transition hover:scale-110 ${
                      star <= myRating
                        ? "text-yellow-400"
                        : "text-gray-600 hover:text-yellow-300"
                    }`}
                    aria-label={`${star} yıldız ver`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={toggleFavorite}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  isFavorite
                    ? "bg-pink-600 hover:bg-pink-500"
                    : "bg-[#17243A] border border-gray-700 hover:border-pink-500"
                }`}
              >
                {isFavorite ? "♥ Favorilerimde" : "♡ Favorilere ekle"}
              </button>

              <a
                href={`/book/${id}/add-chapter`}
                className="inline-block bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold"
              >
                + Bölüm ekle
              </a>
            </div>

            {message && (
              <p className="text-blue-300 mt-4">
                {message}
              </p>
            )}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            Kitabın bölümleri
          </h2>

          {chapters.length === 0 ? (
            <p className="text-gray-400">
              Henüz bölüm eklenmemiş.
            </p>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`/book/${id}/chapter/${chapter.id}`}
                  className="block bg-[#111B2D] border border-gray-800 hover:border-blue-500 p-5 rounded-xl transition"
                >
                  <p className="text-blue-400 text-sm">
                    BÖLÜM {chapter.chapter_number}
                  </p>

                  <h3 className="text-lg font-bold mt-1">
                    {chapter.title}
                  </h3>

                  <p className="text-gray-400 text-sm mt-2">
                    Bölümü okumak için tıkla →
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* YORUMLAR */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            Okur yorumları ({comments.length})
          </h2>

          <form
            onSubmit={addComment}
            className="bg-[#111B2D] border border-gray-800 rounded-2xl p-6 mb-8"
          >
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Bu kitap hakkındaki düşüncelerini yaz..."
              maxLength={1000}
              rows={4}
              className="w-full bg-[#080D18] border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 resize-y"
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-500 text-sm">
                {commentText.length}/1000
              </span>

              <button
                type="submit"
                disabled={sending || !commentText.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold"
              >
                {sending ? "Gönderiliyor..." : "Yorum yap"}
              </button>
            </div>
          </form>

          {comments.length === 0 ? (
            <p className="text-gray-400">
              Henüz yorum yapılmamış. İlk yorumu sen yap!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[#111B2D] border border-gray-800 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3">
                    {comment.avatar_url ? (
                      <img
                        src={comment.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center font-bold">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <a
                      href={`/author/${comment.user_id}`}
                      className="font-semibold text-blue-300 hover:text-blue-200"
                    >
                      {comment.username}
                    </a>
                  </div>

                  <p className="text-gray-300 mt-4 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-500 text-xs">
                      {new Date(comment.created_at).toLocaleDateString("tr-TR")}
                    </span>

                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Yorumu sil
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080D18] text-white p-8">
          Kitap yükleniyor...
        </main>
      }
    >
      <BookPageContent />
    </Suspense>
  );
}
