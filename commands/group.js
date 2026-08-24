export const groupCommands = {
    tagall: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);
        const tagText = `📢 *ATTENTION EVERYONE!*\n\n` + 
                       participants.map(p => `@${p.id.split('@')[0]}`).join(' ') +
                       `\n\n👑 Message from admin!`;
        await sock.sendMessage(msg.key.remoteJid, { text: tagText, mentions });
    },

    groupinfo: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
        const infoText = `📋 *GROUP INFO*\n\n` +
                        `👥 *Name:* ${groupMetadata.subject}\n` +
                        `📝 *Description:* ${groupMetadata.desc || 'No description'}\n` +
                        `👑 *Owner:* @${groupMetadata.owner.split('@')[0]}\n` +
                        `📊 *Members:* ${groupMetadata.participants.length}\n` +
                        `🔒 *Settings:* ${groupMetadata.restrict ? 'Restricted' : 'Open'}`;
        await sock.sendMessage(msg.key.remoteJid, { text: infoText, mentions: [groupMetadata.owner] });
    },

    admin: async (sock, msg) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
            return;
        }
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
        const admins = groupMetadata.participants.filter(p => p.admin);
        const adminText = `👑 *GROUP ADMINS*\n\n` + 
                         admins.map((admin, i) => `${i + 1}. @${admin.id.split('@')[0]}`).join('\n');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: adminText, 
            mentions: admins.map(a => a.id) 
        });
    }
};