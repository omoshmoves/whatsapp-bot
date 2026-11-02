const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Set to false if you want to see the browser window
        executablePath: process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
            : '/usr/bin/chromium-browser',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THIS QR CODE ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Success! Your WhatsApp bot is online.');
    
    // Activate the background status loop after a brief 5s warmup delay
    setTimeout(() => {
        startStatusViewerLoop();
    }, 5000);
});

// Message Handler with Instant Group Filter and Keyword Triggers
client.on('message', async (msg) => {
    console.log('📥 Incoming message detected:', msg.body);

    try {
        // Instantly ignore group chats using msg.from (no async delay or failure)
        if (msg.from && msg.from.endsWith('@g.us')) return;

        const text = msg.body ? msg.body.toLowerCase().trim() : '';
        if (!text) return;

        // --- Static Command & Keyword Triggers ---
        if (text === 'hello' || text === 'hi' || text === 'hey') {
            await msg.reply("Hey there! 👋 How's everything going?");
        }
        else if (text === 'how are you' || text === 'how do you do') {
            await msg.reply("I'm doing awesome, how about you?");
        }
        else if (text === 'thank you' || text === 'thanks') {
            await msg.reply("You're welcome! 😊");  
        }
        else if (text === 'goodbye' || text === 'bye') {
            await msg.reply("See you later! 👋");
        }
        else if (text === 'hey sasa' || text === 'sasa') {
            await msg.reply("Poa sana");
        }
        else if (text === 'mzee' || text === 'omera' || text === 'oya') {
            await msg.reply("Nichapie");
        }   
        else if (text === 'what is your name' || text === 'who are you'){ 
            await msg.reply("I'm Patrick's assistant!");
        }
        else if (text === 'niaje' || text === 'mambo') {
            await msg.reply("Poa sana");
        }
        else if (text === 'ok' || text === 'sawa' || text === 'okay'){
            await msg.reply("👍");
        }
        else if (text === 'help' || text === 'what can you do') {
            await msg.reply("I'm Patrick's assistant! You can use: *'send message to <number> <message>'*.");
        }
        else if (text.startsWith('send message to ') || text.startsWith('send text to ') || text.startsWith('text ')) {
            const parts = msg.body.trim().split(' ');
            
            let targetNumber, messageBody;
            if (text.startsWith('text ')) {
                targetNumber = parts[1];
                messageBody = parts.slice(2).join(' ');
            } else {
                targetNumber = parts[3];
                messageBody = parts.slice(4).join(' ');
            }

            if (!targetNumber || !messageBody) {
                await msg.reply("Oops! To send a message, try phrasing it like: *'send message to <phone_number> <your message>'*");
                return;
            }

            const chatId = `${targetNumber}@c.us`;
            try {
                await client.sendMessage(chatId, messageBody);
                await msg.reply(`Done! 👍 I've sent that message off to ${targetNumber}.`);
            } catch (error) {
                console.error('Failed to send message:', error);
                await msg.reply("Hmm, I couldn't send that message. Double-check if the phone number is correct.");
            }
        }
    } catch (err) {
        console.error('Error handling message event:', err);
    }
});

/**
 * Background loop that periodically interacts with the WhatsApp Web UI 
 * to find and view unread status updates automatically.
 */
function startStatusViewerLoop() {
    console.log('👀 Status automation loop activated (checking every 15 seconds)...');

    setInterval(async () => {
        try {
            const page = client.pupPage;
            if (!page) return;

            const statusButtonClicked = await page.evaluate(() => {
                const selectors = [
                    'span[data-icon="status-v3"]',
                    'span[data-icon="status"]',
                    'button[aria-label="Status"]',
                    'div[title="Status"]',
                    'span[data-icon="refresh"]'
                ];
                
                let btn = null;
                for (const sel of selectors) {
                    btn = document.querySelector(sel);
                    if (btn) break;
                }

                if (btn) {
                    let clickable = btn.closest('div[role="button"]') || btn.closest('button') || btn;
                    clickable.click();
                    return true;
                }
                return false;
            });

            if (statusButtonClicked) {
                await new Promise(resolve => setTimeout(resolve, 2500));

                await page.evaluate(() => {
                    const items = document.querySelectorAll('div[data-testid="cell-frame-container"], div[role="listitem"]');
                    items.forEach(item => {
                        const unreadIndicator = item.querySelector('canvas') || item.querySelector('span[aria-label*="Unread"]');
                        if (unreadIndicator) {
                            item.click();
                        }
                    });
                });

                console.log('[Status Loop] Checked and processed unread statuses.');
            }
        } catch (err) {
            // Silently ignore background loop navigation errors
        }
    }, 15000);
}

client.initialize();