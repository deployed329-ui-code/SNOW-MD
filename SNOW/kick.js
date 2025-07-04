export default {
  name: 'kick',
  category: 'Group',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    // Vérifie reply
    if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      const participant = msg.message.extendedTextMessage.contextInfo.participant;
      await sock.groupParticipantsUpdate(from, [participant], 'remove');
      return sock.sendMessage(from, { text: `🚫 *L'utilisateur mentionné a été expulsé.*` });
    }

    // Vérifie tag
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      const targets = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      for (const target of targets) {
        await sock.groupParticipantsUpdate(from, [target], 'remove');
      }
      return sock.sendMessage(from, { text: `🚫 *Utilisateur(s) mentionné(s) expulsé(s).*` });
    }

    // Vérifie argument direct (ex: .kick 22990001111)
    if (args.length > 0) {
      const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      await sock.groupParticipantsUpdate(from, [number], 'remove');
      return sock.sendMessage(from, { text: `🚫 *${args[0]} a été expulsé.*` });
    }

    // Aucun moyen valide trouvé
    return sock.sendMessage(from, { text: '📝 *Usage:* .kick @personne | ou répondre à un message | ou .kick 123456789' });
  }
};
