const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'nex',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'TAHA KHAN',
  description: 'NexRay & MKZ Multi-Tool (Username Gen, Canvas YT/Welcome, Pinterest, AI Imagine)',
  commandCategory: 'utility',
  usages: '[user / yt / wl / pin / imagine] [query/prompt]',
  cooldowns: 3
};

const NEXRAY_BASE = 'https://api.nexray.eu.cc';
const MKZ_BASE = 'https://mkzstyleee.vercel.app';
const MKZ_APIKEY = ''; // Agar API Key ho toh yahan dalein, varna khali chhod dein

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const cacheDir = path.join(__dirname, 'cache');

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const subCommand = args[0]?.toLowerCase();
  const input = args.slice(1).join(" ");

  if (!subCommand || !['user', 'yt', 'wl', 'pin', 'imagine'].includes(subCommand)) {
    return api.sendMessage(
      "──── •⚡ NEXRAY & MKZ MASTER TOOL ⚡• ────\n\n" +
      "📌 **Istemal ka Tarika:**\n" +
      "1️⃣ **Username Gen:** `.nex user [theme/mode]`\n" +
      "2️⃣ **YouTube Canvas:** `.nex yt [title]`\n" +
      "3️⃣ **Welcome/Leave Canvas:** `.nex wl [welcome/leave]`\n" +
      "4️⃣ **Pinterest Search:** `.nex pin <query>`\n" +
      "5️⃣ **AI Imagine:** `.nex imagine <prompt>`\n\n" +
      "──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★",
      threadID, messageID
    );
  }

  // 1. Username Generator
  if (subCommand === 'user') {
    const theme = input || 'action';
    try {
      const res = await axios.get(`${NEXRAY_BASE}/tools/usernamegen?mode=instans&theme=${encodeURIComponent(theme)}`);
      const usernames = res.data.result || res.data.usernames || res.data;

      let msg = `✨ **GENERATED USERNAMES (${theme.toUpperCase()})** ✨\n\n`;
      if (Array.isArray(usernames)) {
        usernames.slice(0, 10).forEach((u, i) => msg += `[ ${i + 1} ] ${u}\n`);
      } else if (typeof usernames === 'object') {
        Object.values(usernames).slice(0, 10).forEach((u, i) => msg += `[ ${i + 1} ] ${u}\n`);
      } else {
        msg += `🔹 ${usernames}\n`;
      }

      msg += `\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`;
      return api.sendMessage(msg, threadID, messageID);
    } catch (err) {
      return api.sendMessage("❌ Username generate karne mein error aaya!", threadID, messageID);
    }
  }

  // 2. YouTube Canvas Card
  if (subCommand === 'yt') {
    api.sendMessage("🎨 YouTube canvas card ban raha hai...", threadID, messageID);
    const cachePath = path.join(cacheDir, `yt_canvas_${Date.now()}.png`);
    try {
      const userData = await Users.getData(senderID);
      const name = userData?.name || "User";
      const title = input || "Subscribed to Channel!";
      const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc15411275155509164691122a2754881`;

      const res = await axios.get(`${NEXRAY_BASE}/canvas/youtube?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&avatar=${encodeURIComponent(avatarUrl)}`, {
        responseType: 'arraybuffer'
      });

      fs.writeFileSync(cachePath, Buffer.from(res.data, 'binary'));

      return api.sendMessage({
        body: `🎬 **YouTube Canvas Card Generated!**\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.existsSync(cachePath) && fs.unlinkSync(cachePath), messageID);
    } catch (err) {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      return api.sendMessage("❌ YouTube canvas banane mein issue aaya!", threadID, messageID);
    }
  }

  // 3. Welcome / Leave Canvas
  if (subCommand === 'wl') {
    api.sendMessage("🖼️ Welcome/Leave card ban raha hai...", threadID, messageID);
    const cachePath = path.join(cacheDir, `wl_canvas_${Date.now()}.png`);
    try {
      const type = input.toLowerCase().includes('leave') ? 'leave' : 'welcome';
      const userData = await Users.getData(senderID);
      const name = userData?.name || "User";
      const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc15411275155509164691122a2754881`;

      const res = await axios.get(`${NEXRAY_BASE}/canvas/v1/welcomeleave?type=${type}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}`, {
        responseType: 'arraybuffer'
      });

      fs.writeFileSync(cachePath, Buffer.from(res.data, 'binary'));

      return api.sendMessage({
        body: `🖼️ **${type.toUpperCase()} Card Generated!**\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.existsSync(cachePath) && fs.unlinkSync(cachePath), messageID);
    } catch (err) {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      return api.sendMessage("❌ Welcome/Leave canvas banane mein error aaya!", threadID, messageID);
    }
  }

  // 4. Pinterest Search
  if (subCommand === 'pin') {
    if (!input) return api.sendMessage("⚠️ Pinterest par search karne ke liye kuch text likhein!", threadID, messageID);

    api.sendMessage(`🔍 Pinterest par "${input}" search ho raha hai...`, threadID, messageID);
    try {
      const res = await axios.get(`${MKZ_BASE}/search/pinterest?q=${encodeURIComponent(input)}&apikey=${MKZ_APIKEY}`);
      const data = res.data.result || res.data.data || res.data;

      if (!data || data.length === 0) {
        return api.sendMessage("❌ Pinterest par koi image nahi mili!", threadID, messageID);
      }

      const imagesToFetch = Array.isArray(data) ? data.slice(0, 5) : [data];
      const attachments = [];

      for (let i = 0; i < imagesToFetch.length; i++) {
        const imgUrl = typeof imagesToFetch[i] === 'string' ? imagesToFetch[i] : imagesToFetch[i].url || imagesToFetch[i].image;
        const imgPath = path.join(cacheDir, `pin_${i}_${Date.now()}.jpg`);
        const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, Buffer.from(imgRes.data, 'binary'));
        attachments.push(fs.createReadStream(imgPath));
      }

      return api.sendMessage({
        body: `📌 **Pinterest Search Results:** ${input}\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`,
        attachment: attachments
      }, threadID, () => {
        attachments.forEach(stream => {
          if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path);
        });
      }, messageID);
    } catch (err) {
      return api.sendMessage("❌ Pinterest search karne mein error aaya!", threadID, messageID);
    }
  }

  // 5. AI Imagine Image Generator
  if (subCommand === 'imagine') {
    if (!input) return api.sendMessage("⚠️ Image generate karne ke liye prompt likhein!\nExample: .nex imagine cyber lion in red neon", threadID, messageID);

    api.sendMessage("🤖 AI Image generate ho rahi hai...", threadID, messageID);
    const cachePath = path.join(cacheDir, `ai_img_${Date.now()}.png`);
    try {
      const res = await axios.get(`${MKZ_BASE}/ai/imagine?prompt=${encodeURIComponent(input)}&negativePrompt=blur,lowquality&resolution=1:1&apikey=${MKZ_APIKEY}`, {
        responseType: 'arraybuffer'
      });

      fs.writeFileSync(cachePath, Buffer.from(res.data, 'binary'));

      return api.sendMessage({
        body: `🎨 **AI Generated Image**\n📌 **Prompt:** ${input}\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.existsSync(cachePath) && fs.unlinkSync(cachePath), messageID);
    } catch (err) {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      return api.sendMessage("❌ AI Image generate karne mein issue aaya!", threadID, messageID);
    }
  }
};
