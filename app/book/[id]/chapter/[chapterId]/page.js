
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";

function ReadChapterContent() {
  const params = useParams();
  const router = useRouter();

  const bookId = params.id;
  const chapterId = params.chapterId;

  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [fontSize, setFontSize] = useState(19);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadChapter() {
      setLoading(true);
      const supabase = createClient();

      const { data: chapterData, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .eq("book_id", bookId)
        .single();

      const { data: allChapters } = await supabase
        .from("chapters")
        .select("id, title, chapter_number")
        .eq("book_id", bookId)
        .order("chapter_number");

      if (cancelled) return;

      if (!error) {
        setChapter(chapterData);
      } else {
        setChapter(null);
      }

      setChapters(allChapters || []);
      setLoading(false);
    }

    if (bookId && chapterId) {
      loadChapter();
    }

    return () => {
      cancelled = true;
    };
  }, [bookId, chapterId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080D18] text-white p-8">
        Bölüm yükleniyor...
      </main>
    );
  }

  if (!chapter) {
    return (
      <main className="min-h-screen bg-[#080D18] text-white p-8">
        Bölüm bulunamadı.
      </main>
    );
  }

  const currentIndex = chapters.findIndex(
    (item) => String(item.id) === String(chapterId)
  );

  const previousChapter = chapters[currentIndex - 1];
  const nextChapter = chapters[currentIndex + 1];

  return (
    <main
      className={`min-h-screen transition-colors ${
        darkMode
          ? "bg-[#080D18] text-gray-100"
          : "bg-[#F4F1EA] text-[#252525]"
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-8">

        <header className="flex justify-between items-center border-b border-gray-500/20 pb-5">
          <a
            href={`/book/${bookId}`}
            className="text-blue-400"
          >
            ← Kitaba dön
          </a>

          <span className="font-bold text-blue-400">
            DeepRead
          </span>
        </header>

        <div className="flex flex-wrap justify-between items-center gap-4 py-6 border-b border-gray-500/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              🔎-
            </button>

            <span>{fontSize}px</span>

            <button
              onClick={() => setFontSize(Math.min(30, fontSize + 2))}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              🔎+
            </button>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-lg border border-gray-500/40"
          >
            {darkMode ? "☀ Açık mod" : "☾ Koyu mod"}
          </button>
        </div>

        <article className="py-12">
          <p className="text-blue-400 mb-4">
            BÖLÜM {chapter.chapter_number}
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mb-12">
            {chapter.title}
          </h1>

          <div
            className="leading-[2] whitespace-pre-wrap"
            style={{ fontSize: `${fontSize}px` }}
          >
            {chapter.content}
          </div>
        </article>

        <footer className="border-t border-gray-500/20 pt-8 pb-16">
          <div className="flex justify-between gap-4">
            <button
              disabled={!previousChapter}
              onClick={() =>
                router.push(
                  `/book/${bookId}/chapter/${previousChapter.id}`
                )
              }
              className="px-5 py-3 rounded-xl bg-blue-600 text-white disabled:opacity-30"
            >
              ← Önceki bölüm
            </button>

            <button
              disabled={!nextChapter}
              onClick={() =>
                router.push(
                  `/book/${bookId}/chapter/${nextChapter.id}`
                )
              }
              className="px-5 py-3 rounded-xl bg-blue-600 text-white disabled:opacity-30"
            >
              Sonraki bölüm →
            </button>
          </div>
        </footer>

      </div>
    </main>
  );
}

export default function ReadChapter() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080D18] text-white p-8">
          Bölüm yükleniyor...
        </main>
      }
    >
      <ReadChapterContent />
    </Suspense>
  );
}
