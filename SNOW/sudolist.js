import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'sudolist',
  category: 'Sudo',
  execute: async (sock, msg) => {
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

    if (sudoList.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *No sudo users found.*' });
    }

    let listText = `╔════════════════════\n║ 👑 *SUDO USERS LIST*\n╠════════════════════\n`;
    sudoList.forEach((num, i) => {
      listText += `║ ${i + 1}. wa.me/${num}\n`;
    });
    listText += '╚════════════════════';

    await sock.sendMessage(msg.key.remoteJid, { text: listText });
  }
};
