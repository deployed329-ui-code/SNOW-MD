export default {
  name: 'tag',
  category: 'Group',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '*This command can only be used in groups.*' });
    }

    if (args.length === 0) {
      return sock.sendMessage(jid, { text: '*Usage:* !tag 123456789 [your message]' });
    }

    const targetNumber = args[0].replace(/[^0-9]/g, '');
    const mentionJid = `${targetNumber}@s.whatsapp.net`;
    const customText = args.slice(1).join(' ') || `@${targetNumber}`;

    await sock.sendMessage(jid, {
      text: customText,
      mentions: [mentionJid]
    });
  }
};
