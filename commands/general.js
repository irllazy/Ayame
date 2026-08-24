export const generalCommands = {
    ping: async (sock, msg, botInfo) => {
        const start = Date.now();
        await sock.sendMessage(msg.key.remoteJid, { text: '🏓 *Pinging...*' });
        const end = Date.now();
        const ping = end - start;
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `🏓 *Pong!*\n\n📡 *Response Time:* ${ping}ms\n🤖 *Bot:* ${botInfo.name}\n✅ *Status:* Online` 
        });
    },

    help: async (sock, msg) => {
        const helpText = `🤖 *AYAME BOT HELP*\n\n` +
                        `📌 *Available Commands:*\n\n` +
                        `👑 *Owner Commands:*\n` +
                        `• .owner - Show bot owner\n` +
                        `• .settings - Bot settings\n` +
                        `• .alwaysonline - Keep bot online\n` +
                        `• .autostatusview - Auto view statuses\n` +
                        `• .autobio - Auto update bio\n\n` +
                        `👮 *Admin Commands:*\n` +
                        `• .promote - Promote member\n` +
                        `• .demote - Demote admin\n` +
                        `• .kick - Remove member\n` +
                        `• .add - Add member\n` +
                        `• .ban - Ban member\n` +
                        `• .unban - Unban member\n` +
                        `• .mute - Mute group\n` +
                        `• .unmute - Unmute group\n` +
                        `• .warn - Warn member\n` +
                        `• .antilink - Toggle anti-link\n\n` +
                        `👥 *Group Commands:*\n` +
                        `• .tagall - Tag all members\n` +
                        `• .groupinfo - Group information\n` +
                        `• .admin - Admin list\n\n` +
                        `📊 *User Commands:*\n` +
                        `• .profile - Your profile\n` +
                        `• .stats - Bot stats\n` +
                        `• .rank - Your rank\n` +
                        `• .level - Your level\n` +
                        `• .afk - Set AFK status\n\n` +
                        `📋 *Other:*\n` +
                        `• .ping - Check bot status\n` +
                        `• .start - Start bot\n` +
                        `• .menu - Show menu\n` +
                        `• .allmenu - Show all commands`;
        
        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
    },

    start: async (sock, msg, botInfo) => {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ *${botInfo.name} Started!*\n\n🤖 Bot is now online and ready to use.\n📌 Type .menu to see all commands.` 
        });
    },

    profile: async (sock, msg, botInfo) => {
        const sender = msg.key.remoteJid;
        const profileText = `👤 *PROFILE*\n\n` +
                           `👑 *Owner:* ${botInfo.ownerNumber}\n` +
                           `🤖 *Bot:* ${botInfo.name}\n` +
                           `📱 *Chat ID:* ${sender}\n` +
                           `📅 *Date:* ${botInfo.date}\n` +
                           `⏰ *Time:* ${botInfo.time}`;
        await sock.sendMessage(sender, { text: profileText });
    },

    stats: async (sock, msg, botInfo) => {
        const statsText = `📊 *BOT STATS*\n\n` +
                         `🤖 *Name:* ${botInfo.name}\n` +
                         `📌 *Prefix:* ${botInfo.prefix}\n` +
                         `⏰ *Uptime:* ${process.uptime().toFixed(2)}s\n` +
                         `💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\n` +
                         `📅 *Date:* ${botInfo.date}`;
        await sock.sendMessage(msg.key.remoteJid, { text: statsText });
    },

    rank: async (sock, msg) => {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `🏆 *YOUR RANK*\n\n⭐ *Rank:* Gold\n📊 *Level:* 5\n💎 *XP:* 2,500/5,000\n\nKeep chatting to level up!` 
        });
    },

    level: async (sock, msg) => {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `📈 *LEVEL*\n\nLevel: 5\nProgress: [████████░░] 80%\nXP: 2,500/5,000` 
        });
    },

    afk: async (sock, msg, afkUsers) => {
        const sender = msg.key.remoteJid.split('@')[0];
        const reason = msg.message.conversation?.split(' ').slice(1).join(' ') || 'No reason';
        afkUsers.set(sender, reason);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ *AFK Mode Activated*\n\n👤 @${sender}\n📝 Reason: ${reason}`,
            mentions: [msg.key.remoteJid]
        });
    }
};