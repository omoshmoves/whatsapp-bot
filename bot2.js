const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    // Unique clientId prevents session file-locking conflicts with Bot 1
    authStrategy: new LocalAuth({ clientId: 'bot-two' }),
    puppeteer: {
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THIS QR CODE FOR BOT 2 ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Success! Bot 2 is online and actively monitoring statuses.');
    
    // Activate the background status-viewing loop for Bot 2
    startStatusViewerLoop();
});

// Human-like Conversational Message Handler for Bot 2
client.on('message', async (msg) => {
    const text = msg.body.toLowerCase().trim();

    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        await msg.reply("Hey there! 👋 How's everything going with Bot 2?");
    }
    else if (text.includes('how are you') || text.includes('how do you do')) {
        await msg.reply("I'm doing awesome, how about you?");
    }
    else if (text.includes('thank you') || text.includes('thanks')) {
        await msg.reply("You're welcome! 😊");  
    }
    else if (text.includes('goodbye') || text.includes('bye')) {
        await msg.reply("See you later! 👋");
    }
    else if (text.includes('hey sasa') || text.includes('sasa')) {
        await msg.reply("Poa sana");
    }
    else if (text.includes('mzee') || text.includes('omera') || text.includes('oya')) {
        await msg.reply("Nichapie");
    }   
    else if (text.includes('what is your name') || text.includes('who are you')){ 
        await msg.reply("I'm Patrick's second assistant!");
    }
    else if (text.includes('niaje') || text.includes('mambo')) {
        await msg.reply("Poa sana");
    }
    else if (text.includes('help') || text.includes('what can you do')) {
        await msg.reply("I'm Patrick's assistant! You can ask me to send text messages by saying something like: *'send message to 1234567890 hello there'*.");
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
            await msg.reply(`Done! 👍 I've sent that message off to ${targetNumber} via Bot 2.`);
        } catch (error) {
            console.error('Failed to send message:', error);
            await msg.reply("Hmm, I couldn't send that message. Double-check if the phone number is correct.");
        }
    }
});

/**
 * Background loop that periodically interacts with the WhatsApp Web UI 
 * to find and view unread status updates automatically for Bot 2.
 */
function startStatusViewerLoop() {
    console.log('👀 [Bot 2] Status automation loop activated (checking every 15 seconds)...');

    setInterval(async () => {
        try {
            const page = client.pupPage;
            if (!page) return;

            const statusButtonClicked = await page.evaluate(() => {
                const selectors = [
                    'span[data-icon="status-v3"]',
                    'button[aria-label="Status"]',
                    'span[data-icon="status"]'
                ];
                
                let btn = null;
                for (const sel of selectors) {
                    btn = document.querySelector(sel);
                    if (btn) break;
                }

                if (btn) {
                    let clickable = btn.closest('div[role="button"]') || btn;
                    clickable.click();
                    return true;
                }
                return false;
            });

            if (statusButtonClicked) {
                await new Promise(resolve => setTimeout(resolve, 2000));

                await page.evaluate(() => {
                    const statusRows = document.querySelectorAll('div[data-testid="cell-frame-container"]');
                    statusRows.forEach(row => {
                        const unreadRing = row.querySelector('canvas') || row.querySelector('.unread-count');
                        if (unreadRing) {
                            row.click();
                        }
                    });
                });

                console.log('[Bot 2 Status Loop] Checked and cleared unread statuses.');
            }
        } catch (err) {
            // Silently catch background navigation errors so the bot doesn't crash
        }
    }, 15000); // Runs every 15 seconds
}

client.initialize();
client.on('qr', (qr) => {
    console.log('--- SCAN QR CODE FOR BOT 2 ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot 2 is online and ready!');
});

// Add your message handlers or status automation for Bot 2 here...

client.initialize();