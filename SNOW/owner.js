import config from '../config.js';
import fs from 'fs-extra';

export default {
  name: 'owner',
  category: 'General',
  execute: async (sock, msg) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    // Charger la liste des SUDO depuis lib/sudo.json
    let sudoList = [];
    if (await fs.exists('./lib/sudo.json')) {
      sudoList = JSON.parse(await fs.readFile('./lib/sudo.json'));
    }

    // Vérifier si l'utilisateur est OWNER ou SUDO
    if (sender !== config.OWNER_NUMBER && !sudoList.includes(sender)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *Commande réservée au propriétaire et aux sudo.*' });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      text: `🌟 *OWNER DETAILS*

👤 *Name:* ${config.OWNER_NAME}
📱 *Number:* wa.me/${config.OWNER_NUMBER}
🔗 *Channel:* ${config.CHANNEL_URL}

───────────────
🤖 *SNOW-MD BOT*`
    });
  }
};
