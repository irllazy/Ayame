echo "# 🤖 Ayame WhatsApp Bot

A powerful WhatsApp bot with owner-only controls, group management, and advanced features.

## ✨ Features

### 👑 Owner Commands
- owner - Show bot owner
- settings - View bot settings
- alwaysonline - Keep bot online
- autostatusview - Auto view statuses
- autobio - Auto update bio
- autoread dm - Auto read DMs
- autoread group - Auto read groups
- setprefix [prefix] - Change prefix
- setstatus [text] - Set bot status
- afk [reason] - Set AFK mode
- block @user - Block user
- unblock @user - Unblock user
- leave - Leave group
- antispam - Toggle anti-spam
- sudo - List sudo users
- addsudo @user - Add sudo user
- delsudo @user - Remove sudo user

### 👮 Admin Commands
- promote @user - Promote to admin
- demote @user - Demote admin
- kick @user - Kick member
- add [number] - Add member
- remove @user - Remove member
- ban @user - Ban member
- unban @user - Unban member
- banned - List banned users
- mute - Mute group
- unmute - Unmute group
- warn @user - Warn member
- antilink - Toggle anti-link
- clear - Clear chat history

### 👥 Group Commands
- tagall - Tag all members
- groupinfo - Group information
- admin - List admins

## 🚀 Installation

1. Clone the repo:
\`\`\`bash
git clone https://github.com/irllazy/Ayame.git
cd Ayame
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the bot:
\`\`\`bash
npm start
\`\`\`

## 📱 Usage

Default prefix is empty:
\`\`\`
menu
help
afk Sleeping
\`\`\`

Set prefix:
\`\`\`
setprefix .
.menu
\`\`\`

## ⚙️ Configuration

Edit bot.js to change:
- OWNER_NUMBER - Your WhatsApp number
- BOT_NAME - Bot name (default: Ayame)
- PREFIX - Command prefix

## ⚠️ Important Notes

- Don't share your auth_info folder
- Bot only responds to owner and sudo users
- Anti-spam warns then blocks in DMs
- Banned users are removed when they message

## 👑 Owner

- GitHub: [irllazy](https://github.com/irllazy)

---
Made with ❤️ by irllazy" > README.md
