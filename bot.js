import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import readline from 'readline';
import { ownerCommands } from './commands/owner.js';
import { adminCommands } from './commands/admin.js';
import { groupCommands } from './commands/group.js';
import { utilityCommands } from './commands/utility.js';
import { generalCommands } from './commands/general.js';
import { formatPhoneNumber, isOwner, getSenderNumber, getTime, getDate } from './utils/helpers.js';
import fs from 'fs';
import path from 'path';

// Configuration
let OWNER_NUMBER = '2347073792765';
let PREFIX = ''; // Empty prefix means no prefix needed
let BOT_NAME = 'Ayame';
let VERSION = '1.0.0';

// Sudo users list
const sudoUsers = new Set();

// Bot Info
const botInfo = {
    name: BOT_NAME,
    ownerNumber: OWNER_NUMBER,
    prefix: PREFIX,
    version: VERSION,
    alwaysOnline: false,
    autoStatusView: false,
    autoBio: false,
    autoRead: {
        dm: false,
        group: false
    },
    antiSpam: false,
    time: getTime(),
    date: getDate(),
    status: '🤖 Ayame Bot | Online',
 makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import readline from 'readline';
import { ownerCommands } from './commands/owner.js';
import { adminCommands } from './commands/admin.js';
import { groupCommands } from './commands/group.js';
import { utilityCommands } from './commands/utility.js';
import { generalCommands } from './commands/general.js';
import { formatPhoneNumber, isOwner, getSenderNumber, getTime, getDate } from './utils/helpers.js';
import fs from 'fs';
import path from 'path';

// Configuration
let OWNER_NUMBER = '2347073792765';
let PREFIX = ''; // Empty prefix means no prefix needed
let BOT_NAME = 'Ayame';
let VERSION = '1.0.0';

// Sudo users list
const sudoUsers = new Set();

// Bot Info
const botInfo = {
    name: BOT_NAME,
    ownerNumber: OWNER_NUMBER,
    prefix: PREFIX,
    version: VERSION,
    alwaysOnline: false,
    autoStatusView: false,
    autoBio: false,
    autoRead: {
        dm: false,
        group: false
    },
    antiSpam: false,
    time: getTime(),
    date: getDate(),
    status: '🤖 Ayame Bot | Online',
    afk: {
        enabled: false,
        reason: '',
        since: null
    }
};

// Data storage
const mutedGroups = new Set();
const antiLinkGroups = new Set();
const warnings = new Map();
const blockedUsers = new Set();
const spamTracker = new Map();
const SPAM_THRESHOLD = 5;
const SPAM_TIME_WINDOW = 10000;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.windows('Chrome'),
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if ((connection === 'connecting' || qr) && !sock.authState.creds.registered) {
            console.log('⏳ Connection initializing... requesting Pairing Code.');
            const phoneNumber = await question('📱 Enter your WhatsApp number (with country code, no +): ');
            try {
                const code = await sock.requestPairingCode(phoneNumber.trim());
                console.log(`\n✅ YOUR PAIRING CODE: ${code}\n`);
                console.log('Enter this code in WhatsApp: Settings > Linked Devices > Link a Device > Link with Phone Number');
            } catch (err) {
                console.error('❌ Error requesting pairing code:', err);
            }
        }

        if (connection === 'open') {
            console.log('✅ Connected successfully!');
            console.log(`👑 Bot is restricted to owner: ${OWNER_NUMBER}`);
            console.log(`🤖 Bot Name: ${BOT_NAME}`);
            console.log(`📌 Prefix: ${PREFIX || 'None (just type command)'}`);
            
            if (botInfo.autoBio) {
                await sock.updateProfileStatus(`🤖 ${BOT_NAME} | Online | ${PREFIX}menu`);
            }
            
            rl.close();
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 Connection lost. Reconnecting...');
                connectToWhatsApp();
            } else {
                console.log('❌ Connection closed. You are logged out.');
                rl.close();
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        
        if (!msg.message) return;

        // Auto status view
        if (botInfo.autoStatusView && msg.key && msg.key.remoteJid === 'status@broadcast') {
            await sock.readMessages([msg.key]);
            console.log('👁️ Status viewed automatically');
            return;
        }

        // Auto read messages
        if (botInfo.autoRead.dm && !msg.key.remoteJid.endsWith('@g.us')) {
            await sock.readMessages([msg.key]);
        }
        if (botInfo.autoRead.group && msg.key.remoteJid.endsWith('@g.us')) {
            await sock.readMessages([msg.key]);
        }

        const senderNumber = getSenderNumber(msg, OWNER_NUMBER);
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const isFromOwner = msg.key.fromMe || isOwner(senderNumber, OWNER_NUMBER);
        const isSudo = sudoUsers.has(formatPhoneNumber(senderNumber));
        const isAuthorized = isFromOwner || isSudo;

        // Check if sender is blocked
        if (blockedUsers.has(formatPhoneNumber(senderNumber))) {
            console.log(`🚫 Blocked user ${senderNumber} tried to message`);
            return;
        }

        // Anti-link check
        if (msg.key.remoteJid.endsWith('@g.us') && antiLinkGroups.has(msg.key.remoteJid)) {
            const messageContent = msg.message.conversation || 
                                  msg.message.extendedTextMessage?.text || 
                                  msg.message.imageMessage?.caption || '';
                                  
            if (messageContent && (messageContent.includes('http://') || messageContent.includes('https://') || messageContent.includes('www.') || messageContent.includes('.com') || messageContent.includes('.net') || messageContent.includes('.org'))) {
                // Check if sender is admin or owner
                try {
                    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
                    const isAdmin = groupMetadata.participants.some(p => p.id === senderJid && p.admin);
                    
                    if (!isAdmin && !isFromOwner) {
                        // Delete the link message
                        await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });
                        console.log('🔗 Deleted link message from non-admin');
                        return;
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                }
            }
        }

        // Anti-spam check - FIXED
        if (botInfo.antiSpam && !isAuthorized) {
            const spamCheck = checkSpam(senderNumber, msg.key.remoteJid);
            if (spamCheck) {
                if (msg.key.remoteJid.endsWith('@g.us')) {
                    // In group - remove bot
                    if (spamCheck === 'remove') {
                        const botJid = sock.user.id;
                        await sock.groupParticipantsUpdate(msg.key.remoteJid, [botJid], 'remove');
                        console.log(`🚫 Left group due to spam`);
                        return;
                    }
                } else {
                    // In DM - warn then block
                    if (spamCheck === 'warn') {
                        await sock.sendMessage(msg.key.remoteJid, { 
                            text: `⚠️ *WARNING:* You are spamming! Please stop or you will be blocked.` 
                        });
                        return;
                    } else if (spamCheck === 'block') {
                        blockedUsers.add(formatPhoneNumber(senderNumber));
                        console.log(`Blocked spammer: ${senderNumber}`);
                        await sock.sendMessage(msg.key.remoteJid, { 
                            text: `🚫 *BLOCKED:* You have been blocked for spamming!` 
                        });
                        return;
                    }
                }
            }
        }

        // If not authorized, ignore silently
        if (!isAuthorized) {
            return;
        }

        // Extract message content
        const messageContent = msg.message.conversation || 
                              msg.message.extendedTextMessage?.text || 
                              msg.message.imageMessage?.caption || 
                              msg.message.videoMessage?.caption || 
                              '';

        console.log(`📩 Message: ${messageContent}`);

        // Parse command - FIXED
        let command = '';
        let args = [];
        
        if (PREFIX) {
            // If prefix is set, check if message starts with prefix
            if (messageContent.startsWith(PREFIX)) {
                const commandText = messageContent.slice(PREFIX.length).trim();
                const commandParts = commandText.split(/\s+/);
                command = commandParts[0].toLowerCase();
                args = commandParts.slice(1);
            } else {
                return; // Not a command
            }
        } else {
            // No prefix - treat first word as command
            const commandParts = messageContent.trim().split(/\s+/);
            command = commandParts[0].toLowerCase();
            args = commandParts.slice(1);
        }

        console.log(`🔧 Command: ${command}, Args: ${args}`);

        // Update time
        botInfo.time = getTime();
        botInfo.date = getDate();

        // Execute command
        let commandExecuted = false;

        if (ownerCommands[command]) {
            await ownerCommands[command](sock, msg, botInfo, sudoUsers, isFromOwner);
            commandExecuted = true;
        } else if (adminCommands[command]) {
            await adminCommands[command](sock, msg, { isFromOwner }, mutedGroups, antiLinkGroups, warnings, args);
            commandExecuted = true;
        } else if (groupCommands[command]) {
            await groupCommands[command](sock, msg);
            commandExecuted = true;
        } else if (generalCommands[command]) {
            await generalCommands[command](sock, msg, botInfo);
            commandExecuted = true;
        } else if (utilityCommands[command]) {
            await utilityCommands[command](sock, msg, botInfo, blockedUsers, args);
            commandExecuted = true;
        } else if (command === 'menu' || command === 'allmenu') {
            await sendMenu(sock, msg, botInfo);
            commandExecuted = true;
        } else if (command === 'help') {
            await sendHelp(sock, msg, botInfo);
            commandExecuted = true;
        }

        if (!commandExecuted) {
            console.log(`❌ Unknown command: ${command}`);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

function checkSpam(senderNumber, chatId) {
    const now = Date.now();
    const key = `${senderNumber}_${chatId}`;
    
    if (!spamTracker.has(key)) {
        spamTracker.set(key, {
            count: 1,
            firstMessage: now,
            warned: false
        });
        return false;
    }
    
    const tracker = spamTracker.get(key);
    
    if (now - tracker.firstMessage > SPAM_TIME_WINDOW) {
        spamTracker.set(key, {
            count: 1,
            firstMessage: now,
            warned: false
        });
        return false;
    }
    
    tracker.count++;
    
    if (tracker.count >= SPAM_THRESHOLD * 2 && tracker.warned) {
        spamTracker.delete(key);
        return chatId.endsWith('@g.us') ? 'remove' : 'block';
    } else if (tracker.count >= SPAM_THRESHOLD && !tracker.warned) {
        tracker.warned = true;
        return chatId.endsWith('@g.us') ? 'remove' : 'warn';
    }
    
    return false;
}

async function sendMenu(sock, msg, botInfo) {
    const prefixDisplay = botInfo.prefix || '(none)';
    const menuText = `┏━━━━ *${botInfo.name} V1* ━━◆\n` +
                    `┃• *Bot : ${botInfo.name} V2*\n` +
                    `┃• *Prefixes : ${prefixDisplay}*\n` +
                    `┃• *Plugins : 25*\n` +
                    `┃• *Version : ${botInfo.version}*\n` +
                    `┃• *Time : ${botInfo.time}*\n` +
                    `┃\n` +
                    `┃━━━━ *OWNER* ━━◆\n` +
                    `┃ ▸ owner\n` +
                    `┃ ▸ settings\n` +
                    `┃ ▸ alwaysonline\n` +
                    `┃ ▸ autostatusview\n` +
                    `┃ ▸ autobio\n` +
                    `┃ ▸ autoread\n` +
                    `┃ ▸ setprefix\n` +
                    `┃ ▸ setstatus\n` +
                    `┃ ▸ block\n` +
                    `┃ ▸ unblock\n` +
                    `┃ ▸ leave\n` +
                    `┃ ▸ antispam\n` +
                    `┃ ▸ sudo\n` +
                    `┃ ▸ addsudo\n` +
                    `┃ ▸ delsudo\n` +
                    `┃━━━━ *ADMIN* ━━◆\n` +
                    `┃ ▸ promote\n` +
                    `┃ ▸ demote\n` +
                    `┃ ▸ kick\n` +
                    `┃ ▸ add\n` +
                    `┃ ▸ remove\n` +
                    `┃ ▸ mute\n` +
                    `┃ ▸ unmute\n` +
                    `┃ ▸ warn\n` +
                    `┃ ▸ antilink\n` +
                    `┃ ▸ clear\n` +
                    `┃━━━━ *GROUP* ━━◆\n` +
                    `┃ ▸ tagall\n` +
                    `┃ ▸ groupinfo\n` +
                    `┃ ▸ admin\n` +
                    `┗━━━━━━━━━━━━━━━┛`;

    try {
        const imagePath = path.join(process.cwd(), 'assets', 'menu.jpg');
        
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: imagePath },
                caption: menuText,
                mimetype: 'image/jpeg'
            });
            console.log('✅ Menu sent with image');
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: menuText });
            console.log('✅ Menu sent without image');
        }
    } catch (error) {
        console.error('❌ Error sending menu:', error);
        await sock.sendMessage(msg.key.remoteJid, { text: menuText });
    }
}

