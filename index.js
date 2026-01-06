const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

console.log('🐉 DRAGON-XR Bot inaanza...');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });
    
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'open') {
            console.log('✅ Bot imeunganishwa!');
            console.log('📱 Owner: 255760003443');
            console.log('📢 Newsletter: 120363399470975987@newsletter');
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Handle messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        
        if (!msg.message) return;
        
        const text = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || '';
        
        const sender = msg.key.remoteJid;
        const botName = "DRAGON-XR";
        
        console.log(`📩 Message from ${sender}: ${text}`);
        
        // Simple commands
        if (text.toLowerCase() === '.ping') {
            await sock.sendMessage(sender, { 
                text: `🏓 Pong! ${botName} is alive!` 
            });
        }
        
        if (text.toLowerCase() === '.menu') {
            const menu = `
╔═══════════════════════╗
       🐉 ${botName}
╚═══════════════════════╝
📌 *Commands:*
• .ping - Check bot status
• .owner - Contact owner
• .news - Join newsletter
• .channel - Official channel

📞 Owner: 255760003443
            `;
            
            await sock.sendMessage(sender, { text: menu });
        }
    });
}

startBot().catch(console.error);
