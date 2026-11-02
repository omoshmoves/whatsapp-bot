# WhatsApp Personal Bot

An automated, 24/7 autonomous WhatsApp bot built using Node.js and `whatsapp-web.js`. It features custom keyword matching, direct contact text forwarding, session persistence, and background status viewing.

## Features

- **Keyword Matching**: Automatically responds to direct individual chat triggers (`hi`, `sasa`, `help`, etc.).
- **Text Forwarding**: Relay direct messages using the command structure: `send message to <number> <message>` or `text <number> <message>`.
- **Group Filtering**: Ignores group chats to focus entirely on direct 1-on-1 messaging.
- **Auto Status Viewer**: Periodically scans and auto-views unread WhatsApp status updates.
- **Session Persistence**: Utilizes `LocalAuth` to avoid scanning QR codes on every restart.
- **Headless Execution**: Configured for lightweight background deployment using Puppeteer and PM2.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Library**: `whatsapp-web.js`
- **Automation**: Puppeteer (Headless Chrome/Chromium)
- **Process Manager**: PM2

## Project Structure

```text
├── index.js             # Core bot logic and event handlers
├── package.json         # Dependencies and scripts
├── .gitignore           # Excludes session files and dependencies
└── README.md            # Project documentation
