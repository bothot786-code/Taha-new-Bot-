const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'gimg',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'TAHA KHAN',
  description: 'Google Images se high-quality images search karke bhejta hai',
  commandCategory: 'image',
  usages: '[keyword / prompt]',
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      "⚠️ **Google Image search karne ke liye koi keyword likhein!**\n\n" +
      "📌 **Example:** `.gimg Cyberpunk City Night`",
      threadID,
      messageID
    );
  }

  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  api.sendMessage(`🔍 **Google Images** se "${query}" search ho raha hai...`, threadID, messageID);

  try {
    const apiUrl = `https://xalman-apis.vercel.app/api/google-image?prompt=${encodeURIComponent(query)}`;
    
    let response = await axios.get(apiUrl, { responseType: 'arraybuffer' }).catch(async () => {
      return await axios.get(`https://xalman-apis.vercel.app/api/google-image?q=${encodeURIComponent(query)}`, { responseType: 'arraybuffer' });
    });

    let isJson = false;
    let jsonData;
    try {
      jsonData = JSON.parse(Buffer.from(response.data).toString('utf-8'));
      if (jsonData && (jsonData.result || jsonData.data || Array.isArray(jsonData))) {
        isJson = true;
      }
    } catch (e) {
      isJson = false;
    }

    if (isJson) {
      const list = jsonData.result || jsonData.data || jsonData;
      const imagesToFetch = Array.isArray(list) ? list.slice(0, 4) : [list];
      const attachments = [];

      for (let i = 0; i < imagesToFetch.length; i++) {
        const imgUrl = typeof imagesToFetch[i] === 'string' ? imagesToFetch[i] : (imagesToFetch[i].url || imagesToFetch[i].image || imagesToFetch[i].link);
        if (!imgUrl) continue;

        const imgPath = path.join(cacheDir, `gimg_${i}_${Date.now()}.png`);
        const imgBuf = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, Buffer.from(imgBuf.data, 'binary'));
        attachments.push(fs.createReadStream(imgPath));
      }

      if (attachments.length === 0) {
        return api.sendMessage("❌ Google Images par koi result nahi mila!", threadID, messageID);
      }

      return api.sendMessage({
        body: `──── •🔍 GOOGLE IMAGES 🔍• ────\n\n📌 **Query:** ${query}\n✨ **Images Found:** ${attachments.length}\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`,
        attachment: attachments
      }, threadID, () => {
        attachments.forEach(stream => {
          if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path);
        });
      }, messageID);

    } else {
      const cachePath = path.join(cacheDir, `gimg_${Date.now()}.png`);
      fs.writeFileSync(cachePath, Buffer.from(response.data, 'binary'));

      return api.sendMessage({
        body: `──── •🔍 GOOGLE IMAGE 🔍• ────\n\n📌 **Query:** ${query}\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);
    }

  } catch (err) {
    console.error('[ GIMG ERROR ]:', err);
    return api.sendMessage("❌ Google Image search karne mein issue aaya hai, server busy ho sakta hai!", threadID, messageID);
  }
};
