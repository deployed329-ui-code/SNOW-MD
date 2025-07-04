import config from '../config.js';
import fs from 'fs-extra';

const sudoFile = './lib/sudo.json';

export default {
  name: 'mode',
  category: 'General',
  execute: async (sock, msg, args) => {
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];
    
    // Check if OWNER or SUDO
    let sudoList = [];
    if (fs.existsSync(sudoFile)) sudoList = JSON.parse(await fs.readFile(sudoFile));
    const isAuthorized = sender === config.OWNER_NUMBER || sudoList.includes(sender);
    if (!isAuthorized) {
      return sock.sendMessage(msg.key.remoteJid, { text: '🚫 *You are not allowed to use this command.*' });
    }
    
    // Check args
    if (args.length === 0) {
      return sock.sendMessage(msg.key.remoteJid, { text: '📝 *Usage:* !mode public / private' });
    }
    
    const modeArg = args[0].toLowerCase();
    if (modeArg !== 'public' && modeArg !== 'private') {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ *Invalid option. Use:* public or private' });
    }
    
    config.MODE = modeArg;
    
    await sock.sendMessage(msg.key.remoteJid, {
      text: `╔═════════════════
║ ⚙️ *MODE UPDATED*
╠═════════════════
║ ✅ Current mode: *${config.MODE.toUpperCase()}*
║ 👑 Updated by: ${sender === config.OWNER_NUMBER ? 'OWNER' : 'SUDO'}
╚═════════════════`
    });
  }
};
