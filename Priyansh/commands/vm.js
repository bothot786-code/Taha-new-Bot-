const axios = require("axios");
const { createReadStream } = require("fs");
const { resolve } = require("path");

module.exports.config = {
  name: "vm",
  version: "1.2.1",
  hasPermssion: 0,
  credits: "Shaan",
  description: "YouTube Audio + Video Downloader",
  commandCategory: "media",
  usages: "vm <song name> / vm <song name> video",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // Check agar last argument 'video' hai
  let mode = "audio";
  if (args.includes("video")) {
    mode = "video";
    args = args.filter(item => item.toLowerCase() !== "video");
  }

  const query = args.join(" ");
  if (!query) return api.sendMessage("⚠️ Sahi format: vm <song name> ya vm <song name> video", threadID, messageID);

  const searching = await api.sendMessage("✅ Apki Request Jari Hai, Please Wait...", threadID);
  
  try {
    // API Call
    const res = await axios.get(`https://yt-amir.onrender.com/search?query=${encodeURIComponent(query)}`);
    const data = res.data.data || res.data.result;

    if (!data) return api.sendMessage("❌ Media nahi mila, phir se try karein.", threadID, messageID);

    // Audio ya Video URL select karna
    const targetUrl = (mode === "audio") ? (data.audio || data.url) : (data.video || data.url);
    const title = data.title || query;

    if (!targetUrl) throw new Error("Link fetch nahi ho paya");

    // File download/stream karne ka sahi tareeqa
    const path = `${__dirname}/cache/${Date.now()}.${mode === "audio" ? "mp3" : "mp4"}`;
    
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream'
    });

    const fs = require('fs');
    const writer = fs.createWriteStream(path);
    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({
        body: `🎵 ${title}\n\n»»𝑶𝑾𝑵𝑬𝑹««★™  »»𝑺𝑯𝑨𝑨𝑵 𝑲𝑯𝑨𝑵««🥀`,
        attachment: fs.createReadStream(path)
      }, threadID, () => {
        api.unsendMessage(searching.messageID);
        fs.unlinkSync(path); // File delete karden taake server heavy na ho
      }, messageID);
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error: API response mein masla hai.", threadID, messageID);
  }
};
