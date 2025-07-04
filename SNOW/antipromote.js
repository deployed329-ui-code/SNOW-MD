import fs from 'fs-extra';

const configFile = './lib/antigrief.json';

export default {
  name: 'antipromote',
  category: 'Protection',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    // Vérifier que c'est un groupe
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '🚫 *Cette commande doit être utilisée dans un groupe.*' });
    }

    // Vérifier que le bot est admin
    const metadata = await sock.groupMetadata(jid);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botAdmin = metadata.participants.find(p => p.id === botId && p.admin);
    if (!botAdmin) {
      return sock.sendMessage(jid, { text: '❌ *Je dois être admin pour activer/désactiver Anti-Promote.*' });
    }

    if (args.length === 0) {
      return sock.sendMessage(jid, { text: '⚙️ Utilise `.antipromote on` ou `.antipromote off`' });
    }

    let data = { antiPromote: true, antiDemote: true, antiKick: true };
    if (await fs.exists(configFile)) data = JSON.parse(await fs.readFile(configFile));

    data.antiPromote = args[0].toLowerCase() === 'on';
    await fs.writeFile(configFile, JSON.stringify(data, null, 2));
    await sock.sendMessage(jid, { text: `✅ Anti-Promote est maintenant ${data.antiPromote ? 'ACTIVÉ' : 'DÉSACTIVÉ'}.` });
  }
};
