function isGroup(msg) {
    return msg.key.remoteJid?.endsWith('@g.us');
}

async function requireGroupAdmin(sock, msg, isFromOwner) {
    if (!isGroup(msg)) {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in groups!' });
        return false;
    }
    if (isFromOwner) return true;

    const senderJid = msg.key.participant || msg.key.remoteJid;
    try {
        const metadata = await sock.groupMetadata(msg.key.remoteJid);
        const participant = metadata.participants.find(p => p.id === senderJid);
        if (!participant?.admin) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Only group admins can use this command!' });
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking group admin:', error);
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Could not verify group permissions.' });
        return false;
    }
}

function getMentioned(msg) {
    return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

export const adminCommands = {
    promote: async (sock, msg, permissions) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        const mentioned = getMentioned(msg);
        if (!mentioned.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to promote!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'promote');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Promoted @${mentioned[0].split('@')[0]} to admin!`,
            mentions: mentioned
        });
    },

    demote: async (sock, msg, permissions) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        const mentioned = getMentioned(msg);
        if (!mentioned.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to demote!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'demote');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Demoted @${mentioned[0].split('@')[0]} from admin!`,
            mentions: mentioned
        });
    },

    kick: async (sock, msg, permissions) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        const mentioned = getMentioned(msg);
        if (!mentioned.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to kick!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'remove');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Kicked @${mentioned[0].split('@')[0]} from group!`,
            mentions: mentioned
        });
    },

    add: async (sock, msg, permissions, args) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        const number = args?.[0]?.replace(/\D/g, '');
        if (!number) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Usage: add [number]' });
            return;
        }
        try {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [`${number}@s.whatsapp.net`], 'add');
            await sock.sendMessage(msg.key.remoteJid, { text: `✅ Added ${number} to group!` });
        } catch (error) {
            console.error('Error adding member:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to add member!' });
        }
    },

    remove: async (sock, msg, permissions) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        const mentioned = getMentioned(msg);
        if (!mentioned.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to remove!' });
            return;
        }
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'remove');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Removed @${mentioned[0].split('@')[0]} from group!`,
            mentions: mentioned
        });
    },

    mute: async (sock, msg, permissions, mutedGroups) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        mutedGroups.add(msg.key.remoteJid);
        await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement');
        await sock.sendMessage(msg.key.remoteJid, { text: '🔇 Group muted! Only admins can send messages.' });
    },

    unmute: async (sock, msg, permissions, mutedGroups) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        mutedGroups.delete(msg.key.remoteJid);
        await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
        await sock.sendMessage(msg.key.remoteJid, { text: '🔊 Group unmuted! Everyone can send messages.' });
    },

    warn: async (sock, msg, permissions, warnings) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        const mentioned = getMentioned(msg);
        if (!mentioned.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention a user to warn!' });
            return;
        }
        for (const user of mentioned) {
            const key = `${msg.key.remoteJid}:${user}`;
            warnings.set(key, (warnings.get(key) || 0) + 1);
        }
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚠️ Warning for: ${mentioned.map(m => m.split('@')[0]).join(', ')}`,
            mentions: mentioned
        });
    },

    antilink: async (sock, msg, permissions, antiLinkGroups) => {
        if (!await requireGroupAdmin(sock, msg, permissions.isFromOwner)) return;
        const jid = msg.key.remoteJid;
        if (antiLinkGroups.has(jid)) {
            antiLinkGroups.delete(jid);
            await sock.sendMessage(jid, { text: '✅ Anti-link DISABLED!' });
        } else {
            antiLinkGroups.add(jid);
            await sock.sendMessage(jid, { text: '✅ Anti-link ENABLED! Links will be deleted.' });
        }
    }
};
