const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'flux',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'TAHA KHAN',
  description: 'Flux Schnell AI model se ultra high-quality AI images generate karta hai',
  commandCategory: 'image',
  usages: '[prompt]',
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage(
      "⚠️ **Flux AI image generate karne ke liye koi prompt likhein!**\n\n" +
      "📌 **Example:** `.flux A futuristic cyberpunk warrior standing under green neon rain, 8k resolution`",
      threadID,
      messageID
    );
  }

  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const cachePath = path.join(cacheDir, `flux_${Date.now()}.png`);

  api.sendMessage("🎨 **Flux Schnell AI** image render ho rahi hai, please wait...", threadID, messageID);

  try {
    const apiUrl = `https://xalman-apis.vercel.app/api/flux-schnell?prompt=${encodeURIComponent(prompt)}`;
    
    let response;
    try {
      response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    } catch (primaryErr) {
      // Fallback endpoint param if needed
      response = await axios.get(`https://xalman-apis.vercel.app/api/flux-schnell?q=${encodeURIComponent(prompt)}`, { responseType: 'arraybuffer' });
    }

    fs.writeFileSync(cachePath, Buffer.from(response.data, 'binary'));

    const msg = `──── •⚡ FLUX SCHNELL AI ⚡• ────\n\n🎨 **Prompt:** ${prompt}\n🤖 **Model:** Flux.1 Schnell (Xalman API)\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error('[ FLUX ERROR ]:', err);
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    return api.sendMessage("❌ Flux AI Image generate karne mein issue aaya hai, server busy ho sakta hai!", threadID, messageID);
  }
};
