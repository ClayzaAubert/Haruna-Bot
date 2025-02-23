export default {
    command: ["tempnumber"],
    description: "Temp Number Maelyn API",
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
                // Panduan penggunaan
                await m.react('ℹ️');
                return m.reply(
                    `📱 *Panduan Penggunaan Temp Number Maelyn API:*\n\n` +
                    `1️⃣ *Generate Nomor Telepon Sementara:*\n` +
                    `   👉 *.tempnumber generate*\n` +
                    `   ⏳ *Catatan:* Nomor telepon ini bersifat sementara.\n\n` +
                    `2️⃣ *Cek Inbox SMS dari Nomor Tersebut:*\n` +
                    `   👉 *.tempnumber inbox|COUNTRY_CODE|NUMBER*\n\n` +
                    `🔄 *Contoh Lengkap:*\n` +
                    `   📞 *.tempnumber generate*\n` +
                    `   📩 *.tempnumber inbox|39|3508209293*\n\n` +
                    `💡 *Powered by Maelyn API*`
                );
            }

            if (subCommand === "generate") {
                // Generate nomor telepon sementara
                const res = await api.get("/tempnumber/generate");
                await m.react('☑️');
                return await sock.sendMessage(
                    m.chat,
                    {
                        text: `✅ *NOMOR TELEPON SEMENTARA BERHASIL DIBUAT*\n\n🌍 *Negara*: ${res.result.country_name} (${res.result.country_code})\n📞 *Nomor Lengkap*: ${res.result.full_number}\n🔢 *Nomor Tanpa Plus*: ${res.result.number_without_plus}\n🔣 *Nomor Murni*: ${res.result.number_pure}\n🕒 *Tersedia*: ${res.result.data_humans}\n\n⏳ *Catatan:* Nomor ini bersifat sementara dan dapat dihapus kapan saja.\n\n💡 *Powered by Maelyn API*`,
                    },
                    { quoted: m }
                );
            } else if (subCommand === "inbox") {
                // Melihat inbox SMS
                const countryCode = params[1];
                const number = params[2];

                if (!countryCode || !number) {
                    await m.react('⚠️');
                    return m.reply(
                        `⚠️ *Mohon sertakan COUNTRY_CODE dan NUMBER!*\n\n` +
                        `🔄 *Contoh:* *.tempnumber inbox|39|3508209293*`
                    );
                }

                const res = await api.get("/tempnumber/inbox", {
                    country_code: countryCode,
                    number: number,
                });

                if (res.result.length === 0) {
                    await m.react('📭');
                    return m.reply(`📭 *INBOX KOSONG*\n\nBelum ada SMS masuk untuk nomor: *_+${countryCode}${number}_*`);
                }

                let inboxList = `📩 *DAFTAR SMS UNTUK NOMOR:* *_+${countryCode}${number}_*\n\n`;
                res.result.forEach((sms, index) => {
                    inboxList += `📝 *Pesan #${index + 1}*\n` +
                                 `📤 *Dari*: ${sms.in_number}\n` +
                                 `🕒 *Diterima*: ${sms.created_at} (${sms.data_humans})\n` +
                                 `🔑 *Kode*: ${sms.code}\n` +
                                 `💬 *Isi Pesan*: ${sms.text}\n\n─────────────\n\n`;
                });

                await m.react('☑️');
                return await sock.sendMessage(m.chat, { text: inboxList }, { quoted: m });
            } else {
                // Jika perintah salah
                await m.react('❌');
                return m.reply(
                    `⚠️ *Perintah tidak dikenali!*\n\n` +
                    `📚 *Panduan Penggunaan:*\n` +
                    `   👉 *.tempnumber generate* - Buat nomor telepon sementara\n` +
                    `   👉 *.tempnumber inbox|COUNTRY_CODE|NUMBER* - Lihat inbox SMS\n\n` +
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
