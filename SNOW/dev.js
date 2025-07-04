export default {
  name: 'dev',
  category: 'General',
  execute: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: 'https://files.catbox.moe/rmcjwq.jpg' },
      caption: `
╔═══════════════════
║ 👨‍💻 *DEVELOPER INFO*
╠═══════════════════
║ *Name:* JON SNOW
║ *Number:* wa.me/50949100359
║ *Bot:* SNOW-MD
║ *Thanks:* INCONNU BOY
╚════════════════════`,
    });
  }
};
