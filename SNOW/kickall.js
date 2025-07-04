import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'kickall',
  category: 'Group',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '🚫 *This command can only be used in groups.*' });
    }

    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants;

    // Check if bot is admin
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botAdmin = participants.find(p => p.id === botId && p.admin);
    if (!botAdmin) {
      return sock.sendMessage(jid, { text: '❌ *I must be admin to use this command.*' });
    }

    // Check if sender is authorized
    const sender = (msg.key.participant || jid).split('@')[0];
    let sudoList = [];
    if (fs.existsSync(sudoFile)) sudoList = JSON.parse(await fs.readFile(sudoFile));
    const isOwner = sender === config.OWNER_NUMBER;
    const isSudo = sudoList.includes(sender);
    const senderParticipant = participants.find(p => p.id.startsWith(sender));
    const isGroupAdmin = senderParticipant && senderParticipant.admin;

    if (!isOwner && !isSudo && !isGroupAdmin) {
      return sock.sendMessage(jid, { text: '🚫 *Only OWNER, SUDO or group admins can use this command.*' });
    }

    // Kick everyone except bot and sender
    const targets = participants
      .map(p => p.id)
      .filter(id => id !== botId && id !== `${sender}@s.whatsapp.net`);

    if (targets.length === 0) {
      return sock.sendMessage(jid, { text: '✅ *No members to kick.*' });
    }

    await sock.groupParticipantsUpdate(jid, targets, 'remove');
    await sock.sendMessage(jid, {
      text: `🚫 *All members have been removed by* ${isOwner ? 'OWNER' : isSudo ? 'SUDO' : 'ADMIN'}`
    });
  }
};
      
