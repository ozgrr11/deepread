
"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AdminPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function loadBooks() {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Kitaplar yüklenemedi: " + error.message);
      return;
    }

    setBooks(data || []);
  }

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Önce giriş yapmalısın.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        setMessage("Bu sayfaya erişim yetkin yok.");
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadBooks();
      setLoading(false);
    }

    checkAdmin();
  }, []);

  async function changeStatus(bookId, status) {
    const { error } = await supabase
      .from("books")
      .update({ status })
      .eq("id", bookId);

    if (error) {
      setMessage("İşlem başarısız: " + error.message);
      return;
    }

    setMessage(
      status === "approved"
        ? "Kitap onaylandı!"
        : "Kitap reddedildi."
    );

    await loadBooks();
  }

  async function deleteBook(book) {
    const confirmed = window.confirm(
      `"${book.title}" kitabını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.`
    );

    if (!confirmed) return;

    setDeletingId(book.id);
    setMessage("");

    try {
      const relatedTables = ["chapters", "comments", "ratings", "favorites"];

      for (const table of relatedTables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("book_id", book.id);

        if (error) {
          throw new Error(`${table} kayıtları silinemedi: ${error.message}`);
        }
      }

      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", book.id);

      if (error) {
        throw new Error("Kitap silinemedi: " + error.message);
      }

      setMessage("Kitap ve ilişkili kayıtları silindi.");
      await loadBooks();
    } catch (error) {
      setMessage("Silme işlemi başarısız: " + error.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Yükleniyor...</main>;
  }

  if (!isAdmin) {
    return (
      <main style={{
        padding: 40,
        color: "white",
        background: "#080d18",
        minHeight: "100vh"
      }}>
        <h1>Yetkisiz erişim</h1>
        <p>{message}</p>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#080d18",
      color: "white",
      padding: "30px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ color: "#55aaff" }}>DeepRead Yönetici Paneli</h1>
      <p>Onay bekleyen kitapları buradan inceleyebilirsin.</p>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}

      <h2 style={{ marginTop: 25 }}>
        Bekleyen Kitaplar ({books.length})
      </h2>

      {books.length === 0 && <p>Bekleyen kitap bulunmuyor.</p>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: 20
      }}>
        {books.map((book) => (
          <div key={book.id} style={{
            background: "#111c30",
            padding: 18,
            borderRadius: 12,
            border: "1px solid #263b59"
          }}>
            {book.cover_url && (
              <img
                src={book.cover_url}
                alt="Kitap kapağı"
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 8
                }}
              />
            )}

            <h3>{book.title}</h3>
            <p>Yazar: {book.author}</p>
            <p>{book.description}</p>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 12
            }}>
              <button
                onClick={() => changeStatus(book.id, "approved")}
                style={{
                  background: "#16834a",
                  color: "white",
                  padding: 10,
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Onayla
              </button>

              <button
                onClick={() => changeStatus(book.id, "rejected")}
                style={{
                  background: "#b52d3b",
                  color: "white",
                  padding: 10,
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Reddet
              </button>

              <button
                onClick={() => deleteBook(book)}
                disabled={deletingId === book.id}
                style={{
                  background: "#751d2a",
                  color: "white",
                  padding: 10,
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer",
                  opacity: deletingId === book.id ? 0.5 : 1
                }}
              >
                {deletingId === book.id ? "Siliniyor..." : "🗑 Sil"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
