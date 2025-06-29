import cron from "node-cron";
// clear cache 

export default {
  async all(_, sock) {
    // Jalankan setiap 5 jam
    cron.schedule("0 */5 * * *", async () => {
      try {
        // 1. Log informasi aktif
        if (typeof process._getActiveHandles === "function") {
          const handles = process._getActiveHandles();
          console.log(`🧵 Active Handles: ${handles.length}`);
        }

        if (typeof process._getActiveRequests === "function") {
          const reqs = process._getActiveRequests();
          console.log(`🌐 Active Requests: ${reqs.length}`);
        }

        // 2. Bersihkan cache internal jika ada
        if (global._cacheStore) {
          global._cacheStore = {};
          console.log("🗃️ Cache internal (_cacheStore) dibersihkan.");
        }

        // 3. Tampilkan penggunaan RAM
        const mem = process.memoryUsage();
        console.log(`📦 RAM Digunakan: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);

        console.log("🧹 [Scheduled] Pembersihan memori internal berhasil (setiap 5 jam).");
      } catch (err) {
        console.error("❌ [Scheduled] Gagal pembersihan memori:", err.message);
      }
    });
  },
};
