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

    block: async (sock, msg, botInfo, blockedUsers, args) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const number = args[0];
        const users = mentioned.length ? mentioned.map(user => user.split('@')[0]) : number ? [formatPhoneNumber(number)] : [];
        if (!users.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Usage: block @user or block [number]' });
            return;
        }
        for (const user of users) blockedUsers.add(formatPhoneNumber(user));
        await sock.sendMessage(msg.key.remoteJid, { text: `🚫 Blocked: ${users.join(', ')}` });
    },

    unblock: async (sock, msg, botInfo, blockedUsers, args) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const number = args[0];
        const users = mentioned.length ? mentioned.map(user => user.split('@')[0]) : number ? [formatPhoneNumber(number)] : [];
        if (!users.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Usage: unblock @user or unblock [number]' });
            return;
        }
        for (const user of users) blockedUsers.delete(formatPhoneNumber(user));
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Unblocked: ${users.join(', ')}` });
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
    },

    setprefix: async (sock, msg, botInfo, sudoUsers, isFromOwner, args) => {
        const newPrefix = args[0];
        if (newPrefix === undefined) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ Usage: setprefix [new_prefix]\nCurrent prefix: ${botInfo.prefix || 'None'}` });
            return;
        }
        botInfo.prefix = newPrefix.toLowerCase() === 'none' ? '' : newPrefix;
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Prefix changed to: ${botInfo.prefix || 'None'}` });
    },

    setstatus: async (sock, msg, botInfo, sudoUsers, isFromOwner, args) => {
        const status = args.join(' ');
        if (!status) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a status!' });
            return;
        }
        botInfo.status = status;
        await sock.updateProfileStatus(status);
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Status updated to: ${status}` });
    },

    autoread: async (sock, msg, botInfo, sudoUsers, isFromOwner, args) => {
        const subCommand = args[0]?.toLowerCase();
        if (!subCommand) {
            await sock.sendMessage(msg.key.remoteJid, { text: `📖 DM: ${botInfo.autoRead.dm ? 'ON' : 'OFF'}\nGroup: ${botInfo.autoRead.group ? 'ON' : 'OFF'}\n\nUsage: autoread [dm/group]` });
            return;
        }
        if (subCommand === 'dm') botInfo.autoRead.dm = !botInfo.autoRead.dm;
        else if (subCommand === 'group') botInfo.autoRead.group = !botInfo.autoRead.group;
        else {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Use autoread dm or autoread group' });
            return;
        }
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Auto-read ${subCommand}: ${botInfo.autoRead[subCommand] ? 'ON' : 'OFF'}` });
    }
};