async function sendHelp(sock, msg, botInfo) {
    const helpText = `🤖 *${botInfo.name.toUpperCase()} HELP*\n\n` +
                    `📌 *Available Commands:*\n\n` +
                    `👑 *Owner Commands:*\n` +
                    `• owner - Show bot owner\n` +
                    `• settings - Bot settings\n` +
                    `• alwaysonline - Keep bot online\n` +
                    `• autostatusview - Auto view statuses\n` +
                    `• autobio - Auto update bio\n` +
                    `• autoread - Auto read messages\n` +
                    `• setprefix - Change command prefix\n` +
                    `• setstatus - Set bot status\n` +
                    `• block - Block user\n` +
                    `• unblock - Unblock user\n` +
                    `• leave - Leave group\n` +
                    `• antispam - Toggle anti-spam\n` +
                    `• sudo - List sudo users\n` +
                    `• addsudo - Add sudo user\n` +
                    `• delsudo - Remove sudo user\n\n` +
                    `👮 *Admin Commands:*\n` +
                    `• promote - Promote member\n` +
                    `• demote - Demote admin\n` +
                    `• kick - Remove member\n` +
                    `• add - Add member\n` +
                    `• remove - Remove member\n` +
                    `• mute - Mute group\n` +
                    `• unmute - Unmute group\n` +
                    `• warn - Warn member\n` +
                    `• antilink - Toggle anti-link\n` +
                    `• clear - Clear your chat history\n\n` +
                    `👥 *Group Commands:*\n` +
                    `• tagall - Tag all members\n` +
                    `• groupinfo - Group information\n` +
                    `• admin - Admin list\n\n` +
                    `📋 *Other:*\n` +
                    `• menu - Show menu\n` +
                    `• allmenu - Show all commands\n` +
                    `• help - Show this help`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: helpText });
}

console.log('🤖 Starting WhatsApp Bot...');
console.log(`👑 Owner number: ${OWNER_NUMBER}`);
console.log(`🤖 Bot Name: ${BOT_NAME}`);
console.log(`📌 Prefix: ${PREFIX || 'None (just type command)'}`);

if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
    console.log('📁 Created "assets" folder for menu image');
}

connectToWhatsApp();