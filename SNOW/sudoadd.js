import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudoadd',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    // Normalize function
    const normalize = num => num.replace(/[^0-9]/g, '');
    const senderNormalized = normalize(sender);
    const ownerNormalized = normalize(config.OWNER_NUMBER);
    const botNumber = normalize(sock.user.id.split(':')[0]);

    // Load sudo list
    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    // Check OWNER, SUDO or BOT itself
    if (
      senderNormalized !== ownerNormalized &&
      !sudoList.includes(senderNormalized) &&
      senderNormalized !== botNumber
    ) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Access denied. Owner, Sudo, or Bot only.*' });
    }

    // Get number to add
    let numberToAdd = null;
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      numberToAdd = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      numberToAdd = msg.message.extendedTextMessage.contextInfo.participant?.split('@')[0];
    } else if (args.length > 0) {
      numberToAdd = args[0].replace(/[^0-9]/g, '');
    }

    if (!numberToAdd) {
      return sock.sendMessage(msg.key.remoteJid, { text: '📝 *Usage:* Reply to a message or type !sudoadd 123456789' });
    }

    if (sudoList.includes(numberToAdd)) {
      return sock.sendMessage(msg.key.remoteJid, { text: `✅ *${numberToAdd} is already a sudo user.*` });
    }

    sudoList.push(numberToAdd);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ *${numberToAdd} added as sudo.*` });
  }
};
