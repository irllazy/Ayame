export const adminCommands = {
    promote: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to promote!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'promote');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ Promoted @${mentioned[0].split('@')[0]} to admin!`, 
            mentions: mentioned 
        });
    },

    demote: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to demote!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'demote');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ Demoted @${mentioned[0].split('@')[0]} from admin!`, 
            mentions: mentioned 
        });
    },

    kick: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to kick!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'remove');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ Kicked @${mentioned[0].split('@')[0]} from group!`, 
            mentions: mentioned 
        });
    },

    add: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const commandParts = messageText.split(/\s+/);
        const number = commandParts[1];
        
        if (!number) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a number! Usage: add [number]' });
            return;
        }
        
        const cleanNumber = number.replace(/\D/g, '');
        try {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [`${cleanNumber}@s.whatsapp.net`], 'add');
            await sock.sendMessage(msg.key.remoteJid, { text: `✅ Added ${cleanNumber} to group!` });
        } catch (error) {
            console.error('Error adding member:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to add member!' });
        }
    },

    remove: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to remove!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'remove');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ Removed @${mentioned[0].split('@')[0]} from group!`, 
            mentions: mentioned 
        });
    },

    ban: async (sock, msg, bannedUsers) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to ban!' });
            return;
        }
        
        for (const user of mentioned) {
            bannedUsers.add(user);
        }
        
        const mentionedNumbers = mentioned.map(m => m.split('@')[0]).join(', ');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `🚫 Banned: ${mentionedNumbers}`, 
            mentions: mentioned 
        });
    },

    unban: async (sock, msg, bannedUsers) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to unban!' });
            return;
        }
        
        for (const user of mentioned) {
            bannedUsers.delete(user);
        }
        
        const mentionedNumbers = mentioned.map(m => m.split('@')[0]).join(', ');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ Unbanned: ${mentionedNumbers}`, 
            mentions: mentioned 
        });
    },

    mute: async (sock, msg, mutedGroups) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        if (!mutedGroups) mutedGroups = new Set();
        mutedGroups.add(msg.key.remoteJid);
        await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement');
        await sock.sendMessage(msg.key.remoteJid, { text: '🔇 Group muted! Only admins can send messages.' });
    },

    unmute: async (sock, msg, mutedGroups) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        if (mutedGroups) mutedGroups.delete(msg.key.remoteJid);
        await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
        await sock.sendMessage(msg.key.remoteJid, { text: '🔊 Group unmuted! Everyone can send messages.' });
    },

    warn: async (sock, msg, warnings) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to warn!' });
            return;
        }
        
        if (!warnings) warnings = new Map();
        
        for (const user of mentioned) {
            const count = (warnings.get(user) || 0) + 1;
            warnings.set(user, count);
        }
        
        const mentionedNumbers = mentioned.map(m => m.split('@')[0]).join(', ');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `⚠️ Warning for: ${mentionedNumbers}`, 
            mentions: mentioned 
        });
    },

    antilink: async (sock, msg, antiLinkGroups) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        
        if (!antiLinkGroups) antiLinkGroups = new Set();
        
        if (antiLinkGroups.has(msg.key.remoteJid)) {
            antiLinkGroups.delete(msg.key.remoteJid);
            await sock.sendMessage(msg.key.remoteJid, { text: '✅ Anti-link DISABLED!' });
        } else {
            antiLinkGroups.add(msg.key.remoteJid);
            await sock.sendMessage(msg.key.remoteJid, { text: '✅ Anti-link ENABLED! Links will be deleted.' });
        }
    }
};