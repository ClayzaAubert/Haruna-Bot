<div align="center">
  <img src="https://s6.imgcdn.dev/Yc8bUC.png" alt="Kurodate Haruna MD" width="auto" />
  <h1><strong>Kurodate Haruna MD</strong></h1>
  <p>
    <strong>Bot WhatsApp performa tinggi yang dibangun dengan arsitektur modular, berbasis event, dan terintegrasi penuh dengan Maelyn API.</strong>
  </p>

  <p>
    <a href="https://github.com/ClayzaAubert/Haruna-Bot/stargazers"><img src="https://img.shields.io/github/stars/ClayzaAubert/Haruna-Bot?style=for-the-badge&logo=github&color=FFB6C1&logoColor=black" alt="Stars"></a>
    <a href="https://github.com/ClayzaAubert/Haruna-Bot/network/members"><img src="https://img.shields.io/github/forks/ClayzaAubert/Haruna-Bot?style=for-the-badge&logo=github&color=FFB6C1&logoColor=black" alt="Forks"></a>
    <a href="https.com/github/ClayzaAubert/Haruna-Bot/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ClayzaAubert/Haruna-Bot?style=for-the-badge&color=FFB6C1&logoColor=black" alt="License"></a>
    <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/npm?style=for-the-badge&logo=nodedotjs&color=FFB6C1&logoColor=black" alt="NodeJS"></a>
  </p>

  <h4>Didukung oleh <a href="https://maelyn.sbs">Maelyn API</a> • Dibangun dari basis <a href="https://github.com/xct007/SuryaRB">SuryaRB</a></h4>
</div>

**Haruna-Bot** adalah kerangka kerja (framework) bot WhatsApp yang dirancang untuk kemudahan kustomisasi dan skalabilitas. Dengan sistem plugin yang intuitif, Anda dapat dengan mudah menambah atau mengubah fitur tanpa menyentuh kode inti. Ditenagai oleh **`@clayzaaubert/baileys-rise`**, sebuah fork Baileys yang dioptimalkan, Haruna-Bot menawarkan stabilitas dan performa yang andal.

## ✨ Fitur Unggulan

