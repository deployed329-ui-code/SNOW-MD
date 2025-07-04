export default {
  name: 'ping',
  category: 'General',
  execute: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `╔══════════════
║ 🏓 *PONG!*
╠══════════════
║ ✅ SNOW-MD is online and responding!
║ 🚀 Fast and reliable as the North Wind ❄️
╚══════════════`
    });
  }
};
