export default {
  command: ["zerochan"],
  description: "Search random images from Zerochan",
  category: "Images",
  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,

  haruna: async function (m, { sock, api, text }) {
    if (!text) {
      return m.reply("❓ Silakan masukkan keyword pencarian.\nContoh: `.zerochan Kurodate Haruna`");
    }

    await m.react("🔍");

    try {
      const res = await api.get("/zerochan", { q: text });

      if (
        res?.status === "Success" &&
        Array.isArray(res.result?.itemList) &&
        res.result.itemList.length > 0
      ) {
        const items = res.result.itemList;
        const selected = [];

        // Ambil 5 gambar acak unik
        const total = Math.min(5, items.length);
        while (selected.length < total) {
          const rand = items[Math.floor(Math.random() * items.length)];
          if (!selected.find(i => i.url === rand.url)) {
            selected.push(rand);
          }
        }

        const album = selected.map((item, index) => ({
          image: { url: item.url },
          ...(index === 0 && {
            caption: `📁 Sumber: Zerochan\n\n${res.powered || ""}`
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
      console.error("❌ [Zerochan Error]", error);
      await m.react("⚠️");

      if (error.code === "ENOSPC") {
        return m.reply("❌ Gagal karena penyimpanan Pterodactyl penuh. Tapi mode langsung via URL telah aktif.");
      }

      m.reply("❌ Terjadi kesalahan saat mengambil gambar dari Zerochan.");
    }
  },

  failed: "Gagal menjalankan perintah %cmd\n\n%error",
  wait: null,
  done: null,
};
