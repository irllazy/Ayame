export const ownerCommands = {
    owner: async (sock, msg, botInfo) => {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `👑 *BOT OWNER*\n\n📱 Number: ${botInfo.ownerNumber}\n🤖 Bot: ${botInfo.name}\n✅ You are the owner!` 
        });
    },

    settings: async (sock, msg, botInfo) => {
        const settingsText = `⚙️ *BOT SETTINGS*\n\n` +
                            `🤖 *Bot Name:* ${botInfo.name}\n` +
                            `📌 *Prefix:* ${botInfo.prefix}\n` +
                            `👑 *Owner:* ${botInfo.ownerNumber}\n` +
                            `🔒 *Owner Only:* Yes\n` +
                            `📝 *Auto Bio:* ${botInfo.autoBio ? 'ON' : 'OFF'}\n` +
                            `👁️ *Auto Status View:* ${botInfo.autoStatusView ? 'ON' : 'OFF'}\n` +
                            `🌐 *Always Online:* ${botInfo.alwaysOnline ? 'ON' : 'OFF'}`;
        await sock.sendMessage(msg.key.remoteJid, { text: settingsText });
    },

    alwaysonline: async (sock, msg, botInfo) => {
        botInfo.alwaysOnline = !botInfo.alwaysOnline;
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ *Always Online: ${botInfo.alwaysOnline ? 'ENABLED' : 'DISABLED'}*` 
        });
    },

    autostatusview: async (sock, msg, botInfo) => {
        botInfo.autoStatusView = !botInfo.autoStatusView;
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ *Auto Status View: ${botInfo.autoStatusView ? 'ENABLED' : 'DISABLED'}*` 
        });
    },

    autobio: async (sock, msg, botInfo) => {
        botInfo.autoBio = !botInfo.autoBio;
        if (botInfo.autoBio) {
            await sock.updateProfileStatus(`🤖 ${botInfo.name} | Online | ${botInfo.prefix}menu`);
        } else {
            await sock.updateProfileStatus('');
        }
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ *Auto Bio: ${botInfo.autoBio ? 'ENABLED' : 'DISABLED'}*` 
        });
    },

    sudo: async (sock, msg, botInfo, sudoUsers) => {
        if (sudoUsers.size === 0) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `👑 *SUDO USERS*\n\nNo sudo users added yet.\nUse .addsudo to add users.` 
            });
            return;
        }
        
        const sudoList = Array.from(sudoUsers).map((user, i) => `${i + 1}. ${user}`).join('\n');
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `👑 *SUDO USERS*\n\n${sudoList}\n\nTotal: ${sudoUsers.size} sudo users` 
        });
    },

    addsudo: async (sock, msg, botInfo, sudoUsers, isFromOwner) => {
        // Only owner can add sudo users
        if (!isFromOwner) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ Only the owner can add sudo users!' 
            });
            return;
        }
        
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const number = msg.message.conversation?.split(' ')[1];
        
        let userToAdd;
        if (mentioned && mentioned.length > 0) {
            userToAdd = mentioned[0].split('@')[0];
        } else if (number) {
            userToAdd = number.replace(/\D/g, '');
        } else {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ Please mention a user or provide a number!\nUsage: .addsudo @user or .addsudo [number]' 
            });
            return;
        }
        
        sudoUsers.add(userToAdd);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `✅ Added ${userToAdd} as sudo user!` 
        });
    },

    delsudo: async (sock, msg, botInfo, sudoUsers, isFromOwner) => {
        // Only owner can remove sudo users
        if (!isFromOwner) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ Only the owner can remove sudo users!' 
            });
            return;
        }
        
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const number = msg.message.conversation?.split(' ')[1];
        
        let userToRemove;
        if (mentioned && mentioned.length > 0) {
            userToRemove = mentioned[0].split('@')[0];
        } else if (number) {
            userToRemove = number.replace(/\D/g, '');
        } else {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ Please mention a user or provide a number!\nUsage: .delsudo @user or .delsudo [number]' 
            });
            return;
        }
        
        if (sudoUsers.has(userToRemove)) {
            sudoUsers.delete(userToRemove);
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ Removed ${userToRemove} from sudo users!` 
            });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ ${userToRemove} is not a sudo user!` 
            });
        }
    }
};