cat > README.md << 'EOF'
# 🤖 Ayame WhatsApp Bot

A powerful WhatsApp bot with owner-only controls, group management, and advanced features.

## ✨ Features

### 👑 Owner Commands
- `owner` - Show bot owner
- `settings` - View bot settings
- `alwaysonline` - Keep bot online
- `autostatusview` - Auto view statuses
- `autobio` - Auto update bio
- `autoread dm` - Auto read DMs
- `autoread group` - Auto read groups
- `setprefix [prefix]` - Change prefix (use `none` to remove)
- `setstatus [text]` - Set bot status
- `afk [reason]` - Set AFK mode
- `block @user` - Block user
- `unblock @user` - Unblock user
- `leave` - Leave group
- `antispam` - Toggle anti-spam
- `sudo` - List sudo users
- `addsudo @user` - Add sudo user
- `delsudo @user` - Remove sudo user

### 👮 Admin Commands
- `promote @user` - Promote to admin
- `demote @user` - Demote admin
- `kick @user` - Kick member
- `add [number]` - Add member
- `remove @user` - Remove member
- `ban @user` - Ban member (removed when they message)
- `unban @user` - Unban member
- `banned` - List banned users
- `mute` - Mute group
- `unmute` - Unmute group
- `warn @user` - Warn member
- `antilink` - Toggle anti-link
- `clear` - Clear chat history

### 👥 Group Commands
- `tagall` - Tag all members
- `groupinfo` - Group information
- `admin` - List admins

### 📋 Other
- `menu` - Show menu
- `help` - Show help
- `allmenu` - Show all commands

## 🚀 Installation

1. **Clone the repo:**
```bash
git clone https://github.com/irllazy/Ayame.git
cd Ayame
