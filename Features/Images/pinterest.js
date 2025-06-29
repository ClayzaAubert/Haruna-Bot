export default {
  command: ["pinterest", "pin"],
  description: "Search random images from Pinterest",
  category: "Images",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,

  haruna: async function (m, { sock, api, text }) {
    if (!text) {
      return m.reply("❓ Silakan masukkan keyword pencarian.\nContoh: `.pin Haruna Kawaii`");
    }

    await m.react("🔍");

    try {
      const res = await api.get("/pinterest/search", { q: text });

      if (res?.status === "Success" && Array.isArray(res.result) && res.result.length > 0) {
        const selected = [];

        // Ambil 5 gambar acak unik
        const total = Math.min(5, res.result.length);
        while (selected.length < total) {
          const random = res.result[Math.floor(Math.random() * res.result.length)];
          if (!selected.includes(random)) selected.push(random);
        }

        const album = selected.map((url, index) => ({
          image: { url },
          ...(index === 0 && {
            caption: `📁 Sumber: Pinterest\n\n${res.powered || ""}`
          })
        }));

        await sock.sendAlbumMessage(m.chat, album, {
          quoted: m,
          delay: 2000
        });

        await m.react("✅");
      } else {
        await m.react("❌");
        m.reply("😢 Tidak ditemukan gambar untuk kata kunci tersebut.");
      }
    } catch (error) {
      console.error("❌ [Pinterest Error]", error);
      await m.react("⚠️");

      if (error.code === "ENOSPC") {
        return m.reply("❌ Gagal karena penyimpanan Pterodactyl penuh. Tapi mode langsung via URL telah aktif.");
      }

      m.reply("❌ Terjadi kesalahan saat mengambil gambar dari Pinterest.");
    }
  },

  failed: "Gagal menjalankan perintah %cmd\n\n%error",
  wait: null,
  done: null,
};
