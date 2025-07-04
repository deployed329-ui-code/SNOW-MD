import config from '../config.js';
import fs from 'fs-extra';

const welcomeFile = './lib/welcome.json';

export default {
  name: 'welcome',
  description: 'Active/désactive ou affiche le système de bienvenue',
  category: 'Group',
  async execute(sock, message, args) {
    const from = message.key.remoteJid;
    const sender = (message.key.participant || message.key.remoteJid).split('@')[0];

    // Charger welcome status
    let welcomeData = { enabled: false };
    if (await fs.exists(welcomeFile)) {
      welcomeData = JSON.parse(await fs.readFile(welcomeFile));
    }

    // Afficher instructions si pas d'arguments
    if (args.length === 0) {
      await sock.sendMessage(from, {
        text: `╔════════════════════
║ 👋 *SYSTÈME DE BIENVENUE*
╠════════════════════
║ 📌 *État actuel:* ${welcomeData.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ'}
║ 
║ 📝 *Instructions :*
║ ➤ .welcome on  → Activer le welcome
║ ➤ .welcome off → Désactiver le welcome
╚════════════════════`
      });
      return;
    }

    // Vérifier permission (OWNER ou BOT lui-même)
    if (sender !== config.OWNER_NUMBER && sender !== sock.user.id.split(':')[0]) {
      return sock.sendMessage(from, { text: '🚫 *Seul le propriétaire peut activer/désactiver le welcome.*' });
    }

    if (args[0].toLowerCase() === 'on') {
      welcomeData.enabled = true;
      await fs.writeFile(welcomeFile, JSON.stringify(welcomeData, null, 2));
      await sock.sendMessage(from, { text: '✅ *Le système de bienvenue est maintenant ACTIVÉ.*' });
    } else if (args[0].toLowerCase() === 'off') {
      welcomeData.enabled = false;
      await fs.writeFile(welcomeFile, JSON.stringify(welcomeData, null, 2));
      await sock.sendMessage(from, { text: '❌ *Le système de bienvenue est maintenant DÉSACTIVÉ.*' });
    } else {
      await sock.sendMessage(from, { text: '❓ *Option invalide. Utilise "on" ou "off".*' });
    }
  }
};
