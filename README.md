⚡ 5AFFUL V6
A WhatsApp bot for running groups and chats: group protection, welcome messages, games, stickers, downloads and more.

Send .menu to see every command.

⚠️ WhatsApp does not officially allow bots, and a bot number can be banned. Use a spare number, never your main one.

1. Pair your number
Open the pairing site:

https://fiveafful-pair.onrender.com

In WhatsApp on the bot's phone: Linked devices → Link a device. If the pairing code is not accepted, use the QR code option.

The site then gives you a session ID that looks like TFX-K7M2-9QXA-4BNP. It works once and expires after 5 minutes, so paste it and start the bot right away. If it expired, link again and use the new ID. The site runs on a free host, so the first visit can take up to a minute.

2. Start with index.js
Create a server or panel with Node.js 20 or newer.
Upload index.js to the main folder.
Paste your session ID in the SESSION_IDS block near the top of index.js:
const SESSION_IDS = `
TFX-K7M2-9QXA-4BNP
`;
A second number goes on a new line with a name: shop=TFX-AB2C-DE3F-GH4J.
Start the server. The normal start command node index.js already works, so nothing has to be changed in the panel.
On the first run index.js downloads the bot, installs the packages and starts it. This can take a few minutes.
The IDs you pasted are copied into session_id.txt automatically; IDs already in the file are kept and only the missing ones are added.

Without the SESSION_IDS block: leave it empty, start once, then paste SESSION_ID=TFX-... into session_id.txt, save, and restart.

Commands
Command	What it does
node index.js	Install on the first run, then start the bot
node index.js --update	Download the newest version and start; keeps session/, data/, accounts/, session_id.txt and the settings file
BOT_NO_START=1 node index.js	Install only, do not start
After the first successful start the bot keeps its login, so the session ID is not needed again. Never share your session ID or pairing code. Updates can also be installed in chat with .update now (owner only).

Hosting guides
5AFFUL V6 is plain Node.js 20 or newer. It runs on a phone (Termux), a VPS, Docker, a hosting panel, or a normal computer: run npm install once, paste the session ID in session_id.txt, then npm start. Keep it alive with pm2, systemd or Docker's restart: unless-stopped.

Links
✈️ Telegram: https://t.me/saf_ful
💻 Source and releases: https://github.com/godfada-sa/5AFFUL-BOT-V6
5AFFUL V6 is made by s_afful. Released under the MIT license.
