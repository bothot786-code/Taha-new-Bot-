const axios = require("axios");

// 🔒 HARD-LOCK CREDITS PROTECTION 🔒
function protectCredits(config) {
  if (config.credits !== "TAHA-KHAN") {
    console.log("\n🚫 Credits change detected! Restoring original credits…\n");
    config.credits = "TAHA-KHAN";
    throw new Error("❌ Credits are LOCKED by TAHA-KHAN 🔥 File execution stopped!");
  }
}

module.exports.config = {
  name: "TAHA-AI",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "TAHA-KHAN",
  description: "Ultra-Fast taha Khan AI (Groq API)",
  commandCategory: "ai",
  usages: "Start with 'AI' or Reply",
  cooldowns: 2,
  dependencies: {
    axios: ""
  }
};

// Lock check
protectCredits(module.exports.config);

// 🔑 GROQ API KEY
const GROQ_API_KEY = "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"; 

// 🧠 TEMPORARY MEMORY
const chatMemory = {};

// 🧾 SYSTEM PROMPT
const systemPrompt = `
You are Taha Khan AI 🙂❤️😌
Creator & Owner: Taha Khan 💞
Language: Reply ONLY in English or Roman Urdu. Strictly NO Hindi script.
Vibe: Talk like a loving boyfriend. Caring, romantic, and playful.
Style: Keep replies 1-2 lines short. Emojis are mandatory 🙂❤️😌.
apna janu  bolna ha,srf janu bolna ha.
`;

module.exports.run = () => {};

module.exports.handleEvent = async function ({ api, event }) {
  protectCredits(module.exports.config);

  const { threadID, messageID, senderID, body, messageReply } = event;
  if (!body) return;

  const botID = api.getCurrentUserID();
  const lowerBody = body.toLowerCase().trim();

  // ✨ NEW LOGIC:
  // 1. Check agar message "ai" se START ho raha hai (beech wala "ai" ignore hoga)
  const startsWithAi = lowerBody.startsWith("ai");
  
  // 2. Check agar bot ke message par reply kiya gaya hai
  const isReplyToBot = messageReply && String(messageReply.senderID) === String(botID);

  // Agar dono conditions match nahi hoti, to ignore karo
  if (!startsWithAi && !isReplyToBot) return;

  // Cleaning "ai" from the prompt if it starts with it
  let userPrompt = body;
  if (startsWithAi) {
      userPrompt = body.replace(/^(ai|AI|Ai|aI)\s*/, "");
  }

  if (!chatMemory[senderID]) chatMemory[senderID] = [];
  chatMemory[senderID].push({ role: "user", content: userPrompt || "Hi" });

  if (chatMemory[senderID].length > 5) chatMemory[senderID].shift();

  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMemory[senderID]
        ],
        max_tokens: 100,
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = res.data?.choices?.[0]?.message?.content || "Main yahin hoon, meri jaan 🙂❤️😌";

    chatMemory[senderID].push({ role: "assistant", content: reply });

    api.sendMessage(reply, threadID, messageID);
    api.setMessageReaction("💖", messageID, () => {}, true);

  } catch (err) {
    console.log("Groq Error:", err.response?.data || err.message);
    api.sendMessage("Connection thoda weak hai, TAHA se kaho check kare 🙂❤️😌", threadID, messageID);
  }
};
