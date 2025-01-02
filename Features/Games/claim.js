export default {
    command: ["claim"],
    description: "Claim Daily & Monthly",
    category: "Games",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { text, args, sock, api, feature, db }) {
        const user = db.users.get(m.sender);
        const now = Date.now();

        // Check if user exists in the database
        if (!user) {
            return m.reply("User tidak ditemukan dalam database.");
        }

        // Check cooldown
        const lastClaim = user.lastDailyClaim || 0;
        const cooldown = 2 * 60 * 1000; // 1 day in milliseconds

        if (now - lastClaim < cooldown) {
            const timeLeft = cooldown - (now - lastClaim);
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
            return m.reply(`Anda sudah mengklaim daily reward. Coba lagi dalam ${hours} jam ${minutes} menit ${seconds} detik.`);
        }

        // Add balance
        const reward = 100000;
        user.balance = (user.balance || 0) + reward;
        user.lastDailyClaim = now;

        // Save user data
        db.users.set(m.sender, user);

        m.reply(`Selamat! Anda telah menerima ${reward} sebagai daily reward. Saldo Anda sekarang adalah ${user.balance}.`);
    },

    failed: "Gagal menjalankan perintah %cmd\n\n%error",
    wait: null,
    done: null,
};
