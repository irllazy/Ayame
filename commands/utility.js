import { formatPhoneNumber } from '../utils/helpers.js';

export const utilityCommands = {
    clear: async (sock, msg) => {
        try {
            await sock.chatModify({ clear: { messages: [{ id: 'all', fromMe: true }] } }, msg.key.remoteJid);
            await sock.sendMessage(msg.key.remoteJid, { text: '✅ Cleared your chat history!' });
        } catch (error) {
            console.error('Error clearing chat:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to clear chat history!' });
        }
    },

    block: async (sock, msg, botInfo, blockedUsers, bannedUsers, args) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const number = args[0];
        
        if (mentioned.length > 0) {
            for (const user of mentioned) {
                const userNumber = formatPhoneNumber(user.split('@')[0]);
                blockedUsers.add(userNumber);
                console.log(`Blocked user: ${userNumber}`);
            }
            const mentionedNumbers = mentioned.map(m => m.split('@')[0]).join(', ');
            await sock.sendMessage(msg.key.remoteJid, { text: `🚫 Blocked: ${mentionedNumbers}` });
        } else if (number) {
            const cleanNumber = formatPhoneNumber(number);
            blockedUsers.add(cleanNumber);
            console.log(`Blocked number: ${cleanNumber}`);
            await sock.sendMessage(msg.key.remoteJid, { text: `🚫 Blocked: ${cleanNumber}` });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Usage: block @user or block [number]' });
        }
    },

    unblock: async (sock, msg, botInfo, blockedUsers, bannedUsers, args) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const number = args[0];
        
        if (mentioned.length > 0) {
            for (const user of mentioned) {
                const userNumber = formatPhoneNumber(user.split('@')[0]);
                blockedUsers.delete(userNumber);
                console.log(`Unblocked user: ${userNumber}`);
            }
            const mentionedNumbers = mentioned.map(m => m.split('@')[0]).join(', ');
            await sock.sendMessage(msg.key.remoteJid, { text: `✅ Unblocked: ${mentionedNumbers}` });
        } else if (number) {
            const cleanNumber = formatPhoneNumber(number);
            blockedUsers.delete(cleanNumber);
            console.log(`Unblocked number: ${cleanNumber}`);
            await sock.sendMessage(msg.key.remoteJid, { text: `✅ Unblocked: ${cleanNumber}` });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Usage: unblock @user or unblock [number]' });
        }
    },

    leave: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        try {
            await sock.groupLeave(msg.key.remoteJid);
        } catch (error) {
            console.error('Error leaving group:', error);
        }
    },

    antispam: async (sock, msg, botInfo) => {
        botInfo.antiSpam = !botInfo.antiSpam;
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ Anti-spam ${botInfo.antiSpam ? 'ENABLED' : 'DISABLED'}!\n\nDM: Warn then block\nGroup: Bot leaves silently` 
        });
        console.log(`Anti-spam: ${botInfo.antiSpam ? 'ON' : 'OFF'}`);
    },

    setprefix: async (sock, msg, botInfo, sudoUsers, isFromOwner, args) => {
        const newPrefix = args[0];
        
        if (newPrefix === undefined) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Please provide a prefix!\nUsage: setprefix [new_prefix]\nCurrent prefix: ${botInfo.prefix || 'None'}\n\nTo remove prefix, use: setprefix none` 
            });
            return;
        }
        
        if (newPrefix.toLowerCase() === 'none' || newPrefix === '') {
            botInfo.prefix = '';
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ Prefix removed! Just type commands without prefix.\nExample: menu` 
            });
        } else {
            botInfo.prefix = newPrefix;
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ Prefix changed to: ${newPrefix}\nUse ${newPrefix}menu to see commands.` 
            });
        }
        console.log(`Prefix changed to: ${botInfo.prefix || 'None'}`);
    },

    setstatus: async (sock, msg, botInfo, sudoUsers, isFromOwner, args) => {
        const status = args.join(' ');
        
        if (!status) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Please provide a status!\nUsage: setstatus [your status]` 
            });
            return;
        }
        
        botInfo.status = status;
        await sock.updateProfileStatus(status);
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Status updated to: ${status}` });
    },

    afk: async (sock, msg, botInfo, sudoUsers, isFromOwner, args) => {
        const reason = args.join(' ');
        
        if (botInfo.afk.enabled) {
            botInfo.afk.enabled = false;
            botInfo.afk.reason = '';
            botInfo.afk.since = null;
            await sock.sendMessage(msg.key.remoteJid, { text: '✅ AFK mode disabled! Bot is now active.' });
        } else {
            botInfo.afk.enabled = true;
            botInfo.afk.reason = reason || 'Busy right now';
            botInfo.afk.since = new Date();
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ AFK mode enabled!\n📝 Reason: ${botInfo.afk.reason}\n⏰ Time: ${botInfo.afk.since.toLocaleString()}` 
            });
        }
        console.log(`AFK: ${botInfo.afk.enabled ? 'ON' : 'OFF'}`);
    },

    autoread: async (sock, msg, botInfo, sudoUsers, isFromOwner, args) => {
        const subCommand = args[0]?.toLowerCase();
        
        if (!subCommand) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `📖 *Auto-read Settings:*\n\nDM: ${botInfo.autoRead.dm ? 'ON' : 'OFF'}\nGroup: ${botInfo.autoRead.group ? 'ON' : 'OFF'}\n\nUsage: autoread [dm/group]` 
            });
            return;
        }
        
        if (subCommand === 'dm') {
            botInfo.autoRead.dm = !botInfo.autoRead.dm;
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ Auto-read DM: ${botInfo.autoRead.dm ? 'ON' : 'OFF'}` 
            });
        } else if (subCommand === 'group') {
            botInfo.autoRead.group = !botInfo.autoRead.group;
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ Auto-read Group: ${botInfo.autoRead.group ? 'ON' : 'OFF'}` 
            });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ Invalid option! Use autoread dm or autoread group' 
            });
        }
    },

    banned: async (sock, msg, botInfo, blockedUsers, bannedUsers) => {
        if (bannedUsers.size === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '📋 No banned users!' });
            return;
        }
        
        const bannedList = Array.from(bannedUsers).map((user, i) => `${i + 1}. ${user.split('@')[0]}`).join('\n');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `📋 *BANNED USERS:*\n\n${bannedList}\n\nTotal: ${bannedUsers.size} users` 
        });
    }
};