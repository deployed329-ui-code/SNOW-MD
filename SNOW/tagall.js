export default {
  name: 'tagall',
  category: 'Group',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '🚫 *This command can only be used in groups.*' });
    }

    const metadata = await sock.groupMetadata(jid);
    const groupName = metadata.subject;
    const groupMembers = metadata.participants;
    const memberCount = groupMembers.length;

    const senderId = msg.key.participant || msg.key.remoteJid;
    const sender = metadata.participants.find(p => p.id === senderId);

    const adminName = sender?.notify || sender?.id.split('@')[0];
    const creatorJid = metadata.owner;
    const creatorName = creatorJid ? creatorJid.split('@')[0] : 'Unavailable';

    const mentions = groupMembers.map(p => p.id);

    // Chaque mention sur une ligne séparée
    const mentionText = mentions.map(m => `@${m.split('@')[0]}`).join('\n');

    await sock.sendMessage(jid, {
      text: `╔══════════════
║ 👥 *GROUP TAGALL*
╠══════════════
║ 📛 Group Name: *${groupName}*
║ 👤 Members: *${memberCount}*
║ 🛡️ Admin: *${adminName}*
║ 👑 Creator: *${creatorName}*
╠══════════════
${mentionText}
╚══════════════`,
      mentions
    });
  }
};
