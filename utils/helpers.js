// Helper functions
export function formatPhoneNumber(number) {
    let cleaned = number.replace(/\D/g, '');
    cleaned = cleaned.replace(/^0+/, '');
    return cleaned;
}

export function isOwner(number, ownerNumber) {
    const formattedNumber = formatPhoneNumber(number);
    const formattedOwner = formatPhoneNumber(ownerNumber);
    return formattedNumber === formattedOwner || 
           formattedNumber.includes(formattedOwner) || 
           formattedOwner.includes(formattedNumber) ||
           formattedNumber.endsWith(formattedOwner) ||
           formattedOwner.endsWith(formattedNumber);
}

export function getSenderNumber(msg, ownerNumber) {
    if (msg.key.fromMe) {
        return formatPhoneNumber(ownerNumber);
    }
    if (msg.key.remoteJid && !msg.key.remoteJid.includes('@g.us') && !msg.key.remoteJid.includes('@broadcast')) {
        return msg.key.remoteJid.split('@')[0];
    }
    if (msg.key.participant) {
        return msg.key.participant.split('@')[0];
    }
    return '';
}

export function getTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

export function getDate() {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}