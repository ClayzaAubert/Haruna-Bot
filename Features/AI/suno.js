export default {
    command: ["Suno"],
    description: "Suno Generate Musik",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    delay: async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    haruna: async function (m, { sock, api }) {
        const text = m.text.trim();
        if (!text) {
            return m.reply("Masukkan Title|genre|lyrics, pisahkan dengan |");
        }

        const [title, genres, lyrics] = text.split("|");
        if (!title || !genres || !lyrics) {
            return m.reply("Pastikan formatnya benar: Title|genre|lyrics");
        }

        const loadingMessage = await m.reply("Sedang memulai proses pembuatan musik...");

        try {
            // Panggil API untuk memulai permintaan
            let response;
            while (true) {
                response = await api.get("/suno", { title, lyrics, genres });
                
                if (response.status === "Delay") {
                    await m.reply(`⏳ Server sedang sibuk. Tunggu sebentar...`);
                    await this.delay(60000); // Tunggu 1 menit sebelum mencoba lagi
                    continue;
                }
                break; // Keluar dari loop jika bukan status Delay
            }

            if (response.status === "Success" && response.result) {
                const task_id = response.result.task_id;
                const task_url = response.result.task_url;

                // Kirim pesan informasi task ID
                await sock.sendMessage(
                    m.chat,
                    {
                        text: `🎵 Permintaan musik sedang diproses\n\n` +
                              `📝 Task ID: ${task_id}\n` +
                              `⏳ Status: Sedang Diproses\n\n` +
                              `Mohon tunggu sampai prosesnya selesai.`
                    },
                    { quoted: m }
                );

                while (true) {
                    await this.delay(60000); // Tunggu 1 menit

                    // Cek status task
                    let statusResponse;
                    try {
                        statusResponse = await api.get("/task", { task_id: task_id });

                        if (statusResponse.status === "Delay") {
                            await m.reply(`⏳ Server sedang sibuk. Menunggu...`);
                            await this.delay(60000); // Tunggu 1 menit sebelum mencoba lagi
                            continue;
                        }
                        
                        if (statusResponse.status === "Success" && statusResponse.result) {
                            const taskStatus = statusResponse.result.status;
                            
                            if (taskStatus === "completed") {
                                const results = statusResponse.result.result;
                                
                                // Kirim semua hasil
                                for (let i = 0; i < results.length; i++) {
                                    const result = results[i];
                                    
                                    // Kirim video
                                    if (result.video_url) {
                                        await sock.sendMessage(
                                            m.chat,
                                            {
                                                video: { url: result.video_url },
                                                caption: `Variasi ${i + 1}: ${title}\nPowered by Maelyn API`
                                            },
                                            { quoted: m }
                                        );
                                    }

                                    // Kirim audio
                                    if (result.audio_url) {
                                        await sock.sendMessage(
                                            m.chat,
                                            {
                                                audio: { url: result.audio_url },
                                                mimetype: "audio/mp4",
                                                fileName: `${title}_${i + 1}.mp3`
                                            },
                                            { quoted: m }
                                        );
                                    }
                                }
                                await m.react("✅");
                                break;
                            } else if (taskStatus === "failed") {
                                throw new Error("Proses pembuatan musik gagal");
                            }
                        }
                    } catch (checkError) {
                        console.error("Error checking status:", checkError);
                        await this.delay(60000); // Tunggu 1 menit sebelum mencoba lagi
                        continue;
                    }
                }
            } else {
                throw new Error("Gagal memulai proses pembuatan musik");
            }
        } catch (error) {
            console.error("Error:", error);
            await m.reply(`❌ Error: ${error.message || "Gagal memproses permintaan. Silakan coba lagi nanti."}`);
            await m.react("❌");
        }
    },

    failed: "Failed to execute the %cmd command\n%error",
    wait: ["Please wait %tag", "Hold on %tag, fetching response"],
    done: null,
};