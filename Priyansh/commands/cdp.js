const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'cdp',
  version: '1.0.0',
  hasPermssion: 0,
  credits: 'TAHA KHAN',
  description: 'Matching Couple Profile Pictures (CDP) fetch karke bhejta hai',
  commandCategory: 'image',
  usages: 'cdp',
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  api.sendMessage("👩‍❤️‍👨 Matching Couple DPs load ho rahi hain, please wait...", threadID, messageID);

  try {
    const res = await axios.get('https://xalman-apis.vercel.app/api/cdp');
    const data = res.data;

    // Extract male and female image URLs from API response
    const maleUrl = data.male || data.result?.male || data.avatar1 || data.result?.avatar1;
    const femaleUrl = data.female || data.result?.female || data.avatar2 || data.result?.avatar2;

    if (!maleUrl || !femaleUrl) {
      return api.sendMessage("❌ Couple DPs retrieve nahi ho sakein, API response check karein!", threadID, messageID);
    }

    const pathMale = path.join(cacheDir, `cdp_male_${Date.now()}.png`);
    const pathFemale = path.join(cacheDir, `cdp_female_${Date.now()}.png`);

    // Fetch both images parallelly
    const [maleRes, femaleRes] = await Promise.all([
      axios.get(maleUrl, { responseType: 'arraybuffer' }),
      axios.get(femaleUrl, { responseType: 'arraybuffer' })
    ]);

    fs.writeFileSync(pathMale, Buffer.from(maleRes.data, 'binary'));
    fs.writeFileSync(pathFemale, Buffer.from(femaleRes.data, 'binary'));

    const msg = `──── •👩‍❤️‍👨 COUPLE DP (CDP) 👩‍❤️‍👨• ────\n\n✨ **Matching Profile Pictures:**\n👦 Male DP & 👧 Female DP Attached!\n\n──── •💜• ────»»𝐎𝐖𝐍𝐄𝐑««★𝐓𝐀𝐇𝐀 𝐊𝐇𝐀𝐍★`;

    return api.sendMessage({
      body: msg,
      attachment: [
        fs.createReadStream(pathMale),
        fs.createReadStream(pathFemale)
      ]
    }, threadID, () => {
      [pathMale, pathFemale].forEach(filePath => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }, messageID);

  } catch (err) {
    console.error('[ CDP ERROR ]:', err);
    return api.sendMessage("❌ Couple DPs fetch karne mein error aaya hai, server busy ho sakta hai!", threadID, messageID);
  }
};
