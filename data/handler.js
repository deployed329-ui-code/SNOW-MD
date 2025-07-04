import config from '../config.js';
import chalk from 'chalk';
import commands from '../snow/index.js';

export async function Handler(msg, sock, logger) {
  try {
    const message = msg.messages[0];
    if (!message || !message.message) return;

    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const type = Object.keys(message.message)[0];

    logger.info(`📨 Message reçu de ${from} | Type: ${type} | Group: ${isGroup}`);

    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text;

    if (!text) return;

    const prefix = config.PREFIX || '!';

    if (text.startsWith(prefix)) {
      const [command, ...args] = text.slice(prefix.length).trim().split(/\s+/);

      // ➔ Envoie le statut "en train d'écrire..." en boucle
      const keepTyping = setInterval(() => {
        sock.sendPresenceUpdate('composing', from).catch(() => {});
      }, 4000); // toutes les 4 secondes

      try {
        const cmd = commands[command.toLowerCase()];
        if (cmd && typeof cmd.execute === 'function') {
          await cmd.execute(sock, message, args);
        } else {
          await sock.sendMessage(from, { text: `❓ Commande inconnue: *${command}*` });
        }
      } finally {
        clearInterval(keepTyping); // stoppe le statut "typing"
        await sock.sendPresenceUpdate('paused', from).catch(() => {});
      }
    }
  } catch (e) {
    logger.error(chalk.red(`❌ Erreur Handler: ${e}`));
  }
}
