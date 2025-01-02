const cooldown = 60000; // 1 menit cooldown
const winRate = 0.2; // 20% peluang menang

export default {
    command: ["slot"],
    description: "Taruhan Slot Machine",
    category: "Games",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: true,
    private: false,

    haruna: async function (m, { sock, db, text, args, usedPrefix, command }) {
        const fa = `*Berikan jumlah balance yang akan dipertaruhkan*\n\n*Contoh:\n${usedPrefix + command} 500*`;

        if (!args[0]) return m.reply(fa);
        if (isNaN(args[0])) return m.reply(fa);

        const amount = parseInt(args[0]);
        const user = db.users.get(m.sender);
        const timers = cooldown - (Date.now() - (user.lastSlot || 0));

        if (timers > 0) {
            const seconds = Math.floor((timers % (60 * 1000)) / 1000);
            return m.reply(`Tunggu *🕐${seconds} detik* lagi`.trim());
        }

        if (amount < 500) {
            return m.reply(`*Anda tidak dapat bertaruh balance kurang dari 500*`);
        }

        if (user.balance < amount) {
            return m.reply(`*Anda tidak memiliki cukup balance untuk bertaruh*`);
        }

        if (amount > 100000) {
            return m.reply(`*Anda tidak dapat bertaruh balance lebih dari 100000*`);
        }

        const emojis = ["🕊️", "🦀", "🦎", "🍒", "🍇", "🍊", "🍋", "🍉", "🍍", "🍓"];
        const results = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]);
        const isWin = Math.random() < winRate;

        const end = isWin ?
            `🎊 Jackpot! Anda menang ${amount * 2} balance` :
            `Anda kalah ${amount} balance`;

        user.balance += isWin ? amount : -amount;
        user.lastSlot = Date.now();

        const slotResults = `
🎰 ┃ *SLOTS* ┃ 🎰
───────────
    ${emojis[0]} : ${emojis[1]} : ${emojis[2]}
*>*  ${results[0]} : ${results[1]} : ${results[2]} *<*
    ${emojis[3]} : ${emojis[4]} : ${emojis[5]}
───────────
*${end}*`;

        await m.reply(slotResults);
    },

    failed: "Gagal menjalankan perintah %cmd\n\n%error",
    wait: null,
    done: null,
};
