export default {
    command: ["tempmail"],
    description: "Temp Mail Maelyn API",
    category: "Others",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        m.react('🕐');

        try {
            const params = text ? text.split("|").map((x) => x.trim()) : [];
            const subCommand = params[0]?.toLowerCase();

            if (!text) {
                // Panduan penggunaan jika hanya ".tempmail"
                await m.react('ℹ️');
                return m.reply(
                    `📚 *Panduan Penggunaan TempMail Maelyn API:*\n\n` +
                    `1️⃣ *Generate Email Baru (Berlaku 10 Menit):*\n` +
                    `   👉 *.tempmail generate*\n` +
                    `   ⏳ *Catatan:* Email hanya akan bertahan selama *10 menit* sebelum dihapus otomatis.\n\n` +
                    `2️⃣ *Lihat Semua Pesan di Inbox:*\n` +
                    `   👉 *.tempmail inbox|ID_INBOX*\n\n` +
                    `3️⃣ *Lihat Detail Pesan Tertentu:*\n` +
                    `   👉 *.tempmail inbox|ID_INBOX|ID_MESSAGE*\n\n` +
                    `🔄 *Contoh Lengkap:*\n` +
                    `   📩 *.tempmail generate*\n` +
                    `   📨 *.tempmail inbox|699586B7-EC80-8FF0-23E6-C91A4185C05F*\n` +
                    `   📜 *.tempmail inbox|699586B7-EC80-8FF0-23E6-C91A4185C05F|AF8F050D-B4C0-D0AC-F5F6-25A6F60EB892*\n\n` +
                    `💡 *Powered by Maelyn API*`
                );
            }

            if (subCommand === "generate") {
                // Generate email baru
                const res = await api.get("/tempmail/generate");
                await m.react('☑️');
                return await sock.sendMessage(
                    m.chat,
                    {
                        text: `✅ *EMAIL BERHASIL DIBUAT*\n\n📩 *ID INBOX*: *_${res.result.id_inbox}_*\n📧 *EMAIL*: *_${res.result.email}_*\n\n⏳ *Catatan:* Email ini hanya akan bertahan selama *10 menit* sebelum dihapus otomatis.\n\n🔗 *${res.powered}*`,
                    },
                    { quoted: m }
                );
            } else if (subCommand === "inbox") {
                // Menampilkan inbox dan detail pesan
                const inboxId = params[1];
                const messageId = params[2];

                if (!inboxId) return m.reply("⚠️ *Mohon sertakan ID INBOX!*\n\nContoh: *.tempmail inbox|ID_INBOX*");

                if (messageId) {
                    // Detail pesan
                    const detailRes = await api.get("/tempmail/inbox/detail", {
                        id_message: messageId,
                        id_inbox: inboxId,
                    });

                    if (detailRes?.result?.text) {
                        await m.react('☑️');
                        return await sock.sendMessage(
                            m.chat,
                            {
                                text: `📄 *DETAIL PESAN*\n\n🆔 *ID Pesan*: ${detailRes.result.id}\n\n📝 *Isi Pesan*:\n${detailRes.result.text}`,
                            },
                            { quoted: m }
                        );
                    } else {
                        await m.react('❌');
                        return m.reply("❌ *Gagal mengambil detail pesan. Cek kembali ID_MESSAGE dan ID_INBOX Anda.*");
                    }
                } else {
                    // Menampilkan daftar inbox
                    const res = await api.get("/tempmail/inbox", { id_inbox: inboxId });

                    if (res.result.inbox.length === 0) {
                        await m.react('📭');
                        return m.reply(`📭 *INBOX KOSONG*\n\nBelum ada email masuk untuk ID: *_${inboxId}_*`);
                    }

                    let inboxList = `📥 *INBOX UNTUK ID:* *_${inboxId}_*\n\n`;
                    res.result.inbox.forEach((mail, index) => {
                        inboxList += `📨 *Email #${index + 1}*\n` +
                                     `🆔 *ID Pesan*: ${mail.id}\n` +
                                     `👤 *Pengirim*: ${mail.senderName} <${mail.from}>\n` +
                                     `📝 *Subjek*: ${mail.subject}\n` +
                                     `⏰ *Diterima*: ${new Date(mail.receivedAt).toLocaleString()}\n\n` +
                                     `🔍 *Detail*: *.tempmail inbox|${inboxId}|${mail.id}*\n\n─────────────\n\n`;
                    });

                    await m.react('☑️');
                    return await sock.sendMessage(m.chat, { text: inboxList }, { quoted: m });
                }
            } else {
                // Jika perintah salah
                await m.react('❌');
                return m.reply(
                    `⚠️ *Perintah tidak dikenali!*\n\n` +
                    `📚 *Panduan Penggunaan:*\n` +
                    `   👉 *.tempmail generate* - Buat email baru (*berlaku 10 menit*)\n` +
                    `   👉 *.tempmail inbox|ID_INBOX* - Lihat inbox\n` +
                    `   👉 *.tempmail inbox|ID_INBOX|ID_MESSAGE* - Lihat detail pesan\n\n` +
                    `💡 *Powered by Maelyn API*`
                );
            }
        } catch (error) {
            console.error("Error:", error);
            await m.react('❌');
            m.reply("❌ *Terjadi kesalahan saat memproses permintaan Anda.*\n🔄 Silakan coba lagi nanti.");
        }
    },

    failed: "❌ *Gagal menjalankan perintah %cmd*\n\n%error",
    wait: null,
    done: null,
};
