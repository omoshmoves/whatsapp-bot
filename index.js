const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THIS QR CODE ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Success! Your WhatsApp bot is online and actively monitoring statuses.');
    
    // Activate the background status loop
    startStatusViewerLoop();
});

// Human-like Conversational Message Handler (Strict Triggers Only)
client.on('message', async (msg) => {
    const text = msg.body.toLowerCase().trim();

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
            await msg.reply(`Done! 👍 I've sent that message off to ${targetNumber}.`);
        } catch (error) {
            console.error('Failed to send message:', error);
            await msg.reply("Hmm, I couldn't send that message. Double-check if the phone number is correct.");
        }
    }
    // Any other random message from contacts will now be completely ignored.
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

            // Look for the Status icon button on WhatsApp Web interface and click it
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
                // Give it a brief second to open the status list pane
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Now look for unread status items in the list and click them
                await page.evaluate(() => {
                    const statusRows = document.querySelectorAll('div[data-testid="cell-frame-container"]');
                    statusRows.forEach(row => {
                        const unreadRing = row.querySelector('canvas') || row.querySelector('.unread-count');
                        if (unreadRing) {
                            row.click();
                        }
                    });
                });

                console.log('[Status Loop] Checked and cleared unread statuses.');
            }
        } catch (err) {
            // Silently catch background navigation errors so the bot doesn't crash
        }
    }, 15000); // Runs every 15 seconds
}

client.initialize();