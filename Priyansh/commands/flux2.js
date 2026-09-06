const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'flux2',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'TAHA KHAN',
  description: 'Flux AI model se high-quality AI images generate karta hai',
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
      "📌 **Example:** `.flux2 A cyberpunk samurai standing on a rooftop in night`",
      threadID,
      messageID
    );
  }

  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const cachePath = path.join(cacheDir, `flux2_${Date.now()}.png`);

  api.sendMessage("🎨 **Flux AI** image generate ho rahi hai, please wait...", threadID, messageID);

  try {
    const apiUrl = `https://xalman-apis.vercel.app/api/flux?prompt=${encodeURIComponent(prompt)}`;
    
    let response;
    try {
      response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    } catch (primaryErr) {
      response = await axios.get(`https://xalman-apis.vercel.app/api/flux?q=${encodeURIComponent(prompt)}`, { responseType: 'arraybuffer' });
    }

    // Check if response is JSON error
    try {
      const jsonData = JSON.parse(Buffer.from(response.data).toString('utf-8'));
      if (jsonData && (jsonData.error || jsonData.message)) {
        return api.sendMessage(`❌ API Error: ${jsonData.error || jsonData.message}`, threadID, messageID);
      }
    } catch (e) {
      // Direct image binary buffer received
    }

    fs.writeFileSync(cachePath, Buffer.from(response.data, 'binary'));

    const msg = `──── •⚡ FLUX AI ⚡• ────\n\n🎨 **Prompt:** ${prompt}\n🤖 **Model:** Flux AI Standard\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`;

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
