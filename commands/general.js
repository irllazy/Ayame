export const generalCommands = {
    ping: async (sock, msg, botInfo) => {
        const start = Date.now();
        const sent = await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pinging...' });
        const ping = Date.now() - start;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🏓 *Pong!*\n\n📡 *Response Time:* ${ping}ms\n🤖 *Bot:* ${botInfo.name}\n✅ *Status:* Online`
        });
        return sent;
    },

    start: async (sock, msg, botInfo) => {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ *${botInfo.name} Started!*\n\n🤖 Bot is online and ready to use.\n📌 Type menu to see commands.`
        });
    },

    profile: async (sock, msg, botInfo) => {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `👤 *PROFILE*\n\n👑 *Owner:* ${botInfo.ownerNumber}\n🤖 *Bot:* ${botInfo.name}\n📱 *Chat ID:* ${msg.key.remoteJid}\n📅 *Date:* ${botInfo.date}\n⏰ *Time:* ${botInfo.time}`
        });
    },

    stats: async (sock, msg, botInfo) => {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `📊 *BOT STATS*\n\n🤖 *Name:* ${botInfo.name}\n📌 *Prefix:* ${botInfo.prefix || 'None'}\n⏰ *Uptime:* ${process.uptime().toFixed(2)}s\n💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\n📅 *Date:* ${botInfo.date}`
        });
    }
};
