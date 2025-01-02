export default {
    command: ["txt2img"],
    description: "Generate Images",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        try {
            if (!text) {
                return m.reply(`Silakan masukkan prompt dan model. Contoh: txt2img (MODEL)|<prompt>\n\nList Model\n- Cinematic\n- Photographic\n- Anime\n- Manga\n- Digital Art\n- Pixel art\n- Fantasy art\n- Neonpunk\n- 3D Model\n- Juggernaut\n- Redmond\n- DallE-XL`);
            }

            const [model, prompt] = text.split('|').map(v => v.trim().replace('(', '').replace(')', ''));
            if (!prompt || !model) {
                return m.reply(`Silakan masukkan prompt dan model. Contoh: txt2img (MODEL)|<prompt>\n\nList Model\n- Cinematic\n- Photographic\n- Anime\n- Manga\n- Digital Art\n- Pixel art\n- Fantasy art\n- Neonpunk\n- 3D Model\n- Juggernaut\n- Redmond\n- DallE-XL`);
            }

            m.reply("Processing...");

            let endpoint = "";
            let params = { prompt, resolution: "Wide" };

            switch (model.toLowerCase()) {
                case 'cinematic':
                case 'photographic':
                case 'anime':
                case 'manga':
                case 'digital art':
                case 'pixel art':
                case 'fantasy art':
                case 'neonpunk':
                case '3d model':
                    endpoint = "/animeart";
                    params.model = model;
                    break;
                case 'juggernaut':
                    endpoint = "/juggernautart";
                    break;
                case 'redmond':
                    endpoint = "/redmondart";
                    break;
                case 'dallexl':
                    endpoint = "/dallexl";
                    break;
                default:
                    return m.reply(`Model tidak dikenali. Silakan pilih dari: Cinematic, Photographic, Anime, Manga, Digital Art, Pixel art, Fantasy art, Neonpunk, 3D Model, Juggernaut, Redmond, DallE-XL`);
            }

            const res = await api.get(endpoint, params);
            if (!res || res.status !== 'Success' || !res.result) {
                throw new Error("Failed to retrieve image. Please try again later.");
            }

            if (model.toLowerCase() === 'dallexl') {
                if (!res.result.url) {
                    throw new Error("Failed to retrieve image. Please try again later.");
                }

                await sock.sendMessage(
                    m.chat,
                    {
                        image: { url: res.result.url },
                        caption: `Prompt : ${prompt}\nModel : DallE-XL\n\n*_${res.powered}_*`
                    },
                    { quoted: m }
                );
            } else {
                const hasil = res.result;
                await sock.sendMessage(
                    m.chat,
                    {
                        image: { url: hasil.image.url },
                        caption: `*[ TEXT TO IMAGE ]*\n\n*Prompt :* _${hasil.info.prompt}_\n*Negative Prompt :* _${hasil.info.negative_prompt}_\n*Resolution :* _${hasil.info.resolution}_\n*Sampler :* _${hasil.info.sampler}_\n*Model :* _${hasil.info.model || model}_\n*Size :* _${hasil.image.size}_\n\n*_${res.powered}_*`
                    },
                    { quoted: m }
                );
            }

        } catch (e) {
            console.error(e);
            m.reply("Terjadi kesalahan saat memproses permintaan. Mungkin file terlalu besar atau silakan coba lagi nanti.");
        }
    },

    failed: "Failed to haruna the %cmd command\n\n%error",
    wait: null,
    done: null,
};
