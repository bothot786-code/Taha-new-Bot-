const axios = require("axios");
const FormData = require("form-data");

module.exports.config = {
  name: "edit",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Shaan Khan",
  description: "Edit images using Nano-Banana API",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 10
};

// Function to upload image to get CDN URL
async function uploadToCDN(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const form = new FormData();
    form.append('file', Buffer.from(response.data), { filename: 'image.jpg' });
    form.append('type', 'permanent');

    const res = await axios.post('https://tmp.malvryx.dev/upload', form, { headers: form.getHeaders() });
    return res.data?.cdnUrl || res.data?.directUrl;
  } catch (e) {
    return null;
  }
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;
  const prompt = args.join(" ");

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("⚠️ Please reply to an image with your prompt.", threadID, messageID);
  }
  if (!prompt) return api.sendMessage("❌ Please provide an edit prompt!", threadID, messageID);

  api.sendMessage("✨ Processing with Nano-Banana...", threadID, messageID);

  try {
    const imageUrl = await uploadToCDN(messageReply.attachments[0].url);
    if (!imageUrl) throw new Error("Failed to upload image to server.");

    // 1. Initiate Task
    const initRes = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imageUrl)}`);
    if (!initRes.data.success) throw new Error("Task initiation failed.");

    const { task_id, fp } = initRes.data;

    // 2. Poll for Result
    let resultUrl = null;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const check = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2-result?task_id=${task_id}${fp ? `&fp=${fp}` : ''}`);
      if (check.data.status === 'completed') {
        resultUrl = check.data.image_url;
        break;
      }
    }

    if (!resultUrl) throw new Error("Generation timed out.");

    // 3. Send Result
    const imgBuffer = await axios.get(resultUrl, { responseType: 'arraybuffer' });
    return api.sendMessage({
      body: `✨ *EDIT SUCCESS*\n\n📝 Prompt: ${prompt}\n🚀 Powered by: taha Khan`,
      attachment: Buffer.from(imgBuffer.data)
    }, threadID);

  } catch (error) {
    console.error(error);
    api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
  }
};
