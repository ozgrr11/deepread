
"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Önce giriş yapmalısın.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage("Profil yüklenemedi: " + error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
        setBannerUrl(data.banner_url || "");
      } else {
        const defaultUsername =
          user.email?.split("@")[0] || "DeepReadYazarı";

        setUsername(defaultUsername);
        setMessage("Profilini oluşturmak için bilgilerini kaydet.");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Önce giriş yapmalısın.");
        return;
      }

      let newAvatarUrl = avatarUrl;
      let newBannerUrl = bannerUrl;

      async function uploadImage(file, folder) {
        if (!file) return null;

        if (!file.type.startsWith("image/")) {
          throw new Error("Lütfen görsel dosyası seç.");
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Görsel en fazla 5 MB olabilir.");
        }

        const extension = file.name.split(".").pop();
        const path = `${user.id}/${folder}-${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage
          .from("profile-images")
          .upload(path, file);

        if (error) throw error;

        const { data } = supabase.storage
          .from("profile-images")
          .getPublicUrl(path);

        return data.publicUrl;
      }

      if (avatar) {
        newAvatarUrl = await uploadImage(avatar, "avatar");
      }

      if (banner) {
        newBannerUrl = await uploadImage(banner, "banner");
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: username.trim(),
          bio,
          avatar_url: newAvatarUrl,
          banner_url: newBannerUrl,
        });

      if (error) {
        setMessage("Hata: " + error.message);
      } else {
        setAvatarUrl(newAvatarUrl || "");
        setBannerUrl(newBannerUrl || "");
        setAvatar(null);
        setBanner(null);
        setMessage("Profilin başarıyla güncellendi!");
      }
    } catch (error) {
      setMessage("Hata: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Çıkış yapılamadı: " + error.message);
      setLoggingOut(false);
      return;
    }

    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080D18] text-white p-8">
        Profil yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white p-6">
      <div className="max-w-2xl mx-auto py-10">

        <a href="/" className="text-blue-400">
          ← Ana sayfa
        </a>

        <h1 className="text-3xl font-bold text-blue-400 mt-8">
          DeepRead
        </h1>

        <h2 className="text-2xl font-bold mt-3 mb-8">
          Profilini düzenle
        </h2>

        <form onSubmit={saveProfile} className="space-y-7">

          <div>
            <label className="block font-bold mb-3">
              Profil bannerı
            </label>

            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Banner"
                className="w-full h-44 object-cover rounded-xl mb-3"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setBanner(file);
              }}
              className="w-full text-gray-300"
            />

            <p className="text-gray-500 text-sm mt-2">
              En fazla 5 MB.
            </p>
          </div>

          <div>
            <label className="block font-bold mb-3">
              Profil fotoğrafı
            </label>

            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Profil fotoğrafı"
                className="w-28 h-28 rounded-full object-cover mb-3 border-2 border-blue-500"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAvatar(file);
              }}
              className="w-full text-gray-300"
            />

            <p className="text-gray-500 text-sm mt-2">
              En fazla 5 MB.
            </p>
          </div>

          <div>
            <label className="block font-bold mb-2">
              Kullanıcı adı
            </label>

            <input
              className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-2">
              Biyografi
            </label>

            <textarea
              className="w-full p-4 rounded-xl bg-[#111B2D] border border-gray-700"
              placeholder="Kendinden bahset..."
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Profili kaydet"}
          </button>

        </form>

        <p className="mt-5 text-blue-400">{message}</p>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <h3 className="text-lg font-bold mb-2">
            Hesap işlemleri
          </h3>

          <p className="text-gray-400 text-sm mb-4">
            Başka bir DeepRead hesabına geçiş yap.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full p-4 rounded-xl border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold disabled:opacity-50"
          >
            {loggingOut ? "Çıkış yapılıyor..." : "⇄ Hesap Değiştir"}
          </button>
        </div>

      </div>
    </main>
  );
}
