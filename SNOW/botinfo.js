import config from '../config.js';

export default {
  name: 'botinfo',
  category: 'General',
  execute: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `
╔══════════════════
║ 🤖 *SNOW-MD BOT INFO*
╠══════════════════
║ 👤 Owner: ${config.OWNER_NAME}
║ 📞 Number: ${config.OWNER_NUMBER}
║ 🔗 Channel: ${config.CHANNEL_URL}
╚══════════════════
      `.trim()
    });
  }
};
