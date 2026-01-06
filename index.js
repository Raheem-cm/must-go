const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const config = require("./config");

// Hifadhi ya muda ya message
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

async function startDragonXR() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["DRAGON-XR", "Chrome", "1.0.0"]
    });

    store.bind(client.ev);

    client.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log("Session imeisha, tafadhali skani upya.");
            } else {
                startDragonXR(); // Ikiwa imekatika kwa sababu nyingine, iwashe tena
            }
        } else if (connection === "open") {
            console.log("✅ DRAGON-XR IMEUNGANISHWA!");
            client.sendMessage(config.ownerNumber + "@s.whatsapp.net", { 
                text: `DRAGON-XR IKO ONLINE!\n\nOwner: ${config.ownerNumber}\nRepo: ${config.repoUrl}` 
            });
        }
    });

    client.ev.on("creds.update", saveCreds);

    // Sehemu ya kupokea meseji
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
            
            // Hapa bot itasoma amri zako za baadae
            if (body === "ping") {
                await client.sendMessage(from, { text: "PONG! DRAGON-XR IKO ACTIVE 🐉" });
            }
        } catch (err) {
            console.log(err);
        }
    });
}

startDragonXR();
