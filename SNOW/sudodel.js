import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudodel',
  category: 'Sudo',
  execute: async (sock, msg, args) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    const normalize = num => num.replace(/[^0-9]/g, '');
    const senderNormalized = normalize(sender);
    const ownerNormalized = normalize(config.OWNER_NUMBER);
    const botNumber = normalize(sock.user.id.split(':')[0]);

    let sudoList = [];
    if (fs.existsSync(sudoFile)) {
      sudoList = JSON.parse(await fs.readFile(sudoFile));
    }

    if (
      senderNormalized !== ownerNormalized &&
      !sudoList.includes(senderNormalized) &&
      senderNormalized !== botNumber
    ) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Access denied. Owner, Sudo, or Bot only.*' });
    }

    let numberToDel = null;

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      numberToDel = msg.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      numberToDel = msg.message.extendedTextMessage.contextInfo.participant?.split('@')[0];
    } else if (args.length > 0) {
      numberToDel = args[0].replace(/[^0-9]/g, '');
    }

    if (!numberToDel) {
      return sock.sendMessage(msg.key.remoteJid, { text: '📝 *Usage:* Reply to a message or type !sudodel 123456789' });
    }

    if (!sudoList.includes(numberToDel)) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ *${numberToDel} is not in the sudo list.*` });
    }

    sudoList = sudoList.filter(num => num !== numberToDel);
    await fs.writeFile(sudoFile, JSON.stringify(sudoList, null, 2));
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ *${numberToDel} removed from sudo.*` });
  }
};
