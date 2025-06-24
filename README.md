<div align="center">
  <h1><i>Kurodate Haruna</i> WhatsApp Bot</h1>
  <h3>──────────── Powered by Maelyn API ────────────</h3>
  <img src="https://s6.imgcdn.dev/Yc8Rxy.png" alt="Kurodate Haruna MD" width="auto" />
</div>

---

**Haruna-Bot** adalah WhatsApp Bot open-source yang dikembangkan dari kode dasar milik [SuryaRB](https://github.com/xct007/SuryaRB), yang telah didesain ulang agar lebih fleksibel, modular (berbasis plugin & event), serta memiliki performa tinggi—dengan integrasi penuh ke seluruh fitur [Maelyn API](https://maelyn.sbs).

Bot ini menggunakan `baileys-rise`, sebuah versi modifikasi dari Baileys yang saya sesuaikan secara khusus untuk kebutuhan Haruna-Bot. Paket ini tersedia di [npm](https://www.npmjs.com/package/@clayzaaubert/baileys-rise), dan akan terus saya perbarui secara berkala untuk mengikuti perkembangan dan pembaruan dari Baileys resmi.

---

## 🌐 Maelyn Group Services

* 🔗 [Maelyn Group](https://maelyn.my.id)
* 🧠 [Maelyn API](https://maelyn.sbs)

---

## 📚 Table of Contents

* [Requirements](#requirements)
* [Installation](#installation)
* [Configuration](#configuration)
* [Creating Features/Plugins](#creating-featuresplugins)
* [Event Handling](#event-handling)
* [License](#license)
* [Contributors](#contributors)

---

## ✅ Requirements

* [Node.js](https://nodejs.org/en/) v20+
* [Git](https://git-scm.com/)
* [FFmpeg](https://ffmpeg.org/) *(untuk fitur stiker/audio)*
* [MongoDB](https://www.mongodb.com/) *(opsional untuk database mode Mongo)*

---

## ⚙️ Installation

```sh
# 1. Clone repository
git clone https://github.com/ClayzaAubert/Haruna-Bot.git
cd Haruna-Bot

# 2. Install dependencies
npm install

# 3. Ubah nama file .env.example menjadi .env
cp .env.example .env

# 4. Isi MAELYN_APIKEY di file .env
# dapatkan dari https://api.maelyn.tech

# 5. Jalankan bot
npm start
# atau dengan PM2 (production-ready)
pm2 start index.js --name "HarunaBot"
```

---

## 🔧 Configuration

Semua konfigurasi utama ada di `config.js`:

```js
export const Config = {
  owners: ["62xxxxxx"],
  use_pairing_code: true,
  pairing_wait: 6000,
  prefix: ["!", "."],
  timezone: "Asia/Jakarta",
  maelyn_apikey: process.env.MAELYN_APIKEY,

  profile: {
    namebot: "Kurodate Haruna",
    powered: "By Maelyn APIs",
    web: "https://maelyn.tech",
  },

  images: {
    menu: "https://telegra.ph/file/f40d32d686760637e49c4.jpg",
    allmenu: "https://telegra.ph/file/460a444e140f5a5948532.jpg",
  },

  database: {
    use_mongo: true,
    mongo_url: "mongodb://localhost:27017/database",
    path: "./database.json",
    save_interval: 10_000,
    debug: false,
  },
};
```

---

## 🧩 Creating Features/Plugins

Buat file baru di folder `Features/`:

```js
// Features/hello.js

export default {
  // Command triggers
  command: ["hello", "hi"],
  description: "Say hello",
  category: "General",

  owner: false,
  admin: false,
  hidden: false,
  limit: false,
  group: false,
  private: false,

  /**
   * @param {import("../../Utils/Messages").ExtendedWAMessage} m - Message object
   * @param {import("../Handler").miscOptions} options - Command options
   */
  haruna: async function (
    m,
    {
      args,
      sock,
      conn,
      api,
      groupMetadata,
      isOwner,
      isAdmin,
      command,
      text,
      usedPrefix,
      db,
    }
  ) {
    // Contoh reply biasa
    m.reply("Hello World!");

    // Fancy text reply (gunakan style dari Config/Fonts.js)
    m.reply("Hello with style", "funky");

    // Update pesan (loading ke hasil)
    const update = await m.replyUpdate("Sedang diproses...");
    // Proses ...
    update("Selesai diproses!");

    // React dengan emoji
    m.react("🔥");

    // Hapus pesan
    m.delete();

    // Download media jika ada
    const media = await m?.download?.().catch(() => null);
    if (media) {
      // Proses media buffer
    }

    // Request ke Maelyn API (atau API lainnya)
    const response = await api.get("/path/to/endpoint", { param: "value" });
    if (response?.data?.status) {
      m.reply(JSON.stringify(response.data, null, 2));
    }
  }
};
```

---

## 🔄 Event Handling

Kamu bisa membuat event seperti mengirim pesan otomatis setiap hari, menyapa user baru, dll.

Contoh: Kirim pesan ke grup tertentu setiap 1 hari

> Buat file baru di folder `Events/autoDaily.js`

```ts
import cron from "node-cron";

export default {
  async all(_, sock) {
    // Kirim pesan setiap pukul 08:00 WIB setiap hari
    cron.schedule("0 8 * * *", async () => {
      const chatId = "120xxxxxxxx@g.us"; // ID grup
      try {
        await sock.sendMessage(chatId, { text: "Selamat pagi dari Haruna 💌" });
        console.log("Pesan harian berhasil dikirim.");
      } catch (e) {
        console.error("Gagal kirim pesan harian:", e);
      }
    });
  },
};
```

> Penjelasan:

* Fungsi `all(_, sock)` akan dipanggil saat bot aktif.
* `cron.schedule()` menjalankan fungsi sesuai jadwal (di sini: pukul 08:00 tiap hari).
* Format cron: `menit jam hari-bulan bulan hari-minggu`

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Contributors

* [Clayza Aubert](https://github.com/ClayzaAubert) (Lead Developer)
* [xct007](https://github.com/xct007) (Base Engine - SuryaRB)