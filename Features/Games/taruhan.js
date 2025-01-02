export default {
    command: ["taruhan"],
    description: "Taruhan (User A) VS (User B)",
    category: "Games",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: true,
    private: false,

    haruna: async function (m, { sock, db, text }) {
        if (!text) {
            return m.reply("Siapa yang ingin kamu ajak taruhan?\n\nContoh: .taruhan BALANCE MENTION_USER\n.taruhan 10000 @player");
        }

        const [amountStr, userB] = text.split(" ");
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) {
            return m.reply("Jumlah taruhan tidak valid. Harap masukkan jumlah taruhan yang benar.");
        }

        const userA = db.users.get(m.sender);
        const balanceA = userA.balance;

        if (balanceA < amount) {
            return m.reply("Maaf, saldo Anda tidak mencukupi untuk taruhan ini.");
        }

        const userBFormatted = userB.replace("@", "") + "@s.whatsapp.net";
        const userBData = db.users.get(userBFormatted);

        if (!userBData) {
            return m.reply("User yang Anda tantang tidak ditemukan dalam database.");
        }

        const timeoutDuration = 60000;

        await sock.sendMessage(m.chat, {
            text: `Tunggu konfirmasi dari ${userB} untuk taruhan sebesar ${amount}.\nBalas dengan "confirm" untuk menerima taruhan.`
        });

        const waitForConfirmation = () => {
            return new Promise((resolve) => {
                const confirmHandler = async (upsert) => {
                    const messages = upsert.messages;
                    if (!messages || !messages[0] || !messages[0].message) return;

                    const msg = messages[0];
                    const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

                    if (msg.key.remoteJid === m.chat && messageContent.toLowerCase() === 'confirm' && msg.key.participant === userBFormatted) {
                        resolve(true);
                    }
                };

                sock.ev.on('messages.upsert', confirmHandler);

                setTimeout(() => {
                    sock.ev.off('messages.upsert', confirmHandler);
                    resolve(false);
                }, timeoutDuration);
            });
        };

        const confirmed = await waitForConfirmation();

        if (confirmed) {
            if (userBData.balance < amount) {
                return m.reply("User yang Anda tantang tidak memiliki saldo mencukupi untuk taruhan ini. Taruhan dibatalkan.");
            }

            const winner = Math.random() < 0.5 ? 'A' : 'B';
            const winnerId = winner === 'A' ? m.sender : userBFormatted;
            const loserId = winner === 'A' ? userBFormatted : m.sender;

            const newBalanceA = winner === 'A' ? balanceA + amount : balanceA - amount;
            const newBalanceB = winner === 'B' ? userBData.balance + amount : userBData.balance - amount;

            db.users.set(m.sender).balance = newBalanceA
            db.users.set(userBFormatted).balance = newBalanceB

            const winnerName = winner === 'A' ? `User A (Anda)` : `User B (${userB})`;
            const loserName = winner === 'A' ? `User B (${userB})` : `User A (Anda)`;

            m.reply(`[ TARUHAN SELESAI ]\n\nPemenangnya adalah ${winnerName}\nJumlah Taruhan: ${amount}\n\n${winnerName} mendapatkan ${amount}\n${loserName} kalah dan uangnya dikurangi sebesar ${amount}`);
        } else {
            m.reply("User B tidak mengkonfirmasi taruhan dalam waktu yang ditentukan. Taruhan dibatalkan.");
        }
    },

    failed: "Gagal menjalankan perintah %cmd\n\n%error",
    wait: null,
    done: null,
};
