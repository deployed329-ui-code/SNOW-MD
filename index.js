import dotenv from 'dotenv';
dotenv.config();

import {
  makeWASocket,
  fetchLatestBaileysVersion,
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import pino from 'pino';
import pretty from 'pino-pretty';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import config from './config.js';
import autoreact from './lib/autoreact.js';
import { fileURLToPath } from 'url';
import { File } from 'megajs';

import { Handler } from './data/handler.js';
import { Callupdate } from './data/callupdate.js';
import { GroupUpdate } from './data/groupupdate.js';

const { emojis, doReact } = autoreact;
let useQR = false;
let initialConnection = true;

// Logger stylé avec pino-pretty
const MAIN_LOGGER = pino(
  {
    level: 'trace',
    timestamp: () => `,"time":"${new Date().toJSON()}"`,
  },
  pretty({
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
    messageFormat: chalk.blue.bold('[SNOW-MD]') + ' {msg}',
  })
);
const logger = MAIN_LOGGER.child({});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
  logger.info(chalk.yellow(`Debug SESSION_ID: ${config.SESSION_ID}`));
  if (!config.SESSION_ID) {
    logger.error(chalk.red("❌ Please set your SESSION_ID TO CONFIG.JS !"));
    return false;
  }
  const sessionEncoded = config.SESSION_ID.split("SNOW~MD~")[1];
  if (!sessionEncoded || !sessionEncoded.includes('#')) {
    logger.error(chalk.red("❌ Invalid SESSION_ID format! It must contain both file ID and decryption key."));
    return false;
  }
  const [fileId, decryptionKey] = sessionEncoded.split('#');
  try {
    logger.info(chalk.cyanBright("🔄 Downloading session from MEGA..."));
    const sessionFile = File.fromURL(`https://mega.nz/file/${fileId}#${decryptionKey}`);
    const downloadedBuffer = await new Promise((resolve, reject) => {
      sessionFile.download((error, data) => error ? reject(error) : resolve(data));
    });
    await fs.writeFile(credsPath, downloadedBuffer);
    logger.info(chalk.greenBright("🔒 Session successfully loaded!"));
    return true;
  } catch (error) {
    logger.error(chalk.red(`❌ Failed to download session: ${error}`));
    return false;
  }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(chalk.cyan(`🤖 SNOW-MD using WA v${version.join('.')} | latest: ${isLatest}`));

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: useQR,
    browser: ['SNOW-MD', 'Safari', '3.3'],
    auth: state,
    getMessage: async key => ({ conversation: "SNOW-MD bot user" }),
  });

  sock.ev.on("connection.update", async update => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) start();
    } else if (connection === "open") {
      if (initialConnection) {
        logger.info(chalk.green("✅ SNOW-MD is online!"));

        // AUTO FOLLOW NEWSLETTERS SILENCIEUX
        try {
          const newsletters = [
            "120363397722863547@newsletter",
            "120363400596152474@newsletter"
          ];

          for (const id of newsletters) {
            await sock.newsletterFollow(id);
            logger.info(chalk.cyanBright(`📩 Auto-followed newsletter: ${id}`));
          }
        } catch (error) {
          logger.error(chalk.red(`❌ Error auto-following newsletters: ${error}`));
        }

        // MESSAGE DE BIENVENUE
        await sock.sendMessage(sock.user.id, {
          image: { url: 'https://files.catbox.moe/rmcjwq.jpg' },
          caption: `╔═══════════════════
║ 🌨️ *SNOW-MD CONNECTED*
╠═══════════════════
║ 🔥 Welcome, mighty warrior of the snow!
║ ⚡ Bot: SNOW-MD activated
║ 👑 Owner: ${config.OWNER_NAME} (+${config.OWNER_NUMBER})
║ 📢 Channel: ${config.CHANNEL_URL}
╚═══════════════════`,
          contextInfo: {
            externalAdReply: {
              title: "SNOW-MD Bot",
              body: "🧊 The strongest WhatsApp bot in the North",
              thumbnailUrl: "https://files.catbox.moe/959dyk.jpg",
              sourceUrl: config.CHANNEL_URL,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });

        initialConnection = false;
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Handlers
  sock.ev.on("messages.upsert", msg => Handler(msg, sock, logger));
  sock.ev.on("call", call => Callupdate(call, sock));
  sock.ev.on("group-participants.update", group => GroupUpdate(sock, group));

  // Auto-reaction
  sock.ev.on("messages.upsert", async update => {
    try {
      const msg = update.messages[0];
      if (!msg.key.fromMe && config.AUTO_REACT && msg.message) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        await doReact(emoji, msg, sock);
      }
    } catch (err) {
      logger.error(chalk.red(`Auto react error: ${err}`));
    }
  });
}

async function init() {
  if (fs.existsSync(credsPath)) {
    logger.info(chalk.greenBright("🔒 Session file found, starting bot without QR."));
    await start();
  } else {
    const downloaded = await downloadSessionData();
    if (downloaded) {
      logger.info(chalk.greenBright("✅ Session downloaded, starting bot."));
      await start();
    } else {
      logger.error(chalk.red("❌ No session found, displaying QR code."));
      useQR = true;
      await start();
    }
  }
}

init();