*   **🧩 Sistem Plugin:** Buat fitur dengan mengisolasi logika dalam file terpisah. Cukup letakkan di direktori `Features/`, dan bot akan memuatnya secara otomatis.
*   **🚀 Performa Tinggi:** Arsitektur yang dioptimalkan untuk respons cepat dan penggunaan memori yang efisien.
*   **🔗 Integrasi API:** Dilengkapi dengan *wrapper* Axios untuk integrasi tanpa batas ke [Maelyn API](https://maelyn.sbs).
*   **🔧 Konfigurasi Terpusat:** Kelola semua pengaturan dalam satu file `config.js` yang mudah dipahami.
*   **⏰ Penjadwalan Tugas (Cron):** Jalankan fungsi secara otomatis pada interval waktu tertentu.
*   **🔒 Login Aman:** Mendukung login menggunakan **Pairing Code**, metode yang lebih aman dan praktis.

## 📚 Daftar Isi

1.  [Prasyarat](#-prasyarat)
2.  [Instalasi & Setup](#-instalasi--setup)
3.  [Menjalankan Bot](#-menjalankan-bot)
4.  [Struktur Proyek](#-struktur-proyek)
5.  [Panduan Pengembangan](#-panduan-pengembangan)
    *   [A. Membuat Perintah Plugin](#a-membuat-perintah-plugin)
    *   [B. Resep Kode: Contoh Aksi di dalam Plugin](#b-resep-kode-contoh-aksi-di-dalam-plugin)
    *   [C. Menangani Event Otomatis](#c-menangani-event-otomatis)
    *   [D. Mengirim Pesan Lanjutan dengan `sock.sendMessage`](#d-mengirim-pesan-lanjutan-dengan-socksendmessage)
6.  [Contributors](#-contributors)
7.  [Lisensi](#-lisensi)

## ✅ Prasyarat

*   [Node.js](https://nodejs.org/en/) (v20.x atau lebih baru)
*   [Git](https://git-scm.com/downloads)
*   [FFmpeg](https://ffmpeg.org/download.html)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Opsional)

## ⚙️ Instalasi & Setup

1.  **Clone Repository:**
    ```sh
    git clone https://github.com/ClayzaAubert/Haruna-Bot.git
    cd Haruna-Bot
    ```

2.  **Instal Dependensi:**
    ```sh
    npm install
    ```

3.  **Konfigurasi Environment:**
    ```sh
    cp .env.example .env
    ```
    Buka `.env` dan isi `MAELYN_APIKEY` yang didapat dari [dashboard Maelyn](https://api.maelyn.tech).

4.  **Sesuaikan Konfigurasi:**
    Buka `config.js` untuk mengatur nomor `owners`, `prefix`, dll.

## 🚀 Menjalankan Bot

*   **Mode Pengembangan:** `npm start`
*   **Mode Produksi (PM2):**
    ```sh
    pm2 start index.js --name "HarunaBot"
    pm2 logs HarunaBot
    ```

## 📂 Struktur Proyek

```
.
├── Config/           # Konfigurasi tambahan (font, style, dll.)
├── Features/         # Semua file plugin (perintah bot).
├── Libs/             # Pustaka fungsi pembantu.
├── Sockets/          # Mengelola koneksi dan logic socket Baileys.
├── Utils/            # Utilitas umum (Messages.js).
├── db/               # Penyimpanan database.json (jika mode JSON aktif).
├── .env.example      # Template variabel environment.
├── config.js         # Berkas konfigurasi utama.
├── index.js          # Titik masuk aplikasi.
└── package.json      # Dependensi dan skrip proyek.
```

## ✍️ Panduan Pengembangan

### A. Membuat Perintah Plugin

Setiap file JavaScript di dalam direktori `Features/` akan dimuat sebagai sebuah perintah bot.

1.  **Buat File Baru:** Misalnya, `Features/demo.js`.
2.  **Gunakan Struktur Dasar:** Setiap plugin harus mengekspor objek dengan metadata dan fungsi `haruna`.

    ```javascript
    export default {
      command: ["demo"],
      description: "Contoh plugin.",
      category: "Utility",
      haruna: async function(m, options) {
        // ... Logika bot ada di sini ...
      }
    };
    ```

### B. Resep Kode: Contoh Aksi di dalam Plugin

Bagian ini adalah "dapur" dari bot Anda. Berikut adalah contoh lengkap yang bisa Anda letakkan di dalam fungsi `haruna` untuk melakukan berbagai aksi umum.

```javascript
  // File: Features/demo.js
  haruna: async function (m, { sock, api }) { // `m`, `sock`, `api` adalah objek pembantu
    
    // 1. Membalas pesan
    m.reply("Hello World!");

    // 2. Membalas dengan gaya teks kustom
    m.reply("Hello with style", "funky");

    // 3. Mengirim pesan lalu mengeditnya (efek "loading...")
    const update = await m.replyUpdate("Sedang memproses...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi proses
    update("✔️ Proses Selesai!");

    // 4. Memberi reaksi emoji pada pesan
    m.react("🔥");

    // 5. Mengunduh media (gambar/video/stiker) dari pesan
    const media = await m?.download?.().catch(() => null);
    if (media) {
      m.reply("Media berhasil diunduh!");
      // sock.sendMessage(m.chat, { image: media });
    }

    // 6. Request ke Maelyn API
    try {
      const response = await api.get("/ai/v2/tts", { text: "Halo dari Haruna Bot" });
      if (response?.data?.status) {
        m.reply(`Sukses! URL Audio: ${response.data.url}`);
      }
    } catch (e) {
      m.reply(`Gagal request API: ${e.message}`);
    }
  }
```

### C. Menangani Event Otomatis

Gunakan `node-cron` untuk tugas terjadwal. Contoh: membuat file `Events/dailyMessage.js` untuk mengirim pesan "selamat pagi" setiap hari.

```javascript
import cron from "node-cron";

export default {
  async all(_, sock) {
    cron.schedule("0 8 * * *", async () => {
      const groupId = "12036304xxxxxxxxxx@g.us"; // Ganti ID grup
      try {
        await sock.sendMessage(groupId, { text: "Selamat pagi! ☀️" });
      } catch (e) {
        console.error("Gagal mengirim pesan harian:", e);
      }
    }, {
      timezone: "Asia/Jakarta"
    });
  },
};
```

### D. Mengirim Pesan Lanjutan dengan `sock.sendMessage`

Meskipun fungsi `m.reply()` sangat praktis, untuk kontrol lebih besar seperti mengirim media, mention, atau mengutip pesan secara spesifik, Anda harus menggunakan `sock.sendMessage`. Ini adalah fungsi inti dari Baileys.

Berikut adalah beberapa contoh penggunaannya di dalam fungsi `haruna`:

```javascript
  haruna: async function (m, { sock }) {

    // 1. Mengirim gambar dari URL dengan caption
    await sock.sendMessage(m.chat, { 
      image: { url: "https://s6.imgcdn.dev/Yc8bUC.png" },
      caption: "Ini Kurodate Haruna!" 
    });

    // 2. Mengirim audio sebagai Voice Note (PTT)
    // Pastikan path ke file audio sudah benar
    await sock.sendMessage(m.chat, { 
      audio: { url: "./path/to/your/audio.mp3" }, 
      ptt: true // true untuk voice note, false untuk file audio biasa
    });
    
    // 3. Mengirim pesan sambil me-mention pengguna
    const text = `Halo @${m.sender.split('@')[0]}, apa kabar?`;
    await sock.sendMessage(m.chat, { 
      text: text, 
      mentions: [m.sender] // m.sender adalah JID pengguna
    });

    // 4. Membalas pesan spesifik (mengutip)
    // Ini adalah cara kerja `m.reply()` di balik layar
    await sock.sendMessage(m.chat, { 
      text: "Ini adalah balasan yang mengutip pesan Anda." 
    }, { 
      quoted: m.key // `m.key` berisi metadata pesan yang akan dikutip
    });

  }
```

> [!NOTE]
> Untuk variasi `sendMessage` yang lebih lengkap, seperti mengirim video, dokumen, stiker, tombol, dan lainnya, bisa kalian lihat disini: **https://www.npmjs.com/package/@clayzaaubert/baileys-rise#sending-messages**

---

## 👤 Contributors

* [Clayza Aubert](https://github.com/ClayzaAubert) (Lead Developer)
* [xct007](https://github.com/xct007) (Base Engine - SuryaRB)

---
## 📜 Lisensi

This project is licensed under the [MIT License](LICENSE).