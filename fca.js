// SAAN7 FCA Adapted for Taha-New-Bot
const saanEngine = require("fca-project-easy");

module.exports = function (credentials, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    }

    // SAAN7 Core Security & Anti-Ban Configurations
    const saanSettings = {
        listenEvents: true,
        selfListen: false,
        autoMarkDelivery: false,
        online: true,
        autoReconnect: true,
        logLevel: "silent",
        forceLogin: true,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        ...options
    };

    return saanEngine(credentials, saanSettings, (err, api) => {
        if (err) {
            console.error("❌ SAAN7 Login Error:", err.error || err);
            return callback(err);
        }

        // Internal API Override for Taha-New-Bot
        api.setOptions({
            listenEvents: true,
            selfListen: false,
            autoMarkRead: false,
            forceLogin: true,
            online: true
        });

        console.log("⚡ [SAAN7 Engine] Taha-New-Bot ke andar successfully active ho chuka hai!");
        return callback(null, api);
    });
};
