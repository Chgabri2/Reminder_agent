const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fetch = require('node-fetch');
require('dotenv').config();

// מספר הטלפון שלך בפורמט של WhatsApp (ללא + או -)
const YOUR_NUMBER = process.env.YOUR_WHATSAPP_NUMBER; // דוגמה: "972501234567@s.whatsapp.net"

class WhatsAppCalendarBot {
    constructor() {
        this.sock = null;
    }

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: P({ level: 'silent' }),
            browser: ['Calendar Bot', 'Chrome', '1.0.0']
        });

        // שמירת credentials
        this.sock.ev.on('creds.update', saveCreds);

        // טיפול בחיבור
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n📱 סרוק את הקוד QR עם WhatsApp שלך:\n');
                qrcode.generate(qr, { small: true });
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
                    lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut;
                
                console.log('❌ החיבור נסגר:', lastDisconnect?.error);
                
                if (shouldReconnect) {
                    console.log('🔄 מתחבר מחדש...');
                    setTimeout(() => this.start(), 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ מחובר לוואטסאפ בהצלחה!');
                this.setupScheduler();
            }
        });

        // טיפול בהודעות נכנסות (אופציונלי - לדוגמה)
        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.key.fromMe && msg.message?.conversation) {
                const from = msg.key.remoteJid;
                const text = msg.message.conversation;
                
                console.log(`📩 הודעה מ-${from}: ${text}`);
                
                // דוגמה: אם שולחים "תזכורת" - שולח תזכורת מיידית
                if (text.toLowerCase().includes('תזכורת')) {
                    await this.sendDailyReminder();
                }
            }
        });
    }

    async sendDailyReminder() {
        try {
            console.log('🔍 מבקש תזכורות מהשירות...');
            
            // קריאה לשירות Python
            const response = await fetch('http://localhost:5000/get-reminder');
            const data = await response.json();
            
            if (data.has_events && data.message) {
                console.log('📤 שולח תזכורת...');
                
                await this.sock.sendMessage(YOUR_NUMBER, {
                    text: data.message
                });
                
                console.log('✅ תזכורת נשלחה בהצלחה!');
            } else {
                console.log('ℹ️ אין אירועים להיום');
            }
        } catch (error) {
            console.error('❌ שגיאה בשליחת תזכורת:', error);
        }
    }

    setupScheduler() {
        console.log('⏰ מגדיר תזמון יומי לשעה 08:00');
        
        // תזמון יומי ב-08:00
        cron.schedule('0 8 * * *', async () => {
            console.log(`\n🔔 ${new Date().toLocaleString('he-IL')} - מפעיל תזכורת יומית`);
            await this.sendDailyReminder();
        });

        // הרצה מיידית לבדיקה (אופציונלי - הסר את ההערה כדי לבדוק)
        // setTimeout(() => this.sendDailyReminder(), 5000);
    }
}

// הפעלת הבוט
const bot = new WhatsAppCalendarBot();
bot.start().catch(console.error);
